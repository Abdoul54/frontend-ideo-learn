'use client'
import { Button, IconButton, Stack, Typography } from '@mui/material'
import classnames from 'classnames'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import useHorizontalNav from '@menu/hooks/useHorizontalNav'
import settingConfig from '@/configs/settingConfig'
import { usePathname, useRouter } from 'next/navigation'
import NavToggle from './NavToggle'

// Constants
const NAVBAR_ICONS = [
  { icon: 'solar-bell-bing-bold-duotone', ariaLabel: 'Notifications' },
  { icon: 'solar-question-circle-bold-duotone', ariaLabel: 'Help' }
]

const NavbarIcon = ({ icon, onClick, ariaLabel }) => (
  <IconButton onClick={onClick} aria-label={ariaLabel}>
    <i
      className={`${icon} text-white`}
      style={{ color: 'var(--mui-palette-customColors-headerIcon)' }}
    />
  </IconButton>
)

const NavbarContent = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { isBreakpointReached } = useHorizontalNav()

  const renderLogo = () => (
    <div className='flex items-center gap-6'>
      <NavToggle />
      {!isBreakpointReached && <Logo />}
    </div>
  )

  const renderNavIcons = () => (
    <>
      {NAVBAR_ICONS.map((item) => (
        <NavbarIcon key={item.icon} {...item} />
      ))}
      <UserDropdown />
    </>
  )

  return (
    <div
      className={classnames(
        horizontalLayoutClasses.navbarContent,
        'flex items-center justify-between w-full'
      )}
    >
      {renderLogo()}
      <Stack
        direction='row'
        gap={4}
        sx={{
          padding: 2,
          borderRadius: 1,
          display: {
            xs: 'none',
            lg: 'flex'
          },
          '& .MuiTypography-root': {
            transition: 'opacity 0.2s ease-in-out',
            '&:hover': {
              opacity: 0.8,
              cursor: 'pointer'
            }
          }
        }}
      >
        {settingConfig?.navigation?.items?.map((item) => (
          <Button
            key={item.path}
            variant='contained'
            onClick={() => router.push(item.path)}
            sx={{
              color: pathname === item.path ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-customColors-headerIcon)',
              fontWeight: 500,
              fontSize: {
                lg: '0.75rem',
                xl: '1rem',
              },
              letterSpacing: '0.5px',
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              alignItems: 'center',
              textWrap: 'nowrap',
              boxShadow: 'none',
              position: 'relative',
              p: 2,
              bgcolor: pathname === item.path ? 'primary.main' : 'transparent',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'var(--mui-palette-background-paper)'
              }
            }}
          >
            <i className={`${item?.icon} text-xl`} />
            {item.label}
          </Button>
        ))}
      </Stack>
      <div className='flex items-center gap-2'>
        {renderNavIcons()}
      </div>
    </div>
  )
}

export default NavbarContent