'use client';
import { useState, useEffect } from 'react';
import { Box, Badge, Typography, Button, CardContent, CardActions, Skeleton } from '@mui/material';
import clsx from 'clsx';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

const SwiperControls = ({ news, loading, direction = 'ltr' }) => {
  const [loaded, setLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      rtl: direction === 'rtl',
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
    },
    [
      (slider) => {
        let timeout;
        let mouseOver = false;
        
        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 2500);
        }
        
        slider.on('created', () => {
          slider.container.addEventListener('mouseover', () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener('mouseout', () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        
        slider.on('dragStarted', clearNextTimeout);
        slider.on('animationEnded', nextTimeout);
        slider.on('updated', nextTimeout);
      },
    ]
  );

  useEffect(() => {
    instanceRef?.current?.update();
  }, [news, instanceRef]);

  return (
    <Box sx={{ height: '100%' }}>
      <CardContent
        sx={{
          height: '100%',
          boxShadow: '0px 2px 10px 0px rgba(76, 78, 100, 0.22)',
          backgroundColor: '#fff',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent
          sx={{
            pt: 3,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 0,
              textAlign: 'center',
              borderBottom: '3px solid #c5262c',
              paddingBottom: '7px',
              marginBottom: '-7px',
              width: 120,
              color: '#c5262c',
              fontWeight: 'bold',
            }}
          >
            ACTUALITÉS
          </Typography>
        </CardContent>

        {loading ? (
          <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ mt: 5 }}>
              <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            </Box>
            <CardActions sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Skeleton
                variant="rectangular"
                width={200}
                height={60}
                sx={{
                  borderRadius: 20
                }}
              />
            </CardActions>
          </Box>
        ) : news?.length > 0 ? (
          <Box ref={sliderRef} className="keen-slider" sx={{ flexGrow: 1, position: 'relative' }}>
            {news.map((item) => (
              <Box className="keen-slider__slide" key={item.id} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
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
                  <CardActions
                    sx={{ display: 'flex', justifyContent: 'center', mt: 'auto' }}
                  >
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
                  </CardActions>
                )}
              </Box>
            ))}
            
            {loaded && instanceRef.current && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'absolute',
                  bottom: 16,
                  left: 0,
                  right: 0,
                }}
              >
                {[...Array(instanceRef.current.track.details?.slides.length).keys()].map((idx) => (
                  <Badge
                    key={idx}
                    component="div"
                    variant="dot"
                    onClick={() => instanceRef.current?.moveToIdx(idx)}
                    sx={{
                      mx: 0.5,
                      '& .MuiBadge-dot': {
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: currentSlide === idx ? '#c5262c' : '#e0e0e0',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Aucune actualité disponible
            </Typography>
          </Box>
        )}
      </CardContent>
    </Box>
  );
};

export default SwiperControls;