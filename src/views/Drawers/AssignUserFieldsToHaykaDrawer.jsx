import React, { use, useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Stack,
    Grid,
    FormControlLabel,
    Switch,
    CircularProgress,
    Alert,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useHaykal } from "@/hooks/api/tenant/useHaykal";
import DataTableNavigationPanel from "@/components/datatable/DataTableNavigationPanel";
import { useAssignUserFieldsToHaykal } from "@/hooks/api/tenant/useHaykal";
import toast from "react-hot-toast";

const AssignUserFieldsToHaykalDrawer = ({ open, onClose, userFieldIds }) => {
    const [selectedHaykalId, setSelectedHaykalId] = useState(1);
    const [allUserFields, setAllUserFields] = useState(false);
    const [showNavigationPanel, setShowNavigationPanel] = useState(false);
    const [navigationState, setNavigationState] = useState({
        currentItemId: 1,
        currentItemTitle: "Platform",
        searchQuery: "",
        page: 0,
        rowsPerPage: 10,
        breadcrumbs: [{ id: 1, title: "Platform" }],
    });

    useEffect(() => {
        if (!open) {
            setSelectedHaykalId(1);
            setAllUserFields(false);
            setShowNavigationPanel(false);
            setNavigationState({
                currentItemId: 1,
                currentItemTitle: "Platform",
                searchQuery: "",
                page: 0,
                rowsPerPage: 10,
                breadcrumbs: [{ id: 1, title: "Platform" }],
            });
        }
    }, [open]);

    // Fetch haykal data for navigation
    const { data: haykalData, isLoading: isLoadingHaykal } = useHaykal({
        page: navigationState.page + 1,
        page_size: navigationState.rowsPerPage,
        search: navigationState.searchQuery,
        haykal_id: navigationState.currentItemId,
        lang: "fr",
    }, { enabled: open });

    // Format navigation items
    const navigationItems = React.useMemo(() => {
        if (!haykalData?.data?.items) return [];
        return haykalData.data.items.map((item) => ({
            id: item.id,
            title: item.title || item.name || "Unnamed Item",
            has_children: item.has_children,
        }));
    }, [haykalData]);

    // Mutation to assign user fields
    const { mutate, isLoading } = useAssignUserFieldsToHaykal();

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedHaykalId) {
            toast.error("Please select a haykal");
            return;
        }
        mutate(
            { haykalId: selectedHaykalId, userFields: userFieldIds, all: allUserFields },
            {
                onSuccess: () => {
                    toast.success("User fields assigned successfully");
                    onClose();
                },
                onError: (error) => {
                    toast.error(error.response?.data?.message || "Failed to assign user fields");
                },
            }
        );
    };

    // Navigation handlers
    const handleNavigateForward = (id, title) => {
        setNavigationState((prev) => ({
            ...prev,
            currentItemId: id,
            currentItemTitle: title,
            page: 0,
            breadcrumbs: [...prev.breadcrumbs, { id, title }],
        }));
        setSelectedHaykalId(id);
    };

    const handleNavigateBack = () => {
        const newBreadcrumbs = [...navigationState.breadcrumbs];
        newBreadcrumbs.pop();
        if (newBreadcrumbs.length === 0) return;

        const prevItem = newBreadcrumbs[newBreadcrumbs.length - 1];
        setNavigationState((prev) => ({
            ...prev,
            currentItemId: prevItem.id,
            currentItemTitle: prevItem.title,
            breadcrumbs: newBreadcrumbs,
        }));
        setSelectedHaykalId(prevItem.id);
    };

    return (
        <DrawerFormContainer
            open={open}
            onClose={onClose}
            title="Assign User Fields to Haykal"
            description="Select a haykal to assign the user fields"
            width={500}
        >
            <form onSubmit={handleSubmit} style={{ height: '100%' }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    position: 'relative'
                }}>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: 8 }}>
                        <Stack spacing={3}>
                            {/* All User Fields Toggle */}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={allUserFields}
                                        onChange={(e) => setAllUserFields(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Assign all user fields"
                            />

                            {/* Haykal Selection */}
                            <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                    <Typography variant="body2" sx={{ fontWeight: "bold" }} color="text.secondary">
                                        Selected: {navigationState.currentItemTitle}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setShowNavigationPanel(!showNavigationPanel)}
                                        startIcon={<i className={`lucide-${showNavigationPanel ? "x" : "folder"}`} />}
                                    >
                                        {showNavigationPanel ? "Close" : "Browse Haykals"}
                                    </Button>
                                </Stack>

                                {showNavigationPanel && (
                                    <Box sx={{ mt: 2, height: 500 }}>
                                        <DataTableNavigationPanel
                                            height={500}
                                            data={navigationItems}
                                            currentItem={{
                                                id: navigationState.currentItemId,
                                                title: navigationState.currentItemTitle,
                                            }}
                                            GoBack={handleNavigateBack}
                                            GoForward={handleNavigateForward}
                                            searchQuery={navigationState.searchQuery}
                                            onSearchChange={(e) =>
                                                setNavigationState((prev) => ({
                                                    ...prev,
                                                    searchQuery: e.target.value,
                                                    page: 0,
                                                }))
                                            }
                                            isLoading={isLoadingHaykal}
                                            pagination={{
                                                page: navigationState.page,
                                                rowsPerPage: navigationState.rowsPerPage,
                                                count: haykalData?.pagination?.total || 0,
                                                onPageChange: (newPage) =>
                                                    setNavigationState((prev) => ({
                                                        ...prev,
                                                        page: newPage,
                                                    })),
                                                onRowsPerPageChange: (rowsPerPage) =>
                                                    setNavigationState((prev) => ({
                                                        ...prev,
                                                        rowsPerPage,
                                                        page: 0,
                                                    })),
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    </Box>

                    {/* Submit Button */}
                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: 'background.paper',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                        }}
                    >
                        <Grid container spacing={2} justifyContent="flex-end">
                            <Grid item>
                                <Button onClick={onClose} variant="outlined">
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={!selectedHaykalId || isLoading}
                                >
                                    {isLoading ? <CircularProgress size={24} /> : "Assign"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </form>
        </DrawerFormContainer>
    );
};

export default AssignUserFieldsToHaykalDrawer;