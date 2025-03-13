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
    <div className={isCentral ? classnames(horizontalLayoutClasses.root, 'flex flex-auto') : ""}>
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

                {/* Content area with sidebar */}
                <div className="flex flex-1">
                  {/* Fixed sidebar */}
                  <div className="layout-sidebar-box">
                    <Sidebar />
                  </div>

                  {/* Main content */}
                  <div className='layout-content-box'>
                    <StyledContentWrapper className={classnames(horizontalLayoutClasses.contentWrapper, 'flex flex-col')}>
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
    </div >

  )
}


export default HorizontalLayout
