'use client';
import React from 'react';
import { Box, Typography, Card, CardContent, Skeleton } from '@mui/material';
import { useWelcomeDefault } from '@/hooks/api/tenant/widgets/useWidgets';

const WelcomeSection = ({ preview = false, welcomeData = null, isLoading: externalLoading = false }) => {
    // If in preview mode and welcomeData is provided, use it
    // Otherwise, fetch data normally with the hook
    const { data: apiWelcome, isLoading: apiLoading } = useWelcomeDefault();

    // Determine which loading state and data to use
    const isLoading = preview ? externalLoading : apiLoading;
    const welcome = preview && welcomeData ? welcomeData : apiWelcome;

    // Function to safely handle HTML content
    const createMarkup = (htmlContent) => {
        if (!htmlContent) return { __html: '' };

        // If content already has HTML tags, return as is
        if (htmlContent.startsWith('<')) {
            return { __html: htmlContent };
        }

        // Otherwise, wrap it in paragraph tags
        return { __html: `<p>${htmlContent}</p>` };
    };

    const renderLoadingSkeleton = () => (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Skeleton variant="text" sx={{ width: '200px', fontSize: '2rem' }} />
            </Box>
            <Box sx={{ mt: 5 }}>
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="30%" />
            </Box>
            <Box sx={{ mt: 3 }}>
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
            </Box>
            <Box sx={{ mt: 3 }}>
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
            </Box>
        </Box>
    );

    const renderWelcomeContent = () => {
        if (!welcome) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexGrow: 1,
                        p: 3
                    }}
                >
                    <Typography variant="body1" color="text.secondary" align="center">
                        No welcome content available.
                    </Typography>
                    {preview && (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                            Add welcome content in the Welcome section of the Home Page Composer.
                        </Typography>
                    )}
                </Box>
            );
        }

        // Extract title and content based on API response format
        // Handle both formats from the welcome hooks
        const title = welcome.title || (welcome.language_code ? welcome.title : '');
        const content = welcome.content || welcome.text || '';

        return (
            <>
                <Typography
                    variant="h5"
                    sx={{
                        textAlign: 'center',
                        color: '#c5262c',
                        fontWeight: 'bold',
                        mb: 3
                    }}
                >
                    {title}
                </Typography>

                <Box
                    sx={{
                        mt: 3,
                        '& p': {
                            mb: 2,
                            lineHeight: 1.6
                        },
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                            mb: 1.5,
                            mt: 2
                        },
                        '& ul, & ol': {
                            pl: 3,
                            mb: 2
                        }
                    }}
                    dangerouslySetInnerHTML={createMarkup(content)}
                />
            </>
        );
    };

    return (
        <Card sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: 2,
            borderRadius: 2,
            height: '100%'
        }}>
            <CardContent sx={{ flexGrow: 1 }}>
                {isLoading ? renderLoadingSkeleton() : renderWelcomeContent()}
            </CardContent>
        </Card>
    );
};

export default WelcomeSection;