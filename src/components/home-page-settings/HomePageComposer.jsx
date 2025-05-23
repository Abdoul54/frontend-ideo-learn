// frontend/src/components/home-page-settings/HomePageComposer.jsx
'use client';
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack,
    CircularProgress,
    Tooltip,
    FormControlLabel,
    Switch,
} from '@mui/material';

// Widgets settings components
import SliderSettings from '@/components/widgets-Settings/slider/SliderSettings';
import WelcomeSettings from '@/components/widgets-Settings/welcome/WelcomeSettings';
import NewsSettings from '@/components/widgets-Settings/news/NewsSettings';
import PlaceholderSettings from '@/components/widgets-Settings/PlaceholderSettings';
import MiniCardSettings from '@/components/widgets-Settings/minicard/MiniCardSettings';
import FooterSettings from '../widgets-Settings/footer/FooterSettings';

import { useWidgetSettings, useUpdateWidgetSettings } from '@/hooks/api/tenant/widgets/useWidgets';

const HomePageComposer = () => {
    const [expanded, setExpanded] = useState('slider');

    // Fetch current widget settings
    const { data: settings, isLoading: isSettingsLoading, error: settingsError } = useWidgetSettings();

    // Mutation for updating settings
    const updateSettingsMutation = useUpdateWidgetSettings();

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    // Handle toggle for widget visibility
    const handleToggleWidget = (widgetKey) => (event) => {

        event.stopPropagation();
        const newSettings = {
            ...settings,
            [widgetKey]: event.target.checked
        };

        updateSettingsMutation.mutate(newSettings);
    };

    // Helper to render visibility toggle switch
    const renderVisibilityToggle = (widgetKey, label) => {
        if (isSettingsLoading) return <CircularProgress size={24} />;

        const isEnabled = settings?.[widgetKey] ?? true;

        return (
            <Tooltip title={isEnabled ? "This section is visible on the home page" : "This section is hidden on the home page"}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isEnabled}
                            onChange={handleToggleWidget(widgetKey)}
                            onClick={(e) => e.stopPropagation()} // Prevent accordion from closing
                            color="primary"
                            size="small"
                        />
                    }
                    label={<Typography variant="caption">{isEnabled ? "Visible" : "Hidden"}</Typography>}
                    sx={{ ml: 2 }}
                    onClick={(e) => e.stopPropagation()} // Prevent accordion from closing
                />
            </Tooltip>
        );
    };

    if (settingsError) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Error loading widget settings. Please refresh the page.
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Home Page Composer
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Configure how your home page appears by editing each section below. The sections are arranged in the same order they appear on the page.
            </Typography>

            {/* Banner/Slider Settings */}
            <Accordion
                expanded={expanded === 'slider'}
                onChange={handleChange('slider')}
                sx={{
                    mb: 2,
                    // Add styling if widget is disabled
                    ...(settings && !settings.sliders_enabled && {
                        opacity: 0.7
                    })
                }}
            >
                <AccordionSummary
                    expandIcon={<i className="solar-alt-arrow-down-bold-duotone" />}
                    aria-controls="slider-content"
                    id="slider-header"
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" pr={2}>
                        <Typography variant="subtitle1" fontWeight="medium">Banner Slider</Typography>
                        {renderVisibilityToggle('sliders_enabled', 'Banner Slider')}
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <SliderSettings />
                </AccordionDetails>
            </Accordion>

            {/* Welcome Section Settings */}
            <Accordion
                expanded={expanded === 'welcome'}
                onChange={handleChange('welcome')}
                sx={{
                    mb: 2,
                    ...(settings && !settings.welcome_enabled && {
                        opacity: 0.7
                    })
                }}
            >
                <AccordionSummary
                    expandIcon={<i className="solar-alt-arrow-down-bold-duotone" />}
                    aria-controls="welcome-content"
                    id="welcome-header"
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" pr={2}>
                        <Typography variant="subtitle1" fontWeight="medium">Welcome Section</Typography>
                        {renderVisibilityToggle('welcome_enabled', 'Welcome Section')}
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <WelcomeSettings />
                </AccordionDetails>
            </Accordion>

            {/* News Section Settings */}
            <Accordion
                expanded={expanded === 'news'}
                onChange={handleChange('news')}
                sx={{
                    mb: 2,
                    ...(settings && !settings.news_enabled && {
                        opacity: 0.7
                    })
                }}
            >
                <AccordionSummary
                    expandIcon={<i className="solar-alt-arrow-down-bold-duotone" />}
                    aria-controls="news-content"
                    id="news-header"
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" pr={2}>
                        <Typography variant="subtitle1" fontWeight="medium">News Section</Typography>
                        {renderVisibilityToggle('news_enabled', 'News Section')}
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <NewsSettings />
                </AccordionDetails>
            </Accordion>

            {/* Stats Grid Settings (Placeholder) */}
            <Accordion
                expanded={expanded === 'stats'}
                onChange={handleChange('stats')}
                sx={{
                    mb: 2,
                    ...(settings && !settings.userreport_enabled && {
                        opacity: 0.7
                    })
                }}
            >
                <AccordionSummary
                    expandIcon={<i className="solar-alt-arrow-down-bold-duotone" />}
                    aria-controls="stats-content"
                    id="stats-header"
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" pr={2}>
                        <Typography variant="subtitle1" fontWeight="medium">Stats Grid</Typography>
                        {renderVisibilityToggle('userreport_enabled', 'User Stats')}
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <PlaceholderSettings title="Stats Grid Settings" message="Settings for the Stats Grid will be available in a future update." />
                </AccordionDetails>
            </Accordion>

            {/* Mini Cards Settings */}
            <Accordion
                expanded={expanded === 'minicards'}
                onChange={handleChange('minicards')}
                sx={{
                    mb: 2,
                    ...(settings && !settings.banners_enabled && {
                        opacity: 0.7
                    })
                }}
            >
                <AccordionSummary
                    expandIcon={<i className="solar-alt-arrow-down-bold-duotone" />}
                    aria-controls="minicards-content"
                    id="minicards-header"
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" pr={2}>
                        <Typography variant="subtitle1" fontWeight="medium">Mini Cards</Typography>
                        {renderVisibilityToggle('banners_enabled', 'Mini Cards')}
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <MiniCardSettings />
                </AccordionDetails>
            </Accordion>

            {/* Footer Settings */}
            <Accordion
                expanded={expanded === 'footer'}
                onChange={handleChange('footer')}
                sx={{
                    mb: 2,
                    ...(settings && !settings.footer_enabled && {
                        opacity: 0.7
                    })
                }}
            >
                <AccordionSummary
                    expandIcon={<i className="solar-alt-arrow-down-bold-duotone" />}
                    aria-controls="footer-content"
                    id="footer-header"
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" pr={2}>
                        <Typography variant="subtitle1" fontWeight="medium">Footer</Typography>
                        {renderVisibilityToggle('footer_enabled', 'Footer')}
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <FooterSettings />
                </AccordionDetails>
            </Accordion>
            {/* MOOC Sections Settings (Placeholder) */}
            {/* <Accordion
                expanded={expanded === 'mooc'}
                onChange={handleChange('mooc')}
                sx={{ mb: 2 }}
            >
                <AccordionSummary
                    expandIcon={<i className="solar-alt-arrow-down-bold-duotone" />}
                    aria-controls="mooc-content"
                    id="mooc-header"
                >
                    <Typography variant="subtitle1" fontWeight="medium">MOOC Sections</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <PlaceholderSettings title="MOOC Sections Settings" message="Settings for the MOOC Sections will be available in a future update." />
                </AccordionDetails>
            </Accordion> */}

            {/* Mini Cards Settings (Placeholder) */}
            {/* <Accordion
                expanded={expanded === 'minicards'}
                onChange={handleChange('minicards')}
                sx={{ mb: 2 }}
            >
                <AccordionSummary
                    expandIcon={<i className="solar-alt-arrow-down-bold-duotone" />}
                    aria-controls="minicards-content"
                    id="minicards-header"
                >
                    <Typography variant="subtitle1" fontWeight="medium">Mini Cards</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <PlaceholderSettings title="Mini Cards Settings" message="Settings for the Mini Cards will be available in a future update." />
                </AccordionDetails>
            </Accordion> */}

            {/* Support and FAQ Settings (Placeholder) */}
            {/* <Accordion
                expanded={expanded === 'supportfaq'}
                onChange={handleChange('supportfaq')}
                sx={{ mb: 2 }}
            >
                <AccordionSummary
                    expandIcon={<i className="solar-alt-arrow-down-bold-duotone" />}
                    aria-controls="supportfaq-content"
                    id="supportfaq-header"
                >
                    <Typography variant="subtitle1" fontWeight="medium">Support and FAQ</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <PlaceholderSettings title="Support and FAQ Settings" message="Settings for the Support and FAQ sections will be available in a future update." />
                </AccordionDetails>
            </Accordion> */}
        </Box>
    );
};

export default HomePageComposer;