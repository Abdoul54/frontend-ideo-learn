'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import ToolBar from "@/components/ToolBar";
import GrantPowerUsersDrawer from "@/views/Forms/Profiles/GrantPowerUsersDrawer";
import PowerUsers from "@/views/tabs/profiles/PowerUsers";
import Properties from "@/views/tabs/profiles/Properties";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid, Paper, Tab } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";

const Page = () => {
    const { id } = useParams();
    const [value, setValue] = useState("0");
    const [drawerState, setDrawerState] = useState({ open: false });

    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12} >
                    <ToolBar
                        breadcrumbs={[{ label: 'Profiles', link: `/manage/power-users?tab=profiles` }, { label: id }]}
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
                                        <Tab value="1" label="Power Users" />
                                    </CustomTabList>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                                    <TabPanel value="0">
                                        {value === "0" && <Properties profileId={id} />}
                                    </TabPanel>
                                    <TabPanel value="1">
                                        {value === "1" && <PowerUsers profileId={id} />}
                                    </TabPanel>
                                </Paper>
                            </Grid>
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