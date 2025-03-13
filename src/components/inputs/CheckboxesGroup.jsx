import { Box, TablePagination, IconButton, Tooltip, Skeleton } from '@mui/material';
import { useWatch } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Checkbox, FormControl, FormControlLabel, FormHelperText } from '@mui/material';

/**
 * Renders a group of checkboxes that store selected values in an array
 * with improved visual styling and interaction patterns
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of items to display as checkboxes
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.name - Field name in form data
 * @param {Array} props.defaultValue - Default selected IDs array
 * @param {boolean} props.disabled - Whether all checkboxes are disabled
 * @param {Function} props.getItemId - Function to extract ID from an item (defaults to item.id)
 * @param {Function} props.getItemLabel - Function to extract label from an item (defaults to item.name || item.label)
 * @param {Function} props.getItemStyle - Function to extract custom style for an item
 * @param {Function} props.onItemClick - Function called when an item with children is clicked
 * @returns {JSX.Element} Rendered CheckboxesGroup component
 */
const CheckboxesGroup = ({
    items = [],
    control,
    name,
    pagination,
    onPaginationChange,
    defaultValue = [],
    disabled = false,
    getItemId = (item) => item.id,
    getItemLabel = (item) => item.title || item.label,
    getItemStyle = () => ({}),
    onItemClick = null,
    isLoading = false,
    sx = {}
}) => {
    // Get current value from form
    const currentValue = useWatch({
        control,
        name,
        defaultValue
    });

    // Helper function to check if an item is selected
    const isItemSelected = (itemId) => {
        return Array.isArray(currentValue) && currentValue.includes(itemId);
    };

    // Handle checkbox change
    const handleCheckboxChange = (itemId, isChecked, onChange) => {
        // Get current array value
        const currentArray = Array.isArray(currentValue) ? [...currentValue] : [];

        if (isChecked) {
            // Add ID if not already in the array
            if (!currentArray.includes(itemId)) {
                onChange([...currentArray, itemId]);
            }
        } else {
            // Remove ID if it exists in the array
            onChange(currentArray.filter(id => id !== itemId));
        }
    };

    // Handle select all checkboxes
    const handleSelectAll = (isChecked, onChange) => {
        if (isChecked) {
            // Select all items that aren't disabled
            const allIds = items
                .filter(item => !item.disabled)
                .map(item => getItemId(item));
            onChange(allIds);
        } else {
            // Deselect all items
            onChange([]);
        }
    };

    // Check if all selectable items are selected
    const areAllSelected = () => {
        const selectableItems = items.filter(item => !item.disabled);
        const selectableIds = selectableItems.map(item => getItemId(item));
        return selectableIds.length > 0 &&
            selectableIds.every(id => isItemSelected(id));
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', width: 1, ...sx }}>
                {[1, 2, 3, 4, 5].map((_, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                        <Skeleton variant="text" width="80%" height={24} />
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: 1,
            height: '100%',
            ...sx 
        }}>
            {/* {items.length > 1 && (
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            sx={{
                                width: '100%',
                                p: 1,
                                bgcolor: 'background.paper',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                m: 0,
                            }}
                            control={
                                <Checkbox
                                    checked={areAllSelected()}
                                    indeterminate={currentValue.length > 0 && !areAllSelected()}
                                    onChange={(e) => {
                                        handleSelectAll(e.target.checked, field.onChange);
                                    }}
                                    disabled={disabled}
                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                                />
                            }
                            label="Select All"
                        />
                    )}
                />
            )} */}
            <Box sx={{ 
                            flexGrow: 1, 
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
            {items.map((item) => {
                const id = getItemId(item);
                const label = getItemLabel(item);
                const hasChildren = item.has_children || false;
                const customStyle = getItemStyle(item);

                return (
                    <Box
                        key={id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '0',
                            p: 0.5,
                            pl: 1,
                            pr: 1,
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                            ...customStyle
                        }}
                    >
                        <CustomCheckboxForArray
                            control={control}
                            name={name}
                            itemId={id}
                            label={label}
                            isSelected={isItemSelected(id)}
                            onChange={handleCheckboxChange}
                            disabled={disabled || item.disabled}
                        />

                        {hasChildren && onItemClick && (
                            <Tooltip title={`Browse ${label}`} arrow>
                                <IconButton
                                    size="small"
                                    onClick={() => onItemClick(id, label)}
                                    sx={{
                                        ml: 'auto',
                                        color: 'text.secondary',
                                        '&:hover': {
                                            color: 'primary.main',
                                            backgroundColor: 'primary.lighter',
                                        }
                                    }}
                                >
                                    <i className="lucide-chevron-right" style={{ width: 16, height: 16 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            })}
            </Box>

            {pagination && (
                <Box sx={{ mt: 'auto' }}>
                <TablePagination
                    rowsPerPageOptions={pagination?.rowsPerPageOptions || [5, 15, 25, 50]}
                    component="div"
                    count={pagination?.count || 0}
                    page={pagination?.page || 0}
                    rowsPerPage={pagination?.rowsPerPage || 5}
                    onPageChange={(_, newPage) => {
                        onPaginationChange?.({ pageIndex: newPage, pageSize: pagination?.rowsPerPage || 5 })
                    }}
                    onRowsPerPageChange={e => {
                        const newPageSize = Number(e.target.value)
                        onPaginationChange?.({ pageIndex: 0, pageSize: newPageSize })
                    }}
                    sx={{
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        '& .MuiTablePagination-toolbar': {
                            '& .MuiTablePagination-selectLabel': {
                                display: 'none'
                            }
                        }
                    }}
                />
            </Box>
            )}
        </Box>
    );
}

const CustomCheckboxForArray = ({
    control,
    name,
    itemId,
    label,
    isSelected = false,
    onChange,
    disabled = false
}) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <FormControl error={!!error} fullWidth margin="dense">
                    <FormControlLabel
                        sx={{
                            mr: 0,
                            '& .MuiFormControlLabel-label': {
                                fontSize: '0.875rem',
                                fontWeight: isSelected ? 500 : 400,
                                color: isSelected ? 'primary.main' : 'text.primary',
                            }
                        }}
                        control={
                            <Checkbox
                                checked={isSelected}
                                onChange={(e) => {
                                    onChange(itemId, e.target.checked, field.onChange);
                                }}
                                disabled={disabled}
                                size="small"
                                sx={{
                                    '& .MuiSvgIcon-root': { fontSize: 20 },
                                    color: isSelected ? 'primary.main' : 'action.active',
                                }}
                            />
                        }
                        label={label}
                    />
                    {error && <FormHelperText error>{error.message}</FormHelperText>}
                </FormControl>
            )}
        />
    );
}

export default CheckboxesGroup;