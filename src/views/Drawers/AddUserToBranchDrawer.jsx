import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import DrawerFormContainer from '@/components/DrawerFormContainer';
import { useAssignUserToHaykal, useHaykal } from '@/hooks/api/tenant/useHaykal';
import toast from 'react-hot-toast';
import BranchSelector from '@/components/BranchSelector';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '@emotion/react';

const AddUserToBranchDrawer = ({ open, onClose, selectedRows }) => {
    const theme = useTheme();
    
    // Initialize form
    const { control, watch, reset } = useForm({
        defaultValues: {
            branchId: null,
        },
    });

    // Selected branch state
    const [selectedDestination, setSelectedDestination] = useState(null);
    
    // Watch for selected branch ID
    const selectedBranchId = watch('branchId');

    // Assign user to branch mutation
    const {
        mutate: assignUserToBranch,
        isLoading: isAssigning,
        isSuccess
    } = useAssignUserToHaykal();

    // Reset form when drawer closes
    useEffect(() => {
        if (!open) {
            reset({ branchId: null });
            setSelectedDestination(null);
        }
    }, [open, reset]);

    useEffect(() => {
        if (isSuccess) {
            onClose();
        }
    }, [isSuccess, onClose]);

    // Handle assignment submission
    const handleAssignUser = () => {
        if (!selectedRows || selectedRows.length === 0) {
            toast.error('Please select at least one user to assign');
            return;
        }

        if (!selectedBranchId) {
            toast.error('Please select a target branch');
            return;
        }

        // Extract user_id instead of id
        const userIds = selectedRows
            .filter(row => row && row.user_id)
            .map(row => row.user_id)
            .join(',');

        if (!userIds) {
            toast.error('Selected users have no valid IDs');
            return;
        }

        console.log('Assigning users with IDs:', userIds);

        assignUserToBranch({
            id_org: selectedBranchId,
            id_users: userIds,
            use_secondary_identifier: false
        }, {
            onError: (err) => {
                toast.error(err?.response?.data?.message || 'Failed to assign user to branch');
            }
        });
    };

    return (
        <>
            <DrawerFormContainer
                open={open}
                onClose={onClose}
                description="Assign user to a branch"
                width={500}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {selectedRows?.length > 0 && (
                            <Box sx={{ mt: 2, mb: 3, px: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Selected Users ({selectedRows.length})
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 1, maxHeight: 120, overflow: 'auto' }}>
                                    <Stack spacing={1}>
                                        {selectedRows.map(user => (
                                            <Box
                                                key={user.id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    p: 1,
                                                    borderRadius: 1,
                                                    bgcolor: 'background.default'
                                                }}
                                            >
                                                <i className="lucide-user" style={{ color: theme.palette.primary.main, width: 16, height: 16 }} />
                                                <Typography variant="body2">
                                                    {user.username || user.first_name || `User #${user.id}`}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Paper>
                            </Box>
                        )}

                        <Box sx={{ mt: 2, px: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                                Select Target Branch
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Browse and select a branch to assign the users to.
                            </Typography>

                            <Box sx={{ mt: 1 }}>
                                <Controller
                                    control={control}
                                    name="branchId"
                                    render={({ field }) => (
                                        <BranchSelector
                                            control={control}
                                            name="branchId"
                                            selectedValues={field.value !== null ? [field.value] : []}
                                            singleSelect={true}
                                            onChange={(newValue) => {
                                                console.log('Branch selection changed to:', newValue);
                                                field.onChange(newValue);
                                            }}
                                            onBranchSelect={(branch) => {
                                                console.log('Branch selected:', branch);
                                                setSelectedDestination(branch || null);
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>

                        {/* Selected Destination */}
                        {selectedDestination && (
                            <Box sx={{ mt: 2, px: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Target Branch:
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" color="primary.main">
                                    {selectedDestination.title || selectedDestination.name || 'Selected Branch'}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box
                        sx={{
                            p: 2,
                            mt: 2,
                            backgroundColor: 'background.paper'
                        }}
                    >
                        <Grid container spacing={2} justifyContent="flex-end">
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={onClose}
                                    disabled={isAssigning}
                                >
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleAssignUser}
                                    disabled={isAssigning || !selectedBranchId}
                                >
                                    {isAssigning ? 'Assigning...' : 'Confirm'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </DrawerFormContainer >
        </>
    );
};

export default AddUserToBranchDrawer;