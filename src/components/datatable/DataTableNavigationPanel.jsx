import React, { useState, useMemo } from 'react';
import {
    Box,
    Button,
    Paper,
    Stack,
    TablePagination,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    Skeleton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for consistent appearance
const StyledScrollBox = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflow: 'auto',
    padding: theme.spacing(0, 2),
    height: '40%',
    '&::-webkit-scrollbar': {
        width: '0.4em'
    },
    '&::-webkit-scrollbar-track': {
        background: theme.palette.background.paper
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.primary.main,
        borderRadius: 2
    }
}));

const PaginationContainer = styled(Box)({
    flexShrink: 0
});

// Navigation Item Component with enhanced hover effects
const NavigationItem = ({ item, onNavigate }) => {
    const theme = useTheme();

    return (
        <Paper
            component={Button}
            fullWidth
            onClick={() => onNavigate(item.id, item.title)}
            sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
                borderRadius: 1,
                backgroundColor: 'background.paper',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[2],
                    '& .navigation-icon': {
                        color: theme.palette.primary.main,
                        transform: 'translateX(4px)'
                    }
                }
            }}
        >
            <Stack direction="row" gap={1} alignItems="center">
                <i
                    className="lucide-folder"
                    style={{
                        width: '24px',
                        height: '24px',
                        transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        color: theme.palette.text.secondary
                    }}
                />
                <Typography variant="subtitle1" color="text.primary" textTransform="capitalize">
                    {item.title}
                </Typography>
            </Stack>
            {item.has_children && (
                <i
                    className="solar-alt-arrow-right-bold-duotone navigation-icon"
                    style={{
                        width: '20px',
                        height: '20px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        color: theme.palette.text.secondary
                    }}
                />
            )}
        </Paper>
    );
};

// Loading Skeleton for better UX during data fetching
const NavigationItemSkeleton = () => (
    <Paper sx={{ p: 2, width: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={`${Math.floor(Math.random() * 60 + 20)}%`} />
        </Stack>
    </Paper>
);

const DataTableNavigationPanel = ({
    height,
    data = [],
    currentItem = { id: 1, title: 'Platform' },
    GoBack,
    GoForward,
    searchQuery = '',
    onSearchChange,
    isLoading = false,
    pagination = {
        page: 0,
        rowsPerPage: 5,
        count: 0,
        onPageChange: () => { },
        onRowsPerPageChange: () => { }
    }
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Ensure data is properly handled as an array
    const navigationItems = useMemo(() => {
        // Handle all possible data formats
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object' && data !== null) {
            // Handle if data might be an object with numerically indexed keys
            if (Object.keys(data).some(key => !isNaN(Number(key)))) {
                return Object.values(data);
            }
            // Handle if data itself should be wrapped as a single item
            if (data.id) {
                return [data];
            }
        }
        return [];
    }, [data]);

    // Handle search input changes
    const handleSearchChange = (e) => {
        if (onSearchChange) {
            onSearchChange(e);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                border: 1,
                borderColor: 'divider',
                borderTopLeftRadius: "10px",
                borderBottomLeftRadius: "10px",
                borderTopRightRadius: isMobile ? "10px" : 0,
                borderBottomRightRadius: isMobile ? "10px" : 0,
                padding: 1,
                height
            }}
        >
            {/* Header Section with Search and Navigation */}
            <Stack spacing={2} sx={{ p: 2 }}>
                <Stack direction="row" spacing={1}>
                    {currentItem?.id !== 1 && (
                        <IconButton
                            onClick={GoBack}
                            size="small"
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'primary.lighter',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <i className="solar-alt-arrow-left-bold-duotone" style={{ width: '20px', height: '20px' }} />
                        </IconButton>
                    )}
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="lucide-search" style={{ width: '20px', height: '20px' }} />
                                </InputAdornment>
                            )
                        }}
                    />
                </Stack>

                {/* Title with decorative underline */}
                <Stack alignItems="center" spacing={1}>
                    <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {currentItem?.title || 'Navigation'}
                    </Typography>
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            backgroundColor: 'primary.main',
                            borderRadius: 2
                        }}
                    />
                </Stack>
            </Stack>

            {/* Content Section with Navigation Items */}
            <StyledScrollBox>
                <Stack
                    spacing={2}
                    sx={{
                        py: 2,
                        px: 1,
                        height: '100%'
                    }}
                >
                    {isLoading ? (
                        // Display skeletons while loading
                        Array.from({ length: pagination?.rowsPerPage || 5 }).map((_, idx) => (
                            <NavigationItemSkeleton key={idx} />
                        ))
                    ) : navigationItems.length > 0 ? (
                        // Display navigation items
                        navigationItems.map(item => (
                            <NavigationItem key={item.id} item={item} onNavigate={GoForward} />
                        ))
                    ) : (
                        // Empty state
                        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                            <i className="lucide-circle-alert" style={{ width: '40px', height: '40px', color: theme.palette.text.disabled }} />
                            <Typography variant="body1" color="text.disabled">
                                No items found.
                            </Typography>
                        </Stack>
                    )}
                </Stack>
            </StyledScrollBox>

            {/* Pagination Section */}
            <PaginationContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 15, 25, 50]}
                    component="div"
                    count={pagination?.count || 0}
                    page={pagination?.page || 0}
                    rowsPerPage={pagination?.rowsPerPage || 5}
                    onPageChange={(e, page) => pagination?.onPageChange?.(page)}
                    onRowsPerPageChange={e => pagination?.onRowsPerPageChange?.(parseInt(e.target.value, 10))}
                    sx={{
                        '& .MuiTablePagination-toolbar': {
                            '& .MuiTablePagination-selectLabel': {
                                display: 'none'
                            }
                        }
                    }}
                />
            </PaginationContainer>
        </Paper>
    );
};

export default DataTableNavigationPanel;