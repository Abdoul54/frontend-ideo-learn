'use client';

import CustomTabList from "@/@core/components/mui/TabList";
import ToolBar from "@/components/ToolBar";
import { useActivatePartner, usePartner, useRegeneratePartnerKeys } from "@/hooks/api/tenant/usePartners";
import RegenerateKeysDialog from "@/views/Dialogs/RegenerateKeysDialog";
import EditPartnerDrawer from "@/views/Forms/Partners/EditPartnerDrawer";
import Details from "@/views/tabs/partners/Details";
import Logs from "@/views/tabs/partners/Logs";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid, Paper, Tab } from "@mui/material";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
    const { name } = useParams();
    const [value, setValue] = useState("0");
    const [showKeysDialog, setShowKeysDialog] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [regeneratedKeys, setRegeneratedKeys] = useState(null);
    const activatePartner = useActivatePartner();
    const regeneratePartnerKeys = useRegeneratePartnerKeys();
    const searchParams = useSearchParams();


    useEffect(() => {
        const tabParam = searchParams.get("tab");
        setValue(tabParam === "logs" ? "1" : "0");
    }, [searchParams]);

    // Get partner details
    const { data: partner, isLoading, error } = usePartner(name);

    if (error) {
        throw error;
    }

    // Handle tab change
    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

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
                <Grid item xs={12} >
                    <ToolBar
                        breadcrumbs={[
                            { link: `/manage/partners/${name}`, label: partner?.name || name },
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
                                        <Tab value="0" label="Details" />
                                        <Tab value="1" label="Logs" />
                                    </CustomTabList>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                                    <TabPanel value="0">
                                        {value === "0" && <Details partner={partner} isLoading={isLoading} error={error} />}
                                    </TabPanel>
                                    <TabPanel value="1">
                                        {value === "1" && <Logs id={partner?.id} />}
                                    </TabPanel>
                                </Paper>
                            </Grid>
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