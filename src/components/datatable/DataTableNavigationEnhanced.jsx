import { useTheme, alpha } from '@mui/material/styles'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  styled,
  TablePagination,
  TextField,
  Typography,
  useMediaQuery,
  Menu, MenuItem, ListItemIcon, ListItemText,
  Tooltip,
  Fade,
  Divider
} from '@mui/material'
import React, { useState } from 'react'
import CategorySearchTypeDropdown from '../CategorySearchTypeDropdown'

// Custom styled components
const ContentBox = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  height: '100%',
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.divider, 0.1),
    borderRadius: 8
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderRadius: 8,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.3),
    }
  }
}))

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 3,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(theme.palette.primary.main, 0.3),
    }
  }
}))

const NavigationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2, 2, 2),
  position: 'relative',
  zIndex: 2
}))

const NavigationTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 40,
    height: 3,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4
  }
}))

const PaginationWrapper = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5),
  backdropFilter: 'blur(8px)',
  zIndex: 1
}))

// Enhanced NavigationItem Component 
const NavigationItem = ({
  item,
  onNavigate,
  onMove,
  onEdit,
  onAdd,
  onDelete,
  childIdField = 'id',
  childTitleField = 'title',
  idField = 'id',
  titleField = 'title',
  hasChildrenField = 'has_child',
  menuActions = [],
  ...props
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isHovered, setIsHovered] = useState(false);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (handler, event) => {
    if (event) event.stopPropagation();
    // Only call the handler if it's defined and item exists
    if (handler && item) {
      handler(item);
    }
    handleMenuClose();
  };

  // Get the ID and title using the field mapping
  const id = item?.[idField];
  const title = item?.[titleField];
  const hasChildren = item?.[hasChildrenField];

  // Get color for folder icon
  const getFolderColor = () => {
    return theme.palette.primary.main;
  };

  return (
    <>
      <Tooltip title={title} placement="top-start" arrow enterDelay={500}>
        <Paper
          component={Button}
          fullWidth
          onClick={() => onNavigate(id, title)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          elevation={isHovered ? 1 : 0}
          sx={{
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            borderRadius: 1.5,
            backgroundColor: isHovered ? alpha(theme.palette.primary.light, 0.04) : 'background.paper',
            transition: 'all 0.15s ease-in-out',
            border: `1px solid ${isHovered ? alpha(theme.palette.primary.main, 0.3) : theme.palette.divider}`,
            position: 'relative',
            overflow: 'hidden',
            height: '45px',
            '&::before': isHovered ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '45px',
              backgroundColor: getFolderColor()
            } : {}
          }}
        >
          {/* Left side with folder icon and text */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            minWidth: 0,
            height: '100%'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '100%',
              flexShrink: 0,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '16px',
                bottom: '16px',
                right: 0,
                width: '1px',
                backgroundColor: isHovered ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.divider, 0.8),
                transition: 'background-color 0.15s ease'
              }
            }}>
              <i
                className='solar-folder-bold-duotone'
                style={{
                  width: '24px',
                  height: '24px',
                  color: isHovered ? getFolderColor() : theme.palette.text.secondary,
                  transition: 'color 0.15s ease'
                }}
              />
            </Box>
            <Typography
              variant='body1'
              color='text.primary'
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
                minWidth: 0,
                fontWeight: 500,
                mx: 2,
                letterSpacing: '0.015em'
              }}
            >
              {title}
            </Typography>
          </Box>

          {/* Right side with menu and arrow icon */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            height: '100%',
            pr: 1
          }}>
            {/* Actions Menu Button */}
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                color: theme.palette.text.secondary,
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.15s ease, background-color 0.15s ease',
                mr: 1,
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <i className="solar-menu-dots-bold" style={{ width: '18px', height: '18px' }} />
            </IconButton>

            {/* Arrow icon or children indicator */}
            <Box sx={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isHovered ? theme.palette.primary.main : theme.palette.text.secondary,
              transition: 'color 0.15s ease'
            }}>
              {hasChildren ? (
                <i
                  className='solar-alt-arrow-right-linear'
                  style={{
                    width: '16px',
                    height: '16px',
                    transition: 'transform 0.15s ease-in-out',
                    transform: isHovered ? 'translateX(2px)' : 'translateX(0)'
                  }}
                />
              ) : null}
            </Box>
          </Box>
        </Paper>
      </Tooltip>

      {/* Menu with Actions */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            overflow: 'visible',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
            mt: 0.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 1,
              mx: 0.5,
              my: 0.25,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08)
              }
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Standard menu items */}
        {/* {onMove && (
          <MenuItem onClick={(e) => handleAction(onMove, e)}>
            <ListItemIcon>
              <i className="solar-square-transfer-horizontal-linear" style={{ width: '18px', height: '18px', color: theme.palette.text.secondary }} />
            </ListItemIcon>
            <ListItemText primary="Move" />
          </MenuItem>
        )} */}

        {onEdit && (
          <MenuItem onClick={(e) => handleAction(onEdit, e)}>
            <ListItemIcon>
              <i className="solar-pen-2-linear" style={{ width: '18px', height: '18px', color: theme.palette.text.secondary }} />
            </ListItemIcon>
            <ListItemText primary="Edit/Move" />
          </MenuItem>
        )}

        {onAdd && (
          <MenuItem onClick={(e) => handleAction(onAdd, e)}>
            <ListItemIcon>
              <i className="solar-add-folder-line-duotone" style={{ width: '18px', height: '18px', color: theme.palette.text.secondary }} />
            </ListItemIcon>
            <ListItemText primary="New SubCategory" />
          </MenuItem>
        )}

        {/* Custom menu actions */}
        {menuActions.map((action, index) => (
          <MenuItem key={index} onClick={(e) => handleAction(action.handler, e)}>
            <ListItemIcon>
              {action.icon || <i className="solar-settings-linear" style={{ width: '18px', height: '18px', color: theme.palette.text.secondary }} />}
            </ListItemIcon>
            <ListItemText primary={action.label} />
          </MenuItem>
        ))}

        {/* Delete is always last */}
        {onDelete && (
          <Tooltip
            title={item[hasChildrenField] ? "Cannot delete categories with subcategories" : ""}
            placement="top"
            arrow
          >
            <div style={{ width: '100%' }}> {/* Wrapper div to make the tooltip work with disabled MenuItem */}
              <MenuItem
                onClick={(e) => !item[hasChildrenField] && handleAction(onDelete, e)}
                disabled={item[hasChildrenField]}
                sx={{
                  // Base styles
                  position: 'relative',
                  transition: 'all 0.2s ease',

                  // Disabled state styles
                  ...(item[hasChildrenField] && {
                    opacity: 0.7,
                    cursor: 'not-allowed',
                    backgroundColor: alpha(theme.palette.action.disabled, 0.05),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.disabled, 0.05),
                    },

                    // Add diagonal stripes effect
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `repeating-linear-gradient(
                        45deg,
                        ${alpha(theme.palette.action.disabled, 0.1)},
                        ${alpha(theme.palette.action.disabled, 0.1)} 2px,
                        transparent 2px,
                        transparent 4px
                      )`,
                    }
                  }),

                  // Enabled state styles
                  ...(!item[hasChildrenField] && {
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.08),
                    }
                  })
                }}
              >
                <ListItemIcon>
                  <i className="solar-trash-bin-trash-linear" style={{
                    width: '18px',
                    height: '18px',
                    color: item[hasChildrenField] ? theme.palette.text.disabled : theme.palette.error.main
                  }} />
                </ListItemIcon>
                <ListItemText
                  primary="Delete"
                  sx={{
                    color: item[hasChildrenField] ? theme.palette.text.disabled : theme.palette.error.main
                  }}
                />
              </MenuItem>
            </div>
          </Tooltip>
        )}
      </Menu>
    </>
  )
}

// Enhanced Loading Skeleton for a more professional appearance
const NavigationItemSkeleton = () => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 0,
        width: '100%',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{
        display: 'flex',
        width: '56px',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '16px',
          bottom: '16px',
          right: 0,
          width: '1px',
          backgroundColor: theme.palette.divider
        }
      }}>
        <Skeleton variant='circular' width={24} height={24} />
      </Box>
      <Box sx={{ flex: 1, px: 2 }}>
        <Skeleton variant='text' width={`${Math.floor(Math.random() * 60 + 20)}%`} height={28} />
      </Box>
      <Box sx={{ display: 'flex', pr: 2 }}>
        <Skeleton variant='circular' width={24} height={24} sx={{ mr: 1 }} />
      </Box>
    </Paper>
  );
};

// Empty state component for a more polished look
const EmptyNavigationState = () => {
  const theme = useTheme();

  return (
    <Fade in={true} timeout={800}>
      <Stack
        spacing={2}
        alignItems='center'
        justifyContent='center'
        sx={{
          height: '100%',
          p: 3,
          color: theme.palette.text.secondary
        }}
      >
        <Box
          sx={{
            backgroundColor: alpha(theme.palette.primary.light, 0.1),
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <i
            className='solar-folder-broken-linear'
            style={{
              width: '40px',
              height: '40px',
              color: theme.palette.primary.main
            }}
          />
        </Box>
        <Typography variant='h6' color='text.primary' align='center'>
          No items found
        </Typography>
        <Typography variant='body2' color='text.secondary' align='center'>
          Try adjusting your search or filters
        </Typography>
      </Stack>
    </Fade>
  );
};

/**
 * Enhanced DataTableNavigation that supports both branches/haykals and categories
 */
const DataTableNavigationEnhanced = ({
  height,
  data = [],
  currentItem = { id: 1, title: 'Root' },
  GoBack,
  GoForward,
  searchQuery,
  onSearchChange,
  isLoading,
  pagination,
  onMoveItem,
  onEditItem,
  onAddItem,
  onDeleteItem,
  footerComponent,
  searchType,
  onSearchTypeChange,
  enableSearchType = false,
  // Field mapping props
  idField = 'id',
  titleField = 'title',
  hasChildrenField = 'has_child',
  // Custom menu actions
  menuActions = [],
  searchTypeComponent = null,
  // Custom navigation item component
  NavigationItemComponent = NavigationItem
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Ensure data is an array before mapping
  const navigationItems = Array.isArray(data) ? data : [];

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        borderTopLeftRadius: "12px",
        borderBottomLeftRadius: "12px",
        borderTopRightRadius: isMobile ? "12px" : 0,
        borderBottomRightRadius: isMobile ? "12px" : 0,
        overflow: 'hidden',
        height,
        backgroundColor: alpha(theme.palette.background.paper, 0.7)
      }}
    >
      {/* Header Section */}
      <NavigationHeader>
        <Stack spacing={3}>
          {/* Back button and Search */}
          <Stack direction='row' spacing={1}>
            {!currentItem?.is_root && (
              <IconButton
                onClick={GoBack}
                size='small'
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.16),
                  }
                }}
              >
                <i className='solar-alt-arrow-left-linear' style={{ width: '18px', height: '18px' }} />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', width: '100%' }}>
              <SearchField
                fullWidth
                size='small'
                placeholder='Search...'
                value={searchQuery}
                onChange={e => onSearchChange?.(e)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='solar-magnifer-linear' style={{ width: '18px', height: '18px', color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                  ...(enableSearchType && {
                    endAdornment: (
                      <InputAdornment position='end'>
                        {/* Use custom search type component if provided, otherwise default */}
                        {searchTypeComponent ? (
                          React.createElement(searchTypeComponent, {
                            value: searchType,
                            onChange: onSearchTypeChange,
                            disabled: isLoading
                          })
                        ) : (
                          <CategorySearchTypeDropdown
                            value={searchType}
                            onChange={onSearchTypeChange}
                            disabled={isLoading}
                          />
                        )}
                      </InputAdornment>
                    )
                  })
                }}
              />
            </Box>
          </Stack>

          {/* Title area */}
          <Stack alignItems='center' spacing={1}>
            <Tooltip title={currentItem?.title || 'Navigation'} placement="top" arrow enterDelay={700}>
              <NavigationTitle
                variant={isMobile ? 'h6' : 'h5'}
                sx={{
                  fontWeight: 600,
                  textAlign: 'center',
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  pb: 1
                }}
              >
                {currentItem?.[titleField] || currentItem?.title}
              </NavigationTitle>
            </Tooltip>
          </Stack>
        </Stack>
      </NavigationHeader>

      <Divider />

      {/* Content Section */}
      <ContentBox>
        <Stack
          spacing={2}
          sx={{
            py: 2,
            height: '100%'
          }}
        >
          {isLoading ? (
            Array.from({ length: pagination?.rowsPerPage || 5 })?.map((_, idx) => <NavigationItemSkeleton key={idx} />)
          ) : navigationItems.length > 0 ? (
            navigationItems.map(item => (
              <NavigationItemComponent
                key={item[idField]}
                item={item}
                onNavigate={GoForward}
                onMove={onMoveItem}
                onEdit={onEditItem}
                onAdd={onAddItem}
                onDelete={onDeleteItem}
                idField={idField}
                titleField={titleField}
                hasChildrenField={hasChildrenField}
                menuActions={menuActions}
              />
            ))
          ) : (
            <EmptyNavigationState />
          )}
        </Stack>
      </ContentBox>

      {footerComponent}

      {/* Pagination Section */}
      {pagination && (
        <PaginationWrapper>
          <TablePagination
            component="div"
            count={pagination?.count || 0}
            page={pagination?.page || 0}
            rowsPerPage={pagination?.rowsPerPage || 5}
            onPageChange={(e, page) => pagination?.onPageChange?.(page)}
            onRowsPerPageChange={e => pagination?.onRowsPerPageChange?.(parseInt(e.target.value, 10))}
            sx={{
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
                alignItems: 'center',
                px: 2
              },
            }}
          />
        </PaginationWrapper>
      )}
    </Paper>
  )
}

export default DataTableNavigationEnhanced;