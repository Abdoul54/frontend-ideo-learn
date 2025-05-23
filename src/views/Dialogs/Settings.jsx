"use client"

import { useState } from "react"
import {
    Dialog,
    DialogTitle,
    Tabs,
    Tab,
    Button,
    IconButton,
    Box
} from "@mui/material"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "@/@core/contexts/translationContext"

export default function DialogsSettings({
    open,
    onClose
}) {
    const [activeTab, setActiveTab] = useState(0)
    const pathname = usePathname()
    const { translate } = useTranslation()
    const router = useRouter()

    const menuItems = {
        manage: [
            { id: "users", label: translate('Administration System.MENU_USERS'), icon: <i className="lucide-users h-4 w-4" />, link: "/manage/users-management" },
            { id: "power-users", label: translate('Administration System.MENU_POWER_USERS'), icon: <i className="lucide-user-cog h-4 w-4" />, link: "/powerusers" },
            { id: "groups", label: translate('Administration System.MENU_GROUPS'), icon: <i className="lucide-user-round h-4 w-4" />, link: "/manage/groups" },
        ],
        settings: [
            { id: "domain", label: translate('Administration System.MENU_DOMAIN_MANAGEMENT'), icon: <i className="lucide-globe h-4 w-4" />, link: "/settings/domain-management" },
            { id: "localization", label: translate('Administration System.MENU_LOCALIZATION_TOOL'), icon: <i className="lucide-languages h-4 w-4" />, link: "/settings/localization-tool" },
            { id: "advanced", label: translate('Administration System.MENU_ADVANCED_SETTINGS'), icon: <i className="lucide-settings-2 h-4 w-4" />, link: "/settings/advanced-settings" },
            { id: "branding", label: translate('Administration System.MENU_CONFIGURE_BRANDING'), icon: <i className="lucide-palette h-4 w-4" />, link: "/settings/branding" },
            { id: "widget", label: translate('Administration System.MENU_WIDGET'), icon: <i className="lucide-layout-template h-4 w-4" />, link: "/settings/widget" },
        ],
        elearning: [
            { id: "courses", label: translate('Administration System.MENU_COURSES_MANAGEMENT'), icon: <i className="lucide-file-text h-4 w-4" />, link: "/learn/course" },
            { id: "catalog", label: translate('Administration System.MENU_CATALOG'), icon: <i className="lucide-bookmark h-4 w-4" />, link: "/learn/course-catalog" },
            { id: "plans", label: translate('Administration System.MENU_LEARNING_PLANS'), icon: <i className="lucide-graduation-cap h-4 w-4" />, link: "/learn/learning-plans" },
            { id: "skills", label: translate('Administration System.MENU_SKILL_MANAGEMENT'), icon: <i className="lucide-target h-4 w-4" />, link: "/skills" },
            { id: "locations", label: translate('Administration System.MENU_CLASSROOM_LOCATIONS'), icon: <i className="lucide-building h-4 w-4" />, link: "/learn/classroom-locations" },
            { id: "repository", label: translate('Administration System.MENU_CENTRAL_REPOSITORY'), icon: <i className="lucide-archive h-4 w-4" />, link: "/learn/central-repository" },
            { id: "reports", label: translate('Administration System.MENU_REPORTS'), icon: <i className="lucide-bar-chart-3 h-4 w-4" />, link: "/manage/reports" },
            { id: "channels", label: translate('Administration System.MENU_CHANNELS'), icon: <i className="lucide-tv-minimal-play h-4 w-4" />, link: "/learn/channels" },
        ],
    }

    const appItems = {
        '': [
            { id: "agirh", label: "AGIRH Connector", icon: <i className="lucide-unplug h-4 w-4" />, link: '/manage/partners/agirh' },
        ]
    }

    const handleItemClick = (item) => {
        router.push(item.link)
        handleClose()
    }

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }

    const handleClose = () => {
        onClose()
    }

    function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`settings-tabpanel-${index}`}
                aria-labelledby={`settings-tab-${index}`}
                {...other}
                className="m-0 p-0"
            >
                {value === index && (
                    <Box>{children}</Box>
                )}
            </div>
        );
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    maxWidth: '900px',
                    borderRadius: '8px',
                    m: 0,
                    p: 0,
                    overflow: 'hidden'
                }
            }}
        >
            <Box className="flex justify-between items-center p-4 border-b">
                <DialogTitle sx={{ p: 0, m: 0 }} className="text-xl font-semibold">
                    {translate('Administration System.SETTINGS_CONFIGURATION_TITLE')}
                </DialogTitle>
                <IconButton
                    onClick={handleClose}
                    size="medium"
                    sx={{ p: 1 }}
                >
                    <i className="lucide-x h-5 w-5" />
                </IconButton>
            </Box>

            <Box sx={{ width: '100%' }}>
                <Box className="border-b">
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        aria-label="settings tabs"
                        sx={{
                            minHeight: '48px',
                            height: '48px',
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'primary.main',
                                height: '2px',
                            },
                            '& .Mui-selected': {
                                color: 'primary.main',
                                fontWeight: 600,
                            },
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                minHeight: '48px',
                                height: '48px',
                                padding: '0 24px',
                            }
                        }}
                    >
                        <Tab label={translate('Administration System.ADMIN_MENU_TAB')} />
                        <Tab label={translate('Administration System.APPS_FEATURES_TAB')} />
                    </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                    <div className="grid grid-cols-2 h-[500px]">
                        <div className="border-r">
                            <Box sx={{ height: '500px', overflowY: 'auto' }}>
                                <div className="p-4">
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-muted-foreground tracking-wider mb-2">{translate('Administration System.SECTION_MANAGE')}</h3>
                                        <div className="space-y-1">
                                            {menuItems.manage.map((item) => (
                                                <Button
                                                    key={item.id}
                                                    variant={pathname === item.link ? "contained" : "text"}
                                                    onClick={() => handleItemClick(item)}
                                                    startIcon={item.icon}
                                                    sx={{
                                                        justifyContent: 'flex-start',
                                                        textTransform: 'none',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '8px 16px',
                                                        backgroundColor: pathname === item.link ? 'primary.main' : 'transparent',
                                                        color: pathname === item.link ? 'primary.contrastText' : 'inherit',
                                                        '&:hover': {
                                                            backgroundColor: pathname === item.link ? 'primary.main' : 'action.hover',
                                                        }
                                                    }}
                                                >
                                                    {item.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground tracking-wider mb-2">{translate('Administration System.SECTION_SETTINGS')}</h3>
                                        <div className="space-y-1">
                                            {menuItems.settings.map((item) => (
                                                <Button
                                                    key={item.id}
                                                    variant={pathname === item.link ? "contained" : "text"}
                                                    onClick={() => handleItemClick(item)}
                                                    startIcon={item.icon}
                                                    sx={{
                                                        justifyContent: 'flex-start',
                                                        textTransform: 'none',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '8px 16px',
                                                        backgroundColor: pathname === item.link ? 'primary.main' : 'transparent',
                                                        color: pathname === item.link ? 'primary.contrastText' : 'inherit',
                                                        '&:hover': {
                                                            backgroundColor: pathname === item.link ? 'primary.main' : 'action.hover',
                                                        }
                                                    }}
                                                >
                                                    {item.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Box>
                        </div>

                        <div>
                            <Box sx={{ height: '500px', overflowY: 'auto' }}>
                                <div className="p-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground tracking-wider mb-2">{translate('Administration System.SECTION_ELEARNING')}</h3>
                                    <div className="space-y-1">
                                        {menuItems.elearning.map((item) => (
                                            <Button
                                                key={item.id}
                                                variant={pathname === item.link ? "contained" : "text"}
                                                onClick={() => handleItemClick(item)}
                                                startIcon={item.icon}
                                                sx={{
                                                    justifyContent: 'flex-start',
                                                    textTransform: 'none',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '8px 16px',
                                                    backgroundColor: pathname === item.link ? 'primary.main' : 'transparent',
                                                    color: pathname === item.link ? 'primary.contrastText' : 'inherit',
                                                    '&:hover': {
                                                        backgroundColor: pathname === item.link ? 'primary.main' : 'action.hover',
                                                    }
                                                }}
                                            >
                                                {item.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </Box>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <div className="grid grid-cols-2 h-[500px]">
                        <div className="border-r">
                            <Box sx={{ height: '500px', overflowY: 'auto' }}>
                                <div className="p-4">
                                    <div className="mb-6">
                                        {/* <h3 className="text-sm font-semibold text-muted-foreground tracking-wider mb-2">MANAGE</h3> */}
                                        <div className="space-y-1">
                                            {appItems['']?.map((item) => (
                                                <Button
                                                    key={item.id}
                                                    variant={pathname === item.link ? "contained" : "text"}
                                                    onClick={() => handleItemClick(item)}
                                                    startIcon={item.icon}
                                                    sx={{
                                                        justifyContent: 'flex-start',
                                                        textTransform: 'none',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '8px 16px',
                                                        backgroundColor: pathname === item.link ? 'primary.main' : 'transparent',
                                                        color: pathname === item.link ? 'primary.contrastText' : 'inherit',
                                                        '&:hover': {
                                                            backgroundColor: pathname === item.link ? 'primary.main' : 'action.hover',
                                                        }
                                                    }}
                                                >
                                                    {item.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Box>
                        </div>
                    </div>
                </TabPanel>
            </Box>
        </Dialog>
    )
}