'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import ToolBar from "@/components/ToolBar";
import { useSkillGroup } from "@/hooks/api/tenant/skills/useSkillGroups";
import SkillAssignmentDrawer from "@/views/Forms/Skills/SkillAssignmentDrawer";
import SkillDrawer from "@/views/Forms/Skills/SkillDrawer";
import AssignedSkills from "@/views/tabs/SkillGroup/AssignedSkills";
import Properties from "@/views/tabs/SkillGroup/Properties";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid, Paper, Tab } from "@mui/material";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
    const { id } = useParams();
    const [value, setValue] = useState("0");
    const searchParams = useSearchParams();
    const [drawerState, setDrawerState] = useState({ open: false, type: null, data: null });


    useEffect(() => {
        const tabParam = searchParams.get("tab");
        setValue(tabParam === "assigned_skills" ? "1" : "0");
    }, [searchParams]);

    const { data: skillGroup, error } = useSkillGroup({
        skillGroupId: id,
    });

    if (error) {
        throw error;
    }

    // Handle tab change
    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12} >
                    <ToolBar
                        breadcrumbs={[
                            { link: `/skills`, label: "Skill Sets" },
                            { link: `/skills/skill-groups/${id}`, label: skillGroup?.name || id },
                        ]}
                        buttonGroup={[
                            {
                                text: "Assign skills",
                                variant: 'outlined',
                                tooltip: 'Assign skills',
                                icon: 'solar-checklist-outline',
                                onClick: () => setDrawerState({ open: true, type: 'assign', data: skillGroup })
                            },
                            {
                                label: 'Create new skill',
                                icon: 'solar-add-circle-outline',
                                tooltip: 'Create a new skill',
                                onClick: () => setDrawerState({ open: true, type: 'skill' }),
                            }
                        ]}
                    />
                </Grid>
                <Grid item xs={12}>
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
                                        <Tab value="0" label="Properties" />
                                        <Tab value="1" label="Assigned skills" />
                                    </CustomTabList>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                                    <TabPanel value="0">
                                        {value === "0" && <Properties data={skillGroup} />}
                                    </TabPanel>
                                    <TabPanel value="1">
                                        {value === "1" && <AssignedSkills data={skillGroup} />}
                                    </TabPanel>
                                </Paper>
                            </Grid>
                        </Grid>
                    </TabContext>
                </Grid>
            </Grid>
            {drawerState?.open && drawerState?.type === 'skill' &&
                <SkillDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
            {drawerState?.open && drawerState?.type === 'assign' &&
                <SkillAssignmentDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
        </>
    );
}

export default Page;