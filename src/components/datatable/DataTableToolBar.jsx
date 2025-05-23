import { useTranslation } from "@/@core/contexts/translationContext";
import { useLocalization } from "@/hooks/api/tenant/useLocalization";
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
    Tooltip,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import { useState, useEffect, useMemo, memo } from "react";

const Modules = [
    "Administration System",
    "User Management",
    "Power User & Profile Management",
    "Group management",
    "Course management",
    "LP management",
    "Skill management",
    "CL management",
    "CR management"
]

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
    color: isActive ? 'var(--mui-palette-primary-dark)' : 'var(--mui-palette-text-primary)',
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

const BreadcrumbsSection = ({ breadcrumbs }) => (
    <Breadcrumbs
        aria-label="breadcrumb"
        separator={
            <i
                className="solar-alt-arrow-right-outline"
                style={{
                    fontSize: 12,
                    color: 'var(--mui-palette-text-primary)',
                }}
            />
        }
        sx={{
            display: 'flex',
            alignItems: 'center',
            paddingY: 1,
            gap: 1,
            color: 'var(--mui-palette-text-primary)',
            fontSize: '0.875rem',
        }}
    >
        {breadcrumbs?.map((breadcrumb, index) => (
            <Typography
                key={index}
                component="span"
                onClick={!breadcrumb?.isActive ? breadcrumb?.onClick : undefined}
                sx={{
                    cursor: !breadcrumb?.isActive ? 'pointer' : 'default',
                    fontWeight: breadcrumb?.isActive ? 700 : 500,
                    color: breadcrumb?.isActive
                        ? 'primary.main'
                        : 'text.primary',
                    '&:hover': {
                        textDecoration: !breadcrumb?.isActive ? 'underline' : 'none',
                    },
                }}
            >
                {breadcrumb?.title}
            </Typography>
        ))}
    </Breadcrumbs>
);



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
    breadcrumbs = [],
    goBack,
    module,
    language,
    comparedTo,
    openRessources,
    setOpenRessources,
    features = {
        search: true,
        filter: false,
        navigation: false,
        columnVisibility: true,
        breadcrumbs: false,
        goBack: false,
        ressources: false,
        languageTools: false,
    }
}) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { translate } = useTranslation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const { data: languages } = useLocalization({
        with_pagination: false
    })

    // Modified useEffect to not override existing visibility settings and respect locked columns
    useEffect(() => {
        if (Object.keys(columnVisibility).length === 0 && columns.length > 0) {
            const initialVisibility = columns.reduce((acc, column) => {
                if (column.id !== 'actions' && column.id !== 'select') {
                    // Set locked columns to always be visible
                    acc[column.id || column.accessorKey] = column.locked ? true : true;
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

    // Calculate the number of locked columns
    const lockedColumnsCount = useMemo(() =>
        filteredColumns.filter(col => col.locked).length,
        [filteredColumns]
    );

    // Calculate the number of currently visible columns
    const visibleColumnsCount = useMemo(() =>
        Object.values(columnVisibility).filter(Boolean).length,
        [columnVisibility]
    );

    // Calculate the number of toggleable columns that are currently visible
    const toggleableVisibleCount = useMemo(() => {
        return filteredColumns
            .filter(col => !col.locked && columnVisibility[col.id])
            .length;
    }, [filteredColumns, columnVisibility]);

    // Check if we've reached the maximum limit of visible columns
    const isAtColumnLimit = visibleColumnsCount >= MAX_VISIBLE_COLUMNS;

    const handleSearchToggle = () => {
        if (isSearchOpen && query) onSearch('');
        setIsSearchOpen(!isSearchOpen);
    };

    const handleColumnToggle = (columnId) => {
        // Find the column
        const column = filteredColumns.find(col => col.id === columnId);

        // If column is locked, don't allow toggling
        if (column?.locked) return;

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
                {features?.ressources && (
                    <>           <IconButton
                        size='medium'
                        sx={getActiveIconButtonStyles(openRessources)}
                        onClick={setOpenRessources}
                    >
                        <i className={`lucide-panel-left-open ${openRessources ? 'rotate-180' : ''}`} />
                    </IconButton>
                        {features.search && <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--mui-palette-text-primary)' }} />}
                    </>
                )}

                {features?.navigation && (
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

                {features?.search && (
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
                {features?.goBack && breadcrumbs && breadcrumbs?.length > 1 && (
                    <>
                        {breadcrumbs && breadcrumbs?.length > 1 && <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--mui-palette-text-primary)' }} />}
                        <Collapse in={breadcrumbs && breadcrumbs?.length > 1} orientation='horizontal'>
                            <IconButton
                                onClick={goBack}
                                size='medium'
                                sx={getActiveIconButtonStyles(breadcrumbs && breadcrumbs?.length > 1)}
                            >
                                <i
                                    className="solar-alt-arrow-left-outline"
                                />
                            </IconButton>
                        </Collapse>
                    </>
                )}
            </Stack>

            {features?.breadcrumbs && (
                <Stack direction='row' gap={2} alignItems='center' sx={{ flexGrow: 1 }}>
                    <BreadcrumbsSection breadcrumbs={breadcrumbs} />
                </Stack>
            )}
            {features?.languageTools &&
                <Stack direction='row' gap={2} alignItems='center' sx={{ flexGrow: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Module</InputLabel>
                        <Select
                            size='small'
                            value={module?.value || ""}
                            label="Module"
                            autoFocus
                            onChange={(e) => module?.onChange(e.target.value === "all" ? "" : e.target.value)}
                        >
                            <MenuItem value="all">All</MenuItem>
                            {Modules.map((moduleItem, index) => (
                                <MenuItem key={index} value={moduleItem}>
                                    {moduleItem}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                            size='small'
                            label="Language"
                            value={language?.value?.code || ""}
                            autoFocus
                            onChange={(e) => {
                                // Find the full language object based on the code
                                const selectedLang = languages?.find(lang => lang.code === e.target.value);
                                language?.onChange(selectedLang);
                            }}
                        >
                            {languages?.map((lang) => (
                                <MenuItem key={lang.id} value={lang.code}>
                                    {lang.native_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Compare to</InputLabel>
                        <Select
                            size='small'
                            value={comparedTo?.value?.code || ""}
                            label="Compare to"
                            onChange={(e) => {
                                // Find the full language object based on the code
                                const selectedLang = languages?.find(lang => lang.code === e.target.value);
                                comparedTo?.onChange(selectedLang);
                            }}
                            autoFocus
                        >
                            {languages?.map((lang) => (
                                <MenuItem key={lang.id} value={lang.code}>
                                    {lang.native_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            }

            <Stack direction='row' gap={2} justifyContent='flex-end' alignItems='center'>
                {features?.filter && (
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

                {features?.columnVisibility && (
                    <Tooltip title={translate("common.column_visibility")} arrow>
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

                {/* Locked columns section with header */}
                {lockedColumnsCount > 0 && (
                    <MenuItem dense disabled sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                        <Typography variant="caption" color="text.secondary">
                            Locked Columns ({lockedColumnsCount})
                        </Typography>
                    </MenuItem>
                )}

                {/* Display locked columns first */}
                {filteredColumns
                    .filter(col => col.locked)
                    .map((column) => {
                        const columnId = column.id || column.accessorKey;
                        return (
                            <MenuItem
                                key={columnId}
                                dense
                                disabled={true} // Always disabled for locked columns
                                sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                            >
                                <Checkbox
                                    checked={true} // Always checked for locked columns
                                    size="small"
                                    disabled={true}
                                />
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {column.header}
                                            <i className="solar-lock-bold-duotone" style={{ fontSize: '14px', color: 'var(--mui-palette-text-secondary)' }} />
                                        </Box>
                                    }
                                />
                            </MenuItem>
                        );
                    })
                }

                {/* Header for toggleable columns */}
                {lockedColumnsCount > 0 && (
                    <MenuItem dense disabled>
                        <Typography variant="caption" color="text.secondary">
                            Optional Columns
                        </Typography>
                    </MenuItem>
                )}

                {/* Display toggleable columns */}
                {filteredColumns
                    .filter(col => !col.locked)
                    .map((column) => {
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
                    })
                }
            </Menu>
        </Toolbar>
    );
};


export default memo(DataTableToolbar);