'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import StatusCard from "@/components/StatusCard";
import ToolBar from "@/components/ToolBar";
import { useLearningPlan } from "@/hooks/api/tenant/learn/useLearningPlan";
import AssignCoursesDrawer from "@/views/Forms/LearningPlans/AssignCoursesDrawer";
import Courses from "@/views/tabs/LearningPlan/Courses";
import Properties from "@/views/tabs/LearningPlan/Properties";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid, Paper, Tab } from "@mui/material";
import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
    const [value, setValue] = useState("0");
    const [drawerState, setDrawerState] = useState({ open: false, type: null });
    const { id } = useParams();
    const searchParams = useSearchParams();

    const { data, isLoading, error } = useLearningPlan({
        learningPlanId: id,
    });

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        switch (tabParam) {
            case "courses":
                setValue("1");
                break;
            case "enrollements":
                setValue("2");
                break;
            case "catalogs":
                setValue("3");
                break;
            case "channels":
                setValue("4");
                break;
            default:
                setValue("0");
                break;
        }
    }, [searchParams]);

    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12} >
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
                            // {
                            //     text: 'Enroll users',
                            //     variant: 'contained',
                            //     tooltip: 'Enroll users',
                            //     icon: 'solar-add-circle-linear',
                            //     onClick: () => setDrawerState({ open: true, type: 'enroll_users' })
                            // },
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
                {error ?
                    <Grid item xs={12}>
                        <StatusCard
                            type="error"
                            title={`Error ${error?.message || 500}`}
                            message="This learning plan is not available or does not exist. If you think this is a mistake, please contact support."
                        />
                    </Grid>
                    : <Grid item xs={12}>
                        <TabContext value={value}>
                            <Grid container spacing={4}>
                                <Grid item xs={12}>
                                    <Paper elevation={0} sx={{
                                        bgcolor: 'background.default',
                                    }}>
                                        <CustomTabList
                                            pill='true'
                                            onChange={handleChange}
                                            variant="fullWidth"
                                            sx={{
                                                '& .MuiTabs-flexContainer': {
                                                    width: '100%'
                                                }
                                            }}
                                        >
                                            <Tab value="0" label="Properties" disabled={isLoading} />
                                            <Tab value="1" label="Courses" disabled={isLoading} />
                                            <Tab value="2" label="Enrollements" disabled={isLoading} />
                                            <Tab value="3" label="Catalogs" disabled={isLoading} />
                                            <Tab value="4" label="Channels" disabled={isLoading} />
                                        </CustomTabList>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12}>
                                    <Paper elevation={0} sx={{
                                        border: value === "0" ? 0 : 1,
                                        borderColor: 'divider',
                                        padding: 3,
                                        bgcolor: value === "0" ? 'background.default' : 'background.paper',
                                    }}>
                                        <TabPanel value="0">
                                            {value === "0" && <Properties data={data} isLoading={isLoading} />}
                                        </TabPanel>
                                        <TabPanel value="1">
                                            {value === "1" && <Courses learningPlanId={id} />}
                                        </TabPanel>
                                        <TabPanel value="2">
                                            {value === "2" && <h1>Enrollements</h1>}
                                        </TabPanel>
                                        <TabPanel value="3">
                                            {value === "3" && <h1>Catalogs</h1>}
                                        </TabPanel>
                                        <TabPanel value="4">
                                            {value === "4" && <h1>Channels</h1>}
                                        </TabPanel>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </TabContext>
                    </Grid>}
            </Grid>
            {drawerState?.open && drawerState?.type === 'assign_courses' &&
                <AssignCoursesDrawer
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