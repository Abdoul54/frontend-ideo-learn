'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, CardContent, Skeleton, Card } from '@mui/material';
import Slider from '@/components/Slider';
import { useNews } from '@/hooks/api/tenant/widgets/useWidgets';

const NewsSection = ({ preview = false, newsData = null, isLoading: externalLoading = false }) => {
  // If in preview mode and newsData is provided, use it
  // Otherwise, fetch data normally with the hook
  const { data: apiNews, isLoading: apiLoading } = useNews();

  // Determine which loading state and data to use
  const isLoading = preview ? externalLoading : apiLoading;
  const news = preview && newsData ? newsData : apiNews;

  // State for slides
  const [newsSlides, setNewsSlides] = useState([]);

  // Process news data when it changes
  useEffect(() => {
    if (isLoading) {
      // Don't update slides while loading
      return;
    }

    if (news && Array.isArray(news) && news.length > 0) {
      const slides = news.map((item) => (
        <Box key={item.id} sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          pb: 5
        }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              textAlign: 'center',
              color: 'black',
              fontWeight: 'bold',
            }}
          >
            {item.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              textAlign: 'left',
              flexGrow: 1,
            }}
          >
            {item.description}
          </Typography>
          {item.href_text && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 7 }}>
              <Button
                variant="contained"
                size="medium"
                onClick={() => {
                  window.open(
                    item.href_link
                      ? item.href_link
                      : `/learner/news/${item.id}`,
                    '_blank'
                  );
                }}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 20,
                  backgroundColor: '#c5262c',
                  '&:hover': {
                    backgroundColor: '#a01e23',
                  }
                }}
              >
                {item.href_text}
              </Button>
            </Box>
          )}
        </Box>
      ));
      setNewsSlides(slides);
    } else {
      setNewsSlides([]);
    }
  }, [news, isLoading]);

  const renderLoadingSkeleton = () => (
    <Box sx={{
      p: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    }}>
      {/* Title skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Skeleton variant="text" width="70%" height={32} />
      </Box>

      {/* Content skeletons */}
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="75%" sx={{ mb: 3 }} />

      {/* Button skeleton positioned similar to actual button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 7 }}>
        <Skeleton
          variant="rectangular"
          width={120}
          height={40}
          sx={{ borderRadius: 20 }}
        />
      </Box>

      {/* Pagination skeleton */}
      <Box sx={{
        position: 'absolute',
        bottom: 5,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        gap: 1
      }}>
        <Skeleton variant="circular" width={8} height={8} />
        <Skeleton variant="circular" width={8} height={8} />
        <Skeleton variant="circular" width={8} height={8} />
      </Box>
    </Box>
  );

  const renderEmptyState = () => (
    <Box sx={{ p: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <Typography variant="body1" color="text.secondary">
        Aucune actualité disponible
      </Typography>
      {preview && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          Add news items in the News section of the Home Page Composer.
        </Typography>
      )}
    </Box>
  );

  return (
    <Card sx={{
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
      padding: 2,
      borderRadius: 2,
    }}>
      <CardContent
        sx={{
          pt: 2,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            textAlign: 'center',
            width: 120,
            color: '#c5262c',
            fontWeight: 'bold',
          }}
        >
          ACTUALITÉS
        </Typography>
      </CardContent>

      {isLoading ? (
        renderLoadingSkeleton()
      ) : newsSlides.length > 0 ? (
        <Box sx={{
          flexGrow: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Slider
            slides={newsSlides}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              el: '.news-pagination' // Custom pagination element
            }}
            autoplay={true}
            autoplayDelay={5000}
            height="100%"
            sx={{
              flexGrow: 1,
              '& .swiper-pagination': {
                bottom: '5px', // Adjust the position of the pagination
                '& .swiper-pagination-bullet': {
                  backgroundColor: '#c5262c',
                  opacity: 0.7,
                  '&-active': {
                    opacity: 1
                  }
                }
              },
            }}
            // Add custom navigation styling
            navigation={false} // Disable navigation for the news section
          />
          <div className="news-pagination" style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '8px 0'
          }}></div>
        </Box>
      ) : (
        renderEmptyState()
      )}
    </Card>
  );
};

export default NewsSection;