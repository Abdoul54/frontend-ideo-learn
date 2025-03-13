'use client';

import { useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    List,
    ListItem,
    Chip
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect } from "react";
import SelectInput from "@/components/inputs/SelectInput";
import { useAreas, usePermissions } from "@/hooks/api/tenant/usePermissions";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';

const toTitleCase = (str) => {
    return str.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

const schema = yup.object({
    area: yup.string().required('Area is required'),
    type: yup.string().required('Type is required'),
    permissions: yup.array().when('type', {
        is: 'custom',
        then: (schema) => schema.min(1, 'Please select at least one permission'),
        otherwise: (schema) => schema
    })
})

const PermissionsDrawer = ({ open, onClose, data, setValue, permissionsValue }) => {
    const { data: areas, isLoading: isAreasLoading, error: areasError } = useAreas()

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            area: '',
            type: 'all',
            permissions: [] // Ensure this is initialized as an empty array
        }
    });

    // Move the destructuring here, before any usage of these functions
    const { control, handleSubmit, watch, setValue: setFormValue } = methods;

    // Now we can use watch safely
    const selectedArea = watch('area');
    const type = watch('type');

    const { data: permissions, isLoading: isPermissionsLoading, error: permissionsError } = usePermissions({
        noPagination: true,
        area: selectedArea
    })

    useEffect(() => {
        if (data) {
            const dataPermissions = data?.permissions?.map(permission => permission?.code);
            const permissionCodes = permissions?.map(permission => permission?.code) || [];

            const hasAllPermissions = dataPermissions?.every(permission => permissionCodes?.includes(permission));

            methods.reset({
                area: data?.area || '',
                type: hasAllPermissions ? 'custom' : 'all',
                permissions: dataPermissions || []
            });
        }
    }, [data, methods, permissions]);


    const onSubmit = (formData) => {
        // Create new structure to maintain the area-based hierarchy
        const updatedPermissions = { ...permissionsValue } || {};

        // First prioritize the 'all' permission type
        if (formData.type === 'all' && permissions?.length > 0) {
            // If 'all permissions' was selected, include all permissions for the area
            updatedPermissions[formData.area] = permissions;
        } else {
            // Get the full permission objects for selected permissions
            const selectedPermissionObjects = permissions?.filter(
                permission => formData.permissions.includes(permission.code)
            ) || [];

            if (selectedPermissionObjects.length > 0) {
                // Add selected permissions for the area
                updatedPermissions[formData.area] = selectedPermissionObjects;
            } else {
                // If no permissions were selected and it's not 'all', remove the area
                delete updatedPermissions[formData.area];
            }
        }

        // Update the parent component's permissions value
        setValue('permissions', updatedPermissions);
        onClose();
    };

    // Reset permissions when area changes but only if not editing existing data
    useEffect(() => {
        if (!data) {
            setFormValue('permissions', []);
        }
    }, [selectedArea, setFormValue, data, type, permissions]);

    return (
        <DrawerFormContainer
            title="Permissions"
            open={open}
            onClose={onClose}
        >
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
            >
                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    p: 2,
                    '&::-webkit-scrollbar': {
                        width: '0.4em'
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'var(--mui-palette-background-paper)'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2
                    }
                }}>
                    <Grid container rowSpacing={3} padding={2} component={List}>
                        <Grid item xs={12} component={ListItem}>
                            <SelectInput
                                name="area"
                                control={control}
                                label="Area"
                                options={areas?.map(area => ({ value: area, label: toTitleCase(area) }))}
                                disabled={data?.area}
                            />

                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <SelectInput
                                name="type"
                                control={control}
                                label="Type"
                                options={[
                                    { value: 'all', label: 'All permissions' },
                                    { value: 'custom', label: 'Custom permissions' },
                                ]}
                            />
                        </Grid>
                        {type === "custom" && <Grid item xs={12} component={ListItem}>
                            <SelectInput
                                name="permissions"
                                control={control}
                                label="Permissions"
                                renderValue={(selected) => (
                                    <div className='flex flex-wrap gap-1'>
                                        {selected && selected.map(value => {
                                            const label = permissions?.find(permission => permission.code === value)?.name;
                                            return (
                                                <Chip key={value} label={label} size='small' />
                                            )
                                        })}
                                    </div>
                                )}
                                multiple
                                options={permissions}
                                valueKey="code"
                                labelKey="name"
                                disabled={!selectedArea}
                            />
                        </Grid>}
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} >Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" >Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default PermissionsDrawer;