'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Grid,
    Tab,
    Box,
    Typography,
    CircularProgress,
    Paper,
    Button
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from "@/@core/components/mui/TabList";
import ToolBar from "@/components/ToolBar";
import { useEvent } from "@/hooks/api/tenant/learn/sessions/useSessionEvents";
import EventProperties from '@/views/tabs/events/EventsProperties';
import EventAttendance from '@/views/tabs/events/EventAttendance';

export default function EventEditPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const eventId = params.id;

    // Fetch event data
    const { data: eventData, isLoading: isEventLoading, error } = useEvent(eventId);

    // Set default tab to 'properties' or use the tab from URL
    const [activeTab, setActiveTab] = useState(() => {
        const tabParam = searchParams.get("tab");
        return tabParam || "properties";
    });

    // Update tab when URL changes
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Handle tab change
    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
        router.push(`/learn/course/event/${eventId}?tab=${newValue}`);
    };

    // If loading, show a loader
    if (isEventLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // If error, show error message
    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h5" color="error">Error loading event</Typography>
                <Typography variant="body1">{error.message}</Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => router.push(`/learn/course/session/${eventData?.lsession_id || ''}?tab=events`)}
                >
                    Back to Events
                </Button>
            </Box>
        );
    }

    // Breadcrumbs for the toolbar
    const breadcrumbs = [
        { label: 'Course Management', link: '/learn/course' },
        {
            label: 'Session Management',
            link: `/learn/course/session/${eventData?.lsession_id || ''}?tab=events`
        },
        { label: eventData?.name || 'Edit Event', link: '#' }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <ToolBar breadcrumbs={breadcrumbs} />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                    {eventData?.name || 'Edit Event'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Manage event details and properties
                </Typography>

                <TabContext value={activeTab}>
                    <CustomTabList
                        pill='true'
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTabs-flexContainer': {
                                width: '100%'
                            }
                        }}
                    >
                        <Tab value="properties" label="PROPERTIES" />
                        <Tab value="attendance" label="ATTENDANCE" />
                    </CustomTabList>

                    {/* Tab Panels */}
                    <TabPanel value="properties" sx={{ p: 0, pt: 2 }}>
                        <EventProperties
                            event={eventData}
                            sessionId={eventData?.lsession_id}
                        />
                    </TabPanel>

                    <TabPanel value="attendance" sx={{ p: 0, pt: 2 }}>
                        <EventAttendance event={eventData} />
                    </TabPanel>
                </TabContext>
            </Grid>
        </Grid>
    );
}