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
import { useCourse } from "@/hooks/api/tenant/learn/course/useCourse";
import ToolBar from "@/components/ToolBar";
import SessionProperties from '@/views/tabs/session/SessionProperties';
import { useSession } from '@/hooks/api/tenant/learn/course/useSessionCourse';
import SessionEvents from '@/views/tabs/sessions/SessionEvents';
import SessionEnrollments from '@/views/tabs/sessions/SessionEnrollments';

export default function SessionEditPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const sessionId = params.id;

    const { data: sessionData, isLoading: isSessionLoading, error } = useSession(sessionId);

    // Get courseId from sessionData instead of params
    const courseId = sessionData?.course_id;

    // Fetch course data (for breadcrumbs and context)
    const { data: courseData, isLoading: isCourseLoading } = useCourse(courseId);

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
        router.push(`/learn/course/session/${sessionId}?tab=${newValue}`);
    };

    // If loading, show a loader
    const isLoading = isCourseLoading || isSessionLoading;
    if (isLoading) {
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
                <Typography variant="h5" color="error">Error loading session</Typography>
                <Typography variant="body1">{error.message}</Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => router.push(`/learn/course`)}
                >
                    Back to Courses
                </Button>
            </Box>
        );
    }

    // Breadcrumbs for the toolbar
    const breadcrumbs = [
        { label: 'Course Management', link: '/learn/course' },
        {
            label: courseData?.name || 'Course',
            link: courseId ? `/learn/course/edit/${courseId}?tab=sessions` : '/learn/course'
        },
        { label: sessionData?.name || 'Edit Session', link: '#' }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <ToolBar breadcrumbs={breadcrumbs} />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                    {sessionData?.name || 'Edit Session'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Manage session details and properties
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
                        <Tab value="events" label="EVENTS AND ATTENDANCE" />
                        <Tab value="enrollments" label="ENROLLMENTS AND EVALUATIONS" />
                    </CustomTabList>

                    {/* Tab Panels */}
                    <TabPanel value="properties" sx={{ p: 0, pt: 2 }}>
                        <SessionProperties session={sessionData} courseId={courseId} />
                    </TabPanel>

                    <TabPanel value="events" sx={{ p: 0, pt: 2 }}>
                        <SessionEvents sessionId={sessionId} courseId={courseId} session={sessionData} />
                    </TabPanel>

                    <TabPanel value="enrollments" sx={{ p: 0, pt: 2 }}>
                        <SessionEnrollments sessionId={sessionId} />
                    </TabPanel>
                </TabContext>
            </Grid>
        </Grid>
    );
}