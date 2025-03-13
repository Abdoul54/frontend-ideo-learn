import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Breadcrumbs, ButtonGroup, Divider, IconButton, Tooltip, Typography, useTheme, Stack, Box } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'

const styles = {
  breadcrumbsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 2,
    borderRadius: 1,
    overflow: 'hidden'
  },
  buttonGroupContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    border: 1,
    borderColor: 'divider',
    boxShadow: 1,
    overflow: 'hidden'
  },
  iconButton: (theme, isActive) => ({
    borderRadius: 0,
    color: isActive ? 'white' : 'text.primary',
    bgcolor: isActive ? 'primary.light' : 'background.paper',
    '&:hover': {
      bgcolor: isActive ? 'primary.light' : 'divider'
    }
  })
}

const ToolbarButton = memo(({ button, index, totalButtons }) => {
  const theme = useTheme()

  // Handle null or undefined button
  if (!button) return null

  return (
    <>
      <Tooltip title={button.tooltip || 'Missing A Tooltip'} placement={button.tooltipPlacement || 'top'} color='red'>
        {button?.component || (
          <IconButton
            onClick={button.onClick}
            sx={styles.iconButton(theme, button.active)}
            disabled={button.disabled}
            aria-label={button.ariaLabel || button.tooltip || 'Button'}
          >
            <i className={`${button.icon} text-primary`} />
          </IconButton>
        )}
      </Tooltip>
      {totalButtons - 1 !== index && <Divider orientation='vertical' flexItem />}
    </>
  )
})

ToolbarButton.propTypes = {
  button: PropTypes.shape({
    icon: PropTypes.string,
    tooltip: PropTypes.string,
    tooltipPlacement: PropTypes.string,
    onClick: PropTypes.func,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    ariaLabel: PropTypes.string,
    component: PropTypes.element
  }).isRequired,
  index: PropTypes.number.isRequired,
  totalButtons: PropTypes.number.isRequired
}

ToolbarButton.displayName = 'ToolbarButton'

const ToolBar = ({ breadcrumbs = [], buttonGroup = [] }) => {
  // Memoize button group length
  const totalButtons = useMemo(() => buttonGroup.length, [buttonGroup])
  const router = useRouter()
  const currentPath = usePathname()

  const goTo = (path) => {
    if (!path) return
    if (path === currentPath) return
    router.push(path)
  }

  return (
    <Box
      elevation={0}
      sx={{
        display: 'flex',
        bgcolor: 'transparent',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 1,
        gap: 1,
      }}
    >
      <Stack
        direction='row'
        gap={1}
        alignItems='center'
      >
        <Breadcrumbs
          aria-label='breadcrumb'
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {breadcrumbs.map((breadcrumb, index) => (
            <Typography
              key={`breadcrumb-${index}-${breadcrumb?.label}`}
              variant='h5'
              fontWeight='bold'
              color={breadcrumb?.link && currentPath !== breadcrumb?.link ? 'primary.main' : 'text.primary'}
              className={`${breadcrumb?.link && currentPath !== breadcrumb?.link ? 'cursor-pointer' : 'cursor-auto'}`}
              component={'span'}
              onClick={() => breadcrumb?.link && goTo(breadcrumb.link)}
            >
              {breadcrumb?.label || 'Unlabeled'}
            </Typography>
          ))}
        </Breadcrumbs>
      </Stack>

      {buttonGroup.length > 0 && (
        <Stack
          direction='row'
          gap={2}
          justifyContent='flex-end'
          alignItems='center'
        >
          <ButtonGroup sx={styles.buttonGroupContainer}>
            {buttonGroup.map((button, index) => (
              <ToolbarButton
                key={`button-${button.icon || 'custom'}-${index}`}
                button={button}
                index={index}
                totalButtons={totalButtons}
              />
            ))}
          </ButtonGroup>
        </Stack>
      )}
    </Box>
  )
}

export default ToolBar