// Third-party Imports
import classnames from 'classnames'

// Config Imports
import settingConfig from '@/configs/settingConfig'

// Hook Imports
import { useSettings } from '@/@core/contexts/settingsContext'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

// Styled Component Imports
import StyledHeader from '@layouts/styles/horizontal/StyledHeader'

const Header = props => {
  // Props
  const { children, overrideStyles } = props

  // Hooks
  const { settings } = useSettings()

  // Vars
  const { navbarContentWidth } = settings
  const headerFixed = settingConfig.navbar.type === 'fixed'
  const headerStatic = settingConfig.navbar.type === 'static'
  const headerBlur = settingConfig.navbar.blur === true
  const headerContentCompact = navbarContentWidth === 'compact'
  const headerContentWide = navbarContentWidth === 'wide'

  return (
    <StyledHeader
      overrideStyles={overrideStyles}
      className={classnames(horizontalLayoutClasses.header, {
        [horizontalLayoutClasses.headerFixed]: headerFixed,
        [horizontalLayoutClasses.headerStatic]: headerStatic,
        [horizontalLayoutClasses.headerBlur]: headerBlur,
        [horizontalLayoutClasses.headerContentCompact]: headerContentCompact,
        [horizontalLayoutClasses.headerContentWide]: headerContentWide
      })}
    >
      {children}
    </StyledHeader>
  )
}

export default Header
