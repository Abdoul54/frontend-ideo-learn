'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    DialogActions,
    Button,
    Typography,
    Divider,
    alpha,
    Paper,
    TextField
} from "@mui/material";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

const DeleteConfirmationDialog = ({
    open,
    data,
    onSubmit,
    title,
    onClose,
    variant = 'default', // Added variant prop with default value
    set, // Add set parameter to receive the clearSelection function
}) => {
    const { control, formState: { errors, isValid }, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            delete_confirmation: ""
        },
        mode: "onChange"
    });

    const confirmationValue = watch("delete_confirmation");

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [onClose, reset]);

    const handleFormSubmit = useCallback(
        (formData) => {
            if (onSubmit) {
                onSubmit(data)
                    .then(() => {
                        // Call set function to clear selections if provided
                        if (typeof set === 'function') {
                            set();
                        }
                        handleClose();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        },
        [onSubmit, data, handleClose, set]
    );

    // Determine if the delete button should be enabled based on variant
    const isDeleteButtonEnabled = variant === 'simple' ? true :
        (isValid && (confirmationValue === title || confirmationValue === data?.title));

    if (!open) return null;

    const displayTitle = title || data?.title;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                elevation: 5,
                sx: {
                    borderRadius: 1,
                    overflow: 'hidden'
                }
            }}
        >
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogTitle
                    sx={{
                        color: 'error.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 2.5,
                    }}
                >
                    <i className="solar-danger-bold-duotone text-5xl text-error" />
                    <Typography variant="h5" component="span" fontWeight="bold">
                        Delete Confirmation
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Are you sure you want to delete{' '}
                            <strong>{data?.ids ? `${data.ids.length} users` : `"${displayTitle}"`}</strong>?
                        </Typography>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                bgcolor: alpha('#FFF9C4', 0.3),
                                borderColor: 'warning.main',
                                mb: 3,
                            }}
                        >
                            <Typography variant="body2" color="warning.dark">
                                This action cannot be undone. Deleting this field may affect user data and forms that reference it.
                            </Typography>
                        </Paper>

                        {variant === 'default' && (
                            <>
                                <Typography variant="subtitle2" gutterBottom>
                                    To confirm deletion, please type "<strong>{title || data?.title}</strong>" below:
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Controller
                                        name="delete_confirmation"
                                        rules={{
                                            required: 'Confirmation text is required',
                                            validate: value => value === title || value === data?.title || `Text must match exactly: ${title || data?.title}`
                                        }}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                placeholder={`Type "${title || data?.title}" to confirm`}
                                                size="medium"
                                                error={!!errors?.delete_confirmation}
                                                helperText={errors?.delete_confirmation?.message}
                                                InputProps={{
                                                    sx: {
                                                        bgcolor: 'background.paper'
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                            </>
                        )}
                    </Box>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                    <Button onClick={handleClose} variant="outlined" size="medium">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="error"
                        variant="contained"
                        disabled={!isDeleteButtonEnabled}
                        sx={{
                            minWidth: 120,
                            boxShadow: 2
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default DeleteConfirmationDialog;