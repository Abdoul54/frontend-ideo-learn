'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import { useTranslation } from "@/@core/contexts/translationContext";
import StatusCard from "@/components/StatusCard";
import ToolBar from "@/components/ToolBar";
import { useExportGroup, useGroup } from "@/hooks/api/tenant/useGroups";
import useUrlTabs from "@/hooks/useUrlTabs";
import GroupUsersDrawer from "@/views/Forms/Groups/GroupUsersDrawer";
import Properties from "@/views/tabs/Group/Properties";
import Users from "@/views/tabs/Group/Users";
import { TabContext, TabPanel } from "@mui/lab";
import { Box, Grid2 as Grid, Paper, Tab } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const { id } = useParams();
  const [drawerState, setDrawerState] = useState({ open: false });

  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 'properties',
    validTabs: ['properties', 'users'],
  });

  const { translate } = useTranslation();

  const { data, isLoading, error } = useGroup(id);

  const { data: exportData, isLoading: exportLoading, error: exportError } = useExportGroup({ id });

  return (
    <>
      <Grid container spacing={4}>
        <Grid item size={12} >
          <ToolBar
            breadcrumbs={[{ label: translate('Group Management.PAGE_TITLE_GROUPS'), link: '/manage/groups' }, { label: data?.name }]}
            buttonGroup={[
              ...(data?.type === 'manual'
                ? [{
                  text: translate('common.assign_users'),
                  variant: 'contained',
                  tooltip: translate('common.assign_users'),
                  icon: 'solar-add-circle-linear',
                  onClick: () => setDrawerState({ open: true })
                }]
                : []
              ),
              {
                text: translate('common.export'),
                variant: 'outlined',
                tooltip: translate('common.export'),
                icon: 'solar-download-outline',
                disabled: !exportData?.download_url || exportLoading || exportError,
                onClick: () => window.open(exportData?.download_url, '_blank')
              }
            ]}
          />
        </Grid>
        {error ? <Grid item size={12}>
          <StatusCard
            type="error"
            title={`Error ${error?.message || 500}`}
            message={translate('common.error_fetching_group_data')}
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
                      <Tab value="properties" label="Properties" disabled={isLoading || error} />
                      <Tab value="users" label="Users" disabled={isLoading || error} />
                    </CustomTabList>
                  </Paper>
                </Grid>
                <Grid item size={12}>
                  {error || isLoading ?
                    <Box mt={6}>
                      <StatusCard
                        type={isLoading ? 'loading' : 'error'}
                        title={isLoading ? "Loading the group" : `Error: ${error?.message}`}
                        message={
                          isLoading ? "Please wait while we load the group." : "An error occurred while loading the group."
                        }
                      />
                    </Box>
                    :
                    <>
                      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                        <TabPanel value="properties">
                          {activeTab === "properties" && <Properties groupId={id} />}
                        </TabPanel>
                        <TabPanel value="users">
                          {activeTab === "users" && <Users groupId={id} />}
                        </TabPanel>
                      </Paper>
                    </>
                  }
                </Grid>
              </Grid>
            </TabContext>
          </Grid>
        }
      </Grid>
      {drawerState?.open && id &&
        <GroupUsersDrawer
          open={drawerState?.open}
          onClose={() => setDrawerState({ open: false })}
          id={id}
        />
      }
    </>
  );
}

export default Page;