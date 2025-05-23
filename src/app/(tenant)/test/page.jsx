'use client';

import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Drawer,
    Grid2 as Grid,
} from '@mui/material';
import LessonHeader from '@/views/player/LessonHeader';
import NavButtons from '@/views/player/NavButtons';
import LessonContent from '@/views/player/LessonContent';
import MaximizedView from '@/views/player/MaximizedView';
import Sidebar from '@/views/player/Sidebar';

const Page = () => {
    const [activeLesson, setActiveLesson] = useState("lesson-1");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [maximizedSidebarOpen, setMaximizedSidebarOpen] = useState(false);

    const lessons = [
        {
            id: "lesson-1",
            title: "Définir et gérer ses priorités",
            type: "SCORM",
            status: "in-progress",
            icon: <i className='lucide-file-text' size={16} />,
        },
        {
            id: "lesson-2",
            title: "évaluation à chaud M.",
            type: "Survey",
            status: "not-started",
            icon: <i className='lucide-clipboard-check' size={16} />,
        },
    ];

    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleMaximizeToggle = () => {
        setIsMaximized(!isMaximized);
    };

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

    // If maximized, render the maximized view
    if (isMaximized) {
        return (
            <MaximizedView
                sidebarOpen={sidebarOpen}
                maximizedSidebarOpen={maximizedSidebarOpen}
                activeLesson={activeLesson}
                lessons={lessons}
                handleDrawerToggle={handleDrawerToggle}
                handleMaximizeToggle={handleMaximizeToggle}
                setActiveLesson={setActiveLesson}
                setMaximizedSidebarOpen={setMaximizedSidebarOpen}
            />
        );
    }

    // Normal layout
    return (
        <>
            <Drawer
                variant="temporary"
                open={sidebarOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: {
                            xs: '100%',
                            sm: '75%',
                            md: '50%'
                        }, boxSizing: 'border-box'
                    },
                }}
            >
                <Sidebar
                    lessons={lessons}
                    activeLesson={activeLesson}
                    setActiveLesson={setActiveLesson}
                />
            </Drawer>

            <Grid container spacing={4} sx={{
                height: "calc(100vh - 114px)"
            }}>
                {/* Sidebar for desktop */}
                <Grid item size={{
                    xs: 0,
                    md: 3
                }} xs={0} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Sidebar
                        lessons={lessons}
                        activeLesson={activeLesson}
                        setActiveLesson={setActiveLesson}
                    />
                </Grid>

                {/* Main content */}
                <Grid item container size={{
                    xs: 12,
                    md: 9
                }}>
                    <Grid item container size={12}>
                        <Card
                            sx={{
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            <LessonHeader
                                title={currentLesson.title}
                                isMaximized={isMaximized}
                                handleDrawerToggle={handleDrawerToggle}
                                handleMaximizeToggle={handleMaximizeToggle}
                            />

                            <CardContent sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                gap: 2
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
                                    minHeight: 'calc(100vh - 16rem)'
                                }}>
                                    <LessonContent lessonTitle={currentLesson.title} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};

export default Page;