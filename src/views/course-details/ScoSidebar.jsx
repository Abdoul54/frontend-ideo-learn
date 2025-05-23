'use client'

// React Imports
import { Fragment, useState, useRef, useEffect } from 'react'

// MUI Imports
import { styled } from '@mui/material/styles'
import MuiAccordion from '@mui/material/Accordion'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import ListItem from '@mui/material/ListItem'
import List from '@mui/material/List'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemButton from '@mui/material/ListItemButton'
import { Divider } from '@mui/material'

// Styled component for Accordion component
export const Accordion = styled(MuiAccordion)({
  boxShadow: 'none !important',
  border: '1px solid var(--mui-palette-divider) !important',
  borderRadius: '0 !important',
  overflow: 'hidden',
  background: 'none',
  '&:not(:last-of-type)': {
    borderBottom: '0 !important'
  },
  '&:before': {
    display: 'none'
  },
  '&.Mui-expanded': {
    margin: 'auto'
  },
  '&:first-of-type': {
    borderTopLeftRadius: 'var(--mui-shape-borderRadius) !important',
    borderTopRightRadius: 'var(--mui-shape-borderRadius) !important'
  },
  '&:last-of-type': {
    borderBottomLeftRadius: 'var(--mui-shape-borderRadius) !important',
    borderBottomRightRadius: 'var(--mui-shape-borderRadius) !important'
  }
})

// Styled component for AccordionSummary component
export const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  marginBottom: -1,
  padding: theme.spacing(3, 5),
  transition: 'min-height 0.15s ease-in-out',
  backgroundColor: 'var(--mui-palette-action-hover)',
  borderBottom: '1px solid var(--mui-palette-divider) !important',
  cursor: 'pointer',
  '&.Mui-expanded': {
    '& .MuiAccordionSummary-expandIconWrapper': {
      transform: 'rotate(90deg)'
    }
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    transform: theme.direction === 'rtl' && 'rotate(180deg)'
  },
  '& .MuiAccordionSummary-content.Mui-expanded': {
    margin: '12px 0'
  }
}))

// Styled component for AccordionDetails component
export const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: `${theme.spacing(4)} ${theme.spacing(3)} !important`,
  backgroundColor: 'var(--mui-palette-background-paper)'
}))

// Styled component for clickable list items
const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: 8,
  borderRadius: 'var(--mui-shape-borderRadius)',
  '&:hover': {
    backgroundColor: 'var(--mui-palette-action-hover)'
  }
}))

const ScoSidebar = ({ scos, onChildClick, initialSelectedId }) => {
  // States
  const [expanded, setExpanded] = useState(null)
  const [selectedChild, setSelectedChild] = useState(initialSelectedId)
  const initialSetupDone = useRef(false)

  // Initialize with initialSelectedId if provided
  useEffect(() => {
    if (initialSelectedId) {
      setSelectedChild(initialSelectedId);

      // Find and expand the parent SCO if this is a child
      if (scos) {
        for (const sco of scos) {
          if (sco.children?.some(child => child.id === initialSelectedId)) {
            setExpanded(sco.id);
            break;
          }
        }
      }
    }
  }, [initialSelectedId, scos]);

  // Initialize the first SCO or SCO with children when the component loads
  useEffect(() => {
    if (!scos || scos.length === 0 || initialSetupDone.current) return;

    // Skip setup if we already have an initialSelectedId
    if (initialSelectedId) {
      initialSetupDone.current = true;
      return;
    }

    const firstScoWithChildren = scos.find(sco => sco?.children?.length > 0);

    if (firstScoWithChildren) {
      // If there's a SCO with children, expand it and select its first child
      setExpanded(firstScoWithChildren.id);

      if (firstScoWithChildren.children.length > 0) {
        const firstChild = firstScoWithChildren.children[0];
        setSelectedChild(firstChild.id);

        // Notify parent component of selection
        if (onChildClick && typeof onChildClick === 'function') {
          onChildClick(firstChild);
        }
      }
    } else if (scos[0]) {
      // If no SCOs have children, select the first SCO
      setSelectedChild(scos[0].id);

      // Notify parent component of selection
      if (onChildClick && typeof onChildClick === 'function') {
        onChildClick(scos[0]);
      }
    }

    initialSetupDone.current = true;
  }, [scos, onChildClick, initialSelectedId]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const handleChildClick = (child) => {
    setSelectedChild(child.id)

    // Call the parent component's handler with the child data
    if (onChildClick && typeof onChildClick === 'function') {
      onChildClick(child)
    }
  }

  // Find the parent SCO of a selected child to keep it expanded
  useEffect(() => {
    if (selectedChild && scos) {
      for (const sco of scos) {
        if (sco.children?.some(child => child.id === selectedChild)) {
          setExpanded(sco.id);
          break;
        }
      }
    }
  }, [selectedChild, scos]);

  return (
    <>
      {scos?.map((sco) => {
        const hasChildren = sco?.children?.length > 0
        const isExpanded = expanded === sco.id
        const isSelected = !hasChildren && selectedChild === sco.id

        return (
          <Accordion
            key={sco.id}
            expanded={hasChildren && isExpanded}
            onChange={handleChange(sco.id)}
          >
            <AccordionSummary
              id={`sco-panel-header-${sco.id}`}
              expandIcon={
                hasChildren ? (
                  <i className='ri-arrow-right-s-line text-textSecondary' />
                ) : null
              }
              aria-controls={`sco-panel-content-${sco.id}`}
              sx={{
                bgcolor: !hasChildren ? (isSelected ? 'var(--mui-palette-primary-lightOpacity)' : 'var(--mui-palette-background-paper)') : '',
                cursor: hasChildren ? 'default' : 'pointer',
              }}
              onClick={!hasChildren ? () => handleChildClick(sco) : undefined}
            >
              <Typography variant='h5' className={`flex items-center ${!hasChildren ? 'text-sm' : ''} gap-2`}>
                {!hasChildren && (
                  <i className='solar-play-circle-outline size-8 text-textSecondary' />
                )}
                {sco.title}
              </Typography>
            </AccordionSummary>

            {hasChildren && (
              <AccordionDetails>
                <List component='div' className='flex flex-col gap-4 plb-0'>
                  {sco.children.map((child, index) => {
                    const isSelected = selectedChild === child.id
                    return (
                      <Fragment key={child.id}>
                        <StyledListItemButton
                          onClick={() => handleChildClick(child)}
                          selected={isSelected}
                          sx={{
                            backgroundColor: isSelected ? 'var(--mui-palette-primary-lightOpacity)' : 'transparent'
                          }}
                        >
                          <ListItemIcon>
                            <i className='solar-play-circle-outline size-6' />
                          </ListItemIcon>
                          <Typography className='font-medium !text-textPrimary'>
                            {child.title}
                          </Typography>
                        </StyledListItemButton>
                        {index !== sco.children.length - 1 && <Divider />}
                      </Fragment>
                    )
                  })}
                </List>
              </AccordionDetails>
            )}
          </Accordion>
        )
      })}
    </>
  )
}

export default ScoSidebar