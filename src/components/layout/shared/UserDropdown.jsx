'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Hook Imports
import { signOut } from 'next-auth/react'
import { useSettings } from '@/@core/contexts/settingsContext'
import centralChecker from '@/utils/workers/centralChecker'
import { useLogout } from '@/hooks/api/useAuth'
import { stringAvatar } from '@/utils/avatarGenerator'
import { useUser } from '@/@core/contexts/userContext'

const UserDropdown = ({ advancedSettings = null }) => {
  // States
  const [open, setOpen] = useState(false)
  const [isCentral, setIsCentral] = useState(false)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const logout = useLogout()
  const { user, removeUserData } = useUser();

  // Helper function to normalize user data regardless of format
  const getUserInfo = () => {
    if (!user) return { firstName: '', lastName: '', fullName: '', username: '', email: '', avatar: '' }

    return {
      firstName: (user.first_name || user.firstname || '').trim(),
      lastName: (user.last_name || user.lastname || '').trim(),
      fullName: user.full_name || `${(user.first_name || user.firstname || '')} ${(user.last_name || user.lastname || '')}`.trim(),
      username: user.username || '',
      email: user.email || '',
      avatar: user.avatar || ''
    }
  }

  const userInfo = getUserInfo()
  const logoutUrl = user?.user_logout_redirect?.is_enabled && user?.user_logout_redirect?.url
    ? user?.user_logout_redirect?.url
    : '/login'

  useEffect(() => {
    const checkCentral = async () => {
      try {
        const centralCheck = await centralChecker()
        setIsCentral(centralCheck)
      } catch (error) {
        console.error('Central check failed:', error)
      }
    }
    checkCentral()
  }, [])

  const handleDropdownOpen = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    logout.mutateAsync()
    signOut({
      redirect: false
    }).then(() => {
      removeUserData()
      // Redirect to login page
      router.push(isCentral ? '/auth/login' : logoutUrl)
    })
  }

  const hasUserIdentity = userInfo.firstName || userInfo.lastName || userInfo.avatar

  // Render user avatar or default icon
  const renderAvatar = (className = '') => {
    if (!hasUserIdentity) {
      return (
        <Avatar
          className={`text-2xl text-backgroundPaper bg-secondary ${className}`}
        >
          <i className='solar-user-bold-duotone' />
        </Avatar>
      )
    }

    return (
      <Avatar
        {...stringAvatar(
          `${userInfo.firstName.toUpperCase()} ${userInfo.lastName.toUpperCase()}`,
          {}, // Default sx
          !userInfo.firstName && !userInfo.lastName ? 'solar-user-bold-duotone' : null // Use icon only if no name
        )}
        src={userInfo.avatar}
        className={className}
      />
    )
  }

  return (
    <>
      <div ref={anchorRef} onClick={handleDropdownOpen} className="cursor-pointer">
        {renderAvatar('bs-[38px] is-[38px]')}
      </div>

      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper
              elevation={settings.skin === 'bordered' ? 0 : 8}
              {...(settings.skin === 'bordered' && { className: 'border' })}
            >
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    {renderAvatar('bs-[38px] is-[38px]')}
                    <div className='flex items-start flex-col'>
                      <Typography variant='body2' className='font-medium' color='text.primary'>
                        {userInfo.username}
                      </Typography>
                      <Typography variant='caption'>{userInfo.email}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  {advancedSettings && (
                    <MenuItem className='gap-3 pli-4' onClick={() => router.push('/profile')}>
                      <i className='solar-user-bold-duotone' />
                      <Typography color='text.primary'>My Profile</Typography>
                    </MenuItem>
                  )}
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e)}>
                    <i className='solar-settings-bold-duotone' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-1.5 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleUserLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown