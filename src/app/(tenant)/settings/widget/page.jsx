// frontend/src/app/(tenant)/home/settings/page.jsx
'use client';
import React, { useState } from 'react';
import {
    Box,
    Tab,
    Tabs,
    Typography,
    CircularProgress,
    Alert,
    AlertTitle
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import { useSession } from 'next-auth/react';
import ToolBar from '@/components/ToolBar';
import { TabContext, TabPanel } from '@mui/lab';
import CustomTabList from '@/@core/components/mui/TabList';

// Import components
import HomePageComposer from '@/components/home-page-settings/HomePageComposer';
import HomePagePreview from '@/components/home-page-settings/HomePagePreview';

export default function HomePageSettings() {
    const [tabIndex, setTabIndex] = useState('composer');
    const { status } = useSession();

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    if (status === 'loading') {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                flexDirection: 'column',
                gap: 3
            }}>
                <CircularProgress size={40} />
                <Typography variant="h6">Loading...</Typography>
            </Box>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    <AlertTitle>Authentication Required</AlertTitle>
                    You must be logged in to access this page.
                </Alert>
            </Box>
        );
    }

    return (
        <Grid container>
            <Grid item size={12}>
                <ToolBar
                    breadcrumbs={[{
                        label: 'Home Page Settings',
                        link: '/home/settings'
                    }]}
                    buttonGroup={[
                        {
                            text: "View Home Page",
                            variant: "outlined",
                            tooltip: "Go to the Home Page",
                            icon: "solar-home-2-bold-duotone",
                            onClick: () => {
                                window.open('/home', '_blank');
                            }
                        },
                    ]}
                />
            </Grid>
            <Grid item size={12} sx={{ mt: 4 }}>
                <TabContext value={tabIndex}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <CustomTabList
                            onChange={handleChange}
                            variant="fullWidth"
                        >
                            <Tab label="Composer" value="composer" />
                            <Tab label="Home Page Preview" value="preview" />
                        </CustomTabList>
                    </Box>
                    <TabPanel value="composer" sx={{ p: 0 }}>
                        <HomePageComposer />
                    </TabPanel>
                    <TabPanel value="preview" sx={{ p: 0 }}>
                        <HomePagePreview />
                    </TabPanel>
                </TabContext>
            </Grid>
        </Grid>
    );
}