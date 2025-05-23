'use client'

import CustomTabList from "@/@core/components/mui/TabList";
import { TabContext, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import Classrooms from "@/views/tabs/classrooms-locations/Classrooms";
import Locations from "@/views/tabs/classrooms-locations/Locations";
import ToolBar from "@/components/ToolBar";
import AssignLocationDrawer from "@/views/Forms/Classrooms/AssignLocationDrawer";
import ClassroomDrawer from "@/views/Forms/Classrooms/ClassroomDrawer";
import LocationsDrawer from "@/views/Forms/Locations/LocationsDrawer";
import useUrlTabs from "@/hooks/useUrlTabs";
import { useTranslation } from '@/@core/contexts/translationContext';

export default function Page() {
    const { translate } = useTranslation();
    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'classrooms',
        validTabs: ['classrooms', 'locations'],
    });

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
                        breadcrumbs={
                            activeTab === 'locations'
                                ? [
                                    { label: translate('CL management.TAB_CLASSROOMS', 'Classrooms'), link: '/learn/classroom-locations?tab=classrooms' },
                                    { label: translate('CL management.TAB_LOCATIONS', 'Locations') },
                                ]
                                : [{ label: translate('CL management.TAB_CLASSROOMS', 'Classrooms'), link: '/learn/classroom-locations' }]
                        }
                        buttonGroup={[
                            {
                                text: activeTab === 'locations' 
                                    ? translate('CL management.MODAL_TITLE_CREATE_LOCATION', 'Create New Location') 
                                    : translate('CL management.MODAL_TITLE_CREATE_CLASSROOM', 'Create Classroom'),
                                variant: 'contained',
                                tooltip: activeTab === 'locations' 
                                    ? translate('CL management.MODAL_SUBTITLE_CREATE_LOCATION', 'Fill in the details to create a new location') 
                                    : translate('CL management.MODAL_SUBTITLE_CREATE_CLASSROOM', 'Create a new classroom'),
                                icon: 'lucide-plus',
                                onClick: () => setDrawerState({ open: true, data: null, type: activeTab === 'locations' ? 'add_location' : 'add_classroom' }),
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
                            <Tab value="classrooms" label={translate('CL management.TAB_CLASSROOMS', 'Classrooms')} />
                            <Tab value="locations" label={translate('CL management.TAB_LOCATIONS', 'Locations')} />
                        </CustomTabList>
                    </Grid>
                    <Grid item size={12}>
                        <TabPanel value="classrooms">
                            <Classrooms drawerState={drawerState} setDrawerState={setDrawerState} />
                        </TabPanel>
                        <TabPanel value="locations">
                            <Locations drawerState={drawerState} setDrawerState={setDrawerState} />
                        </TabPanel>
                    </Grid>
                </Grid>
            </Grid>
            {
                drawerState?.open && (drawerState?.type === 'edit_location' || drawerState?.type === 'add_location') && <LocationsDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                    data={drawerState?.data}
                />
            }
            {
                drawerState?.open && (drawerState?.type === 'edit_classroom' || drawerState?.type === 'add_classroom') && <ClassroomDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                    data={drawerState?.data}
                />
            }
            {
                drawerState?.open && drawerState?.type === 'assign' && <AssignLocationDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                    data={drawerState?.data}
                />
            }
        </>
    );
}