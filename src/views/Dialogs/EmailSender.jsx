import TextInput from "@/components/inputs/TextInput";
import { useTestEmailSender } from "@/hooks/api/tenant/useEmailSender";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    DialogActions,
    Button
} from "@mui/material";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

const EmailSenderDialog = ({
    open,
    onClose,
}) => {

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            recipient: ''
        }
    });

    const testEmailSender = useTestEmailSender();

    const onSubmit = async (data) => {
        try {
            await testEmailSender.mutateAsync(data?.recipient);
            handleClose();
        } catch (error) {
            // Error handling is now managed by the button
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Email Sender Test</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        p: 2
                    }}
                >
                    <Controller
                        name="recipient"
                        rules={{
                            required: 'Recipient is required',
                            // pattern: {
                            //     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, // Updated regex for more flexible TLDs
                            //     message: 'Invalid email address'
                            // }
                        }}
                        control={control}
                        render={({ field }) => (
                            <TextInput
                                {...field}
                                label="Recipient"
                                control={control}
                                size="small"
                                error={errors?.recipient?.message}
                                helperText={errors?.recipient?.message}
                            />
                        )}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    color="primary"
                    variant="contained"
                >
                    Send
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EmailSenderDialog;