import React, { useEffect } from 'react';
import {
    Box,
    CardContent,
    Grid,
    Paper,
    Typography,
    Tooltip,
    IconButton,
    Button,
    CardActions,
    Divider
} from '@mui/material';
import ColorInput from '../inputs/ColorInput';
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { defaultValues, schema } from "@/constants/ColorSettings";
import { useColorSettings, useUpdateColorSettings } from "@/hooks/api/tenant/useColorSettings";

const ColorSettingsPanel = () => {
    const { control, watch, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema)
    });

    const { data } = useColorSettings();
    const updateColorSettings = useUpdateColorSettings();

    useEffect(() => {
        if (data) {
            const adjustedData = {
                colors: {
                    background_color: data.colors.background_color,
                    icon_color: data.colors.icon_color,
                    primary: {
                        main: data.colors.primary.main,
                        light: data.colors.primary.light,
                        dark: data.colors.primary.dark
                    },
                    secondary: {
                        main: data.colors.secondary.main,
                        light: data.colors.secondary.light,
                        dark: data.colors.secondary.dark
                    },
                    success: {
                        main: data.colors.success.main,
                        light: data.colors.success.light,
                        dark: data.colors.success.dark
                    },
                    warning: {
                        main: data.colors.warning.main,
                        light: data.colors.warning.light,
                        dark: data.colors.warning.dark
                    },
                    error: {
                        main: data.colors.error.main,
                        light: data.colors.error.light,
                        dark: data.colors.error.dark
                    },
                    info: {
                        main: data.colors.info.main,
                        light: data.colors.info.light,
                        dark: data.colors.info.dark
                    }
                }
            };
            reset(adjustedData);
        }
    }, [data, reset]);

    const onSubmit = async (formData) => {
        console.log('formData Color settings:', formData);
        try {
            await updateColorSettings.mutateAsync(formData.colors);
        } catch (error) {
            console.error('Failed to save color settings:', error);
        }
    };

    // Top color settings to be displayed first
    const topSettings = [
        {
            name: 'background_color',
            label: 'Background Color',
            description: 'Main application background',
            icon: 'layout'
        },
        {
            name: 'icon_color',
            label: 'Icon Color',
            description: 'Default icon color',
            icon: 'palette'
        },
    ];

    // Rest of the color settings
    const restColorSettings = [
        {
            name: 'primary.main',
            label: 'Primary Color',
            description: 'Primary brand color',
            icon: 'brush'
        },
        {
            name: 'primary.light',
            label: 'Primary Light',
            description: 'Lighter shade of primary color',
            icon: 'sun'
        },
        {
            name: 'primary.dark',
            label: 'Primary Dark',
            description: 'Darker shade of primary color',
            icon: 'moon'
        },
        {
            name: 'secondary.main',
            label: 'Secondary Color',
            description: 'Secondary brand color',
            icon: 'brush'
        },
        {
            name: 'secondary.light',
            label: 'Secondary Light',
            description: 'Lighter shade of secondary color',
            icon: 'sun'
        },
        {
            name: 'secondary.dark',
            label: 'Secondary Dark',
            description: 'Darker shade of secondary color',
            icon: 'moon'
        },
        {
            name: 'success.main',
            label: 'Success Color',
            description: 'Positive feedback color',
            icon: 'check-circle'
        },
        {
            name: 'success.light',
            label: 'Success Light',
            description: 'Lighter shade of success color',
            icon: 'check'
        },
        {
            name: 'success.dark',
            label: 'Success Dark',
            description: 'Darker shade of success color',
            icon: 'check-square'
        },
        {
            name: 'warning.main',
            label: 'Warning Color',
            description: 'Warning feedback color',
            icon: 'alert-triangle'
        },
        {
            name: 'warning.light',
            label: 'Warning Light',
            description: 'Lighter shade of warning color',
            icon: 'alert-circle'
        },
        {
            name: 'warning.dark',
            label: 'Warning Dark',
            description: 'Darker shade of warning color',
            icon: 'alert-octagon'
        },
        {
            name: 'error.main',
            label: 'Error Color',
            description: 'Error feedback color',
            icon: 'x-circle'
        },
        {
            name: 'error.light',
            label: 'Error Light',
            description: 'Lighter shade of error color',
            icon: 'x'
        },
        {
            name: 'error.dark',
            label: 'Error Dark',
            description: 'Darker shade of error color',
            icon: 'x-square'
        },
        {
            name: 'info.main',
            label: 'Info Color',
            description: 'Information color',
            icon: 'info'
        },
        {
            name: 'info.light',
            label: 'Info Light',
            description: 'Lighter shade of info color',
            icon: 'help-circle'
        },
        {
            name: 'info.dark',
            label: 'Info Dark',
            description: 'Darker shade of info color',
            icon: 'info-square'
        }
    ];

    // Function to render a color setting item
    const renderColorSetting = (setting) => (
        <Grid item xs={12} md={6} key={setting.name}>
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
                        borderColor: 'primary.main'
                    }
                }}
            >
                <Box sx={{ mb: 2 }}>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 500,
                                flex: 1
                            }}
                        >
                            {setting.label}
                        </Typography>
                        <Tooltip
                            title={setting.description}
                            placement="top"
                            arrow
                        >
                            <IconButton
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                <i className={`lucide-${setting.icon} w-4 h-4`} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <ColorInput
                    name={`colors.${setting.name}`}
                    control={control}
                    fullWidth
                />
            </Paper>
        </Grid>
    );

    return (
        <CardContent sx={{
            p: 3,
            position: 'static', // Prevent creating new stacking context
            '& .MuiPaper-root': {
                // Ensure color picker popovers render above everything
                '& .MuiPopper-root': {
                    zIndex: (theme) => theme.zIndex.modal + 1
                }
            },
            // Prevent clipping of color picker modals
            overflow: 'visible',
            // Ensure proper spacing without causing overflow issues
            '&:last-child': {
                pb: 3
            }
        }}>
            {/* Top settings section */}
            <Grid container spacing={3} sx={{
                mb: 4,
                '& .MuiGrid-item': {
                    position: 'relative',
                    zIndex: 'auto'
                }
            }}>
                {topSettings.map(renderColorSetting)}
            </Grid>
            
            {/* Rest of color settings */}
            <Grid container spacing={3} sx={{
                // Prevent grid from creating unwanted stacking contexts
                '& .MuiGrid-item': {
                    position: 'relative',
                    zIndex: 'auto'
                }
            }}>
                {restColorSettings.map((setting) => (
                    <Grid item xs={12} md={6} lg={4} key={setting.name}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
                                    borderColor: 'primary.main'
                                }
                            }}
                        >
                            <Box sx={{ mb: 2 }}>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 500,
                                            flex: 1
                                        }}
                                    >
                                        {setting.label}
                                    </Typography>
                                    <Tooltip
                                        title={setting.description}
                                        placement="top"
                                        arrow
                                    >
                                        <IconButton
                                            size="small"
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'primary.main'
                                                }
                                            }}
                                        >
                                            <i className='lucide-info w-4 h-4' />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <ColorInput
                                name={`colors.${setting.name}`}
                                control={control}
                                fullWidth
                            />
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <CardActions sx={{
                justifyContent: 'flex-end',
                p: 2,
                flexShrink: 0
            }}>
                <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                    Save Changes
                </Button>
            </CardActions>
        </CardContent>
    );
};

export default ColorSettingsPanel;