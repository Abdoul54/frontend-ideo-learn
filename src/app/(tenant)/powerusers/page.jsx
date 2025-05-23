'use client'
import CustomTabList from "@/@core/components/mui/TabList";
import PowerUsers from "@/views/tabs/power-users/PowerUsers";
import Profile from "@/views/tabs/power-users/Profile";
import { TabContext, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import Grid from "@mui/material/Grid2";
import useUrlTabs from "@/hooks/useUrlTabs";
import ToolBar from "@/components/ToolBar";
import { useState } from "react";
import PowerUsersDrawer from "@/views/Forms/PowerUsers/PowerUsersDrawer";
import ProfilesDrawer from "@/views/Forms/Profiles/ProfilesDrawer";
import { useTranslation } from "@/@core/contexts/translationContext";

export default function Page() {
    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'power-users',
        validTabs: ['power-users', 'profiles'],
    });

    const { translate } = useTranslation()

    const [drawerState, setDrawerState] = useState({
        open: false,
        type: null,
        data: null
    });

    return (
        <>
            <Grid container >
                <Grid item size={12}>
                    <ToolBar
                        breadcrumbs={
                            activeTab === 'profiles'
                                ? [
                                    { label: translate('Power User & Profile Management.TAB_POWER_USERS'), link: '/powerusers?tab=power-users' },
                                    { label: translate('Power User & Profile Management.TAB_PROFILES'), link: '/powerusers' },
                                ]
                                : [{ label: translate('Power User & Profile Management.TAB_POWER_USERS'), link: '/powerusers' }]
                        }
                        buttonGroup={[
                            {
                                text: activeTab === 'profiles' ? translate('Power User & Profile Management.BUTTON_ADD_PROFILE') : translate('Power User & Profile Management.BUTTON_ADD_POWER_USER'),
                                variant: 'contained',
                                tooltip: activeTab === 'profiles' ? translate('Power User & Profile Management.MODAL_SUBTITLE_PROMOTE_USERS') : translate('Power User & Profile Management.MODAL_SUBTITLE_PROMOTE_USERS'),
                                icon: 'lucide-plus',
                                onClick: () => setDrawerState({ open: true, data: null, type: activeTab === 'profiles' ? 'add_profile' : 'add_power_user' }),
                            },
                        ]} />
                </Grid>
                <Grid item size={12} >
                    <TabContext value={activeTab}>
                        <Grid container>
                            <Grid item size={12}>
                                <CustomTabList
                                    onChange={handleTabChange}
                                    sx={{
                                        '& .MuiTabs-flexContainer': {
                                            width: '100%'
                                        }
                                    }}
                                >
                                    <Tab value="power-users" label={translate('Power User & Profile Management.TAB_POWER_USERS')} />
                                    <Tab value="profiles" label={translate('Power User & Profile Management.TAB_PROFILES')} />
                                </CustomTabList>
                            </Grid>
                            <Grid item size={12}>
                                <TabPanel value="power-users">
                                    <PowerUsers translate={translate} />
                                </TabPanel>
                                <TabPanel value="profiles">
                                    <Profile translate={translate} />
                                </TabPanel>
                            </Grid>
                        </Grid>
                    </TabContext>
                </Grid>
            </Grid>
            {/* Power user drawers */}
            {
                drawerState?.open && (drawerState?.type === 'edit_power_user' || drawerState?.type === 'add_power_user') && <PowerUsersDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, data: null, type: null })}
                    data={drawerState?.data}
                    translate={translate}
                />
            }


            {/* Profile drawers */}
            {
                drawerState?.open && drawerState?.type === 'add_profile' && <ProfilesDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, data: null })}
                    data={drawerState?.data}
                    translate={translate}
                />
            }
        </>
    );
}