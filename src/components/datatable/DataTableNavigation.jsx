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
import { useState } from 'react'
import MoveHaykalDrawer from '../../views/Drawers/MoveHaykalDrawer'
import EditHaykalDrawer from '../../views/Drawers/EditHaykalDrawer'
import { useDeleteHaykal } from '@/hooks/api/tenant/useHaykal'
import AssignUserFieldsToBranchDrawer from '@/views/Drawers/AssignUserFieldsToBranchDrawer'
import { useAdvancedSettings } from '@/hooks/api/tenant/useAdvancedSettings'
import HaykalDeleteWarningDialog from '@/views/Dialogs/HaykalDeleteWarningDialog'
import toast from 'react-hot-toast'
import BranchDeleteConfirmationDialog from '@/views/Dialogs/BranchDeleteConfirmationDialog'
import UserBranchErrorDialog from '@/views/Dialogs/UserBranchErrorDialog'
import SearchTypeDropdown from '../SearchTypeDropDown'

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
const NavigationItem = ({ item, onNavigate, onMove }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [moveDrawerOpen, setMoveDrawerOpen] = useState(false);
  const open = Boolean(anchorEl);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [assignUserFieldDrawerOpen, setAssignUserFieldDrawerOpen] = useState(false);
  const [selectedHaykalId, setSelectedHaykalId] = useState(null);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userErrorDialogOpen, setUserErrorDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { data: advancedSettings } = useAdvancedSettings();
  const shouldShowUserFields = advancedSettings?.user?.use_node_fields_visibility || false;

  const deleteHaykalMutation = useDeleteHaykal();

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleMoveAction = (event) => {
    if (event) event.stopPropagation();
    setMoveDrawerOpen(true);
    handleMenuClose();
  };

  const handleEditAction = (event) => {
    if (event) event.stopPropagation();
    setSelectedHaykalId(item.id);
    setEditDrawerOpen(true);
    handleMenuClose();
  };

  const handleDeleteAction = (event) => {
    if (event) event.stopPropagation();

    if (item.has_children) {
      setWarningDialogOpen(true);
    } else {
      setConfirmDialogOpen(true);
    }

    handleMenuClose();
  };

  const handleConfirmedDelete = async () => {
    try {
      await deleteHaykalMutation.mutateAsync(item.id);
      console.log('Branch deleted successfully:', item.id);
    } catch (error) {
      console.error('Error deleting Branch:', error);

      const errorMessage = error.response?.data?.message;
      if (Array.isArray(errorMessage) &&
        errorMessage.some(msg =>
          typeof msg === 'string' &&
          (msg.includes('user_branches') || msg.includes('column "id" does not exist'))
        )) {
        setUserErrorDialogOpen(true);
        toast.error('Cannot delete branch that contains users');
      } else {
        toast.error('Error deleting branch');
      }
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  const handleAssignUserfieldAction = (event) => {
    if (event) event.stopPropagation();
    setSelectedHaykalId(item.id);
    setAssignUserFieldDrawerOpen(true);
    handleMenuClose();
  }

  // Modern color gradient for folder icon based on item title
  const getFolderColor = () => {
    // Return fixed theme color instead of dynamic color
    return theme.palette.primary.main;
  };

  return (
    <>
      <Tooltip title={item.title} placement="top-start" arrow enterDelay={500}>
        <Paper
          component={Button}
          fullWidth
          onClick={() => onNavigate(item.id, item.title)}
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
              //transition: 'width 0.2s ease'
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
              {item.title}
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
              {item.has_children ? (
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
        <MenuItem onClick={handleMoveAction}>
          <ListItemIcon>
            <i className="solar-square-transfer-horizontal-linear" style={{ width: '18px', height: '18px', color: theme.palette.text.secondary }} />
          </ListItemIcon>
          <ListItemText primary="Move" />
        </MenuItem>

        {shouldShowUserFields && (
          <MenuItem onClick={handleAssignUserfieldAction}>
            <ListItemIcon>
              <i className="solar-user-id-linear" style={{ width: '18px', height: '18px', color: theme.palette.text.secondary }} />
            </ListItemIcon>
            <ListItemText primary="Assign User Fields" />
          </MenuItem>
        )}

        <MenuItem onClick={handleEditAction}>
          <ListItemIcon>
            <i className="solar-pen-2-linear" style={{ width: '18px', height: '18px', color: theme.palette.text.secondary }} />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>

        <MenuItem onClick={handleDeleteAction}>
          <ListItemIcon>
            <i className="solar-trash-bin-trash-linear" style={{ width: '18px', height: '18px', color: theme.palette.error.main }} />
          </ListItemIcon>
          <ListItemText primary="Delete" sx={{ color: theme.palette.error.main }} />
        </MenuItem>
      </Menu>

      {/* Drawers and Dialogs */}
      <MoveHaykalDrawer
        open={moveDrawerOpen}
        onClose={() => setMoveDrawerOpen(false)}
        haykalId={item.id}
        currentTitle={item.title}
      />

      <EditHaykalDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setSelectedHaykalId(null);
        }}
        haykalId={selectedHaykalId}
      />

      <AssignUserFieldsToBranchDrawer
        open={assignUserFieldDrawerOpen}
        onClose={() => {
          setAssignUserFieldDrawerOpen(false);
          setSelectedHaykalId(null);
        }}
        haykalId={selectedHaykalId}
      />

      <HaykalDeleteWarningDialog
        open={warningDialogOpen}
        onClose={() => setWarningDialogOpen(false)}
        haykalTitle={item.title}
      />

      <BranchDeleteConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmedDelete}
        haykalTitle={item.title}
      />

      <UserBranchErrorDialog
        open={userErrorDialogOpen}
        onClose={() => setUserErrorDialogOpen(false)}
        haykalTitle={item.title}
      />
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

const DataTableNavigation = ({
  height,
  data = [],
  currentItem = { id: 1, title: 'Platform' },
  GoBack,
  GoForward,
  searchQuery,
  onSearchChange,
  isLoading,
  pagination,
  onMoveItem,
  footerComponent,
  searchType,
  onSearchTypeChange,
  enableSearchType = false
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
            {currentItem?.id !== 1 && (
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
                placeholder='Search folders...'
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
                {currentItem?.title || 'Navigation'}
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
              <NavigationItem key={item.id} item={item} onNavigate={GoForward} onMove={onMoveItem} />
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

export default DataTableNavigation