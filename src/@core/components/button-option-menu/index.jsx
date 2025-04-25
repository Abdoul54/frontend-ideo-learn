'use client'

// React Imports
import { useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Portal from '@mui/material/Portal'

// Third-party Imports
import classnames from 'classnames'
import { useSettings } from '@/@core/contexts/settingsContext'

const MenuItemWrapper = ({ children, option }) => {
  if (option.href) {
    return (
      <Box component={Link} href={option.href} {...option.linkProps}>
        {children}
      </Box>
    )
  } else {
    return <>{children}</>
  }
}

const ButtonOptionMenu = props => {
  // Props
  const {
    buttonText = 'Options',
    buttonIcon,
    buttonVariant = 'contained',
    buttonSize = 'medium',
    buttonColor = 'primary',
    options,
    leftAlignMenu,
    buttonProps
  } = props

  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const { settings } = useSettings()

  const handleToggle = e => {
    e.stopPropagation()
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }

    setOpen(false)
  }

  return (
    <>
      <Button
        ref={anchorRef}
        variant={buttonVariant}
        size={buttonSize}
        color={buttonColor}
        onClick={handleToggle}
        startIcon={buttonIcon && (typeof buttonIcon === 'string' ? <i className={buttonIcon} /> : buttonIcon)}
        {...buttonProps}
      >
        {buttonText}
      </Button>
      <Portal>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement={leftAlignMenu ? 'bottom-start' : 'bottom-end'}
          transition
          style={{
            zIndex: 9999,
            position: 'fixed'
          }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps}>
              <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList>
                    {options.map((option, index) => {
                      if (typeof option === 'string') {
                        return (
                          <MenuItem key={index} onClick={handleClose}>
                            {option}
                          </MenuItem>
                        )
                      } else if ('divider' in option) {
                        return option.divider && <Divider key={index} {...option.dividerProps} />
                      } else {
                        return (
                          <MenuItem
                            key={index}
                            {...option.menuItemProps}
                            {...(option.href && { className: 'p-0' })}
                            onClick={e => {
                              handleClose(e)
                              option.menuItemProps && option.menuItemProps.onClick
                                ? option.menuItemProps.onClick(e)
                                : null
                            }}
                          >
                            <MenuItemWrapper option={option}>
                              {(typeof option.icon === 'string' ? <i className={option.icon} /> : option.icon) || null}
                              {option.text}
                            </MenuItemWrapper>
                          </MenuItem>
                        )
                      }
                    })}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      </Portal>
    </>
  )
}

export default ButtonOptionMenu