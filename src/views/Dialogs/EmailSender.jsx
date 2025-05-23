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
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object({
    recipient: yup.string().email('Invalid email address').required('Recipient email is required')
})

const EmailSenderDialog = ({
    open,
    onClose,
}) => {

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const { control, handleSubmit, watch } = useForm({
        defaultValues: {
            recipient: ''
        },
        resolver: yupResolver(schema)
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
                    <TextInput
                        name="recipient"
                        label="Recipient Email Address"
                        control={control}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={testEmailSender.isPending}>Cancel</Button>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    color="primary"
                    variant="contained"
                    disabled={testEmailSender.isPending || watch('recipient') === ''}
                >
                    {testEmailSender.isPending ? 'Sending...' : 'Send'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EmailSenderDialog;