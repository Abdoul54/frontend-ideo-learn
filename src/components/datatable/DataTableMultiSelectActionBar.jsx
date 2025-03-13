'use client';

import React, { useState, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Menu,
    MenuItem,
    Divider,
    Slide,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import DeleteConfirmationDialog from '@/views/Dialogs/DeleteConfirmation';

/**
 * @typedef {Object} ActionItem
 * @property {string} id - Unique identifier for the action
 * @property {string} label - Display label for the action
 * @property {React.ReactNode} [icon] - Optional icon to display
 * @property {Function} handler - Function to call when action is triggered
 * @property {string} [color] - Optional color for the action (primary, secondary, error, etc.)
 * @property {string} [variant] - Optional button variant (text, contained, outlined)
 * @property {boolean} [requireConfirmation] - Whether this action requires confirmation
 * @property {Object} [confirmationProps] - Custom props for the confirmation dialog
 */

/**
 * @typedef {Object} DataTableMultiSelectActionBarProps
 * @property {Array<any>} selectedRows - Array of selected items
 * @property {Function} onClearSelection - Function to clear selection
 * @property {boolean} [selectAll] - Whether all items are selected
 * @property {Function} [onSelectAll] - Function to select all items
 * @property {Function} [onUnselectAll] - Function to unselect all items
 * @property {number} [total] - Total number of items available for selection
 * @property {Array<ActionItem>} [primaryActions] - Array of primary actions to show as buttons
 * @property {Array<Array<ActionItem>>} [actionGroups] - Groups of actions for the dropdown menu
 * @property {string} [actionButtonLabel] - Label for the main action button
 * @property {Object} [paperProps] - Additional props for the Paper component
 * @property {Object} [style] - Custom styles for the action bar
 * @property {Object} [deleteConfirmationProps] - Props for the delete confirmation dialog
 */

/**
 * A customizable selection action bar for managing bulk actions on selected items
 * 
 * @param {DataTableMultiSelectActionBarProps} props
 */
const DataTableMultiSelectActionBar = ({
    // Selection props
    selectedRows = [],
    onClearSelection,
    selectAll = false,
    onSelectAll,
    onUnselectAll,
    total = 0,

    // Action props
    primaryActions = [],
    actionGroups = [], // Must be an array of arrays
    actionButtonLabel = "Actions",
    deleteLabel = 'Delete',

    showDelete = false,
    // Customization props
    paperProps = {},
    style = {},
    deleteConfirmationProps = {},
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // State for confirmation dialog
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null);

    const handleActionClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleActionClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action) => {
        if (action.requireConfirmation) {
            setConfirmationAction(action);
            setOpenConfirmation(true);
        } else if (action.handler) {
            action.handler(selectedRows, selectAll ? total : null);
        }
        handleActionClose();
    };

    // Handle delete action specifically
    const handleDelete = () => {
        setOpenConfirmation(true);
    };

    // Don't render if nothing is selected
    if (!selectedRows.length && !selectAll) return null;

    const selectedCount = selectAll ? total : selectedRows.length;

    return (
        <>
            <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        left: 0,
                        right: 0,
                        zIndex: 1200,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        pointerEvents: 'none',
                        ...style.container
                    }}
                >
                    <Paper
                        elevation={6}
                        sx={{
                            borderRadius: 1,
                            minWidth: 'min(560px, 90%)',
                            maxWidth: '90%',
                            pointerEvents: 'auto',
                            boxShadow: theme.shadows[6],
                            ...style.paper
                        }}
                        {...paperProps}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                padding: '8px 16px',
                                flexWrap: isMobile ? 'wrap' : 'nowrap',
                                justifyContent: isMobile ? 'center' : 'space-between',
                                ...style.content
                            }}
                        >
                            {/* Selection info and control section */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mr: isMobile ? 0 : 2,
                                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                                    justifyContent: isMobile ? 'center' : 'flex-start',
                                    ...style.selectionInfo
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    fontWeight="medium"
                                    mr={1}
                                    sx={{ ...style.selectionCount }}
                                >
                                    {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
                                </Typography>

                                {onSelectAll && onUnselectAll && (
                                    <Button
                                        size="small"
                                        onClick={() => selectAll ? onUnselectAll() : onSelectAll()}
                                        sx={{
                                            textTransform: 'none',
                                            color: 'text.secondary',
                                            ...style.selectAllButton
                                        }}
                                    >
                                        {selectAll ? 'Unselect all' : 'Select all'}
                                    </Button>
                                )}

                                <Button
                                    size="small"
                                    onClick={onClearSelection}
                                    sx={{
                                        textTransform: 'none',
                                        color: 'text.secondary',
                                        ...style.clearButton
                                    }}
                                >
                                    Clear selection
                                </Button>
                            </Box>

                            {/* Actions section */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    mt: isMobile ? 1 : 0,
                                    flexWrap: 'nowrap',
                                    ...style.actionsContainer
                                }}
                            >
                                {/* Common actions - always present */}
                                {showDelete && <Button
                                    color="error"
                                    variant="text"
                                    size="small"
                                    onClick={handleDelete}
                                    sx={{ ...style.deleteButton }}
                                >
                                    {deleteLabel}
                                </Button>}

                                {/* Primary action buttons */}
                                {primaryActions.map((action) => (
                                    <Button
                                        key={action.id}
                                        color={action.color || "primary"}
                                        variant={action.variant || "text"}
                                        size="small"
                                        startIcon={action.icon}
                                        onClick={() => handleAction(action)}
                                        sx={{ ...style.primaryAction }}
                                    >
                                        {action.label}
                                    </Button>
                                ))}

                                {/* Action dropdown menu */}
                                {actionGroups?.length > 0 && (
                                    <>
                                        <Button
                                            id="selection-action-button"
                                            aria-controls={open ? 'selection-action-menu' : undefined}
                                            aria-haspopup="true"
                                            aria-expanded={open ? 'true' : undefined}
                                            onClick={handleActionClick}
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            sx={{ ...style.actionButton }}
                                        >
                                            {actionButtonLabel}
                                        </Button>
                                        <Menu
                                            id="selection-action-menu"
                                            anchorEl={anchorEl}
                                            open={open}
                                            onClose={handleActionClose}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'right',
                                            }}
                                            sx={{ ...style.menu }}
                                        >
                                            {actionGroups.map((group, groupIndex) => {
                                                // Ensure group is an array before trying to map it
                                                if (!Array.isArray(group)) {
                                                    console.error('Action group is not an array:', group);
                                                    return null;
                                                }

                                                return (
                                                    <React.Fragment key={`group-${groupIndex}`}>
                                                        {groupIndex > 0 && <Divider />}
                                                        {group.map((action) => (
                                                            <MenuItem
                                                                key={action.id}
                                                                onClick={() => handleAction(action)}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                    py: 1.25,
                                                                    px: 2,
                                                                    ...style.menuItem
                                                                }}
                                                            >
                                                                {action.icon && (
                                                                    <Box
                                                                        component="span"
                                                                        sx={{
                                                                            display: 'flex',
                                                                            color: action.color ? theme.palette[action.color]?.main : 'inherit',
                                                                            ...style.actionIcon
                                                                        }}
                                                                    >
                                                                        {action.icon}
                                                                    </Box>
                                                                )}
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: action.color ? theme.palette[action.color]?.main : 'inherit',
                                                                        ...style.actionLabel
                                                                    }}
                                                                >
                                                                    {action.label}
                                                                </Typography>
                                                            </MenuItem>
                                                        ))}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </Menu>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Slide>

            {/* Integrated Delete Confirmation Dialog */}
            {openConfirmation && (
                <DeleteConfirmationDialog
                    open={openConfirmation}
                    onClose={() => setOpenConfirmation(false)}
                    onSubmit={(confirmationAction?.handler || deleteConfirmationProps.onSubmit || (() => { }))}
                    title={deleteConfirmationProps.title || 'Selected Items'}
                    data={selectedRows}
                    variant={deleteConfirmationProps.variant || 'default'}
                    set={deleteConfirmationProps.set || onUnselectAll} // Pass the set function from props or use onUnselectAll as a fallback
                />
            )}
        </>
    );
};

export default DataTableMultiSelectActionBar;