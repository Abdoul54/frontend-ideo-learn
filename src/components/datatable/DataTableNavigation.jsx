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
import OptionMenu from '@/@core/components/option-menu'

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
  // Custom array of actions
  actions = []
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Store any active drawer/dialog state
  const [activeDrawer, setActiveDrawer] = useState({
    type: null, // Type of drawer/dialog
    open: false, // Whether it's open
    data: null // Any data to pass to the drawer/dialog
  });

  const closeDrawer = () => {
    setActiveDrawer({
      type: null,
      open: false,
      data: null
    });
  };

  // Convert our actions array to the format expected by OptionMenu
  const menuOptions = actions.map(action => ({
    text: action.label,
    icon: action.icon,
    menuItemProps: {
      onClick: () => {
        if (action.onClick) {
          action.onClick(item, {
            openDrawer: (type, data = null) => {
              setActiveDrawer({
                type,
                open: true,
                data
              });
            }
          });
        }
      },
      className: action.className
    }
  }));

  // Modern color gradient for folder icon based on item title
  const getFolderColor = () => {
    // Return fixed theme color instead of dynamic color
    return theme.palette.primary.main;
  };

  // Check if we have any menu items to display
  const hasMenuItems = actions.length > 0;

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
            {/* Actions Menu Button - Only show if we have menu items */}
            {hasMenuItems && (
              <Box
                sx={{
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.15s ease',
                  mr: 1,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <OptionMenu
                  options={menuOptions}
                  icon="solar-menu-dots-bold"
                  iconButtonProps={{
                    size: "small",
                    sx: {
                      color: theme.palette.text.secondary,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      }
                    }
                  }}
                />
              </Box>
            )}

            {/* Arrow icon or children indicator */}
            {(item?.has_children || item?.has_child) && (
              <Box sx={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isHovered ? theme.palette.primary.main : theme.palette.text.secondary,
                transition: 'color 0.15s ease'
              }}>
                <i
                  className='solar-alt-arrow-right-linear'
                  style={{
                    width: '16px',
                    height: '16px',
                    transition: 'transform 0.15s ease-in-out',
                    transform: isHovered ? 'translateX(2px)' : 'translateX(0)'
                  }}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Tooltip>

      {/* Dynamic Drawers and Dialogs - Rendered based on active drawer type */}
      {activeDrawer.type === 'move' && (
        <MoveHaykalDrawer
          open={activeDrawer.open}
          onClose={closeDrawer}
          haykalId={item.id}
          currentTitle={item.title}
        />
      )}

      {activeDrawer.type === 'edit' && (
        <EditHaykalDrawer
          open={activeDrawer.open}
          onClose={closeDrawer}
          haykalId={activeDrawer.data || item.id}
        />
      )}

      {activeDrawer.type === 'assignUserFields' && (
        <AssignUserFieldsToBranchDrawer
          open={activeDrawer.open}
          onClose={closeDrawer}
          haykalId={activeDrawer.data || item.id}
        />
      )}

      {activeDrawer.type === 'deleteWarning' && (
        <HaykalDeleteWarningDialog
          open={activeDrawer.open}
          onClose={closeDrawer}
          haykalTitle={item.title}
        />
      )}

      {activeDrawer.type === 'deleteConfirm' && (
        <BranchDeleteConfirmationDialog
          open={activeDrawer.open}
          onClose={closeDrawer}
          onConfirm={() => {
            // You would need to implement the delete logic here 
            // or pass it via the action.onClick handler
            closeDrawer();
          }}
          haykalTitle={item.title}
        />
      )}

      {activeDrawer.type === 'userError' && (
        <UserBranchErrorDialog
          open={activeDrawer.open}
          onClose={closeDrawer}
          haykalTitle={item.title}
        />
      )}
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
            className='solar-folder-linear'
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
  enableSearchType = false,
  // New prop for custom actions
  actions = []
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
              <NavigationItem
                key={item.id}
                item={item}
                onNavigate={GoForward}
                actions={actions}
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

export default DataTableNavigation
