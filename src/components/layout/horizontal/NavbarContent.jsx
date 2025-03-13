'use client'
import { useState } from 'react'
import classnames from 'classnames'
import { Collapse, IconButton, TextField } from '@mui/material'

// Component Imports
import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import useHorizontalNav from '@menu/hooks/useHorizontalNav'
import DialogsSettings from '@/views/Dialogs/Settings'
import { useAdvancedSettings } from '@/@core/contexts/advancedSettingsContext'

// Constants
const NAVBAR_ICONS = [
  { icon: 'solar-question-circle-bold-duotone', ariaLabel: 'Help' },
  { icon: 'solar-medal-ribbons-star-bold-duotone', ariaLabel: 'Rewards' },
  { icon: 'solar-bell-bing-bold-duotone', ariaLabel: 'Notifications' }
]

const UnifiedSearchField = ({ onClose, className }) => (
  <TextField
    id='search'
    variant='outlined'
    size='small'
    fullWidth
    placeholder='Search'
    className={className}
    sx={{
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '9999px !important',
        transition: 'all 0.2s ease-in-out',
        '& fieldset': {
          border: '1px solid var(--mui-palette-customColors-headerIcon)'
        }
      },
      '& input': {
        color: 'var(--mui-palette-customColors-headerIcon)',
        '&::placeholder': {
          color: 'var(--mui-palette-customColors-headerIcon)',
          fontWeight: 300,
          opacity: 1,
          fontSize: '0.875rem'
        }
      }
    }}
    InputProps={{
      startAdornment: (
        <i
          className='solar-magnifer-line-duotone text-xl ltr:mr-2 rtl:ml-2'
          style={{ color: 'var(--mui-palette-customColors-headerIcon)' }}
        />
      ),
      endAdornment: onClose && (
        <i
          className='solar-close-circle-bold-duotone text-xl cursor-pointer'
          onClick={onClose}
          style={{ color: 'var(--mui-palette-customColors-headerIcon)' }}
        />
      )
    }}
  />
)

const NavbarIcon = ({ icon, onClick, ariaLabel }) => (
  <IconButton onClick={onClick} aria-label={ariaLabel}>
    <i
      className={`${icon} text-white`}
      style={{ color: 'var(--mui-palette-customColors-headerIcon)' }}
    />
  </IconButton>
)

const NavbarContent = () => {
  const { advancedSettings } = useAdvancedSettings()
  const { isBreakpointReached } = useHorizontalNav()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen)

  const renderLogo = () => (
    <div className='flex items-center gap-6'>
      <NavToggle />
      {!isBreakpointReached && <Logo />}
    </div>
  )

  const renderSearch = () => (
    !isBreakpointReached && (
      <div className='flex-1 max-w-md'>
        <UnifiedSearchField />
      </div>
    )
  )

  const renderMobileSearch = () => (
    <Collapse
      orientation='horizontal'
      in={isSearchOpen}
      sx={{ display: isBreakpointReached ? 'flex' : 'none' }}
    >
      <UnifiedSearchField onClose={() => setIsSearchOpen(false)} />
    </Collapse>
  )

  const renderNavIcons = () => (
    <>
      {NAVBAR_ICONS.map((item) => (
        <NavbarIcon key={item.icon} {...item} />
      ))}
      <NavbarIcon
        icon='solar-settings-bold-duotone'
        onClick={toggleSettings}
        ariaLabel='Settings'
      />
      <UserDropdown advancedSettings={advancedSettings} />
    </>
  )

  const renderMobileMenu = () => (
    <Collapse orientation='horizontal' in={!isSearchOpen && isBreakpointReached}>
      <div className={`${isBreakpointReached ? 'flex' : 'hidden'}`}>
        <NavbarIcon
          icon='solar-magnifer-line-duotone'
          onClick={toggleSearch}
          ariaLabel='Search'
        />
        {renderNavIcons()}
      </div>
    </Collapse>
  )

  return (
    <>
      <div
        className={classnames(
          horizontalLayoutClasses.navbarContent,
          `flex items-center justify-between w-full ${!isBreakpointReached && 'gap-6'}`
        )}
      >
        {renderLogo()}
        {renderSearch()}
        <div className='flex items-center gap-2'>
          {renderMobileSearch()}
          {renderMobileMenu()}
          {!isBreakpointReached && renderNavIcons()}
        </div>
      </div>
      <DialogsSettings open={isSettingsOpen} onClose={toggleSettings} />
    </>
  )
}

export default NavbarContent