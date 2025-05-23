'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import ToolBar from "@/components/ToolBar";
import useUrlTabs from "@/hooks/useUrlTabs";
import SkillDrawer from "@/views/Forms/Skills/SkillDrawer";
import SkillSetDrawer from "@/views/Forms/Skills/SkillSetDrawer";
import PlatformCatalog from "@/views/tabs/Skills/PlatformCatalog";
import SkillSets from "@/views/tabs/Skills/SkillSets";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid2 as Grid, Paper, Tab } from "@mui/material";
import { useState } from "react";
import { useTranslation } from '@/@core/contexts/translationContext';

const Page = () => {
    const { translate } = useTranslation();

    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'skill_sets',
        validTabs: ['skill_sets', 'platform_catalog'],
    });

    const [drawerState, setDrawerState] = useState({ open: false, type: null });

    return (
        <>
            <Grid container spacing={4}>
                <Grid item size={12} >
                    <ToolBar
                        breadcrumbs={[{ label: translate('Skill management.PAGE_TITLE_SKILLS', 'Skills'), link: '/skills' }]}
                        buttonGroup={[
                            {
                                text: translate('Skill management.MODAL_TITLE_CREATE_SKILL', 'Create Skill'),
                                variant: 'contained',
                                tooltip: translate('Skill management.MODAL_TITLE_CREATE_SKILL', 'Create Skill'),
                                icon: 'solar-add-circle-linear',
                                onClick: () => setDrawerState({ open: true, type: 'skill' })
                            },
                            {
                                text: translate('Skill management.MODAL_TITLE_NEW_SKILL_SET', 'Create Skill Set'),
                                variant: 'contained',
                                tooltip: translate('Skill management.MODAL_TITLE_NEW_SKILL_SET', 'Create Skill Set'),
                                icon: 'solar-add-folder-outline',
                                onClick: () => setDrawerState({ open: true, type: 'skill_group' })
                            }
                        ]}
                    />
                </Grid>
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
                                        <Tab value="skill_sets" label={translate('Skill management.TAB_SKILL_SETS', 'Skill Sets')} />
                                        <Tab value="platform_catalog" label={translate('Skill management.TAB_PLATFORM_CATALOG', 'Platform Catalog')} />
                                    </CustomTabList>
                                </Paper>
                            </Grid>
                            <Grid item size={12}>
                                <TabPanel value="skill_sets">
                                    {activeTab === "skill_sets" && <SkillSets />}
                                </TabPanel>
                                <TabPanel value="platform_catalog">
                                    {activeTab === "platform_catalog" && <PlatformCatalog setDrawerState={setDrawerState} />}
                                </TabPanel>
                            </Grid>
                        </Grid>
                    </TabContext>
                </Grid>
            </Grid>
            {drawerState?.open && drawerState?.type === 'skill' &&
                <SkillDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
            {drawerState?.open && drawerState?.type === 'skill_group' &&
                <SkillSetDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
        </>
    );
}

export default Page;