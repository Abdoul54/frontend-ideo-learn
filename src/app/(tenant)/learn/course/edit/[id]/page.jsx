'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
    Grid2 as Grid,
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
import CourseProperties from '@/views/tabs/course/CourseProperties';
import CourseSessionsTab from '@/views/tabs/session/CourseSessionsTab';
import CourseEnrollmentsTab from '@/views/tabs/session/CourseEnrollmentsTab';
import EnrollUserDrawer from '@/views/Drawers/Learn/Enroll/EnrollUserDrawer';
import useUrlTabs from '@/hooks/useUrlTabs';
import StatusCard from '@/components/StatusCard';
import { useTranslation } from '@/@core/contexts/translationContext';

export default function CourseEditPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params.id;

    // Translation hook
    const { translate } = useTranslation();

    const {
        activeTab,
        handleTabChange,
    } = useUrlTabs({
        defaultTab: 'properties',
        validTabs: ['properties', 'training_material', 'sessions', 'enrollments', 'learning_plans', 'reports'],
    });

    // Fetch course data
    const { data: courseData, isLoading, error } = useCourse(courseId);

    // State for enrollment drawer
    const [enrollDrawerOpen, setEnrollDrawerOpen] = useState(false);

    // Toggle enrollment drawer
    const toggleEnrollDrawer = () => {
        setEnrollDrawerOpen(!enrollDrawerOpen);
    };

    // Check if the course is a classroom course
    const isClassroomCourse = courseData?.course_type === "classroom";

    // Breadcrumbs for the toolbar
    const breadcrumbs = [
        { label: translate('Course management.BREADCRUMB_COURSE_MANAGEMENT', 'Course Management'), link: '/learn/course' },
        { label: courseData?.name || translate('Course management.EDIT_COURSE', 'Edit Course'), link: '#' }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item size={12}>
                <ToolBar breadcrumbs={breadcrumbs} />
            </Grid>

            <Grid item size={12} sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2, // Add margin bottom for better spacing
                flexWrap: 'wrap' // Allow wrapping on smaller screens
            }}>
                <Typography
                    variant="h4"
                    sx={{ mb: 0 }} // Override gutterBottom with explicit margin
                >
                    {courseData?.name || 'Edit Course'}
                </Typography>

                {/* Improved Enroll Users button with more visible styling */}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<i className="solar-user-plus-bold" />}
                    onClick={toggleEnrollDrawer}
                    className="enroll-users-btn" // Add class for easier debugging
                    sx={{
                        minWidth: '140px',
                        display: 'flex',
                        visibility: 'visible', // Ensure visibility
                        zIndex: 1 // Ensure proper stacking
                    }}
                >
                    {translate('Course management.BUTTON_ENROLL_USERS', 'Enroll Users')}
                </Button>
            </Grid>

            <Grid item size={12}>
                <TabContext value={activeTab}>
                    <CustomTabList
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTabs-flexContainer': {
                                width: '100%'
                            }
                        }}
                    >
                        <Tab value="properties" label={translate('Course management.SIDEBAR_MENU_GENERAL', 'Properties')} disabled={error || isLoading} />
                        <Tab value="training_material" label={translate('Course management.TAB_TRAINING_MATERIAL', 'Training Material')} disabled={error || isLoading} />
                        {isClassroomCourse && <Tab value="sessions" label={translate('Course management.TAB_SESSIONS', 'Sessions')} disabled={error || isLoading} />}
                        <Tab value="enrollments" label={translate('Course management.TAB_ENROLLMENTS', 'Enrollments')} disabled={error || isLoading} />
                        <Tab value="learning_plans" label={translate('Course management.TAB_LEARNING_PLANS', 'Learning Plans')} disabled={error || isLoading} />
                        <Tab value="reports" label={translate('Course management.TAB_REPORTS', 'Reports')} disabled={error || isLoading} />
                    </CustomTabList>

                    {error || isLoading ?
                        <Box mt={6}>
                            <StatusCard
                                type={isLoading ? 'loading' : 'error'}
                                title={isLoading ? translate('common.loading', "Loading the course") : `${translate('common.error', 'Error')}: ${error?.message}`}
                                message={
                                    isLoading ? "Please wait while we load the course." : "An error occurred while loading the course."
                                }
                            />
                        </Box>
                        :
                        <>
                            {/* Tab Panels */}
                            <TabPanel value="properties" sx={{ p: 0 }}>
                                <CourseProperties course={courseData} />
                            </TabPanel>

                            <TabPanel value="training_material" sx={{ p: 0 }}>
                                <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="h6">{translate('Course management.TAB_TRAINING_MATERIAL', 'Training Material')}</Typography>
                                    <Typography variant="body1" sx={{ mt: 2 }}>
                                        Training Material coming soon.
                                    </Typography>
                                </Paper>
                            </TabPanel>

                            {isClassroomCourse && (
                                <TabPanel value="sessions" sx={{ p: 0 }}>
                                    <CourseSessionsTab courseId={courseId} />
                                </TabPanel>
                            )}

                            <TabPanel value="enrollments" sx={{ p: 0 }}>
                                <CourseEnrollmentsTab courseId={courseId} />
                            </TabPanel>

                            <TabPanel value="learning_plans" sx={{ p: 0 }}>
                                <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="h6">{translate('Course management.TAB_LEARNING_PLANS', 'Course Learning Plans')}</Typography>
                                    <Typography variant="body1" sx={{ mt: 2 }}>
                                        Learning Plans coming soon.
                                    </Typography>
                                </Paper>
                            </TabPanel>

                            <TabPanel value="reports" sx={{ p: 0 }}>
                                <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="h6">{translate('Course management.TAB_REPORTS', 'Course Reports')}</Typography>
                                    <Typography variant="body1" sx={{ mt: 2 }}>
                                        Reports coming soon.
                                    </Typography>
                                </Paper>
                            </TabPanel>
                        </>
                    }
                </TabContext>
            </Grid>

            {/* Enroll Users Drawer */}
            <EnrollUserDrawer
                open={enrollDrawerOpen}
                onClose={() => setEnrollDrawerOpen(false)}
                courseId={courseId}
                courseType={courseData?.course_type}
                courseName={courseData?.name}
                isBulkEnrollment={false}
            />
        </Grid>
    );
}