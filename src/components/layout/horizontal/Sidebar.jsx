'use client'
import { usePathname } from "next/navigation"
import NavItem from "../../tooltip/Tooltip"
// import { useSettings } from "@/@core/contexts/settingsContext"


// Sidebar Component
const Sidebar = () => {
    const pathname = usePathname() // Add this hook to track current path
    // const { settings } = useSettings() // Add this hook to get settings

    const navigationItems = [
        { icon: "solar-home-2-bold-duotone", label: "Home", path: "/home" }
    ]

    return (
        <aside className="h-full bg-backgroundPaper border-e border-gray-200">
            <div
                className="h-full overflow-y-auto"
                style={{ scrollbarWidth: 'none' }}
            >
                <div className="flex flex-col items-center">
                    {navigationItems?.map((item, index) => (
                        <NavItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            currentPath={pathname}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </aside>
    )
}

export default Sidebar