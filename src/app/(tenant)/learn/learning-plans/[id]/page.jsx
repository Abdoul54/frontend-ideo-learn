'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import StatusCard from "@/components/StatusCard";
import ToolBar from "@/components/ToolBar";
import { useLearningPlan } from "@/hooks/api/tenant/learn/useLearningPlan";
import useUrlTabs from "@/hooks/useUrlTabs";
import UsersEnrollmentsDrawer from "@/views/Forms/LearningPlan/Enrollment/UsersEnrollmentsDrawer";
import AssignCoursesDrawer from "@/views/Forms/LearningPlans/AssignCoursesDrawer";
import Courses from "@/views/tabs/LearningPlan/Courses";
import Enrollments from "@/views/tabs/LearningPlan/Enrollments";
import Properties from "@/views/tabs/LearningPlan/Properties";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid2 as Grid, Paper, Tab } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";

const Page = () => {
    const { id } = useParams();

    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'properties',
        validTabs: ['properties', 'courses', 'enrollments', 'catalogs', 'channels'],
    });

    const [drawerState, setDrawerState] = useState({ open: false, type: null });

    const { data, isLoading, error } = useLearningPlan({
        learningPlanId: id,
    });

    return (
        <>
            <Grid container spacing={4}>
                <Grid item size={12} >
                    <ToolBar
                        breadcrumbs={[{ label: 'Learning Plans', link: '/learn/learning-plans' },
                        { label: data?.title || id, link: `/learn/learning-plans/${id}` }]}
                        buttonGroup={[
                            {
                                text: 'Assign Courses',
                                variant: 'contained',
                                tooltip: 'Assign Courses',
                                icon: 'solar-add-circle-linear',
                                disabled: isLoading || error,
                                onClick: () => setDrawerState({ open: true, type: 'assign_courses', data: { id } })
                            },
                            // {
                            //     text: 'Assign to catalogs',
                            //     variant: 'contained',
                            //     tooltip: 'Assign to catalogs',
                            //     icon: 'solar-add-circle-linear',
                            //     onClick: () => setDrawerState({ open: true, type: 'assign_catalogs' })
                            // },
                            // {
                            //     text: 'Assign to channels',
                            //     variant: 'contained',
                            //     tooltip: 'Assign to channels',
                            //     icon: 'solar-add-circle-linear',
                            //     onClick: () => setDrawerState({ open: true, type: 'assign_channels' })
                            // },
                            {
                                text: 'Enroll users',
                                variant: 'contained',
                                tooltip: 'Enroll users',
                                icon: 'solar-add-circle-linear',
                                onClick: () => setDrawerState({ open: true, type: 'enroll_users', data: data })
                            },
                            // {
                            //     text: 'Assign Courses via CSV',
                            //     variant: 'contained',
                            //     tooltip: 'Assign Courses via CSV',
                            //     icon: 'solar-add-circle-linear',
                            //     onClick: () => setDrawerState({ open: true, type: 'assign_courses_csv' })
                            // },
                        ]}
                    />
                </Grid>
                {false ?
                    <Grid item size={12}>
                        <StatusCard
                            type="error"
                            title={`Error ${error?.message || 500}`}
                            message="This learning plan is not available or does not exist. If you think this is a mistake, please contact support."
                        />
                    </Grid>
                    : <Grid item size={12} container component={TabContext} value={activeTab}>
                        <Grid item size={12}>
                            <Paper elevation={0} sx={{
                                bgcolor: 'background.default',
                            }}>
                                <CustomTabList
                                    onChange={handleTabChange}
                                    sx={{
                                        '& .MuiTabs-flexContainer': {
                                            width: '100%'
                                        }
                                    }}
                                >
                                    <Tab value="properties" label="Properties" disabled={isLoading || error} />
                                    <Tab value="courses" label="Courses" />
                                    <Tab value="enrollments" label="Enrollments" />
                                    <Tab value="catalogs" label="Catalogs" disabled={isLoading || error} />
                                    <Tab value="channels" label="Channels" disabled={isLoading || error} />
                                </CustomTabList>
                            </Paper>
                        </Grid>
                        <Grid item size={12}>
                            <TabPanel value="properties">
                                {activeTab === "properties" && <Properties data={data} isLoading={isLoading} />}
                            </TabPanel>
                            <TabPanel value="courses">
                                {activeTab === "courses" && <Courses learningPlanId={id} />}
                            </TabPanel>
                            <TabPanel value="enrollments">
                                {activeTab === "enrollments" && <Enrollments learningPlanId={id} />}
                            </TabPanel>
                            <TabPanel value="catalogs">
                                {activeTab === "catalogs" && <h1>Catalogs</h1>}
                            </TabPanel>
                            <TabPanel value="channels">
                                {activeTab === "channels" && <h1>Channels</h1>}
                            </TabPanel>
                        </Grid>
                    </Grid>}
            </Grid>
            {drawerState?.open && drawerState?.type === 'assign_courses' &&
                <AssignCoursesDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
            {drawerState?.open && drawerState?.type === 'enroll_users' &&
                <UsersEnrollmentsDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
            {/* {drawerState?.open && drawerState?.type === 'setDrawerState' &&
                <LearningPlansDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
            {/* {drawerState?.open && drawerState?.type === 'skill_group' &&
                <SkillSetDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            } */}
        </>
    );
}

export default Page;