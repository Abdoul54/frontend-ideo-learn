// frontend/src/components/forms/CustomDomainForm.jsx
import { useForm } from 'react-hook-form';
import { Stack, Button, Typography, MenuItem, Card, CardContent, CardActions } from '@mui/material';
import FileInput from '@/components/inputs/FileInput';
import TextInput from '@/components/inputs/TextInput';
import { useAddCustomDomain } from '@/hooks/api/central/useCustomDomain';
import toast from 'react-hot-toast';

const CustomDomainForm = ({ onSubmitSuccess, onCancel }) => {
    const { control, handleSubmit, watch, formState: { isSubmitting }, reset } = useForm({
        defaultValues: {
            tenant_id: '',
            custom_domain: '',
            ssl_provider: 'letsencrypt',
            ssl_key_path: null,
            ssl_cert_path: null,
            ssl_chain_path: null
        }
    });

    const sslProvider = watch('ssl_provider');

    const { mutateAsync } = useAddCustomDomain();

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();

            // Append basic fields
            formData.append('tenant_id', data.tenant_id);
            formData.append('custom_domain', data.custom_domain);
            formData.append('ssl_provider', data.ssl_provider);

            // Append files if using custom SSL
            if (data.ssl_provider === 'custom') {
                formData.append('ssl_key_path', data.ssl_key_path);
                formData.append('ssl_cert_path', data.ssl_cert_path);
                if (data.ssl_chain_path) {
                    formData.append('ssl_chain_path', data.ssl_chain_path);
                }
            }

            await mutateAsync(formData);
            toast.success('Custom domain added successfully');
            onSubmitSuccess?.();
            reset();
            onCancel?.();
        } catch (error) {
            toast.error('Failed to add custom domain');
            console.error('Submission failed:', error);
        }
    };

    return (
        <Card
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: 0
            }}
        >
            <CardContent
                sx={{
                    flexGrow: 1,
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
                <Stack spacing={3}>
                    <TextInput
                        name="tenant_id"
                        control={control}
                        label="Tenant ID"
                        rules={{ required: 'Tenant ID is required' }}
                    />

                    <TextInput
                        name="custom_domain"
                        control={control}
                        label="Custom Domain"
                        rules={{
                            required: 'Custom Domain is required',
                            pattern: {
                                value: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
                                message: 'Invalid domain format'
                            }
                        }}
                    />

                    <TextInput
                        name="ssl_provider"
                        control={control}
                        label="SSL Provider"
                        select
                        rules={{ required: 'SSL Provider is required' }}
                    >
                        <MenuItem value="letsencrypt">Let's Encrypt</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                    </TextInput>

                    {sslProvider === 'custom' && (
                        <>
                            <FileInput
                                name="ssl_key_path"
                                control={control}
                                label="SSL Private Key"
                                accept=".key"
                                rules={{ required: 'Private key is required for custom SSL' }}
                            />

                            <FileInput
                                name="ssl_cert_path"
                                control={control}
                                label="SSL Certificate"
                                accept=".crt"
                                rules={{ required: 'Certificate is required for custom SSL' }}
                            />

                            <FileInput
                                name="ssl_chain_path"
                                control={control}
                                label="SSL Certificate Chain (Optional)"
                                accept=".crt"
                            />
                        </>
                    )}
                </Stack>
            </CardContent>

            <CardActions
                sx={{
                    justifyContent: 'flex-end',
                    gap: 2,
                    p: 2
                }}
            >
                <Button variant="outlined" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Create Domain'}
                </Button>
            </CardActions>
        </Card>
    );
};

export default CustomDomainForm;