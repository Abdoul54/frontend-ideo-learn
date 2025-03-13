import AsyncButton from "@/components/AsyncButton";
import RadioInput from "@/components/inputs/RadioInput";
import SelectInput from "@/components/inputs/SelectInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import { useConfigureDomain, useDomainManagement, useTestDomain } from "@/hooks/api/tenant/useDomainManagement";
import { Alert, AlertTitle, Button, Grid, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { defaultValues, schema } from "@/constants/MainDomain";
import { useEffect } from "react";



const MainDomain = () => {
    const { control, watch, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema)
    });

    const { data } = useDomainManagement();

    useEffect(() => {
        if (data) {
            // Set form values here
            reset({
                custom_domain_status: data.custom_domain_status,
                custom_domain: data.custom_domain_name,
                ssl_provider: data.custom_domain_ssl_provider || 'letsencrypt',
            });
        }
    }, [data]);

    const testDomain = useTestDomain({ domain: watch("custom_domain") });
    const configureDomain = useConfigureDomain();

    const handleTestClick = async () => {
        try {
            await testDomain.mutateAsync();
        } catch (error) {
            // Error is already handled by the mutation
        }
    };

    const onSubmit = async (data) => {
        try {
            // Replace with your actual API call
            await configureDomain.mutateAsync(data);
            // You might want to show a success message here
        } catch (error) {
            // Handle submission error
            console.error('Failed to save domain settings:', error);
        }
    };

    return (
        <Grid container spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid item xs={12}>
                <Typography variant="h4">General</Typography>
            </Grid>
            <Grid item xs={12}>
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Main domain"
                            secondary="This is your primary domain provided by our service. It is automatically managed and maintained for optimal performance."
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            label="Main domain"
                            value={data?.main_domain}
                            variant="standard"
                            fullWidth
                            focused
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Custom domain"
                            secondary="Use a custom domain to personalize your platform's URL and enhance your brand identity."
                        />
                    </ListItem>
                    <ListItem>
                        <SwitchInput
                            name="custom_domain_status"
                            label="Enable custom domain"
                            control={control}
                            checkedValue="enabled"
                            uncheckedValue="disabled"
                            error={!!errors.custom_domain_status}
                            helperText={errors.custom_domain_status?.message}
                        />
                    </ListItem>
                    {watch("custom_domain_status") === 'enabled' && (
                        <>
                            <ListItem>
                                <Alert severity="info" variant='standard' sx={{ width: '100%' }}>
                                    <AlertTitle>DNS Update Notice</AlertTitle>
                                    <Typography variant="body2" color="textSecondary">
                                        Allow some time for DNS propagation. Avoid repeated attempts with the same domain to ensure a smooth transition and verification process.
                                    </Typography>
                                </Alert>
                            </ListItem>
                            <ListItem>
                                <TextInput
                                    name="custom_domain"
                                    label="Custom domain"
                                    control={control}
                                    variant="standard"
                                    error={!!errors.custom_domain}
                                    helperText={errors.custom_domain?.message}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="DNS Configuration Check"
                                    secondary="Verify that your DNS settings correctly point to your platform to enable full functionality."
                                />
                            </ListItem>
                            <ListItem>
                                <AsyncButton
                                    onClick={handleTestClick}
                                    disabled={testDomain.isPending || !watch("custom_domain")}
                                    status={
                                        testDomain.isError ? 'error' :
                                            testDomain.isSuccess ? 'success' :
                                                'idle'
                                    }
                                >
                                    Test DNS Configuration
                                </AsyncButton>
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="SSL Certificate"
                                    secondary="Configure your SSL certificate settings. Note that changes may take up to 2 minutes to take effect."
                                />
                            </ListItem>
                            <ListItem>
                                <RadioInput
                                    name="ssl_provider"
                                    control={control}
                                    error={!!errors.ssl_provider}
                                    helperText={errors.ssl_provider?.message}
                                    options={[
                                        {
                                            value: 'letsencrypt',
                                            label: <ListItemText
                                                primary="Platform-Managed SSL"
                                                secondary="Our platform will automatically manage the SSL certificate for secure connections."
                                            />,
                                        },
                                        {
                                            value: 'custom',
                                            label: <ListItemText
                                                primary="Custom SSL Certificate"
                                                secondary="Opt to provide your own SSL certificate if you prefer to manage it independently."
                                            />
                                        }
                                    ]}
                                />
                            </ListItem>
                            {watch("ssl_provider") === 'custom' && (
                                <ListItem>
                                    <SelectInput
                                        options={[]}
                                        name="ssl_certificate_id"
                                        label="SSL Certificate"
                                        control={control}
                                        error={!!errors.ssl_certificate_id}
                                        helperText={errors.ssl_certificate_id?.message}
                                    />
                                </ListItem>
                            )}
                        </>
                    )}
                </List>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="end">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    status={isSubmitting ? 'loading' : 'idle'}
                >
                    Save
                </Button>
            </Grid>
        </Grid>
    );
};

export default MainDomain;