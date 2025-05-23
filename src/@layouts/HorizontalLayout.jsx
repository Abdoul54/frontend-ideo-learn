// Third-party Imports
import classnames from 'classnames'

// Context Imports
import { HorizontalNavProvider } from '@menu/contexts/horizontalNavContext'

// Component Imports
import LayoutContent from './components/horizontal/LayoutContent'

// Util Imports
import { horizontalLayoutClasses } from './utils/layoutClasses'

// Styled Component Imports
import StyledContentWrapper from './styles/horizontal/StyledContentWrapper'
import Sidebar from '@/components/layout/horizontal/Sidebar'

const HorizontalLayout = props => {
  // Props
  const { header, footer, children, isCentral } = props

  return (
    <div className={isCentral ? classnames(horizontalLayoutClasses.root, 'flex flex-auto') : "flex flex-col h-screen"}>
      <HorizontalNavProvider>
        {
          isCentral ? (
            <StyledContentWrapper className={classnames(horizontalLayoutClasses.contentWrapper, 'flex flex-col is-full')}>
              {header || null}
              <LayoutContent>{children}</LayoutContent>
              {footer || null}
            </StyledContentWrapper>
          )
            :
            (
              <>
                {/* Full width header */}
                {header || null}

                {/* Content area with sidebar - the key fix is removing fixed and making this a flex layout */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Sidebar with fixed positioning */}
                    <Sidebar />

                  {/* Main content - with overflow auto to enable scrolling */}
                  <div className='flex-1 overflow-auto'>
                    <StyledContentWrapper className={classnames(horizontalLayoutClasses.contentWrapper, 'flex flex-col w-full')}>
                      <main className="flex-1">
                        <LayoutContent>{children}</LayoutContent>
                      </main>
                      {footer || null}
                    </StyledContentWrapper>
                  </div>
                </div>
              </>
            )
        }
      </HorizontalNavProvider>
    </div>
  )
}

export default HorizontalLayout