import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Alert,
    Stack,
    Typography,
    Grid,
    CircularProgress,
    Chip
} from '@mui/material';
import DrawerFormContainer from '@/components/DrawerFormContainer';
import { useMoveHaykal } from '@/hooks/api/tenant/useHaykal';
import BranchSelector from '@/components/BranchSelector';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';

const MoveHaykalDrawer = ({ open, onClose, haykalId, currentTitle = 'Unnamed Item' }) => {
    // Initialize form with null selection
    const initialFormData = {
        newParentId: null
    };

    const methods = useForm({
        defaultValues: initialFormData,
    });

    // Form state
    const { handleSubmit, control, setValue, watch } = methods;

    // Selected haykal state
    const [selectedDestination, setSelectedDestination] = useState(null);

    // Error handling
    const [generalError, setGeneralError] = useState('');

    // Move haykal mutation
    const {
        mutate: moveHaykal,
        isLoading: isMoving,
        isSuccess
    } = useMoveHaykal();

    // Reset state when drawer opens/closes
    useEffect(() => {
        if (!open) {
            setGeneralError('');
            setSelectedDestination(null);
            methods.reset(initialFormData);
        }
    }, [open]);

    // Effect to close drawer on successful move
    useEffect(() => {
        if (isSuccess) {
            onClose();
        }
    }, [isSuccess, onClose]);

    // Handle branch selection (now receives a single ID, not an array)
    const handleBranchChange = (selectedId) => {
        // In radio button mode, we receive a single value or null
        setValue('newParentId', selectedId);
    };

    // Move submission handler
    const onSubmit = (data) => {
        setGeneralError('');

        // Ensure we have a valid parent ID (default to platform/1 if none selected)
        const newParentId = data.newParentId ? String(data.newParentId) : "1";

        // Prevent moving to itself
        if (parseInt(newParentId, 10) === parseInt(haykalId, 10)) {
            setGeneralError("Cannot move item to itself");
            return;
        }

        // Execute the move operation
        moveHaykal({
            haykalId,
            newParentId
        }, {
            onError: (err) => {
                setGeneralError(err?.response?.data?.message || 'Failed to move haykal');
            }
        });
    };

    // Get the current form value (now a single value, not an array)
    const currentParentId = watch('newParentId');

    return (
        <DrawerFormContainer
            open={open}
            onClose={onClose}
            title={`Move "${currentTitle}"`}
            description="Select a new parent location"
        >
            {generalError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {generalError}
                </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        minHeight: 0, // Important for nested flex containers
                        overflowY: 'auto',
                        p: 2
                    }}>
                        <Stack spacing={3}>
                            {/* Current Item Information */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                    Moving Item
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center"
                                    sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mt: 1 }}>
                                    <i className="lucide-move" style={{ width: 20, height: 20, color: 'primary.main' }} />
                                    <Typography variant="body1">{currentTitle}</Typography>
                                </Stack>
                            </Box>

                            {/* Destination Selection */}
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                                    Select New Parent
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Browse and select a new location for this item.
                                    {!selectedDestination && (
                                        <Box sx={{ mt: 1 }}>
                                            <Chip
                                                label="Default: Platform Root"
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>
                                    )}
                                </Typography>

                                <Box sx={{
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: 0 // Important for nested flex containers
                                }}>
                                    <Controller
                                        name="newParentId"
                                        control={control}
                                        render={({ field }) => (
                                            <BranchSelector
                                                control={control}
                                                name="newParentId"
                                                selectedValues={field.value !== null ? [field.value] : []}
                                                onChange={handleBranchChange}
                                                singleSelect={true} // Enable radio button mode
                                                onBranchSelect={(branch) => {
                                                    setSelectedDestination(branch || null);
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                            </Box>

                            {/* Selected Destination */}
                            {/* <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    New Parent Location:
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" color="primary.main">
                                    {selectedDestination ? selectedDestination.title : 'Platform (Default)'}
                                </Typography>
                            </Box> */}
                        </Stack>
                    </Box>

                    {/* Action Buttons */}
                    <Box
                        sx={{
                            p: 2,
                            mt: 2,
                            backgroundColor: 'background.paper'
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={onClose}
                                disabled={isMoving}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={isMoving}
                                startIcon={isMoving ? <CircularProgress size={16} color="inherit" /> :
                                    <i className="lucide-check" style={{ width: 16, height: 16 }} />}
                            >
                                {isMoving ? 'Moving...' : 'Confirm Move'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </form>
        </DrawerFormContainer>
    );
};

export default MoveHaykalDrawer;