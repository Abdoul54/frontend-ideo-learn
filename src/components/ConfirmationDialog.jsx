import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import {
    Box,
    DialogActions, DialogContent,
    Divider, Typography, TextField, DialogTitle, Alert, AlertTitle, Snackbar,
    CircularProgress
} from '@mui/material';
import toast from "react-hot-toast";
import HighlightQuotes from './HighlightQuotes';

/**
 * @typedef {Object} DialogActionsConfig
 * @property {Object} buttons - Button label configurations
 * @property {string} buttons.confirm - Label for the confirm button
 * @property {string} buttons.cancel - Label for the cancel button
 * @property {string} buttons.processing - Label shown during async processing
 * @property {Object} toast - Toast notification configurations
 * @property {string} toast.success - Success message for toast notification
 * @property {string} toast.error - Error message for toast notification
 * @property {boolean} toast.show - Whether to show toast notifications
 * @property {Object} icons - Button icon configurations
 * @property {React.ReactNode} icons.confirm - Icon for the confirm button
 * @property {React.ReactNode} icons.cancel - Icon for the cancel button
 * @property {React.ReactNode} icons.processing - Icon shown during async processing
 * @property {Function} onConfirm - Function called when confirm button is clicked
 * @property {Function} onCancel - Function called when cancel button is clicked
 */

/**
 * @typedef {Object} AlertConfig
 * @property {string} message - The alert message
 * @property {string} type - The alert type ('error', 'warning', 'info', 'success')
 * @property {string} title - The alert title
 * @property {boolean} show - Whether to show the alert
 */

/**
 * A configurable confirmation dialog component with support for different themes,
 * async operations, and typing confirmation.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {'info'|'warning'|'error'|'success'} [props.type='info'] - The theme of the dialog
 * @param {string} [props.title=''] - The title displayed in the dialog header
 * @param {Object} [props.actions] - Configuration for dialog actions
 * @param {Object} [props.actions.toast] - Toast notification settings
 * @param {string} [props.actions.toast.success=''] - Success toast message
 * @param {string} [props.actions.toast.error=''] - Error toast message
 * @param {boolean} [props.actions.toast.show=false] - Whether to show toast notifications
 * @param {Object} [props.actions.buttons] - Button label configurations
 * @param {string} [props.actions.buttons.confirm='Confirm'] - Confirm button text
 * @param {string} [props.actions.buttons.cancel='Cancel'] - Cancel button text
 * @param {string} [props.actions.buttons.processing='Processing...'] - Button text during async processing
 * @param {Object} [props.actions.icons] - Button icon configurations
 * @param {React.ReactNode} [props.actions.icons.confirm] - Confirm button icon
 * @param {React.ReactNode} [props.actions.icons.cancel] - Cancel button icon
 * @param {React.ReactNode} [props.actions.icons.processing] - Icon shown during async processing
 * @param {Function} [props.actions.onConfirm=()=>{}] - Callback function when confirm is clicked
 * @param {Function} [props.actions.onCancel=()=>{}] - Callback function when cancel is clicked
 * @param {Object} [props.alert] - Alert configuration within the dialog
 * @param {string} [props.alert.message='This action cannot be undone.'] - Alert message
 * @param {'warning'|'info'|'error'|'success'} [props.alert.type='warning'] - Alert type
 * @param {string} [props.alert.title='Important Notice'] - Alert title
 * @param {boolean} [props.alert.show=false] - Whether to show the alert
 * @param {string} [props.message=''] - Main dialog message
 * @param {boolean} [props.isOpen=false] - Controls dialog visibility
 * @param {Function} [props.onClose=()=>{}] - Callback function when dialog is closed
 * @param {boolean} [props.typingConfirmation=false] - Requires typing confirmation word to enable confirm button
 * @param {string} [props.confirmationWord='confirm'] - Word that must be typed for confirmation
 * @param {boolean} [props.isAsync=false] - Whether the confirmation action is asynchronous
 * 
 * @returns {React.ReactElement|null} The confirmation dialog component or null if not open
 * 
 * @example
 * <ConfirmationDialog
 *   type="warning"
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item?"
 *   isOpen={isDialogOpen}
 *   onClose={() => setIsDialogOpen(false)}
 *   actions={{
 *     onConfirm: handleDelete,
 *     onCancel: () => console.log('Cancelled'),
 *     toast: { show: true, success: "Item deleted successfully" }
 *   }}
 *   typingConfirmation={true}
 *   confirmationWord="delete"
 *   isAsync={true}
 * />
 */
const ConfirmationDialog = ({
    type = 'info',
    title = '',
    actions = {
        toast: {
            success: '',
            error: '',
            show: false,
        },
        buttons: {
            confirm: 'Confirm',
            cancel: 'Cancel',
            processing: 'Processing...',
        },
        icons: {
            confirm: <i className='solar-check-circle-outline' />,
            cancel: <i className='solar-close-circle-outline' />,
            processing: <CircularProgress size={20} color="inherit" />,
        },
        onConfirm: () => { },
        onCancel: () => { }, // Ensuring onCancel is always a function in default props
    },
    alert = {
        message: 'This action cannot be undone.',
        type: 'warning',
        title: "Important Notice",
        show: false,
    },
    message = '',
    isOpen = false,
    onClose = () => { },
    typingConfirmation = false,
    confirmationWord = 'confirm',
    isAsync = false,
}) => {
    // State for controlling dialog visibility - uses the isOpen prop
    const [open, setOpen] = useState(isOpen);
    const [typedConfirmation, setTypedConfirmation] = useState('');
    const [isConfirmEnabled, setIsConfirmEnabled] = useState(!typingConfirmation);
    const [alertOpen, setAlertOpen] = useState(alert?.show);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setOpen(isOpen);
        if (!isOpen) {
            setTypedConfirmation('');
            setLoading(false);
        }
    }, [isOpen]);

    useEffect(() => {
        setAlertOpen(alert?.show);
    }, [alert?.show]);

    useEffect(() => {
        if (typingConfirmation) {
            setIsConfirmEnabled(typedConfirmation.toLowerCase() === confirmationWord.toLowerCase());
        } else {
            setIsConfirmEnabled(true);
        }
    }, [typedConfirmation, typingConfirmation, confirmationWord]);

    /**
     * Handles the dialog close action
     */
    const handleClose = () => {
        if (loading) return; // Prevent closing while loading
        setOpen(false);
        onClose();
    };

    /**
     * Handles the confirm action, with support for async operations
     * @returns {Promise<void>}
     */
    const handleConfirm = async () => {
        if (!isConfirmEnabled || loading) return;

        if (isAsync) {
            setLoading(true);

            try {
                // Check if onConfirm is a function before calling it
                if (typeof actions?.onConfirm === 'function') {
                    await actions.onConfirm();
                }
                handleClose();

                if (actions?.toast?.show) {
                    toast.success(actions?.toast?.success || 'Operation completed successfully');
                }
            } catch (error) {
                if (actions?.toast?.show) {
                    toast.error(actions?.toast?.error || 'Operation failed');
                }
            } finally {
                setLoading(false);
            }
        } else {
            // Synchronous operation - check if onConfirm is a function before calling it
            if (typeof actions?.onConfirm === 'function') {
                actions.onConfirm();
            }
            handleClose();
        }
    };

    /**
     * Handles the cancel action
     */
    const handleCancel = () => {
        if (loading) return; // Prevent canceling while loading

        // Check if onCancel is a function before calling it
        if (typeof actions?.onCancel === 'function') {
            actions.onCancel();
        }

        handleClose();
    };

    /**
     * Handles changes to the typing confirmation field
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
     */
    const handleTypingConfirmationChange = (e) => {
        setTypedConfirmation(e.target.value);
    };

    // Color themes based on type
    const themes = {
        error: {
            color: 'error',
            bgColor: '#fee2e2', // red-50
            icon: <i className='solar-close-circle-outline text-error text-4xl' />
        },
        warning: {
            color: 'warning',
            bgColor: '#fefce8', // yellow-50
            icon: <i className='solar-danger-circle-outline text-warning text-4xl' />
        },
        info: {
            color: 'info',
            bgColor: '#EFF6FF', // blue-50
            icon: <i className='solar-info-circle-outline text-info text-4xl' />
        },
        success: {
            color: 'success',
            bgColor: '#F0FDF4', // green-50
            icon: <i className='solar-check-circle-outline text-success text-4xl' />
        }
    };

    // Get theme based on type
    const currentTheme = themes[type] || themes.info;

    // If dialog is not open, return null
    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : handleClose} // Disable close on backdrop click while loading
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
                sx: {
                    minWidth: '30%',
                    maxWidth: '100%',
                }
            }}
        >
            <DialogTitle id="alert-dialog-title" sx={{
                color: currentTheme.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${currentTheme.bgColor}`,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {currentTheme.icon}
                    <Typography variant="h6" component="span" sx={{ ml: 1 }}>
                        <HighlightQuotes text={title} />
                    </Typography>
                </Box>
                {!loading && (
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{ color: 'text.secondary' }}
                    >
                        <i className='solar-close-circle-outline' />
                    </IconButton>
                )}
            </DialogTitle>
            <Divider />
            <DialogContent sx={{
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                p: 4,
                gap: 2,
                color: 'text.primary'
            }}>
                {alertOpen && alert.show && alert.message && (
                    <Alert
                        severity={alert.type}
                        sx={{ mb: 2 }}
                    >
                        {alert?.title && <AlertTitle>{alert?.title}</AlertTitle>}
                        {alert.message}
                    </Alert>
                )}

                {message && (
                    <Typography variant="body2" color="text.secondary">
                        <HighlightQuotes text={message} />
                    </Typography>
                )}

                {typingConfirmation && !loading && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <HighlightQuotes text={`Type "${confirmationWord}" to confirm:`} />
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={typedConfirmation}
                            onChange={handleTypingConfirmationChange}
                            variant="outlined"
                            autoFocus
                        />
                    </Box>
                )}
            </DialogContent>
            <Divider />
            <DialogActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button
                    onClick={handleCancel}
                    variant="outlined"
                    color="inherit"
                    disabled={loading}
                    startIcon={actions?.icons?.cancel}
                >
                    {actions?.buttons?.cancel}
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color={currentTheme.color}
                    disabled={!isConfirmEnabled || loading}
                    startIcon={loading ? actions?.icons?.processing : actions?.icons?.confirm}
                >
                    {loading ? actions?.buttons?.processing : actions?.buttons?.confirm}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;