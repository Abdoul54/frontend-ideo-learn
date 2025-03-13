// MUI Imports
import { useTheme } from '@mui/material/styles'

// Component Imports

import HorizontalNav, { Menu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import { useSettings } from '@/@core/contexts/settingsContext'
import { use, useEffect, useState } from 'react'
import centralChecker from '@/utils/workers/centralChecker'

const RenderExpandIcon = ({ level }) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='ri-arrow-right-s-line' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = () => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const { settings } = useSettings()

  const [navigation, setNavigation] = useState(null)

  useEffect(() => {
    centralChecker().then((res) => {

      console.log({ res });

      if (res) {
        setNavigation(
          {
            items: [
              {
                icon: 'solar-widget-5-bold-duotone',
                label: 'Dashboard',
                path: '/dashboard'
              },
              {
                icon: 'solar-lock-bold-duotone',
                label: 'SSL Management',
                path: '/ssl-management'
              },
              {
                icon: 'solar-link-square-bold-duotone',
                label: 'Custom Domain Management',
                path: '/custom-domain-management'
              },
              {
                icon: 'solar-window-frame-bold-duotone',
                label: 'Tenant Management',
                path: '/tenant-management'
              }
            ]
          }
        )
      }
      else {
        setNavigation(
          {
            items: [
              {
                icon: 'solar-home-2-bold-duotone',
                label: 'Home',
                path: '/home'
              },
            ]
          }
        )
      }
    }).catch((err) => {
      console.log(err)
    })
  }
    , [])

  // Vars
  const { skin } = settings
  const { transitionDuration } = verticalNavOptions

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor:
          skin === 'bordered' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-default)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuItemStyles={menuItemStyles(settings, theme, 'ri-circle-fill')}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 4 : 14),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme, settings),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='ri-circle-fill' /> }
        }}
      >
        {/* {settings?.navigation?.items?.map((item, index) => (
          <MenuItem key={index} href={item.path} icon={<i className={item.icon} />}>
            {item.label}
          </MenuItem>
        ))} */}
        {navigation?.items?.map((item, index) => (
          <MenuItem key={index} href={item.path} icon={<i className={item.icon} />}>
            {item.label}
          </MenuItem>
        ))}

      </Menu>
    </HorizontalNav>
  )
}

export default HorizontalMenu