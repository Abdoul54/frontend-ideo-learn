'use client';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    Divider,
    Tab,
    Typography
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useState } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useAssignUsersToCatalog } from "@/hooks/api/tenant/learn/catalog/useCatalog";
import toast from "react-hot-toast";
import SelectUsersStepCatalog from "@/views/Forms/Catalogs/SelectUsersStepCatalog";
import { useTranslation } from '@/@core/contexts/translationContext';

// Schema validation for user assignment
const schema = yup.object().shape({
    users: yup.array().default([]),
    branches: yup.array().default([]),
    group_ids: yup.array().default([]),
    includeDescendants: yup.boolean().default(true),
}).test(
    'at-least-one-selection',
    'You must select at least one user, branch, or group',
    function (values) {
        const { users, branches, group_ids } = values;
        return users.length > 0 || branches.length > 0 || group_ids.length > 0;
    }
);

const AssignUsersToCatalogDrawer = ({ open, onClose, catalog }) => {
    const { translate } = useTranslation();
    // Tab state
    const [activeTab, setActiveTab] = useState('users');

    // Form setup
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
        reset
    } = useForm({
        defaultValues: {
            users: [],
            branches: [],
            group_ids: [],
            includeDescendants: true
        },
        resolver: yupResolver(schema)
    });

    // API mutation
    const assignUsersMutation = useAssignUsersToCatalog();

    // Form values for total count display
    const users = watch('users') || [];
    const branches = watch('branches') || [];
    const groupIds = watch('group_ids') || [];

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle drawer close and reset form
    const handleClose = () => {
        reset();
        onClose();
    };

    // Handle form submission
    const onSubmit = async (formData) => {
        try {
            if (!catalog?.id) {
                throw new Error(translate('Catalog management.ERROR_CATALOG_ID_REQUIRED', "Catalog ID is required"));
            }

            const branchesIds = (formData.branches || [])
                .filter(id => id != null && !isNaN(id))
                .map(id => Number(id));

            // Extract necessary data from form
            const payload = {
                catalogId: catalog.id,
                users_ids: formData.users.map(user => user.id),
                branches_ids: branchesIds.length > 0 ? branchesIds : undefined,
                groups_ids: formData.group_ids
            };

            // Don't send empty arrays
            if (payload.users_ids.length === 0) delete payload.users_ids;
            if (payload.branches_ids.length === 0) delete payload.branches_ids;
            if (payload.groups_ids.length === 0) delete payload.groups_ids;

            // Check if at least one array has values
            if (!payload.users_ids && !payload.branches_ids && !payload.groups_ids) {
                toast.error(translate('Catalog management.ERROR_SELECT_AT_LEAST_ONE', "Please select at least one user, branch, or group"));
                return;
            }

            // Execute the mutation
            await assignUsersMutation.mutateAsync(payload);

            handleClose();
        } catch (error) {
            toast.error(error.message || translate('Catalog management.ERROR_ASSIGN_USERS', "Failed to assign users"));
            console.error("Error assigning users to catalog:", error);
        }
    };

    // Calculate total selected
    const totalSelected = users.length + branches.length + groupIds.length;

    return (
        <DrawerFormContainer
            title={translate('Catalog management.DRAWER_TITLE_ASSIGN_USERS',
                { catalogName: catalog?.name || translate('Catalog management.CATALOG', 'Catalog') }
            )}
            description={translate('Catalog management.DRAWER_DESCRIPTION_ASSIGN_USERS', "Select users, branches, or groups to assign to this catalog")}
            open={open}
            onClose={handleClose}
            width={{ xs: '100%', sm: '80%', md: '70%' }}
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
                    p: 0,
                    '&::-webkit-scrollbar': { width: '0.4em' },
                    '&::-webkit-scrollbar-track': { background: 'var(--mui-palette-background-paper)' },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2
                    }
                }}>
                    <TabContext value={activeTab}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleTabChange} aria-label="user assignment tabs">
                                <Tab
                                    label={users.length > 0
                                        ? translate('Catalog management.USERS_WITH_COUNT', { count: users.length })
                                        : translate('Catalog management.USERS')
                                    }
                                    value="users"
                                />
                                <Tab
                                    label={branches.length > 0
                                        ? translate('Catalog management.BRANCHES_WITH_COUNT', { count: branches.length })
                                        : translate('Catalog management.BRANCHES')
                                    }
                                    value="branches"
                                />
                                <Tab
                                    label={groupIds.length > 0
                                        ? translate('Catalog management.GROUPS_WITH_COUNT', { count: groupIds.length })
                                        : translate('Catalog management.GROUPS')
                                    }
                                    value="groups"
                                />
                            </TabList>
                        </Box>

                        <Box sx={{ p: 2 }}>
                            <SelectUsersStepCatalog
                                control={control}
                                errors={errors}
                                setValue={setValue}
                                activeTab={activeTab} // Pass active tab to control the display
                            />
                        </Box>
                    </TabContext>
                </CardContent>

                {/* Form Errors */}
                {errors.root && (
                    <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.main' }}>
                        <Typography variant="body2">{errors.root.message}</Typography>
                    </Box>
                )}

                <Divider />

                {/* Actions Footer */}
                <CardActions sx={{ justifyContent: 'space-between', p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        {translate(
                            totalSelected === 1
                                ? 'Catalog management.SELECTION_COUNT_SINGULAR'
                                : 'Catalog management.SELECTION_COUNT_PLURAL',
                            { count: totalSelected }
                        )}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            onClick={handleClose}
                            disabled={assignUsersMutation.isPending || isSubmitting}
                        >
                            {translate('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={totalSelected === 0 || assignUsersMutation.isPending || isSubmitting}
                            startIcon={
                                (assignUsersMutation.isPending || isSubmitting) &&
                                <CircularProgress size={20} color="inherit" />
                            }
                        >
                            {assignUsersMutation.isPending || isSubmitting
                                ? translate('Catalog management.PROCESSING_ASSIGNING', 'Assigning...')
                                : translate('Catalog management.BUTTON_ASSIGN_USERS', 'Assign Users')
                            }
                        </Button>
                    </Box>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default AssignUsersToCatalogDrawer;