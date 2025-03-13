import { MAX_VISIBLE_COLUMNS } from "@/utils/columnsGenerator";
import {
    Box,
    Breadcrumbs,
    Collapse,
    Divider,
    IconButton,
    Paper,
    Stack,
    TextField,
    Toolbar,
    Typography,
    Menu,
    MenuItem,
    Checkbox,
    ListItemText,
    useMediaQuery,
    Badge,
    Tooltip
} from "@mui/material";
import { useState, useEffect, useMemo, memo } from "react";

// Extracted reusable styles
const iconButtonStyles = {
    border: 1,
    borderColor: 'var(--mui-palette-text-secondary)',
    borderRadius: 1,
    transition: 'all 0.2s ease-in-out'
};

const getActiveIconButtonStyles = (isActive) => ({
    ...iconButtonStyles,
    backgroundColor: isActive ? 'primary.lightOpacity' : 'rgba(255, 255, 255, 0.05)',
    color: isActive ? 'var(--mui-palette-primary-light)' : 'var(--mui-palette-text-primary)',
});

// Memoized sub-components for better performance
const SearchField = memo(({ query, onSearch }) => (
    <TextField
        size='small'
        fullWidth
        placeholder='Search'
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        sx={{
            '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s ease-in-out',
                '& fieldset': {
                    border: '1px solid var(--mui-palette-text-primary)'
                }
            },
            '& input': {
                color: 'var(--mui-palette-text-primary)',
                '&::placeholder': {
                    color: 'var(--mui-palette-text-primary)',
                }
            }
        }}
    />
));

const BreadcrumbsSection = memo(() => (
    <Breadcrumbs
        aria-label='breadcrumb'
        sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'white'
        }}
    >
        {['Home', 'Data', 'Table', 'Table', 'Table'].map((text, index) => (
            <Typography key={index} className="text-white">{text}</Typography>
        ))}
    </Breadcrumbs>
));

const DataTableToolbar = ({
    onSearch,
    query = '',
    onFilterClick,
    showFilter = false,
    showNavigation,
    navigationOpen = false,
    columns = [],
    columnVisibility = {},
    onColumnVisibilityChange,
    hasFilters = false,
    features = {
        search: true,
        filter: false,
        navigation: false,
        columnVisibility: true,
        breadcrumbs: true
    }
}) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    // Modified useEffect to not override existing visibility settings
    useEffect(() => {
        if (Object.keys(columnVisibility).length === 0 && columns.length > 0) {
            const initialVisibility = columns.reduce((acc, column) => {
                if (column.id !== 'actions' && column.id !== 'select') {
                    // Only initialize if not already set
                    acc[column.id || column.accessorKey] = true;
                }
                return acc;
            }, {});
            onColumnVisibilityChange(initialVisibility);
        }
    }, [columns, columnVisibility, onColumnVisibilityChange]);

    // Memoize filtered columns to prevent unnecessary recalculations
    const filteredColumns = useMemo(() =>
        columns.filter(col => col.id !== 'actions' && col.id !== 'select'),
        [columns]
    );

    // Calculate the number of currently visible columns
    const visibleColumnsCount = useMemo(() =>
        Object.values(columnVisibility).filter(Boolean).length,
        [columnVisibility]
    );

    // Check if we've reached the maximum limit of visible columns
    const isAtColumnLimit = visibleColumnsCount >= MAX_VISIBLE_COLUMNS;

    const handleSearchToggle = () => {
        if (isSearchOpen && query) onSearch('');
        setIsSearchOpen(!isSearchOpen);
    };

    const handleColumnToggle = (columnId) => {
        // Get current state of the column
        const isCurrentlyVisible = columnVisibility[columnId] ?? true;

        // If trying to show a column and already at max limit, don't allow
        if (!isCurrentlyVisible && isAtColumnLimit) {
            return; // Don't allow making more columns visible
        }

        onColumnVisibilityChange(prev => ({
            ...prev,
            [columnId]: !isCurrentlyVisible
        }));
    };

    if (isMobile) return null;

    return (
        <Toolbar
            component={Paper}
            elevation={0}
            sx={{
                display: 'flex',
                bgcolor: 'transparent',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: 2
            }}
        >
            <Stack direction='row' gap={2} alignItems='center'>
                {features.navigation && (
                    <>
                        <IconButton
                            size='medium'
                            sx={getActiveIconButtonStyles(navigationOpen)}
                            onClick={showNavigation}
                        >
                            <i className={`solar-folder-${navigationOpen ? 'open-' : ''}bold-duotone`} />
                        </IconButton>
                        {features.search && <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--mui-palette-text-primary)' }} />}
                    </>
                )}

                {features.search && (
                    <>
                        <IconButton
                            onClick={handleSearchToggle}
                            size='medium'
                            sx={getActiveIconButtonStyles(isSearchOpen)}
                        >
                            <i
                                className={isSearchOpen && query ? 'solar-magnifer-zoom-in-bold-duotone' : 'solar-magnifer-bold-duotone'}
                                style={{
                                    transform: isSearchOpen ? 'rotate(45deg)' : 'none',
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            />
                        </IconButton>
                        {isSearchOpen && <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--mui-palette-text-primary)' }} />}
                        <Collapse in={isSearchOpen} orientation='horizontal'>
                            <Box sx={{ width: 240, transition: 'all 0.3s easy-in-out' }}>
                                <SearchField query={query} onSearch={onSearch} />
                            </Box>
                        </Collapse>
                    </>
                )}
            </Stack>

            {features.breadcrumbs && features.navigation && (
                <Stack direction='row' gap={2} alignItems='center' sx={{ flexGrow: 1 }}>
                    <BreadcrumbsSection />
                </Stack>
            )}

            <Stack direction='row' gap={2} justifyContent='flex-end' alignItems='center'>
                {features.filter && (
                    <>
                        <IconButton
                            onClick={onFilterClick}
                            size='medium'
                            sx={getActiveIconButtonStyles(showFilter)}
                        >
                            <Badge badgeContent={hasFilters ? 1 : 0} color="primary" variant="dot">
                                <i className='solar-filter-bold-duotone' />
                            </Badge>
                        </IconButton>
                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--mui-palette-text-primary)' }} />
                    </>
                )}

                {features.columnVisibility && (
                    <Tooltip title="Manage visible columns">
                        <IconButton
                            size='medium'
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            sx={getActiveIconButtonStyles(Boolean(anchorEl))}
                        >
                            <i className='solar-eye-bold-duotone' />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                sx={{
                    '& .MuiMenu-paper': {
                        '&::-webkit-scrollbar': {
                            width: '0.4em'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'var(--mui-palette-background-paper)'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'var(--mui-palette-primary-main)',
                            borderRadius: 2
                        }
                    }
                }}
                PaperProps={{
                    sx: {
                        maxHeight: 300,
                        width: 200
                    }
                }}
            >
                <MenuItem dense disabled className="flex justify-between sticky top-0 bg-backgroundPaper z-10">
                    <Typography variant="body2">
                        Max {Object.keys(columnVisibility).length > MAX_VISIBLE_COLUMNS ? MAX_VISIBLE_COLUMNS : Object.keys(columnVisibility).length} columns allowed
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color={isAtColumnLimit ? 'error' : 'inherit'}>
                        {visibleColumnsCount}/{Object.keys(columnVisibility).length > MAX_VISIBLE_COLUMNS ? MAX_VISIBLE_COLUMNS : Object.keys(columnVisibility).length}
                    </Typography>
                </MenuItem>
                {filteredColumns.map((column) => {
                    const columnId = column.id || column.accessorKey;
                    const isVisible = columnVisibility[columnId] ?? true;
                    // Disable checkbox if at limit and column is not visible
                    const isDisabled = isAtColumnLimit && !isVisible;

                    return (
                        <MenuItem
                            key={columnId}
                            onClick={() => handleColumnToggle(columnId)}
                            dense
                            disabled={isDisabled}
                        >
                            <Checkbox
                                checked={isVisible}
                                size="small"
                                disabled={isDisabled}
                            />
                            <ListItemText primary={column.header} />
                        </MenuItem>
                    );
                })}
            </Menu>
        </Toolbar>
    );
};

export default memo(DataTableToolbar);