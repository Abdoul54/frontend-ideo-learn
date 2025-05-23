'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import StatusCard from "@/components/StatusCard";
import ToolBar from "@/components/ToolBar";
import { useActivatePartner, usePartner, useRegeneratePartnerKeys } from "@/hooks/api/tenant/usePartners";
import useUrlTabs from "@/hooks/useUrlTabs";
import RegenerateKeysDialog from "@/views/Dialogs/RegenerateKeysDialog";
import EditPartnerDrawer from "@/views/Forms/Partners/EditPartnerDrawer";
import Details from "@/views/tabs/partners/Details";
import Logs from "@/views/tabs/partners/Logs";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid2 as Grid, Paper, Tab } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
    const { name } = useParams();
    const [showKeysDialog, setShowKeysDialog] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [regeneratedKeys, setRegeneratedKeys] = useState(null);
    const activatePartner = useActivatePartner();
    const regeneratePartnerKeys = useRegeneratePartnerKeys();

    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'details',
        validTabs: ['details', 'logs'],
    });

    // Get partner details
    const { data: partner, isLoading, error } = usePartner(name);


    // Enhanced handler for regenerating keys
    const handleRegenerateKeys = () => {
        regeneratePartnerKeys.mutate(partner.id, {
            onSuccess: (data) => {
                setRegeneratedKeys({
                    apiKey: data.api_key,
                    secretKey: data.api_secret
                });
                setShowKeysDialog(true);
            }
        });
    };

    return (
        <>
            <Grid container spacing={4}>
                <Grid item size={12} >
                    <ToolBar
                        breadcrumbs={[
                            { link: `/manage/partners/${name}`, label: partner?.name || name },
                            ...(activeTab === 'logs' && (!error && !isLoading) ? [{ label: "Logs" }] : []),
                        ]}
                        buttonGroup={[
                            {
                                text: partner?.is_active ? 'Deactivate' : 'Activate',
                                variant: 'outlined',
                                tooltip: activatePartner.isPending ? 'svg-spinners-90-ring-with-bg' : partner?.is_active ? 'Deactivate Partner' : 'Activate Partner',
                                icon: partner?.is_active ? 'solar-stop-circle-outline' : 'solar-play-circle-outline',
                                disabled: error || isLoading,
                                onClick: () => activatePartner.mutateAsync(partner?.id).then(() => {
                                    if (partner?.is_active) {
                                        toast.success('Partner deactivated successfully');
                                    } else {
                                        toast.success('Partner activated successfully');
                                    }
                                })
                            },
                            {
                                text: 'Edit',
                                variant: 'outlined',
                                tooltip: 'Edit Partner',
                                icon: 'solar-pen-linear',
                                disabled: !partner?.is_active || error || isLoading,
                                onClick: () => setOpenDrawer(true),
                            },
                            {
                                label: 'Regenerate Keys',
                                icon: 'solar-refresh-outline',
                                tooltip: 'Regenerate API keys',
                                onClick: handleRegenerateKeys,
                                disabled: !partner?.is_active || error || isLoading
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
                                        <Tab value="details" label="Details" disabled={error || isLoading} />
                                        <Tab value="logs" label="Logs" disabled={error || isLoading} />
                                    </CustomTabList>
                                </Paper>
                            </Grid>
                            {
                                error || isLoading ?
                                    <Grid item size={12}>
                                        <StatusCard
                                            type={isLoading ? 'loading' : 'error'}
                                            title={isLoading ? "Loading the partner" : `Error: ${error?.message}`}
                                            message={
                                                isLoading ? "Please wait while we load the partner." : "An error occurred while loading the partner."
                                            }
                                        />
                                    </Grid>
                                    :
                                    <Grid item size={12}>
                                        <TabPanel value="details">
                                            {activeTab === "details" && <Details partner={partner} isLoading={isLoading} error={error} />}
                                        </TabPanel>
                                        <TabPanel value="logs">
                                            {activeTab === "logs" && <Logs id={partner?.id} />}
                                        </TabPanel>
                                    </Grid>
                            }
                        </Grid>
                    </TabContext>
                </Grid>
            </Grid >
            <EditPartnerDrawer
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                data={partner}
            />
            {/* Regenerate Keys Dialog */}
            <RegenerateKeysDialog
                open={showKeysDialog}
                onClose={() => setShowKeysDialog(false)}
                keys={regeneratedKeys}
                isLoading={regeneratePartnerKeys.isLoading}
                error={regeneratePartnerKeys.error?.message}
            />
        </>
    );
}

export default Page;