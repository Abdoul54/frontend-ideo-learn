'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import { useTranslation } from "@/@core/contexts/translationContext";
import StatusCard from "@/components/StatusCard";
import ToolBar from "@/components/ToolBar";
import { usePowerUser } from "@/hooks/api/tenant/usePowerUsers";
import useUrlTabs from "@/hooks/useUrlTabs";
import AssignRessourcesDrawer from "@/views/Forms/PowerUsers/AssignRessourcesDrawer";
import AssignedRessources from "@/views/tabs/power-user/AssignedRessources";
import Properties from "@/views/tabs/power-user/Properties";
import { TabContext, TabPanel } from "@mui/lab";
import { Box, Grid2 as Grid, Paper, Tab } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";

const Page = () => {
    const { id } = useParams();
    const { data: powerUser, isLoading, error } = usePowerUser({ id })
    const { translate } = useTranslation();

    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'properties',
        validTabs: ['properties', 'assigned-ressources'],
    });

    const [drawerState, setDrawerState] = useState({ open: false, data: null, type: null });

    return (
        <>
            <Grid container spacing={4}>
                <Grid item size={12}>
                    <ToolBar
                        breadcrumbs={[{ label: translate('Power User & Profile Management.TAB_POWER_USERS'), link: `/powerusers` },
                        ...(powerUser?.username ? [{
                            label: powerUser?.username, ...(activeTab === 'assigned-ressources' && { link: `/powerusers/${id}` })
                        }] : []),
                        ...(activeTab === 'assigned-ressources' ? [{ label: translate('Power User & Profile Management.TAB_ASSIGNED_RESSOURCES') }] : [])
                        ]}
                        buttonGroup={[
                            {
                                text: translate('Power User & Profile Management.BUTTON_ASSIGN_RESOURCES'),
                                variant: 'outlined',
                                tooltip: translate('Power User & Profile Management.BUTTON_ASSIGN_RESOURCES'),
                                icon: 'solar-add-circle-outline',
                                onClick: () => setDrawerState({ open: true, data: powerUser, type: 'assign_resources' }),
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
                                        <Tab value="properties" label={translate('Power User & Profile Management.TAB_PROPERTIES')} />
                                        <Tab value="assigned-ressources" label={translate('Power User & Profile Management.TAB_ASSIGNED_RESSOURCES')} />
                                    </CustomTabList>
                                </Paper>
                            </Grid>
                            <Grid item size={12}>
                                {error || isLoading ?
                                    <Box mt={6}>
                                        <StatusCard
                                            type={isLoading ? 'loading' : 'error'}
                                            title={isLoading ? translate('Power User & Profile Management.LOADING_POWER_USER') : `${translate('Power User & Profile Management.ERROR')}: ${error?.message}`}
                                            message={
                                                isLoading ? translate('Power User & Profile Management.LOADING_MESSAGE') : translate('Power User & Profile Management.ERROR_MESSAGE')
                                            }
                                        />
                                    </Box>
                                    :
                                    <>
                                        <TabPanel value="properties">
                                            {activeTab === "properties" && <Properties powerUser={powerUser} translate={translate} />}
                                        </TabPanel>
                                        <TabPanel value="assigned-ressources">
                                            {activeTab === "assigned-ressources" && <AssignedRessources powerUser={powerUser} translate={translate} />}
                                        </TabPanel>
                                    </>
                                }
                            </Grid>
                        </Grid>
                    </TabContext>
                </Grid>
            </Grid>
            {drawerState?.open && drawerState?.type === 'assign_resources' && (
                <AssignRessourcesDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, data: null, type: null })}
                    data={drawerState?.data}
                    translate={translate}
                />
            )}

        </>
    );
}

export default Page;