'use client'
import { useSettings } from "@/@core/contexts/settingsContext"
import { Box, IconButton, Paper, Portal, Slide, Stack, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { memo, useEffect, useRef, useState } from "react"

// Constants remain the same
const NAV_CONFIG = {
    WIDTH: 80,
    ITEM_HEIGHT: 48,
    TOOLTIP_DELAY: 200
}

// Custom hook for tooltip management remains the same
const useTooltip = () => {
    const [showTooltip, setShowTooltip] = useState(false)
    const [tooltipPosition, setTooltipPosition] = useState(null)
    const tooltipTimer = useRef(null)
    const itemRef = useRef(null)

    const updateTooltipPosition = () => {
        const rect = itemRef.current?.getBoundingClientRect()
        if (rect) setTooltipPosition(rect.top)
    }

    const handleMouseEnter = () => {
        updateTooltipPosition()
        tooltipTimer.current = setTimeout(() => {
            setShowTooltip(true)
        }, NAV_CONFIG.TOOLTIP_DELAY)
    }

    const handleMouseLeave = () => {
        if (tooltipTimer.current) {
            clearTimeout(tooltipTimer.current)
        }
        tooltipTimer.current = setTimeout(() => {
            setShowTooltip(false)
        }, 100)
    }

    useEffect(() => {
        const handleGlobalClick = () => {
            setShowTooltip(false)
            if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
        }

        window.addEventListener('click', handleGlobalClick)

        return () => {
            window.removeEventListener('click', handleGlobalClick)
            if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
            setShowTooltip(false)
        }
    }, [])

    return {
        showTooltip,
        tooltipPosition,
        itemRef,
        handleMouseEnter,
        handleMouseLeave
    }
}

// Fixed NavTooltip Component
const NavTooltip = memo(function NavTooltip({ show, position, icon, label }) {
    const { settings } = useSettings()
    const [isMounted, setIsMounted] = useState(false)

    // Move useEffect after all other hooks to maintain consistent order
    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    const isRTL = settings?.language?.direction === 'rtl'

    return (
        <Portal container={document.body}>
            <Slide direction={isRTL ? 'left' : 'right'} in={show}>
                <Paper
                    sx={{
                        position: 'fixed',
                        borderColor: 'primary.main',
                        bgcolor: 'primary.main',
                        zIndex: 9999,
                        pointerEvents: 'none',
                        p: 1.75,
                        cursor: 'pointer',
                        boxShadow: 4,
                        borderRadius: '0 10px 10px 0',
                        top: position,
                        transform: 'translateY(-50%)',
                        right: 'unset',
                        left: '0px',
                        transition: 'transform 0.3s ease',
                        willChange: 'transform',
                        ':dir(rtl) &': {
                            borderRadius: '10px 0 0 10px',
                            left: 'unset',
                            right: '0px'
                        }
                    }}
                >
                    <Stack direction='row' spacing={1} alignItems='center' gap={1} minWidth={80} sx={{ py: 1 }}>
                        <i
                            className={`${icon} text-white`}
                            sx={{
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                        <Typography
                            variant='body2'
                            sx={{
                                color: 'white',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {label}
                        </Typography>
                    </Stack>
                </Paper>
            </Slide>
        </Portal>
    )
})

// NavItem Component remains the same
const NavItem = memo(function NavItem({ icon, label, path, currentPath, index }) {
    const router = useRouter()
    const {
        showTooltip,
        tooltipPosition,
        itemRef,
        handleMouseEnter,
        handleMouseLeave
    } = useTooltip()

    const isActive = currentPath === path

    return (
        <Box
            id={`nav-item-${index}`}
            ref={itemRef}
            onClick={() => router.push(path)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
                position: 'relative',
                height: NAV_CONFIG.ITEM_HEIGHT,
                width: NAV_CONFIG.ITEM_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            }}
        >
            <IconButton
                sx={{
                    borderRadius: 1,
                    height: 'auto',
                    width: 'auto',
                    p: 1.75,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'white' : 'text.primary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor: isActive ? 'primary.dark' : 'action.hover'
                    }
                }}
            >
                <i className={`${icon}`} />
            </IconButton>

            <NavTooltip
                show={showTooltip}
                position={tooltipPosition}
                icon={icon}
                label={label}
            />
        </Box>
    )
})

export default NavItem