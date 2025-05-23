'use client'

import { IconButton } from '@mui/material'
// Hook Imports
import useVerticalNav from '../../hooks/useVerticalNav'

// Icon Imports
import CloseIcon from '../../svg/Close'
const NavCollapseIcons = props => {
  // Props
  const { closeIcon, lockedIcon, unlockedIcon, onClick, onClose, IconClassName, ...rest } = props

  // Hooks
  const { isCollapsed, collapseVerticalNav, isBreakpointReached, toggleVerticalNav } = useVerticalNav()

  // Handle Lock / Unlock Icon Buttons click
  const handleClick = action => {
    // Setup the verticalNav to be locked or unlocked
    const collapse = action === 'lock' ? false : true

    // Tell the verticalNav to lock or unlock
    collapseVerticalNav(collapse)

    // Call onClick function if passed
    onClick && onClick()
  }

  // Handle Close button click
  const handleClose = () => {
    // Close verticalNav using toggle verticalNav function
    toggleVerticalNav(false)

    // Call onClose function if passed
    onClose && onClose()
  }

  return (
    <>
      {isBreakpointReached ? (
        <IconButton onClick={handleClose} {...rest}>
          {closeIcon ?? <CloseIcon />}
        </IconButton>
      ) : <IconButton onClick={() => isCollapsed ? handleClick('lock') : handleClick('unlock')} {...rest}>
        <i className={IconClassName} />
      </IconButton>
      }
    </>
  )

}

export default NavCollapseIcons
