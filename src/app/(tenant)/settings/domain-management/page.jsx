'use client'
import CustomTabList from "@/@core/components/mui/TabList";
import ToolBar from "@/components/ToolBar";
import useUrlTabs from "@/hooks/useUrlTabs";
import EmailSenderDomains from "@/views/tabs/domain-management/EmailSenderDomains";
import MainDomain from "@/views/tabs/domain-management/MainDomain";
import SSLCertificates from "@/views/tabs/domain-management/SSLCertificates";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid2 as Grid, Paper, Tab } from "@mui/material";

export default function Page() {
    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'main_domain',
        validTabs: ['main_domain', 'email_sender_domains', 'ssl_certificates'],
    });

    return (
        <Grid container spacing={4}>
            <Grid item size={12} >
                <ToolBar
                    breadcrumbs={[{ label: 'Domain Management' }]}
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
                                    <Tab value="main_domain" label="Main Domain" />
                                    <Tab value="email_sender_domains" label="Email Sender Domains" />
                                    <Tab value="ssl_certificates" label="SSL Certificates" />
                                </CustomTabList>
                            </Paper>
                        </Grid>
                        <Grid item size={12}>
                            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                                <TabPanel value="main_domain">
                                    <MainDomain />
                                </TabPanel>
                                <TabPanel value="email_sender_domains">
                                    <EmailSenderDomains />
                                </TabPanel>
                                <TabPanel value="ssl_certificates">
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