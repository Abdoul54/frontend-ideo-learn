'use client';

import React from 'react';
import {
    AppBar,
    Box,
    Button,
    IconButton,
    Toolbar,
    Typography,
} from '@mui/material';

const LessonHeader = ({
    title,
    isMaximized,
    maximizedSidebarOpen,
    handleDrawerToggle,
    handleMaximizeToggle,
    setMaximizedSidebarOpen
}) => {
    return (
        <AppBar
            position="static"
            color="default"
            elevation={0}
            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
            <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: { md: 'none' }, p: 1 }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleDrawerToggle}
                    >
                        <i className='lucide-menu' size={20} />
                    </IconButton>
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="medium">
                        {title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <i className='lucide-laptop' size={16} style={{ marginRight: 4 }} />
                        <Typography variant="body2" color="text.secondary">
                            E-learning • French • 0 of 2 lessons completed
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isMaximized && (
                        <IconButton
                            size="small"
                            onClick={() => setMaximizedSidebarOpen(!maximizedSidebarOpen)}
                            sx={{ display: { xs: 'none', md: 'flex' } }}
                        >
                            <i className={maximizedSidebarOpen ? 'lucide-panel-right-close' : 'lucide-panel-right-open'} size={20} />
                        </IconButton>
                    )}
                    <IconButton size="small" onClick={handleMaximizeToggle}>
                        <i className={isMaximized ? 'lucide-minimize' : 'lucide-maximize'} size={20} />
                    </IconButton>
                    <IconButton size="small">
                        <i className='lucide-ellipsis' size={20} />
                    </IconButton>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<i className='lucide-settings' size={16} />}
                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                    >
                        Manage
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default LessonHeader;