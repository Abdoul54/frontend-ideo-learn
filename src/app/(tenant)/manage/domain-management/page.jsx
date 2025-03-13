'use client'
import CustomTabList from "@/@core/components/mui/TabList";
import ToolBar from "@/components/ToolBar";
import EmailSenderDomains from "@/views/tabs/domain-management/EmailSenderDomains";
import MainDomain from "@/views/tabs/domain-management/MainDomain";
import SSLCertificates from "@/views/tabs/domain-management/SSLCertificates";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid, Paper, Tab } from "@mui/material";
import { useState } from "react";

export default function Page() {
    const [value, setValue] = useState("0");

    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} >
                <ToolBar
                    breadcrumbs={[{ label: 'Domain Management' }]}
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
                                    <Tab value="0" label="Main Domain" />
                                    <Tab value="1" label="Email Sender Domains" />
                                    <Tab value="2" label="SSL Certificates" />
                                </CustomTabList>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                                <TabPanel value="0">
                                    <MainDomain />
                                </TabPanel>
                                <TabPanel value="1">
                                    <EmailSenderDomains />
                                </TabPanel>
                                <TabPanel value="2">
                                    <SSLCertificates />
                                </TabPanel>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabContext>
            </Grid>
        </Grid>
    );
}