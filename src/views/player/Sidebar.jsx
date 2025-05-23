'use client';

import React from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material';

const Sidebar = ({ lessons, activeLesson, setActiveLesson }) => {
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                paddingX: 2,
            }}
        >
            <CardHeader
                title="Syllabus"
                subheader={`${lessons.length} Lessons`}
            />
            <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                <List disablePadding>
                    {lessons.map((lesson) => (
                        <ListItemButton
                            key={lesson.id}
                            selected={activeLesson === lesson.id}
                            onClick={() => setActiveLesson(lesson.id)}
                            sx={{
                                borderRadius: 1,
                                mb: 0.5,
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                },
                                '&.Mui-selected': {
                                    backgroundColor: 'action.selected',
                                    '&:hover': {
                                        backgroundColor: 'action.selected',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: activeLesson === lesson.id ? 'primary.main' : 'text.secondary' }}>
                                {lesson.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={lesson.title}
                                secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{
                                            fontSize: {
                                                md: 10,
                                                lg: 12,
                                                xl: 12
                                            }
                                        }}>
                                            {lesson.type}
                                        </Typography>
                                        {lesson.status === 'in-progress' && (
                                            <Chip
                                                label="In progress"
                                                size="small"
                                                variant="outlined"
                                                sx={{ ml: 1, height: 20, fontSize: 10, px: 0.5 }}
                                            />
                                        )}
                                    </Box>
                                }
                                slotProps={{
                                    primary: {
                                        sx: {
                                            fontWeight: activeLesson === lesson.id ? 'bold' : 'normal',
                                        },
                                    },
                                    secondary: {
                                        sx: {
                                            color: activeLesson === lesson.id ? 'primary.main' : 'text.secondary',
                                        },
                                    },
                                }}
                            />
                        </ListItemButton>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default Sidebar;