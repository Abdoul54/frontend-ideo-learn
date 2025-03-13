import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Menu,
    MenuItem,
    Divider,
    Slide,
    ListItemIcon,
    ListItemText
} from '@mui/material';

// Custom component for nested menu items
const NestedMenuItem = ({
    parentMenuOpen,
    label,
    icon,
    children,
    disabled,
    ...props
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const menuItemRef = useRef(null);
    const isSubMenuOpen = Boolean(anchorEl);
    
    // Close submenu when parent menu closes
    useEffect(() => {
        if (!parentMenuOpen) {
            setAnchorEl(null);
        }
    }, [parentMenuOpen]);

    const handleClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        if (isSubMenuOpen) {
            setAnchorEl(null);
        } else {
            setAnchorEl(menuItemRef.current);
        }
    };
    
    const handleMouseEnter = (event) => {
        if (!disabled && parentMenuOpen) {
            setAnchorEl(menuItemRef.current);
        }
    };
    
    const handleMouseLeave = (event) => {
        // Check if the related target is inside the menu
        const submenuElement = document.getElementById('nested-submenu');
        const relatedTarget = event.relatedTarget;
        
        if (!submenuElement || !submenuElement.contains(relatedTarget)) {
            setAnchorEl(null);
        }
    };

    return (
        <>
            <MenuItem
                {...props}
                ref={menuItemRef}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                disabled={disabled}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    py: 1.25,
                    px: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {icon && <Box component="span" sx={{ display: 'flex' }}>{icon}</Box>}
                    <Typography variant="body2">{label}</Typography>
                </Box>
                <i className="solar-alt-arrow-right-bold-duotone" style={{ fontSize: '16px' }} />
            </MenuItem>

            <Menu
                id="nested-submenu"
                // Use the menu item as the anchor
                anchorEl={anchorEl}
                open={isSubMenuOpen}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                // Prevent auto focus on open to avoid closing the parent menu
                disableAutoFocus
                // Prevent restore focus on close to keep parent menu open
                disableRestoreFocus
                disablePortal={false}
                sx={{ 
                    pointerEvents: 'none',
                    '& .MuiPaper-root': {
                        minWidth: 180,
                        pointerEvents: 'auto',
                    }
                }}
                MenuListProps={{
                    onMouseLeave: () => setAnchorEl(null),
                    dense: true
                }}
                slotProps={{
                    paper: {
                        elevation: 3,
                        sx: { 
                            overflow: 'visible',
                            mt: 0.5,
                            // Increase the z-index to be higher than the parent menu
                            zIndex: 1500
                        }
                    }
                }}
            >
                {children}
            </Menu>
        </>
    );
};

const SelectionActionBar = ({
    selectedRows = [],
    onClearSelection,
    onDelete,
    actionItems = []
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action) => {
        if (action.handler) {
            action.handler(selectedRows);
        }
        handleClose();
    };

    if (!selectedRows.length) return null;

    return (
        <Slide direction="up" in={selectedRows.length > 0} mountOnEnter unmountOnExit>
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
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        borderRadius: 1,
                        minWidth: 'min(560px, 90%)',
                        maxWidth: '90%',
                        pointerEvents: 'auto',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '8px 16px',
                            flexWrap: { xs: 'wrap', sm: 'nowrap' },
                            justifyContent: { xs: 'center', sm: 'space-between' }
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mr: { xs: 0, sm: 2 }
                        }}>
                            <Typography variant="body1" fontWeight="medium" mr={1}>
                                {selectedRows.length} {selectedRows.length === 1 ? 'item' : 'items'} selected
                            </Typography>
                            <Button
                                size="small"
                                onClick={onClearSelection}
                                sx={{ textTransform: 'none', color: 'text.secondary' }}
                            >
                                Clear selection
                            </Button>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            gap: 1,
                            mt: { xs: 1, sm: 0 },
                            flexWrap: 'nowrap'
                        }}>
                            {/* Common actions can be explicitly defined here */}
                            <Button
                                color="error"
                                variant="text"
                                size="small"
                                onClick={() => onDelete(selectedRows)}
                                startIcon={<i className="solar-trash-bin-2-bold-duotone" />}
                            >
                                Delete ({selectedRows.length})
                            </Button>

                            {/* Dynamic action menu */}
                            <Button
                                id="action-button"
                                aria-controls={open ? 'action-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                onClick={handleClick}
                                variant="contained"
                                color="primary"
                                size="small"
                            >
                                Choose Action
                            </Button>
                            <Menu
                                id="action-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                slotProps={{
                                    paper: {
                                        sx: { 
                                            zIndex: 1300 
                                        }
                                    }
                                }}
                            >
                                {actionItems.map((group, groupIndex) => (
                                    <React.Fragment key={`group-${groupIndex}`}>
                                        {groupIndex > 0 && <Divider />}
                                        {group.map((action) => (
                                            <React.Fragment key={action.id}>
                                                {action.subMenu ? (
                                                    <NestedMenuItem
                                                        parentMenuOpen={open}
                                                        label={action.label}
                                                        icon={action.icon}
                                                        disabled={action.disabled}
                                                    >
                                                        {action.subMenu.map((subAction) => (
                                                            <MenuItem
                                                                key={subAction.id}
                                                                onClick={() => handleAction(subAction)}
                                                                disabled={subAction.disabled}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                    py: 1.25,
                                                                    px: 2
                                                                }}
                                                            >
                                                                {subAction.icon && <Box component="span" sx={{ display: 'flex' }}>{subAction.icon}</Box>}
                                                                <Typography variant="body2">{subAction.label}</Typography>
                                                            </MenuItem>
                                                        ))}
                                                    </NestedMenuItem>
                                                ) : (
                                                    <MenuItem
                                                        onClick={() => handleAction(action)}
                                                        disabled={action.disabled}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1.5,
                                                            py: 1.25,
                                                            px: 2
                                                        }}
                                                    >
                                                        {action.icon && <Box component="span" sx={{ display: 'flex' }}>{action.icon}</Box>}
                                                        <Typography variant="body2">{action.label}</Typography>
                                                    </MenuItem>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </Menu>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Slide>
    );
};

export default SelectionActionBar;