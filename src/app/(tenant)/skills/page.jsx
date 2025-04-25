'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import ToolBar from "@/components/ToolBar";
import SkillDrawer from "@/views/Forms/Skills/SkillDrawer";
import SkillSetDrawer from "@/views/Forms/Skills/SkillSetDrawer";
import PlatformCatalog from "@/views/tabs/Skills/PlatformCatalog";
import SkillSets from "@/views/tabs/Skills/SkillSets";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid, Paper, Tab } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
    const [value, setValue] = useState("0");
    const [drawerState, setDrawerState] = useState({ open: false, type: null });
    const searchParams = useSearchParams();

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        setValue(tabParam === "platform_catalog" ? "1" : "0");
    }, [searchParams]);

    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12} >
                    <ToolBar
                        breadcrumbs={[{ label: 'Skills', link: '/skills' }]}
                        buttonGroup={[
                            {
                                text: 'Create Skill',
                                variant: 'contained',
                                tooltip: 'Create Skill',
                                icon: 'solar-add-circle-linear',
                                onClick: () => setDrawerState({ open: true, type: 'skill' })
                            },
                            {
                                text: 'Create Skill Group',
                                variant: 'contained',
                                tooltip: 'Create Skill Group',
                                icon: 'solar-add-folder-outline',
                                onClick: () => setDrawerState({ open: true, type: 'skill_group' })
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
                                        <Tab value="0" label="Skill Sets" />
                                        <Tab value="1" label="Platform Catalog" />
                                    </CustomTabList>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                                    <TabPanel value="0">
                                        {value === "0" && <SkillSets />}
                                    </TabPanel>
                                    <TabPanel value="1">
                                        {value === "1" && <PlatformCatalog setDrawerState={setDrawerState} />}
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