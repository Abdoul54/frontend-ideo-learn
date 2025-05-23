'use client'

import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Portal from '@mui/material/Portal'
import classnames from 'classnames'
import { useSettings } from '@/@core/contexts/settingsContext'

const CustomDropdown = props => {
  const { Icon, iconClassName, items, leftAlignMenu, iconButtonProps } = props

  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

  const { settings } = useSettings()

  const handleToggle = e => {
    e.stopPropagation()
    setOpen(prev => !prev)
  }

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return
    setOpen(false)
  }

  return (
    <>
      {typeof Icon === 'string' ? (

        <IconButton
          ref={anchorRef}
          size='small'
          onClick={handleToggle}
          {...iconButtonProps}
          sx={iconButtonProps?.sx}
        >
          <i className={classnames(Icon, iconClassName)} />
        </IconButton>
      )
        : Icon ? (
          <Icon
            ref={anchorRef}
            size='small'
            onClick={handleToggle}
            {...iconButtonProps}
            sx={iconButtonProps?.sx}
            className={classnames(Icon, iconClassName)}
          >{iconButtonProps?.label}</Icon>
        ) : (
          <IconButton
            ref={anchorRef}
            size='small'
            onClick={handleToggle}
            {...iconButtonProps}
            sx={iconButtonProps?.sx}
          >
            <i className={classnames('ri-more-2-line', iconClassName)} />
          </IconButton >
        )}

      <Portal>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement={leftAlignMenu ? 'bottom-start' : 'bottom-end'}
          transition
          style={{ zIndex: 9999, position: 'fixed' }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps}>
              <Paper
                className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}
                sx={{ p: 1 }} // Add padding here if needed
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <Box>{items}</Box>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      </Portal>
    </>
  )
}

export default CustomDropdown
