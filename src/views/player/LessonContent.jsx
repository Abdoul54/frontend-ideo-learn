'use client';

import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
} from '@mui/material';

const LessonContent = ({ lessonTitle }) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 5,
                    height: '100%'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.lighterOpacity',
                        borderRadius: '50%',
                        p: 5,
                        mb: 2
                    }}>
                        <i className="lucide-file-text size-16 text-primary" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Keep learning from
                    </Typography>
                    <Typography variant="h5" fontWeight="medium" align="center" sx={{ mb: 3 }}>
                        {lessonTitle}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<i className="lucide-play" size={16} />}
                    >
                        Resume training
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default LessonContent;