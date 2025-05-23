'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import StatusCard from "@/components/StatusCard";
import ToolBar from "@/components/ToolBar";
import { useProfile } from "@/hooks/api/tenant/useProfiles";
import useUrlTabs from "@/hooks/useUrlTabs";
import GrantPowerUsersDrawer from "@/views/Forms/Profiles/GrantPowerUsersDrawer";
import PowerUsers from "@/views/tabs/profiles/PowerUsers";
import Properties from "@/views/tabs/profiles/Properties";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid2 as Grid, Paper, Tab } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";

const Page = () => {
    const { id } = useParams();
    const [drawerState, setDrawerState] = useState({ open: false });
    const { data: profile, isLoading, error } = useProfile({ id });

    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'properties',
        validTabs: ['properties', 'powerusers'],
    });

    return (
        <>
            <Grid container spacing={4}>
                <Grid item size={12} >
                    <ToolBar
                        breadcrumbs={[
                            { label: 'Profiles', link: `/powerusers?tab=profiles` },
                            ...(!error && !isLoading ? [{ label: profile?.name }] : []),
                            ...(activeTab === 'powerusers' && (!error && !isLoading) ? [{ label: "Power Users" }] : []),
                        ]}
                        buttonGroup={[
                            {
                                text: 'Grant Power Users',
                                variant: 'outlined',
                                tooltip: 'Grant Power Users',
                                icon: 'solar-add-circle-outline',
                                onClick: () => setDrawerState({ open: true, data: { id } })

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
                                        <Tab value="properties" label="Properties" disabled={error || isLoading} />
                                        <Tab value="powerusers" label="Power Users" disabled={error || isLoading} />
                                    </CustomTabList>
                                </Paper>
                            </Grid>
                            {
                                error || isLoading ?
                                    <Grid item size={12}>
                                        <StatusCard
                                            type={isLoading ? 'loading' : 'error'}
                                            title={isLoading ? "Loading the profile" : `Error: ${error?.message}`}
                                            message={
                                                isLoading ? "Please wait while we load the profile." : "An error occurred while loading the profile."
                                            }
                                        />
                                    </Grid>
                                    :
                                    <Grid item size={12}>
                                        <TabPanel value="properties">
                                            {activeTab === "properties" && <Properties profile={profile} />}
                                        </TabPanel>
                                        <TabPanel value="powerusers">
                                            {activeTab === "powerusers" && <PowerUsers profileId={id} />}
                                        </TabPanel>
                                    </Grid>
                            }
                        </Grid>
                    </TabContext>
                </Grid>
            </Grid>
            {drawerState?.open && id &&
                <GrantPowerUsersDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false })}
                    data={drawerState?.data}
                />
            }
        </>
    );
}

export default Page;