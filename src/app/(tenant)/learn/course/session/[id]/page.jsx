'use client';
import { useParams } from 'next/navigation';
import {
    Grid2 as Grid,
    Tab,
    Box,
    Typography,
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from "@/@core/components/mui/TabList";
import { useCourse } from "@/hooks/api/tenant/learn/course/useCourse";
import ToolBar from "@/components/ToolBar";
import SessionProperties from '@/views/tabs/session/SessionProperties';
import { useSession } from '@/hooks/api/tenant/learn/course/useSessionCourse';
import SessionEvents from '@/views/tabs/sessions/SessionEvents';
import SessionEnrollments from '@/views/tabs/sessions/SessionEnrollments';
import useUrlTabs from '@/hooks/useUrlTabs';
import StatusCard from '@/components/StatusCard';
import { useTranslation } from '@/@core/contexts/translationContext';

export default function SessionEditPage() {
    const params = useParams();
    const sessionId = params.id;
    const { translate } = useTranslation();

    const { data: sessionData, isLoading: isSessionLoading, error } = useSession(sessionId);

    // Get courseId from sessionData instead of params
    const courseId = sessionData?.course_id;

    // Fetch course data (for breadcrumbs and context)
    const { data: courseData } = useCourse(courseId);

    const {
        activeTab,
        handleTabChange,
    } = useUrlTabs({
        defaultTab: 'properties',
        validTabs: ['properties', 'events', 'enrollments'],
    });

    // Breadcrumbs for the toolbar
    const breadcrumbs = [
        { label: translate('Course management.BREADCRUMB_COURSE_MANAGEMENT', 'Course Management'), link: '/learn/course' },
        {
            label: courseData?.name || translate('Course management.BREADCRUMB_COURSE_TITLE', 'Course'),
            link: courseId ? `/learn/course/edit/${courseId}?tab=sessions` : '/learn/course'
        },
        { label: sessionData?.name || translate('Course management.EDIT_SESSION', 'Edit Session'), link: '#' }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item size={12}>
                <ToolBar breadcrumbs={breadcrumbs} />
            </Grid>

            <Grid item size={12}>
                <Typography variant="h4" gutterBottom>
                    {sessionData?.name || translate('Course management.EDIT_SESSION', 'Edit Session')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {translate('Course management.PAGE_SUB_TITLE_SESSION', 'Manage session details and properties')}
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
                        <Tab value="properties" label={translate('Course management.TAB_PROPERTIES', 'PROPERTIES')} disabled={error || isSessionLoading} />
                        <Tab value="events" label={translate('Course management.TAB_EVENTS_ATTENDANCE', 'EVENTS AND ATTENDANCE')} disabled={error || isSessionLoading} />
                        <Tab value="enrollments" label={translate('Course management.TAB_ENROLLMENTS_EVALUATIONS', 'ENROLLMENTS AND EVALUATIONS')} disabled={error || isSessionLoading} />
                    </CustomTabList>

                    {
                        error || isSessionLoading ?
                            <Box mt={6}>
                                <StatusCard
                                    type={isSessionLoading ? 'loading' : 'error'}
                                    title={isSessionLoading ? 
                                        translate('Course management.loading_session', 'Loading the session') : 
                                        translate('Course management.error_message', `Error: ${error?.message}`)}
                                    message={
                                        isSessionLoading ? 
                                        translate('Course management.loading_session_wait', 'Please wait while we load the session.') : 
                                        translate('Course management.error_loading_session', 'An error occurred while loading the session.')
                                    }
                                />
                            </Box>
                            :
                            <>
                                <TabPanel value="properties" sx={{ p: 0, pt: 2 }}>
                                    <SessionProperties session={sessionData} courseId={courseId} />
                                </TabPanel>

                                <TabPanel value="events" sx={{ p: 0, pt: 2 }}>
                                    <SessionEvents sessionId={sessionId} courseId={courseId} session={sessionData} />
                                </TabPanel>

                                <TabPanel value="enrollments" sx={{ p: 0, pt: 2 }}>
                                    <SessionEnrollments sessionId={sessionId} />
                                </TabPanel>
                            </>}
                </TabContext>
            </Grid>
        </Grid>
    );
}