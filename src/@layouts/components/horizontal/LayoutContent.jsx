'use client'

// Third-party Imports
import classnames from 'classnames'

// Config Imports
import settingConfig from '@/configs/settingConfig'

// Hook Imports
import { useSettings } from '@/@core/contexts/settingsContext'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

// Styled Component Imports
import StyledMain from '@layouts/styles/shared/StyledMain'
import { usePathname } from 'next/navigation'
import { noPaddingPages } from '@/constants/noPaddingPages'

const LayoutContent = ({ children }) => {
  // Hooks
  const { settings } = useSettings()
  const pathname = usePathname()

  // Vars
  const contentCompact = settings.contentWidth === 'compact'
  const contentWide = settings.contentWidth === 'wide'

  return (
    <StyledMain
      isContentCompact={contentCompact}
      className={classnames(horizontalLayoutClasses.content, 'flex-auto', {
        [`${horizontalLayoutClasses.contentCompact} is-full`]: contentCompact,
        [horizontalLayoutClasses.contentWide]: contentWide
      })}
      // style={{ padding: noPaddingPages?.includes(pathname) ? 0 : settingConfig.layoutPadding }}
      style={{ padding: settingConfig.layoutPadding }}
    >
      {children}
    </StyledMain>
  )
}

export default LayoutContent
