'use client';

import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Drawer,
    Grid2 as Grid,
} from '@mui/material';
import Sidebar from './Sidebar';
import LessonHeader from './LessonHeader';
import NavButtons from './NavButtons';
import LessonContent from './LessonContent';

const MaximizedView = ({
    sidebarOpen,
    maximizedSidebarOpen,
    activeLesson,
    lessons,
    handleDrawerToggle,
    handleMaximizeToggle,
    setActiveLesson,
    setMaximizedSidebarOpen
}) => {
    // Find the current lesson
    const currentLesson = lessons.find(lesson => lesson.id === activeLesson) || lessons[0];
    const currentIndex = lessons.findIndex(lesson => lesson.id === activeLesson);
    const isFirstLesson = currentIndex === 0;
    const isLastLesson = currentIndex === lessons.length - 1;

    const handlePrevious = () => {
        if (!isFirstLesson) {
            setActiveLesson(lessons[currentIndex - 1].id);
        }
    };

    const handleNext = () => {
        if (!isLastLesson) {
            setActiveLesson(lessons[currentIndex + 1].id);
        }
    };

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1200,
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={sidebarOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block' },
                    '& .MuiDrawer-paper': {
                        width: {
                            xs: '100%',
                            sm: '75%',
                            md: '50%'
                        },
                        boxSizing: 'border-box',
                        zIndex: 1300,
                    },
                }}
            >
                <Sidebar
                    lessons={lessons}
                    activeLesson={activeLesson}
                    setActiveLesson={setActiveLesson}
                />
            </Drawer>

            <Grid container spacing={2} sx={{
                height: '100vh',
                padding: '16px',
                flexWrap: 'nowrap'
            }}>
                {/* Sidebar container */}
                <Grid
                    item
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        width: '25%',
                        maxWidth: 1,
                        flexShrink: 0,
                        transition: 'width 0.3s ease',
                        width: maximizedSidebarOpen ? '25%' : '0%',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            minWidth: 1,
                            borderColor: 'divider',
                            overflow: 'hidden',
                            opacity: maximizedSidebarOpen ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                        }}
                    >
                        <Sidebar
                            lessons={lessons}
                            activeLesson={activeLesson}
                            setActiveLesson={setActiveLesson}
                        />
                    </Box>
                </Grid>

                {/* Main content area */}
                <Grid item xs sx={{ flexGrow: 1 }}>
                    <Card
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <LessonHeader
                            title={currentLesson.title}
                            isMaximized={true}
                            maximizedSidebarOpen={maximizedSidebarOpen}
                            handleDrawerToggle={handleDrawerToggle}
                            handleMaximizeToggle={handleMaximizeToggle}
                            setMaximizedSidebarOpen={setMaximizedSidebarOpen}
                        />

                        <CardContent sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            gap: 2,
                            flexGrow: 1,
                            overflow: 'auto'
                        }}>
                            <NavButtons
                                isFirstLesson={isFirstLesson}
                                isLastLesson={isLastLesson}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                            />

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                flexGrow: 1
                            }}>
                                <LessonContent lessonTitle={currentLesson.title} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MaximizedView;