import { Masonry } from "@mui/lab";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Box,
    Tabs,
    Tab,
    IconButton
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";

const DialogsSettings = ({
    open,
    onClose,
    initialTab = 0,
}) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const currentPath = usePathname()
    const router = useRouter();

    const adminMenu = {
        'MANAGE': [
            { title: 'Users', link: '/manage/users-management', icon: 'solar-user-bold' },
            { title: 'Power Users', link: '/manage/power-users', icon: 'solar-user-bold-duotone' },
            { title: 'Groups', link: '/manage/groups', icon: 'solar-users-group-rounded-bold-duotone' },
        ],
        "E-LEARNING": [
            { title: 'Courses Management', link: '/manage/courses-management', icon: 'solar-book-2-bold' },
            { title: 'Course Catalog', link: '/manage/course-catalog', icon: 'solar-library-bold' },
            { title: 'Learning Plans', link: '/manage/learning-plans', icon: 'solar-clipboard-list-bold' },
            { title: 'Classroom Locations', link: '/manage/classroom-locations', icon: 'solar-buildings-2-bold' },
            { title: 'Central Repository', link: '/manage/central-repository', icon: 'solar-folder-with-files-bold' },
            { title: 'Reports', link: '/manage/reports', icon: 'solar-chart-2-bold' },
        ],
        'SETTINGS': [
            { title: 'Domain management', link: '/manage/domain-management', icon: 'solar-global-bold-duotone' },
            { title: 'Localization tool', link: '/manage/localization-tool', icon: 'solar-gps-bold-duotone' },
            { title: 'Advanced settings', link: '/manage/advanced-settings', icon: 'solar-settings-bold' },
            { title: 'Configure branding and look', link: '/manage/branding', icon: 'solar-palette-bold' }
        ],
    };

    const appsFeatures = {
        '': [
            { title: 'AGIRH Connector', link: '/manage/partners/agirh', icon: 'solar-users-group-two-rounded-outline' }
        ],
        // 'API AND SSO': ['Manage'],
        // 'ARTIFICIAL INTELLIGENCE': ['Manage'],
        // 'AUTHO': ['Settings'],
        // 'AUTOMATION': ['Manage'],
        // 'BLOG': ['Manage'],
        // 'CERTIFICATIONS AND RETRAINING': ['Manage'],
        // 'CUSTOM DOMAIN': ['Manage'],
        // 'E-COMMERCE': ['Manage', 'Transactions', 'Coupons'],
        // 'E-SIGNATURE': ['Manage'],
        // 'ENROLLMENT CODES': ['Manage'],
        // 'ENROLLMENT RULES': ['Manage'],
        // 'EXTENDED ENTERPRISE': ['Manage', 'Settings'],
        // 'GAMIFICATION': ['Badges', 'Leaderboards', 'Contests', 'Settings'],
        // 'GOOGLE ANALYTICS': ['Manage'],
        // 'GOOGLE DRIVE': ['Manage'],
        // 'GOTOMEETING': ['Manage'],
        // 'GOTOMEETING V2': ['Manage'],
        // 'LDAP': ['Manage'],
        // 'LABELS': ['Manage'],
        // 'NOTIFICATIONS': ['Manage'],
        // 'OPENID CONNECT': ['Manage'],
        // 'PAYMENT METHOD - AUTHORIZE.NET ACCEPT HOSTED': ['Manage'],
        // 'PAYMENT METHOD - STRIPE SCA': ['Manage'],
        // 'PAYMENT METHOD - WIRE TRANSFER': ['Manage']
    };

    const currentData = activeTab === 0 ? adminMenu : appsFeatures;

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            aria-labelledby="settings-dialog-title"
            PaperProps={{
                sx: { minHeight: '80vh' }
            }}
        >
            <DialogTitle
                id="settings-dialog-title"
                sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="span">
                        Settings Configuration
                    </Typography>
                    <IconButton onClick={handleClose} aria-label="close">
                        <i className="lucide-x" />
                    </IconButton>
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={(_, val) => setActiveTab(val)}
                    aria-label="settings categories"
                >
                    <Tab label="Admin menu" id="tab-0" aria-controls="tabpanel-0" />
                    <Tab label="Apps & features" id="tab-1" aria-controls="tabpanel-1" />
                </Tabs>
            </DialogTitle>

            <DialogContent
                sx={{
                    p: 3,
                    '&::-webkit-scrollbar': {
                        width: '.4em',
                        height: '.4em',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'var(--mui-palette-background-paper)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2,
                    },

                }}
                role="tabpanel"
                id={`tabpanel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
            >
                <Masonry columns={{
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 2
                }} spacing={4}>
                    {Object.entries(currentData).map(([section, items]) => (
                        <Box key={section}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {section}
                            </Typography>
                            <List sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}>
                                {items.map((item, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            borderRadius: 1,
                                            boxShadow: 1,
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            ...(currentPath === item.link && {
                                                bgcolor: 'primary.light',
                                                '& .item-text': {
                                                    color: 'common.white',
                                                },
                                                '& .item-icon': {
                                                    color: 'common.white',
                                                }
                                            }),

                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: 3,
                                                bgcolor: 'primary.light',
                                                '& .item-text': {
                                                    color: 'common.white',
                                                },
                                                '& .item-icon': {
                                                    color: 'common.white',
                                                }
                                            }
                                        }}
                                        onClick={() => {
                                            router.push(item.link)
                                            onClose()
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        py: 1,
                                                        fontWeight: 500,
                                                        '& i': {
                                                            fontSize: '1.2rem'
                                                        }
                                                    }}
                                                >
                                                    <i className={`${item?.icon} item-icon`} />
                                                    <span className="item-text">{item?.title}</span>
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    ))}
                </Masonry>
            </DialogContent>
        </Dialog >
    );
};

export default DialogsSettings;