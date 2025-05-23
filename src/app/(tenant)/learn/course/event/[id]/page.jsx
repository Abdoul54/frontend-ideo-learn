'use client';
import { useParams } from 'next/navigation';
import {
    Grid2 as Grid,
    Tab,
    Box,
    Typography
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from "@/@core/components/mui/TabList";
import ToolBar from "@/components/ToolBar";
import { useEvent } from "@/hooks/api/tenant/learn/sessions/useSessionEvents";
import EventProperties from '@/views/tabs/events/EventsProperties';
import EventAttendance from '@/views/tabs/events/EventAttendance';
import useUrlTabs from '@/hooks/useUrlTabs';
import StatusCard from '@/components/StatusCard';
import { useTranslation } from '@/@core/contexts/translationContext';

export default function EventEditPage() {
    const params = useParams();
    const eventId = params.id;
    const { translate } = useTranslation();

    // Fetch event data
    const { data: eventData, isLoading: isEventLoading, error } = useEvent(eventId);

    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'properties',
        validTabs: ['properties', 'attendance'],
    });

    // Breadcrumbs for the toolbar
    const breadcrumbs = [
        { label: translate('Course management.BREADCRUMB_COURSE_MANAGEMENT', 'Course Management'), link: '/learn/course' },
        {
            label: translate('Course management.SESSION_MANAGEMENT', 'Session Management'),
            link: `/learn/course/session/${eventData?.lsession_id || ''}?tab=events`
        },
        { label: eventData?.name || translate('Course management.EDIT_EVENT', 'Edit Event'), link: '#' }
    ];


    return (
        <Grid container spacing={3}>
            <Grid item size={12}>
                <ToolBar breadcrumbs={breadcrumbs} />
            </Grid>

            <Grid item size={12}>
                <Typography variant="h4" gutterBottom>
                    {eventData?.name || translate('Course management.EDIT_EVENT', 'Edit Event')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {translate('Course management.PAGE_SUB_TITLE_EVENT', 'Manage event details and properties')}
                </Typography>

                <TabContext value={activeTab}>
                    <CustomTabList
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTabs-flexContainer': {
                                width: '100%'
                            }
                        }}
                    >
                        <Tab value="properties" label={translate('Course management.TAB_PROPERTIES', 'PROPERTIES')} disabled={error || isEventLoading} />
                        <Tab value="attendance" label={translate('Course management.TAB_ATTENDANCE', 'ATTENDANCE')} disabled={error || isEventLoading} />
                    </CustomTabList>

                    {/* Tab Panels */}
                    {error || isEventLoading ?
                        <Box mt={6}>
                            <StatusCard
                                type={isEventLoading ? 'loading' : 'error'}
                                title={isEventLoading
                                    ? translate('Course management.LOADING_EVENT', 'Loading the event')
                                    : translate('Course management.ERROR_EVENT', `Error: ${error?.message}`)}
                                message={isEventLoading
                                    ? translate('Course management.LOADING_EVENT_WAIT', 'Please wait while we load the event.')
                                    : translate('Course management.ERROR_LOADING_EVENT', 'An error occurred while loading the event.')}
                            />
                        </Box>
                        :
                        <>
                            <TabPanel value="properties" sx={{ p: 0, pt: 2 }}>
                                <EventProperties
                                    event={eventData}
                                    sessionId={eventData?.lsession_id}
                                />
                            </TabPanel>

                            <TabPanel value="attendance" sx={{ p: 0, pt: 2 }}>
                                <EventAttendance event={eventData} />
                            </TabPanel>
                        </>
                    }
                </TabContext>
            </Grid>
        </Grid>
    );
}