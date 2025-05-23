// frontend/src/components/widgets-Settings/news/NewsSettings.jsx
'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    Alert
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import { useSession } from 'next-auth/react';
import AddNews from '@/components/widgets-Settings/news/AddNews';
import NewsOrdering from '@/components/widgets-Settings/news/NewsOrdering';
import NewsPreview from '@/components/widgets-Settings/news/NewsPreview';

// Import widget hooks
import { useNews, useAddNews, useUpdateNews } from '@/hooks/api/tenant/widgets/useWidgets';

const NewsSettings = () => {
    const { data: session } = useSession();
    const { data: newsData, isLoading, error, refetch } = useNews();
    const addNewsMutation = useAddNews();
    const updateNewsMutation = useUpdateNews();

    const [news, setNews] = useState([]);

    // Update local state when data changes
    useEffect(() => {
        if (newsData) {
            setNews(newsData);
        }
    }, [newsData]);

    const handleAddNews = async (data) => {
        if (!session?.accessToken) return;

        try {
            addNewsMutation.mutate(data, {
                onSuccess: () => {
                    refetch(); // Refresh news after adding
                }
            });
        } catch (error) {
            console.error('Error adding news:', error);
        }
    };

    const handleUpdateNews = async () => {
        if (!session?.accessToken) return;

        try {
            updateNewsMutation.mutate(news);
        } catch (error) {
            console.error('Error updating news:', error);
        }
    };

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load news settings. Please try again later.
            </Alert>
        );
    }

    return (
        <Grid container spacing={4}>
            <Grid item size={{ xs: 12, md: 8 }}>
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Add News</Typography>
                    <AddNews
                        onSubmit={handleAddNews}
                        isSubmitting={addNewsMutation.isLoading}
                    />
                </Box>
            </Grid>

            <Grid item size={{ xs: 12, md: 4 }}>
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Arrange News</Typography>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : news.length > 0 ? (
                        <NewsOrdering
                            news={news}
                            setNews={setNews}
                            onSave={handleUpdateNews}
                            isSaving={updateNewsMutation.isLoading}
                        />
                    ) : (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                            No news items available
                        </Typography>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
};

export default NewsSettings;