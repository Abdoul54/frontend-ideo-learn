'use client';

import { useState } from "react";
import {
  Tab,
  Grid,
  Paper,
  Box,
  Skeleton,
  Alert,
  AlertTitle
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
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams()
  const [tabIndex, setTabIndex] = useState('register');
  const { data: metadata, isLoading, isError } = useSettingsMetadata();

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const visibleTabs = metadata ? Object.keys(metadata) : [];

  const tabs = [
    { value: 'register', label: 'Registration', condition: visibleTabs.includes('register') },
    { value: 'user', label: 'User', condition: visibleTabs.includes('user') },
    { value: 'password', label: 'Password', condition: visibleTabs.includes('password') },
    { value: 'advancedoptions', label: 'Advanced Options', condition: visibleTabs.includes('advancedoptions') },
    { value: 'date', label: 'Date and Time', condition: visibleTabs.includes('date') }
  ];

  return (
    <Grid container>
      <Grid item xs={12}>
        <ToolBar
          breadcrumbs={[{
            label:'Advanced Settings',
            link:'/manage/advanced-settings'
          }]}
        />
      </Grid>
      <Grid item xs={12}>
        {isError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            Failed to load settings. Please try again later or contact support if the problem persists.
          </Alert>
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : (
          <TabContext value={tabIndex}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ height: '100%', bgcolor: 'transparent' }}>
                  <CustomTabList
                    pill='true'
                    onChange={handleChange}
                    orientation='vertical'
                    variant="fullWidth"
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
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                  {tabs.map(tab => (
                    <TabPanel key={tab.value} value={tab.value} sx={{ p: 0 }}>
                      {tab.value === 'register' && <SelfRegistration />}
                      {tab.value === 'user' && <Users />}
                      {tab.value === 'password' && <Password />}
                      {tab.value === 'advancedoptions' && <AdvancedOptions />}
                      {tab.value === 'date' && <DateTime />}
                    </TabPanel>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </TabContext>
        )}
      </Grid>
    </Grid>
  );
}
