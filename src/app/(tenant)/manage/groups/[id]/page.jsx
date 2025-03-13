'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import ToolBar from "@/components/ToolBar";
import { useExportGroup, useGroup } from "@/hooks/api/tenant/useGroups";
import GroupUsersDrawer from "@/views/Forms/Groups/GroupUsersDrawer";
import Properties from "@/views/tabs/Group/Properties";
import Users from "@/views/tabs/Group/Users";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid, Paper, Tab } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const { id } = useParams();
  const [value, setValue] = useState("0");
  const [drawerState, setDrawerState] = useState({ open: false });

  const { data, error } = useGroup(id);

  const { data: exportData, isLoading: exportLoading, error: exportError } = useExportGroup({ id });

  if (error) throw error;

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12} >
          <ToolBar
            breadcrumbs={[{ label: 'Groups', link: '/manage/groups' }, { label: data?.name }]}
            buttonGroup={[
              ...(data?.type === 'manual'
                ? [{
                  text: 'Assign Users',
                  variant: 'contained',
                  tooltip: 'Assign Users',
                  icon: 'solar-add-circle-linear',
                  onClick: () => setDrawerState({ open: true })
                }]
                : []
              ),
              {
                text: 'Export',
                variant: 'outlined',
                tooltip: 'Export',
                icon: 'solar-download-outline',
                disabled: !exportData?.download_url || exportLoading || exportError,
                onClick: () => window.open(exportData?.download_url, '_blank')
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
                    <Tab value="0" label="Properties" />
                    <Tab value="1" label="Users" />
                  </CustomTabList>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                  <TabPanel value="0">
                    {value === "0" && <Properties groupId={id} />}
                  </TabPanel>
                  <TabPanel value="1">
                    {value === "1" && <Users groupId={id} />}
                  </TabPanel>
                </Paper>
              </Grid>
            </Grid>
          </TabContext>
        </Grid>
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