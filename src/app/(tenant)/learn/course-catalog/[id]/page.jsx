'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box,
    Grid,
    Chip,
    Avatar,
    Typography,
    Skeleton,
    Tab
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";

// Core components
import ToolBar from "@/components/ToolBar";
import StatusCard from "@/components/StatusCard";
import CustomTabList from "@/@core/components/mui/TabList";

// Custom components
import AssignedCourses from "@/views/tabs/catalogs/AssignedCourses";
import AssignedUsers from "@/views/tabs/catalogs/AssignedUsers";
import AssignContentsToCatalogDrawer from "@/views/Drawers/Learn/catalog/AssignContentsToCatalogDrawer";
import AssignUsersToCatalogDrawer from "@/views/Drawers/Learn/catalog/AssignUsersToCatalogDrawer";

// Hooks
import { useCatalog } from "@/hooks/api/tenant/learn/catalog/useCatalog";
import useUrlTabs from "@/hooks/useUrlTabs";
import { useTranslation } from '@/@core/contexts/translationContext';

const CatalogDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { translate } = useTranslation();

    // Drawer states
    const [drawerState, setDrawerState] = useState({
        assignContent: false,
        assignUsers: false
    });

    // Tab management 
    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: "assigned_courses",
        validTabs: ["assigned_courses", "assigned_users"],
    });

    // Fetch catalog details
    const {
        data: catalog,
        isLoading,
        error,
        refetch
    } = useCatalog({ id });

    // Handle back navigation
    const handleBackClick = () => {
        router.push('/learn/course-catalog');
    };

    // Drawer handlers
    const handleOpenAssignContentDrawer = () => {
        setDrawerState(prev => ({ ...prev, assignContent: true }));
    };

    const handleOpenAssignUsersDrawer = () => {
        setDrawerState(prev => ({ ...prev, assignUsers: true }));
    };

    const handleCloseDrawers = () => {
        setDrawerState({
            assignContent: false,
            assignUsers: false
        });
        // Refetch data when drawers close to get updates
        refetch();
    };

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <ToolBar
                        breadcrumbs={[
                            { label: translate('Catalog management.BREADCRUMB_CATALOGS', 'Catalogs'), link: '/learn/course-catalog' },
                            { label: catalog?.name || translate('Catalog management.BREADCRUMB_CATALOG_DETAILS', 'Catalog Details') }
                        ]}
                        component={
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="flex-start"
                                gap={2}
                            >
                                {isLoading ? (
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
                                ) : error ? (
                                    <Typography color="error">
                                        {translate('Catalog management.ERROR_LOADING_CATALOG', 'Error loading catalog')}
                                    </Typography>
                                ) : (
                                    <>
                                        <Avatar sx={{
                                            width: 42,
                                            height: 42,
                                            bgcolor: catalog?.thumbnail?.background_code_color || 'primary.main'
                                        }}>
                                            <i className={catalog?.thumbnail?.icon || 'solar-book-bold-duotone'} style={{
                                                color: catalog?.thumbnail?.icon_code_color || 'white',
                                                fontSize: 24,
                                            }} />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5">
                                                {catalog?.name}
                                            </Typography>
                                            {catalog?.sorting && (
                                                <Chip
                                                    label={translate('Catalog management.CHIP_SORT', `Sort: ${catalog.sorting.replace('_', ' ')}`)}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mr: 1, textTransform: 'capitalize' }}
                                                />
                                            )}
                                        </Box>
                                    </>
                                )}
                            </Box>
                        }
                        buttonGroup={[
                            {
                                text: translate('common.back', 'Back'),
                                variant: 'outlined',
                                tooltip: translate('Catalog management.TOOLTIP_BACK', 'Back to Catalogs'),
                                icon: 'solar-arrow-left-linear',
                                onClick: handleBackClick,
                            },
                            {
                                text: translate('Catalog management.BUTTON_ASSIGN_COURSES', 'Assign Courses'),
                                variant: 'contained',
                                tooltip: translate('Catalog management.TOOLTIP_ASSIGN_COURSES', 'Assign Courses to Catalog'),
                                icon: 'solar-book-2-bold-duotone',
                                onClick: handleOpenAssignContentDrawer,
                                disabled: isLoading || !!error
                            },
                            {
                                text: translate('Catalog management.BUTTON_ASSIGN_USERS', 'Assign Users'),
                                variant: 'contained',
                                tooltip: translate('Catalog management.TOOLTIP_ASSIGN_USERS', 'Assign Users to Catalog'),
                                icon: 'solar-user-plus-bold-duotone',
                                onClick: handleOpenAssignUsersDrawer,
                                disabled: isLoading || !!error
                            },
                        ]}
                    />
                </Grid>
                <Grid item xs={12} container component={TabContext} value={activeTab}>
                    <Grid item xs={12}>
                        <CustomTabList
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTabs-flexContainer': {
                                    width: '100%'
                                }
                            }}
                        >
                            <Tab 
                                value="assigned_courses" 
                                label={translate('Catalog management.TAB_ASSIGNED_COURSES', 'Assigned Courses')} 
                                disabled={error || isLoading} 
                            />
                            <Tab 
                                value="assigned_users" 
                                label={translate('Catalog management.TAB_ASSIGNED_USERS', 'Assigned Users')} 
                                disabled={error || isLoading} 
                            />
                        </CustomTabList>
                    </Grid>
                    <Grid item xs={12}>
                        {error || isLoading ? (
                            <Box mt={6}>
                                <StatusCard
                                    type={isLoading ? 'info' : 'error'}
                                    title={isLoading 
                                        ? translate('Catalog management.STATUS_LOADING', "Loading catalog") 
                                        : translate('Catalog management.STATUS_ERROR', `Error loading catalog`)}
                                    message={
                                        isLoading
                                            ? translate('Catalog management.STATUS_LOADING_MESSAGE', "Please wait while we load the catalog information.")
                                            : error?.message || translate('Catalog management.STATUS_ERROR_MESSAGE', "An error occurred while loading the catalog.")
                                    }
                                    showDivider={true}
                                    customIcon={isLoading ? <Skeleton variant="circular" width={36} height={36} /> : null}
                                />
                            </Box>
                        ) : (
                            <>
                                <TabPanel value="assigned_courses" sx={{ px: 0 }}>
                                    <AssignedCourses catalog={catalog} />
                                </TabPanel>
                                <TabPanel value="assigned_users" sx={{ px: 0 }}>
                                    <AssignedUsers catalog={catalog} />
                                </TabPanel>
                            </>
                        )}
                    </Grid>
                </Grid>
            </Grid>

            {/* Assign Content Drawer */}
            <AssignContentsToCatalogDrawer
                open={drawerState.assignContent}
                onClose={handleCloseDrawers}
                catalog={catalog}
            />

            {/* Assign Users Drawer */}
            <AssignUsersToCatalogDrawer
                open={drawerState.assignUsers}
                onClose={handleCloseDrawers}
                catalog={catalog}
            />
        </>
    );
};

export default CatalogDetailPage;