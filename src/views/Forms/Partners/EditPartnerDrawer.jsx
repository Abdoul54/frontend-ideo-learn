import DrawerFormContainer from "@/components/DrawerFormContainer";
import SelectInput from "@/components/inputs/SelectInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import { defaultValues, schema, FIELDS } from "@/constants/partners";
import { useUpdatePartner } from "@/hooks/api/tenant/usePartners";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Card, CardActions, CardContent, Divider, Grid2 as Grid, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

const EditPartnerDrawer = ({ open, onClose, data }) => {
    const { control, handleSubmit, setValue, watch, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    // Set up field array for provisioning fields
    const { fields: provisioningFields, append, remove } = useFieldArray({
        control,
        name: "provisioning_fields"
    });

    // watch activation status to conditionally show fields
    const isActive = watch("is_active");

    // Watch enable_user_provisioning to conditionally show fields
    const enableUserProvisioning = watch("enable_user_provisioning");

    // Initialize form with partner data when it loads
    useEffect(() => {
        if (data) {
            setValue('display_name', data?.name || '');
            setValue('is_active', data?.is_active || false);
            setValue('enable_user_provisioning', data?.enable_user_provisioning || false);
            setValue('username_attribute', data?.username_attribute || '');

            // Set provisioning fields if they exist
            if (data.provisioning_fields && data.provisioning_fields.length > 0) {
                setValue('provisioning_fields', data.provisioning_fields);
            }
        }
    }, [data, setValue]);

    const updatePartner = useUpdatePartner();

    // Function to add a new provisioning field
    const addProvisioningField = () => {
        append({ field: '', attribute: '' });
    };


    const onSubmit = (formData) => {
        updatePartner.mutateAsync({ id: data?.id, data: formData }).then(() => {
            onClose();
            reset();
        })
    }

    const cancel = () => {
        reset();
        onClose();
    }

    return (
        <DrawerFormContainer
            title={data?.name}
            description={"Edit the partner details and settings."}
            open={open}
            onClose={onClose}
        >
            <Card
                component='form'
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

                }}
                >
                    <Grid container rowSpacing={5} padding={2} component={List}>
                        <Grid item size={12} component={ListItem}>
                            <SwitchInput
                                control={control}
                                name='is_active'
                                label={<ListItemText
                                    primary='Active'
                                    secondary='Activate or deactivate this partner'
                                />}
                                checkedValue={true}
                                uncheckedValue={false}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                control={control}
                                name='display_name'
                                label='Name'
                                disabled={!isActive}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SelectInput
                                control={control}
                                name='username_attribute'
                                label='Username Attribute'
                                options={[
                                    { value: 'username', label: 'Username' },
                                    { value: 'email', label: 'Email' },
                                ]}
                                valueKey='value'
                                labelKey='label'
                                disabled={!isActive}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SwitchInput
                                control={control}
                                name='enable_user_provisioning'
                                label={<ListItemText
                                    primary='Enable User Provisioning'
                                    secondary='Allow users to sign up using this partner'
                                />}
                                disabled={!isActive}
                            />
                        </Grid>

                        {enableUserProvisioning && (
                            <Grid item size={12} component={ListItem} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Provisioning Fields
                                </Typography>
                                {provisioningFields.map((field, index) => (
                                    <Box key={field.id} sx={{ display: 'flex', flexDirection: "column", width: '100%', mb: 2 }}>
                                        <SwitchInput
                                            control={control}
                                            name={`provisioning_fields.${index}.required`}
                                            label="Required"
                                            disabled={!isActive}
                                        />
                                        <Box key={field.id} sx={{ display: 'flex', width: '100%', gap: 2, alignItems: 'center' }}>
                                            <SelectInput
                                                control={control}
                                                name={`provisioning_fields.${index}.field`}
                                                label="User Field"
                                                options={FIELDS || []}
                                                valueKey='value'
                                                labelKey='label'
                                                disabled={!isActive}
                                            />
                                            <TextInput
                                                control={control}
                                                name={`provisioning_fields.${index}.attribute`}
                                                label="Partner Attribute"
                                                disabled={!isActive}
                                            />
                                            <IconButton
                                                color="error"
                                                onClick={() => remove(index)}
                                                sx={{ alignSelf: 'center', color: 'error.main' }}
                                                disabled={!isActive}
                                            >
                                                <i className='solar-close-circle-outline' />
                                            </IconButton>
                                        </Box>

                                    </Box>
                                ))}
                                {isActive && <Divider
                                    sx={{ width: '100%' }}
                                >
                                    <IconButton
                                        onClick={addProvisioningField}
                                        sx={{ alignSelf: 'center' }}
                                    >
                                        <i className='solar-add-circle-outline' />
                                    </IconButton>
                                </Divider>
                                }
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
                <CardActions
                    sx={{
                        justifyContent: 'flex-end',
                        gap: 2,
                        p: 2
                    }}
                >
                    <Button onClick={cancel} disabled={updatePartner?.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        color="primary"
                        type="submit"
                        disabled={updatePartner?.isPending}
                    >
                        {updatePartner?.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    )
}

export default EditPartnerDrawer;