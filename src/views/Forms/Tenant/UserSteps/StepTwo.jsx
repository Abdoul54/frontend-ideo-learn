// frontend/src/views/Forms/Tenant/UserSteps/StepTwo.jsx
import { useState } from "react";
import {
    Grid,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress,
    Button,
    Box,
    Breadcrumbs
} from "@mui/material";
import { useHaykal } from "@/hooks/api/tenant/useHaykal";
import CheckboxesGroup from "@/components/inputs/CheckboxesGroup";
import { useHistoryNavigation } from "@/hooks/useHistoryNavigation";
import { useWatch } from "react-hook-form";

const StepTwo = ({ control }) => {
    // State management
    const [searchInput, setSearchInput] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

    // Branch navigation
    const {
        history,
        currentItem,
        goForward,
        goBack,
        goToBreadcrumb
    } = useHistoryNavigation(
        { id: 1, title: 'Platform' },
        (item, action) => {
            if (action === 'forward') {
                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                setSearchInput('');
            }
        }
    );

    // Data fetching
    const { data: haykalData, isLoading: isHaykalLoading } = useHaykal({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: searchInput,
        haykal_id: currentItem?.id,
    });

    console.log('haykaldata', haykalData);

    const selectedBranchIds = useWatch({ control, name: 'select_orgchart' });

    // Handlers
    const handleSearchChange = (value) => {
        setSearchInput(value);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const handleHaykalItemClick = (id, title) => {
        goForward({ id, title });

        // Replace this problematic line with a safer approach
        // This is likely causing the v.setValue is not a function error
        // control.setValue('select_orgchart', [...(selectedBranchIds || []), id]);

        // Instead, use the following safer approach:
        if (control && typeof control.setValue === 'function') {
            const currentValues = selectedBranchIds || [1];
            // Ensure we don't add duplicates
            if (!currentValues.includes(id)) {
                control.setValue('select_orgchart', [...currentValues, id]);
            }
        }
    };

    return (
        <>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                    Assign to Branches
                </Typography>
            </Grid>

            {/* Breadcrumbs */}
            <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    {history.length > 1 && (
                        <IconButton onClick={goBack} size="small">
                            <i className="lucide-chevron-left" />
                        </IconButton>
                    )}

                    <Breadcrumbs separator="›">
                        {history.map((item, index) => (
                            <Button
                                key={index}
                                variant="text"
                                color={currentItem.id === item.id ? 'primary' : 'inherit'}
                                onClick={() => goToBreadcrumb(item)}
                            >
                                {item.title}
                            </Button>
                        ))}
                    </Breadcrumbs>
                </Box>
            </Grid>

            {/* Search Field */}
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    placeholder="Search branches..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <i className="lucide-search" />
                            </InputAdornment>
                        ),
                        endAdornment: searchInput && (
                            <IconButton onClick={() => handleSearchChange('')} size="small">
                                <i className="lucide-x" />
                            </IconButton>
                        )
                    }}
                />
            </Grid>

            {/* Loading State */}
            {isHaykalLoading && (
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" ml={2}>
                            Loading branches...
                        </Typography>
                    </Box>
                </Grid>
            )}

            {/* Empty State */}
            {!isHaykalLoading && haykalData?.data?.length === 0 && (
                <Grid item xs={12}>
                    <Box
                        p={4}
                        textAlign="center"
                        border={1}
                        borderColor="divider"
                        borderRadius={1}
                    >
                        <i className="lucide-folder" style={{ fontSize: 40, opacity: 0.5 }} />
                        <Typography mt={2}>
                            {searchInput ? 'No branches found' : 'This branch is empty'}
                        </Typography>
                    </Box>
                </Grid>
            )}

            {/* Branches List */}
            {!isHaykalLoading && haykalData?.data?.items?.length > 0 && (
                <Grid item xs={12}>
                    <CheckboxesGroup
                        control={control}
                        name="select_orgchart"
                        items={
                            (haykalData?.data?.items || []).map(item => ({
                                id: item.id,
                                title: item.title,
                                has_children: item.has_children,
                                _style: {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': { backgroundColor: 'action.hover' }
                                }
                            }))
                        }
                        getItemId={(item) => item.id}
                        getItemLabel={(item) => item.title}
                        onItemClick={(id, title) => handleHaykalItemClick(id, title)}
                        pagination={{
                            count: haykalData?.data?.pagination?.total || 0,
                            page: pagination.pageIndex,
                            rowsPerPage: pagination.pageSize
                        }}
                        onPaginationChange={(newPagination) => {
                            setPagination({
                                pageIndex: newPagination.pageIndex,
                                pageSize: newPagination.pageSize
                            });
                        }}
                    />
                </Grid>
            )}
        </>
    );
};

export default StepTwo;