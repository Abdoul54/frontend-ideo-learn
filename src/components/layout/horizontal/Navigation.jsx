// Third-party Imports
import styled from '@emotion/styled'
import classnames from 'classnames'

// Component Imports
import HorizontalMenu from './HorizontalMenu'

// Config Imports
import settingConfig from '@/configs/settingConfig'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import { useSettings } from '@/@core/contexts/settingsContext'

const StyledDiv = styled.div`
  ${({ isContentCompact, isBreakpointReached }) =>
    !isBreakpointReached &&
    `
    padding: ${settingConfig.layoutPadding}px;

    ${isContentCompact &&
    `
      margin-inline: auto;
      max-inline-size: ${settingConfig.compactContentWidth}px;
    `
    }
  `}
`

const Navigation = () => {
  // Hooks
  const { settings } = useSettings()
  const { isBreakpointReached } = useHorizontalNav()

  // Vars
  const headerContentCompact = settings.navbarContentWidth === 'compact'

  return (
    <div
      {...(!isBreakpointReached && {
        className: classnames(horizontalLayoutClasses.navigation, 'relative flex border-bs')
      })}
    >
      <StyledDiv
        isContentCompact={headerContentCompact}
        isBreakpointReached={isBreakpointReached}
        {...(!isBreakpointReached && {
          className: classnames(horizontalLayoutClasses.navigationContentWrapper, 'flex items-center is-full plb-2 hidden')
        })}
      >
        <HorizontalMenu />
      </StyledDiv>
    </div>
  )
}

export default Navigation
