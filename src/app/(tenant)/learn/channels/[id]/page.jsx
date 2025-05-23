'use client'

import CustomTabList from "@/@core/components/mui/TabList";
import StatusCard from "@/components/StatusCard";
import ToolBar from "@/components/ToolBar";
import { useChannel } from "@/hooks/api/tenant/learn/useChannels";
import useUrlTabs from "@/hooks/useUrlTabs";
import ContentsDrawer from "@/views/Forms/Channel/ContentsDrawer";
import Contents from "@/views/tabs/Channels/Contents";
import Properties from "@/views/tabs/Channels/Properties";
import { TabContext, TabPanel } from "@mui/lab";
import { Avatar, Box, Grid2 as Grid, Skeleton, Tab, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from '@/@core/contexts/translationContext';

const Page = () => {
    const { translate } = useTranslation();
    const { id } = useParams();

    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: "properties",
        validTabs: ["properties", "content"],
    })

    const { data: channel, isLoading, error } = useChannel(id);

    const [drawerState, setDrawerState] = useState({
        open: false,
        type: null,
        data: null
    });

    return (
        <>
            <Grid container spacing={4}>
                <Grid item size={12} >
                    <ToolBar
                        component={
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                gap={2}
                                sx={{ width: '100%' }}
                            >
                                {isLoading ?
                                    <>
                                        <Skeleton
                                            variant="circular"
                                            width={42}
                                            height={42}
                                            sx={{ bgcolor: 'grey.300' }}
                                            animation="wave"
                                        />
                                        <Skeleton
                                            variant="text"
                                            width={150}
                                            height={42}
                                            animation="wave"
                                        />

                                    </>
                                    : error ?
                                        null
                                        :
                                        <>
                                            <Avatar sx={{
                                                width: 42, height: 42, bgcolor: channel?.thumbnail?.background_code_color
                                            }} >
                                                <i className={channel?.thumbnail?.icon} style={{
                                                    color: channel?.thumbnail?.icon_code_color, fontSize: 24,
                                                }} />
                                            </Avatar>
                                            <Typography variant="h5" >
                                                {channel?.name}
                                            </Typography>
                                        </>
                                }
                            </Box>
                        }
                        buttonGroup={[
                            {
                                text: translate('Channel management.BUTTON_ASSIGN_CONTENT', 'Assign Content'),
                                variant: 'contained',
                                tooltip: translate('Channel management.TOOLTIP_ASSIGN_CONTENT', 'Assign content to this channel'),
                                icon: 'lucide-plus',
                                disabled: isLoading || error,
                                onClick: () => setDrawerState({ open: true, data: channel, type: 'assign_content' }),
                            },
                            {
                                text: translate('Channel management.BUTTON_CHANNEL_VIEW', 'Channel View'),
                                variant: 'contained',
                                tooltip: translate('Channel management.TOOLTIP_CHANNEL_VIEW', 'View channel as a user'),
                                icon: 'lucide-eye',
                                disabled: isLoading || error,
                                onClick: () => setDrawerState({ open: true, data: channel, type: 'channel_view' }),
                            },
                        ]} />
                </Grid>
                <Grid item size={12} container component={TabContext} value={activeTab}>
                    <Grid item size={12}>
                        <CustomTabList
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTabs-flexContainer': {
                                    width: '100%'
                                }
                            }}
                        >
                            <Tab value="properties" label={translate('Channel management.TAB_PROPERTIES', 'Properties')} disabled={error || isLoading} />
                            <Tab value="content" label={translate('Channel management.TAB_CONTENT', 'Content')} disabled={error || isLoading} />
                        </CustomTabList>
                    </Grid>
                    <Grid item size={12}>
                        {error || isLoading ?
                            <Box mt={6}>
                                <StatusCard
                                    type={isLoading ? 'loading' : 'error'}
                                    title={isLoading ? 
                                        translate('Channel management.STATUS_LOADING_CHANNEL', 'Loading the channel') : 
                                        translate('Channel management.STATUS_ERROR', { message: error?.message })
                                    }
                                    message={
                                        isLoading ? 
                                          translate('Channel management.MESSAGE_LOADING_CHANNEL', 'Please wait while we load the channel.') : 
                                          translate('Channel management.MESSAGE_ERROR_LOADING', 'An error occurred while loading the channel.')
                                    }
                                />
                            </Box>
                            :
                            <>
                                <TabPanel value="properties">
                                    <Properties channel={channel} />
                                </TabPanel>
                                <TabPanel value="content">
                                    <Contents channelId={channel?.id} />
                                </TabPanel>
                            </>
                        }
                    </Grid>
                </Grid>
            </Grid>
            {
                drawerState.open && drawerState?.type === 'assign_content' && <ContentsDrawer
                    open={drawerState.open}
                    onClose={() => setDrawerState({ open: false, data: null, type: null })}
                    data={drawerState.data}
                />
            }
        </>
    );
}

export default Page;