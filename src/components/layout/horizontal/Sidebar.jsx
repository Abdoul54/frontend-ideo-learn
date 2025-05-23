'use client'
import VerticalNav, { Menu, MenuItem, NavCollapseIcons } from "@/@menu/vertical-menu"
import useVerticalNav from "@/@menu/hooks/useVerticalNav"
import { useTheme } from "@mui/material"
import { useEffect, useState, useRef } from "react"
import menuItemStyles from "@/@core/styles/vertical/menuItemStyles"
import menuSectionStyles from "@/@core/styles/vertical/menuSectionStyles"
import { useSettings } from "@/@core/contexts/settingsContext"
import PerfectScrollbar from 'react-perfect-scrollbar'
import navigationCustomStyles from "@/@core/styles/vertical/navigationCustomStyles"
import { useLanguage } from "@/providers/LanguageProvider"
import { useTranslation } from "@/@core/contexts/translationContext"

// Sidebar Component
const Sidebar = () => {

    const { translate } = useTranslation()

    const navigationItems = [
        { icon: "lucide-house", label: translate('metadata.path/home-title'), path: "/home" },
        { icon: "lucide-graduation-cap", label: "Mes Formations", path: "/learn/mycourses" },
        { icon: "lucide-activity", label: "Mes Activités", path: "/learn/activities" },
        { icon: "lucide-book-open-text", label: "Course Catalog", path: "/learn/catalog" },
    ]

    // Hooks
    const { language } = useLanguage()
    const verticalNavOptions = useVerticalNav()
    const {
        isCollapsed,
        isHovered,
        expanding,
        collapsing,
        isBreakpointReached,
        handleToggleCollapse,
        handleMouseEnter,
        handleMouseLeave,
        transitionDuration,
        ...rest
    } = verticalNavOptions
    const theme = useTheme()
    const { settings } = useSettings()

    // State to track local hover for the collapse icon
    const [isIconHovered, setIsIconHovered] = useState(false)

    // Ref to track if transition is in progress
    const transitioningRef = useRef(false)

    // Define a consistent transition duration - MUST match in all places
    const TRANSITION_DURATION = 300

    // Define exact positions for clarity
    const COLLAPSED_POSITION = "55px"
    const EXPANDED_POSITION = "245px"

    // Calculate the position for the collapse icon based on sidebar state and transition state
    const iconLeftPosition = isCollapsed
        ? (isHovered ? EXPANDED_POSITION : COLLAPSED_POSITION)
        : EXPANDED_POSITION

    // Create consistent transition string to use in both places
    const transitionStyle = `transition-all duration-${TRANSITION_DURATION} ease-in-out`

    // Special class for hover state
    const hoverClass = isCollapsed && isHovered ? "sidebar-hovered" : ""

    const scrollMenu = (container, isPerfectScrollbar) => {
        container = isBreakpointReached || !isPerfectScrollbar ? container.target : container

        if (shadowRef && container.scrollTop > 0) {
            // @ts-ignore
            if (!shadowRef.current.classList.contains('scrolled')) {
                // @ts-ignore
                shadowRef.current.classList.add('scrolled')
            }
        } else {
            // @ts-ignore
            shadowRef.current.classList.remove('scrolled')
        }
    }


    // Log state for debugging
    useEffect(() => {

        // Track transition state
        if (expanding || collapsing) {
            transitioningRef.current = true
            const timer = setTimeout(() => {
                transitioningRef.current = false
            }, TRANSITION_DURATION)
            return () => clearTimeout(timer)
        }
    }, [isCollapsed, isHovered, expanding, collapsing, iconLeftPosition])

    const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

    return (
        <VerticalNav
            customStyles={navigationCustomStyles(verticalNavOptions, theme)}
            collapsedWidth={71}
            backgroundColor='var(--mui-palette-background-paper)'
            customBreakpoint='1100px'
            className={`${transitionStyle} ${hoverClass}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            transitionDuration={TRANSITION_DURATION}
            // Pass the collapsed state to the component
            data-collapsed={isCollapsed}
            data-hovered={isHovered}
        >
            <ScrollWrapper
                {...(isBreakpointReached
                    ? {
                        className: 'bs-full overflow-y-auto overflow-x-hidden',
                        onScroll: container => scrollMenu(container, false)
                    }
                    : {
                        className: 'mt-2',
                        options: { wheelPropagation: false, suppressScrollX: true },
                        onScrollY: container => scrollMenu(container, true)
                    })}
            >
                {/* Collapse icon with dynamic positioning based on sidebar state */}
                {!isBreakpointReached &&
                    <NavCollapseIcons
                        size="small"
                        className={`fixed bottom-20 bg-primary text-backgroundPaper hover:bg-primaryDark z-50 shadow-md rounded-full p-2 ${transitionStyle}`}
                        style={{
                            left: language?.direction === 'ltr' ? iconLeftPosition : 'unset',
                            right: language?.direction === 'rtl' ? iconLeftPosition : 'unset',
                            // Lock transition timing to match sidebar exactly
                            transitionProperty: 'left, right',
                            transitionDuration: `${TRANSITION_DURATION}ms`,
                            transitionTimingFunction: 'ease-in-out'
                        }}
                        onMouseEnter={() => setIsIconHovered(true)}
                        onMouseLeave={() => setIsIconHovered(false)}
                        IconClassName={`solar-double-alt-arrow-left-bold-duotone transition-all duration-300 ${isCollapsed ? "rotate-180" : "rotate-0"}`}
                        unlockedIcon={<i className='solar-double-alt-arrow-left-bold-duotone' />}
                        lockedIcon={<i className='solar-double-alt-arrow-right-bold-duotone' />}
                        closeIcon={<i className='solar-xmark' />}
                        onClick={handleToggleCollapse}
                        onClose={() => console.log('closed')}
                    />}

                <Menu
                    popoutMenuOffset={{ mainAxis: 17 }}
                    menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
                    renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
                    renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
                    menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
                >
                    {
                        navigationItems.map((item, index) => (
                            <MenuItem
                                key={index}
                                href={item.path}
                                icon={<i className={item.icon} />}
                            >
                                {item.label}
                            </MenuItem>
                        ))
                    }
                </Menu>
            </ScrollWrapper>
        </VerticalNav>
    )
}

export default Sidebar