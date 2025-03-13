import DrawerFormContainer from "@/components/DrawerFormContainer";
import SelectInput from "@/components/inputs/SelectInput";
import TextInput from "@/components/inputs/TextInput";
import { defaultValues, schema } from "@/constants/EmailDomainSender";
import { useUpdateEmailSender } from "@/hooks/api/tenant/useEmailSender";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Card, CardActions, CardContent, Grid } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const EmailSenderDomainDrawer = ({ open, onClose, data }) => {
    const { control, formState: { errors }, reset, handleSubmit } = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    const updateEmailSender = useUpdateEmailSender();

    useEffect(() => {
        if (data) {
            reset(data);
        }
    }, [data, reset]);

    const onSubmit = (data) => {
        updateEmailSender(data, {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    }

    const cancel = () => {
        reset();
        onClose();
    }

    return (
        <DrawerFormContainer
            title="Email Sender Domain"
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
                    <Grid container rowSpacing={5} padding={2}>
                        <Grid item xs={12}>
                            <TextInput
                                control={control}
                                name="host"
                                label="Host"
                                error={errors?.host?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextInput
                                control={control}
                                name="port"
                                label="Port"
                                error={errors?.port?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextInput
                                control={control}
                                name="username"
                                label="Username"
                                error={errors?.username?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextInput
                                control={control}
                                name="password"
                                label="Password"
                                error={errors?.password?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <SelectInput
                                name="encryption"
                                label="Encryption"
                                control={control}
                                options={[
                                    { label: 'SSL', value: 'ssl' },
                                    { label: 'TLS', value: 'tls' }
                                ]}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextInput
                                control={control}
                                name="from_address"
                                label="From Address"
                                error={errors?.from_address?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextInput
                                control={control}
                                name="from_name"
                                label="From Name"
                                error={errors?.from_name?.message}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions
                    sx={{
                        justifyContent: 'flex-end',
                        gap: 2,
                        p: 2
                    }}
                >
                    <Button onClick={cancel}>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        color="primary"
                        type="submit"
                    >
                        Submit
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    )
}

export default EmailSenderDomainDrawer;