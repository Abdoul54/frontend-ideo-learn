import { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    TextField,
    Stack,
    Paper,
    Skeleton,
    Button,
    InputAdornment,
    Pagination,
    TablePagination
} from '@mui/material';
import SearchTypeDropdown from '../SearchTypeDropDown';

const NavigationItem = ({ item, onNavigate }) => {
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
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    '& .navigation-icon': {
                        color: 'primary.main',
                        transform: 'translateX(4px)'
                    }
                }
            }}
        >
            <Stack direction="row" gap={1} alignItems="center">
                <i
                    className="solar-monitor-bold-duotone"
                    style={{
                        width: '24px',
                        height: '24px',
                        transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        color: 'inherit'
                    }}
                />
                <Typography variant="subtitle1" color="text.primary" sx={{ textTransform: 'capitalize' }}>
                    {item.title}
                </Typography>
            </Stack>
            <i
                className="solar-alt-arrow-right-bold-duotone navigation-icon"
                style={{
                    width: '20px',
                    height: '20px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: 'inherit'
                }}
            />
        </Paper>
    );
};

const NavigationItemSkeleton = () => (
    <Paper sx={{ p: 2, width: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={`${Math.floor(Math.random() * 60 + 20)}%`} />
        </Stack>
    </Paper>
);

const MobileDataTableNavigation = ({
    height = '100vh',
    currentItem = { id: 1, title: 'Platform' },
    GoBack,
    GoForward,
    searchQuery = '',
    onSearchChange,
    isLoading = false,
    data = [],
    pagination,
    open,
    onClose,
    footerComponent,
    searchType,
    onSearchTypeChange,
    enableSearchType = false
}) => {
    console.log('MobileDataTableNavigation', currentItem, data);

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: '100%',
                    maxWidth: '320px'
                }
            }}
        >
            <Paper sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                height: height,
                borderRadius: 0
            }}>
                {/* Header with Search */}
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
                                <i className="solar-arrow-left-bold-duotone" />
                            </IconButton>
                        )}
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={onSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <i className="solar-magnifer-bold-duotone" />
                                    </InputAdornment>
                                ),
                                ...(enableSearchType && {
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <SearchTypeDropdown
                                                value={searchType}
                                                onChange={onSearchTypeChange}
                                                disabled={isLoading}
                                            />
                                        </InputAdornment>
                                    )
                                })
                            }}
                        />
                    </Stack>

                    <Stack alignItems="center" spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                            {currentItem?.title || 'Navigation'}
                        </Typography>
                        <Box sx={{
                            width: 40,
                            height: 4,
                            backgroundColor: 'primary.main',
                            borderRadius: 2
                        }} />
                    </Stack>
                </Stack>

                {/* Content */}
                <Box sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    px: 2,
                    '&::-webkit-scrollbar': {
                        width: '4px'
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'background.paper'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'primary.main',
                        borderRadius: 2
                    }
                }}>
                    <Stack spacing={2} sx={{ height: '100%', py: 2, px: 1 }}>
                        {isLoading ? (
                            Array.from({ length: pagination?.rowsPerPage || 5 }).map((_, idx) => (
                                <NavigationItemSkeleton key={idx} />
                            ))
                        ) : data?.length > 0 ? (
                            data.map(item => (
                                <NavigationItem key={item.id} item={item} onNavigate={GoForward} />
                            ))
                        ) : (
                            <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ height: '100%', py: 8 }}>
                                <i className="solar-danger-bold-duotone" style={{ fontSize: 40, color: 'text.disabled' }} />
                                <Typography variant="body1" color="text.disabled">
                                    No items found.
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Box>

                {/* Pagination Footer */}
                {pagination && (
                    <Box
                        sx={{
                            padding: 1,
                            borderTop: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <TablePagination
                            component={Paper}
                            elevation={0}
                            count={pagination?.count || 0}
                            rowsPerPage={pagination?.rowsPerPage || 10}
                            page={pagination?.page || 0}
                            onPageChange={(_, newPage) => {
                                pagination?.onPageChange?.(newPage)
                            }}
                            onRowsPerPageChange={e => {
                                pagination?.onRowsPerPageChange?.(e.target.value)
                            }}
                            rowsPerPageOptions={[]}
                            labelRowsPerPage={""}
                            sx={{
                                width: 1,
                                '& .MuiTablePagination-selectLabel': {
                                    display: 'none',
                                },
                                '& .MuiTablePagination-input': {
                                    display: 'none',
                                },
                                '& .MuiTablePagination-spacer': {
                                    display: 'none',
                                },
                                '& .MuiTablePagination-actions': {
                                    display: 'flex',
                                    gap: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                },
                                '& .MuiTablePagination-caption': {
                                    display: 'none',
                                },
                                '& .MuiTablePagination-select': {
                                    display: 'none',
                                },
                                '& .MuiTablePagination-toolbar': {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                            }}
                        />
                    </Box>

                )}
            </Paper>
        </Drawer>
    );
};

export default MobileDataTableNavigation;