'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import useScrollTrigger from '@mui/material/useScrollTrigger'

// Third-party Imports
import classnames from 'classnames'

// Config Imports
import settingConfig from '@/configs/settingConfig'

// Hook Imports

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Styled Component Imports
import StyledHeader from '@layouts/styles/vertical/StyledHeader'
import { useSettings } from '@/@core/contexts/settingsContext'

const Navbar = props => {
  // Props
  const { children, overrideStyles } = props

  // Hooks
  const { settings } = useSettings()
  const theme = useTheme()

  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true
  })

  // Vars
  const { navbarContentWidth } = settings
  const headerFixed = settingConfig.navbar.type === 'fixed'
  const headerStatic = settingConfig.navbar.type === 'static'
  const headerFloating = settingConfig.navbar.floating === true
  const headerDetached = settingConfig.navbar.detached === true
  const headerAttached = settingConfig.navbar.detached === false
  const headerBlur = settingConfig.navbar.blur === true
  const headerContentCompact = navbarContentWidth === 'compact'
  const headerContentWide = navbarContentWidth === 'wide'

  return (
    <StyledHeader
      theme={theme}
      overrideStyles={overrideStyles}
      className={classnames(verticalLayoutClasses.header, 'flex items-center justify-center is-full', {
        [verticalLayoutClasses.headerFixed]: headerFixed,
        [verticalLayoutClasses.headerStatic]: headerStatic,
        [verticalLayoutClasses.headerFloating]: headerFloating,
        [verticalLayoutClasses.headerDetached]: !headerFloating && headerDetached,
        [verticalLayoutClasses.headerAttached]: !headerFloating && headerAttached,
        [verticalLayoutClasses.headerBlur]: headerBlur,
        [verticalLayoutClasses.headerContentCompact]: headerContentCompact,
        [verticalLayoutClasses.headerContentWide]: headerContentWide,
        scrolled: trigger
      })}
    >
      <div className={classnames(verticalLayoutClasses.navbar, 'flex bs-full')}>{children}</div>
    </StyledHeader>
  )
}

export default Navbar
