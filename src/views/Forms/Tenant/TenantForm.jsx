import { useState, useEffect } from "react";
import StepFour from "./Steps/StepFour";
import StepOne from "./Steps/StepOne";
import StepThree from "./Steps/StepThree";
import StepTwo from "./Steps/StepTwo";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Stepper, Step, StepLabel, Card, CardHeader, CardContent, CardActions, Grid, CircularProgress } from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useAddTenant } from "@/hooks/api/central/useTenant";
import { defaultValues, schema } from "@/constants/TenantManagement";
import dayjs from "dayjs";

export default function TenantForm({ open, onClose }) {
    const { control, handleSubmit, trigger, watch, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues,
        mode: 'onChange'
    });

    const handleClose = () => {
        reset();
        setActiveStep(0);
        onClose();
    };

    const addTenant = useAddTenant(handleClose);

    const [activeStep, setActiveStep] = useState(0);
    const isSmtp = watch('configure_smtp');
    const totalSteps = isSmtp ? 4 : 3;

    // Effect to handle step when SMTP is toggled
    useEffect(() => {
        if (!isSmtp && activeStep === 3) {
            setActiveStep(2);
        }
    }, [isSmtp, activeStep]);

    const handleNext = async () => {
        // Get fields for current step
        const fieldsToValidate = getFieldsForStep(activeStep);
        const isStepValid = await trigger(fieldsToValidate);

        if (isStepValid) {
            // Check if next step would be SMTP when it's disabled
            if (!isSmtp && activeStep === 3) {
                return;
            }
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const getFieldsForStep = (step) => {
        switch (step) {
            case 0:
                return [
                    'platform_name',
                    'subdomain',
                    'default_language',
                    'default_timezone',
                    'max_active_users',
                    'service_start_date',
                    'service_end_date',
                    'configure_smtp'
                ];
            case 1:
                return [
                    'header.page_title',
                    'header.header_message.status',
                    'header.header_message.content',
                    'header.logo',
                    'header.favicon'
                ];
            case 2:
                return [
                    'sign_in_page.type',
                    'sign_in_page.color_data',
                    'sign_in_page.bg_data',
                    'sign_in_page.bg_video_data.video',
                    'sign_in_page.bg_video_data.fallback_image'
                ];
            case 3:
                return [
                    'colors.background_color',
                    'colors.icon_color',
                    'colors.primary',
                    'colors.secondary',
                    'colors.info',
                    'colors.success',
                    'colors.error',
                    'colors.warning'
                ];
            case 4:
                return isSmtp ? [
                    'smtp.host',
                    'smtp.port',
                    'smtp.username',
                    'smtp.password',
                    'smtp.encryption',
                    'smtp.from_address',
                    'smtp.from_name'
                ] : [];
            default:
                return [];
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const onSubmit = (data) => {
        console.log('Form data:', data);

        const formData = new FormData();

        // Handle flat fields
        formData.append('platform_name', data.platform_name);
        formData.append('subdomain', data.subdomain);
        formData.append('default_language', data.default_language);
        formData.append('default_timezone', data.default_timezone);
        formData.append('max_active_users', data.max_active_users);
        formData.append('configure_smtp', data.configure_smtp);

        if (data.service_start_date) {
            // Ensure date is in YYYY-MM-DD format - force string conversion
            const startDate = typeof data.service_start_date === 'object'
                ? dayjs(data.service_start_date).format('YYYY-MM-DD')
                : data.service_start_date;

            formData.append('service_start_date', startDate);
            console.log('Appending service_start_date:', startDate);
        }

        if (data.service_end_date) {
            // Ensure date is in YYYY-MM-DD format - force string conversion
            const endDate = typeof data.service_end_date === 'object'
                ? dayjs(data.service_end_date).format('YYYY-MM-DD')
                : data.service_end_date;

            formData.append('service_end_date', endDate);
            console.log('Appending service_end_date:', endDate);
        }


        // Handle header object
        if (data.header) {
            if (data.header.logo) {
                if (data.header.logo instanceof File) {
                    formData.append('header[logo]', data.header.logo, data.header.logo.name);
                } else {
                    console.warn('Logo is not an instance of File:', data.header.logo);
                }
            }

            if (data.header.favicon instanceof File) {
                formData.append('header[favicon]', data.header.favicon, data.header.favicon.name);
            }

            formData.append('header[page_title]', data.header.page_title);
            formData.append('header[header_message][status]', data.header.header_message.status);
            formData.append('header[header_message][content]', data.header.header_message.content);
        }

        // Handle sign_in_page object
        if (data.sign_in_page) {
            formData.append('sign_in_page[type]', data.sign_in_page.type);

            switch (data.sign_in_page.type) {
                case 'color':
                    formData.append('sign_in_page[color_data]', data.sign_in_page.color_data);
                    break;
                case 'image':
                    if (data.sign_in_page.bg_data instanceof File) {
                        formData.append('sign_in_page[bg_data]', data.sign_in_page.bg_data, data.sign_in_page.bg_data.name);
                    }
                    break;
                case 'video':
                    if (data.sign_in_page.bg_video_data?.video instanceof File) {
                        formData.append('sign_in_page[bg_video_data][video]',
                            data.sign_in_page.bg_video_data.video,
                            data.sign_in_page.bg_video_data.video.name
                        );
                    }
                    if (data.sign_in_page.bg_video_data?.fallback_image instanceof File) {
                        formData.append('sign_in_page[bg_video_data][fallback_image]',
                            data.sign_in_page.bg_video_data.fallback_image,
                            data.sign_in_page.bg_video_data.fallback_image.name
                        );
                    }
                    break;
            }
        }

        // Handle colors object
        if (data.colors) {
            formData.append('colors[background_color]', data.colors.background_color);
            formData.append('colors[icon_color]', data.colors.icon_color);

            ['primary', 'secondary', 'info', 'success', 'error', 'warning'].forEach(colorType => {
                if (data.colors[colorType]) {
                    formData.append(`colors[${colorType}][main]`, data.colors[colorType].main);
                    formData.append(`colors[${colorType}][light]`, data.colors[colorType].light);
                    formData.append(`colors[${colorType}][dark]`, data.colors[colorType].dark);
                }
            });
        }

        if (isSmtp) {
            // Handle SMTP object
            if (data.smtp) {
                formData.append('smtp[host]', data.smtp.host);
                formData.append('smtp[port]', data.smtp.port);
                formData.append('smtp[username]', data.smtp.username);
                formData.append('smtp[password]', data.smtp.password);
                formData.append('smtp[encryption]', data.smtp.encryption);
                formData.append('smtp[from_address]', data.smtp.from_address);
                formData.append('smtp[from_name]', data.smtp.from_name);
            }
        }

        addTenant.mutate(formData);
    };

    const StepRenderer = (step) => {
        switch (step) {
            case 0:
                return <StepOne control={control} watch={watch} />;
            case 1:
                return <StepTwo control={control} watch={watch} />;
            case 2:
                return <StepThree control={control} />;
            case 3:
                return isSmtp ? <StepFour control={control} /> : null;
            default:
                return null;
        }
    };

    return (
        <DrawerFormContainer open={open} onClose={handleClose} title='Create Tenant'>
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
            >
                <CardHeader
                    title={
                        <Stepper activeStep={activeStep}>
                            <Step>
                                <StepLabel>Infos</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Header & Sign In Page</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Colors</StepLabel>
                            </Step>
                            {isSmtp && (
                                <Step>
                                    <StepLabel>SMTP</StepLabel>
                                </Step>
                            )}
                        </Stepper>
                    }
                />
                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    p: 2,
                    '&::-webkit-scrollbar': { width: '0.4em' },
                    '&::-webkit-scrollbar-track': { background: 'var(--mui-palette-background-paper)' },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2
                    }
                }}>
                    <Grid container rowSpacing={5} padding={2}>
                        {StepRenderer(activeStep)}
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    {activeStep > 0 && (
                        <Button onClick={handleBack} disabled={addTenant.isPending}>
                            Back
                        </Button>
                    )}
                    {activeStep < totalSteps - 1 && (
                        <Button variant="contained" onClick={handleNext} disabled={addTenant.isPending}>
                            Next
                        </Button>
                    )}
                    {activeStep === (isSmtp ? 3 : 2) && (
                        <Button 
                            variant="contained" 
                            type="submit" 
                            disabled={addTenant.isPending}
                            startIcon={addTenant.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {addTenant.isPending ? 'Submitting...' : 'Submit'}
                        </Button>
                    )}
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
}
