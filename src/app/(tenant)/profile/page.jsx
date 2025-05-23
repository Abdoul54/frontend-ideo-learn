'use client';

import {
    Tab,
    Grid2 as Grid,
    Paper
} from "@mui/material";
import ToolBar from "@/components/ToolBar";
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from "@/@core/components/mui/TabList";
import PersonalInfo from "@/views/tabs/profile/PersonalInfo";
import ChangePassword from "@/views/tabs/profile/ChangePassword";
import Preferences from "@/views/tabs/profile/Preferences";
import ConditionsOfUse from "@/views/tabs/profile/ConditionsOfUse";
import Skills from "@/views/tabs/profile/Skills";
import { useAdvancedSettings } from "@/@core/contexts/advancedSettingsContext";
import useUrlTabs from "@/hooks/useUrlTabs";


export default function Page() {
    const { advancedSettings } = useAdvancedSettings();

    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'personalInfo',
        validTabs: ['personalInfo', 'changePassword', 'preferences', 'conditionsOfUse', 'skills'],
    });


    const tabs = [
        { value: 'personalInfo', label: 'Personal Info', condition: true },
        { value: 'changePassword', label: 'Change Password', condition: advancedSettings?.user?.allow_password_change },
        { value: 'preferences', label: 'Preferences', condition: !advancedSettings?.user?.hide_preferences_tab },
        { value: 'conditionsOfUse', label: 'Conditions of use', condition: true },
        { value: 'skills', label: 'My skills', condition: true }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item size={12}>
                <ToolBar
                    breadcrumbs={[{
                        label: 'My Profile',
                        link: '/profile'
                    }]}
                />
            </Grid>
            <Grid item size={12}>
                <TabContext value={activeTab}>
                    <Grid container spacing={3}>
                        <Grid item size={{
                            xs: 12,
                            md: 3
                        }}>
                            <Paper elevation={0} sx={{ bgcolor: 'background.paper', padding: 4 }}>
                                <CustomTabList
                                    onChange={handleTabChange}
                                    orientation='vertical'
                                    variant="fullWidth"
                                    color="primary"
                                    vertical="true"

                                    sx={{
                                        width: '100%',
                                        '& .MuiTabs-flexContainer': {
                                            width: '100%'
                                        }
                                    }}
                                >
                                    {tabs.map(tab =>
                                        tab.condition && (
                                            <Tab
                                                key={tab.value}
                                                label={tab.label}
                                                value={tab.value}
                                            />
                                        )
                                    )}
                                </CustomTabList>
                            </Paper>
                        </Grid>
                        <Grid item size={{
                            xs: 12,
                            md: 9
                        }}>
                            {tabs.map(tab => (
                                <TabPanel key={tab.value} value={tab.value} sx={{ p: 0 }}>
                                    {tab.value === 'personalInfo' && <PersonalInfo />}
                                    {tab.value === 'changePassword' && <ChangePassword />}
                                    {tab.value === 'preferences' && <Preferences />}
                                    {tab.value === 'conditionsOfUse' && <ConditionsOfUse />}
                                    {tab.value === 'skills' && <Skills />}
                                </TabPanel>
                            ))}
                        </Grid>
                    </Grid>
                </TabContext>
            </Grid>
        </Grid>
    );
}
