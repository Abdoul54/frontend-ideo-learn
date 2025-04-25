// MuiTabList.js
import MuiTabList from '@mui/lab/TabList'
import { styled } from '@mui/material/styles'

const TabList = styled(MuiTabList)(({ color = 'primary', theme, pill, vertical, orientation }) => ({
  ...(pill === 'true' && {
    minHeight: 38,
    ...(orientation === 'vertical'
      ? {
        borderInlineEnd: 0
      }
      : {
        borderBlockEnd: 0
      }),
    '&, & .MuiTabs-scroller': {
      ...(orientation === 'vertical' && {
        boxSizing: 'content-box'
      }),
      margin: `${theme.spacing(-1, -1, -1.5, -1)} !important`,
      padding: theme.spacing(1, 1, 1.5, 1)
    },
    '& .MuiTabs-indicator': {
      display: 'none'
    },
    '& .MuiTabs-flexContainer': {
      gap: theme.spacing(1)
    },
    '& .Mui-selected': {
      backgroundColor: `var(--mui-palette-${color}-main) !important`,
      color: `var(--mui-palette-${color}-contrastText) !important`,
      boxShadow: 'var(--mui-customShadows-xs)'
    },
    '& .MuiTab-root': {
      minHeight: 38,
      padding: theme.spacing(2, 5.5),
      borderRadius: 'var(--mui-shape-customBorderRadius-lg)',
      '&:hover': {
        border: 0,
        backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
        color: `var(--mui-palette-${color}-main)`,
        ...(orientation === 'vertical'
          ? {
            paddingInlineEnd: theme.spacing(5.5)
          }
          : {
            paddingBlockEnd: theme.spacing(2)
          })
      }
    }
  }),

  // Add new vertical variant
  ...(vertical === 'true' && {
    borderInlineEnd: 'none !important',
    borderRight: 'none !important',

    // Target all possible elements that could show indicators
    '&.MuiTabs-root': {
      borderRight: 'none !important'
    },

    '& .MuiTabs-scroller': {
      borderRight: 'none !important'
    },

    '& .MuiTabs-indicator': {
      display: 'none !important',
      width: '0 !important',
      borderRight: 'none !important'
    },

    '& .MuiTabs-flexContainer': {
      borderRight: 'none !important',
    },

    '& .Mui-selected': {
      borderLeft: `4px solid var(--mui-palette-${color}-dark) !important`,
      borderRight: 'none !important',
      borderTopRightRadius: '10px !important',
      borderBottomRightRadius: '10px !important',
      backgroundColor: 'var(--mui-palette-action-hover)',
      fontWeight: 'bold'
    },

    '& .MuiTab-root': {
      position: 'relative',
      minHeight: '50px',
      alignItems: 'flex-start',
      transition: 'all 0.2s',
      paddingLeft: '16px',
      borderLeft: '4px solid transparent',
      borderRight: 'none !important',

      // Target and hide all pseudo-elements
      '&::after': {
        display: 'none !important',
        content: '""',
        width: '0 !important',
        height: '0 !important',
        borderRight: 'none !important'
      },

      '&::before': {
        display: 'none !important',
        content: '""',
        width: '0 !important',
        height: '0 !important',
        borderRight: 'none !important'
      },

      '&:hover': {
        backgroundColor: 'var(--mui-palette-action-hover)',
        borderRight: 'none !important',
        borderLeft: `4px solid var(--mui-palette-${color}-light) !important`,
        borderTopRightRadius: '10px !important',
        borderBottomRightRadius: '10px !important',


        // Additional selectors to target any hover indicators
        '&::after': {
          display: 'none !important',
          width: '0 !important',
          height: '0 !important',
          content: '""',
          borderRight: 'none !important'
        },

        '&::before': {
          display: 'none !important',
          width: '0 !important',
          height: '0 !important',
          content: '""',
          borderRight: 'none !important'
        }
      }
    }
  })
}))

const CustomTabList = props => {
  // Props
  const { color = 'primary', vertical = 'false', ...rest } = props

  return <TabList color={color} vertical={vertical} {...rest} />
}

export default CustomTabList