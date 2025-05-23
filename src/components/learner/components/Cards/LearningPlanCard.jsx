// frontend/src/components/learner/components/Cards/LearningPlanCard.jsx
import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Card,
    CardContent,
    CardMedia,
    Stack
} from '@mui/material';

const LearningPlanCard = ({ id, Title, Language, image, status, courseCount }) => {
    return (
        <Card sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            {/* Folder Top Tab */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 30,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    px: 1.5,
                    gap: 1,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    zIndex: 1
                }}
            >
                <i className="lucide-home" />
                <Typography variant="caption" color="white">
                    Learning Plan
                </Typography>
                <Chip
                    label={`${courseCount} courses`}
                    size="small"
                    sx={{
                        backgroundColor: 'white',
                        color: 'primary.main',
                        fontSize: 11,
                        ml: 'auto',
                        height: 22
                    }}
                />
            </Box>

            {/* Image */}
            <CardMedia
                component="img"
                height="140"
                image={image || '/images/books/2.png'}
                alt={Title}
                sx={{ mt: 3 }} // Leave space for the top tab
            />

            <CardContent>
                <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {Title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Language: {Language}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            backgroundColor: status === 'En cours' ? 'info.light' : 'grey.300',
                            px: 1,
                            borderRadius: 1,
                            display: 'inline-block'
                        }}
                    >
                        {status}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default LearningPlanCard;
