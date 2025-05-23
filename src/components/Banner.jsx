"use client"
import { Box, Skeleton } from "@mui/material";
import Slider from "./Slider";
import { useEffect, useState } from "react";
import { useSliders } from "@/hooks/api/tenant/widgets/useWidgets";

const Banner = ({ preview = false, sliderData = null, isLoading: externalLoading = false }) => {

    const { data: apiSliders, isLoading: apiLoading } = useSliders();
    const [slides, setSlides] = useState([]);

    // Determine if we're loading
    const isLoading = preview ? externalLoading : apiLoading;
    // Use the appropriate data source
    const slidersToUse = preview && sliderData ? sliderData : apiSliders;

    useEffect(() => {
        // Initial loading state
        if (isLoading) {
            setSlides([
                <Skeleton key="loading" variant="rectangular" width="100%" sx={{ height: '100%', borderRadius: 1 }} />
            ]);
            return;
        }

        // When data is available, map it to slides
        if (slidersToUse && Array.isArray(slidersToUse)) {
            const newSlides = slidersToUse.map((slider, index) => (
                <Box
                    key={slider.id || index}
                    component="img"
                    src={slider.image}
                    alt={`banner-${index}`}
                    className='w-full object-fill'
                />
            ));

            if (newSlides.length > 0) {
                setSlides(newSlides);
            } else {
                // Fallback for empty data
                setSlides([
                    <Box
                        key="empty"
                        component="div"
                        sx={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            color: 'text.secondary',
                            fontSize: '1.25rem'
                        }}
                    >
                        No banner images available
                    </Box>
                ]);
            }
        }
    }, [slidersToUse, isLoading, preview]);



    return (
        <Box sx={{
            height: {
                xs: '8rem',
                sm: '12rem',
                md: '16rem',
                lg: '20rem',
                xl: '26rem'
            },
            width: '100%',
            position: 'relative' // Added to establish positioning context

        }}>
            <Slider
                slides={slides}
                pagination
                sx={{
                    height: '100%',
                    position: 'relative',
                    WebkitBackfaceVisibility: 'hidden',
                    WebkitPerspective: 1000,
                    WebkitTransform: 'translate3d(0, 0, 0)',
                    '& .MuiSkeleton-root': {
                        height: '100%' // Changed from inherit
                    }

                }}
            />
        </Box>);
}

export default Banner;