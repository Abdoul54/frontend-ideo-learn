'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import StatusCard from "@/components/StatusCard";
import ToolBar from "@/components/ToolBar";
import { useSkillGroup } from "@/hooks/api/tenant/skills/useSkillGroups";
import useUrlTabs from "@/hooks/useUrlTabs";
import SkillAssignmentDrawer from "@/views/Forms/Skills/SkillAssignmentDrawer";
import SkillDrawer from "@/views/Forms/Skills/SkillDrawer";
import AssignedSkills from "@/views/tabs/SkillGroup/AssignedSkills";
import Properties from "@/views/tabs/SkillGroup/Properties";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid2 as Grid, Paper, Tab } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";

const Page = () => {
    const { id } = useParams();
    const [drawerState, setDrawerState] = useState({ open: false, type: null, data: null });

    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'properties',
        validTabs: ['properties', 'assigned_skills'],
    });

    const { data: skillGroup, error, isLoading } = useSkillGroup({
        skillGroupId: id,
    });

    return (
        <>
            <Grid container spacing={4}>
                <Grid item size={12} >
                    <ToolBar
                        breadcrumbs={[
                            { link: `/skills`, label: translate('Skill management.TAB_SKILL_SETS', 'Skill Set') },
                            ...(!error ? [{ link: `/skills/skill-groups/${id}`, label: skillGroup?.name }] : []),
                            ...(activeTab === 'assigned_skills' ? [{ label: translate('Skill management.TAB_ASSIGNED_SKILLS', 'Assigned Skills') }] : []),
                        ]}
                        buttonGroup={[
                            {
                                text: translate('Skill management.TEXT_ASSIGN_SKILLS', 'Assign Skills'),
                                variant: 'outlined',
                                tooltip: translate('Skill management.TOOLTIP_ASSIGN_SKILLS', 'Assign Skills'),
                                icon: 'solar-checklist-outline',
                                onClick: () => setDrawerState({ open: true, type: 'assign', data: skillGroup })
                            },
                            {
                                label: translate('Skill management.TEXT_CREATE_SKILL', 'Create Skill'),
                                icon: 'solar-add-circle-outline',
                                tooltip: translate('Skill management.TOOLTIP_CREATE_SKILL', 'Create a new skill'),
                                onClick: () => setDrawerState({ open: true, type: 'skill' }),
                            }
                        ]}
                    />
                </Grid>
                {
                    error || isLoading ?

                        <Grid item size={12}>
                            <StatusCard
                                type={isLoading ? 'loading' : 'error'}
                                title={isLoading ? "Loading skill group..." : `Error: ${error?.message}`}
                                message={
                                    isLoading ? "Please wait while we load the skill group." : "An error occurred while loading the skill group."
                                }
                            />
                        </Grid>
                        :
                        <Grid item size={12}>
                            <TabContext value={activeTab}>
                                <Grid container spacing={4}>
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
                                                <Tab value="properties" label={translate('Skill management.TAB_PROPERTIES', 'Properties')} />
                                                <Tab value="assigned_skills" label={translate('Skill management.TAB_ASSIGNED_SKILLS', 'Assigned skills')} />
                                            </CustomTabList>
                                        </Paper>
                                    </Grid>
                                    <Grid item size={12}>
                                        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                                            <TabPanel value="properties">
                                                {activeTab === "properties" && <Properties data={skillGroup} />}
                                            </TabPanel>
                                            <TabPanel value="assigned_skills">
                                                {activeTab === "assigned_skills" && <AssignedSkills data={skillGroup} />}
                                            </TabPanel>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TabContext>
                        </Grid>

                }
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