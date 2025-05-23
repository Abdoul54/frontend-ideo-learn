'use client';

import {
  Tab,
  Grid,
  Paper,
  Box,
  Skeleton
} from "@mui/material";
import SelfRegistration from "@/views/tabs/Settings/SelfRegistration";
import Users from "@/views/tabs/Settings/Users";
import DateTime from "@/views/tabs/Settings/DateTime";
import ToolBar from "@/components/ToolBar";
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from "@/@core/components/mui/TabList";
import { useSettingsMetadata } from "@/hooks/api/tenant/useSettingsMetadata";
import Password from "@/views/tabs/Settings/Password";
import AdvancedOptions from "@/views/tabs/Settings/AdvancedOptions";
import StatusCard from "@/components/StatusCard";
import useUrlTabs from "@/hooks/useUrlTabs"; // Import our custom hook

const LoadingSkeleton = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={3}>
      <Paper elevation={0} sx={{ height: '100%', bgcolor: 'transparent' }}>
        <Box sx={{ p: 2 }}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton
              key={item}
              variant="rectangular"
              height={48}
              sx={{ mb: 1, borderRadius: 1 }}
            />
          ))}
        </Box>
      </Paper>
    </Grid>
    <Grid item xs={12} md={9}>
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
        <Skeleton
          variant="text"
          height={40}
          width='20%'
          sx={{ mb: 4, borderRadius: 1 }}
        />
        {[1, 2, 3, 4].map((item) => (
          <Skeleton
            key={item}
            variant="rectangular"
            height={30}
            sx={{ mb: 4, borderRadius: 1 }}
          />
        ))}
      </Paper>
    </Grid>
  </Grid>
);

export default function Page() {
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 'register',
    validTabs: ['register', 'user', 'password', 'advancedoptions', 'date'],
  });

  const { data: metadata, isLoading, isError, error } = useSettingsMetadata();

  // Define available tabs based on metadata
  const visibleTabs = metadata ? Object.keys(metadata) : [];

  const tabs = [
    { value: 'register', label: 'Registration', condition: visibleTabs.includes('register') },
    { value: 'user', label: 'User', condition: visibleTabs.includes('user') },
    { value: 'password', label: 'Password', condition: visibleTabs.includes('password') },
    { value: 'advancedoptions', label: 'Advanced Options', condition: visibleTabs.includes('advancedoptions') },
    { value: 'date', label: 'Date and Time', condition: visibleTabs.includes('date') }
  ];

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <ToolBar
          breadcrumbs={[{
            label: 'Advanced Settings',
            link: '/settings/advanced-settings'
          }]}
        />
      </Grid>
      <Grid item xs={12}>
        {isError ? (
          <StatusCard
            type="error"
            title={`Error ${error?.message || 500}`}
            message="An error occurred while fetching settings. Please try again later. If the problem persists, contact support."
          />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : (
          <TabContext value={activeTab}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ bgcolor: 'background.paper', padding: 4 }}>
                  <CustomTabList
                    onChange={handleTabChange}
                    orientation='vertical'
                    variant="fullWidth"
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
              <Grid item xs={12} md={9}>
                {tabs.map(tab => (
                  <TabPanel key={tab.value} value={tab.value} sx={{ p: 0 }}>
                    {tab.value === 'register' && tab?.condition && <SelfRegistration />}
                    {tab.value === 'user' && tab?.condition && <Users />}
                    {tab.value === 'password' && tab?.condition && <Password />}
                    {tab.value === 'advancedoptions' && tab?.condition && <AdvancedOptions />}
                    {tab.value === 'date' && tab?.condition && <DateTime />}
                  </TabPanel>
                ))}
              </Grid>
            </Grid>
          </TabContext>
        )}
      </Grid>
    </Grid>
  );
}