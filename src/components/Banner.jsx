"use client"
import { Box, Skeleton } from "@mui/material";
import Slider from "./Slider";
import { useEffect, useState } from "react";

const Banner = () => {

    const [slides, setSlides] = useState([]);

    useEffect(() => {
        const fetchBanners = async () => {
            const response = await fetch('/api/banners');
            const data = await response.json();

            setSlides(data?.map((banner, index) => (
                <Box
                    key={index}
                    component="img"
                    src={banner?.imageUrl}
                    alt={`banner-${index}`}
                    className='w-full object-fill'
                />
            )));

        };

        setSlides([<Skeleton variant="rectangular" width="100%" sx={{ height: '100%', borderRadius: 1 }} />]);
        setTimeout(() => {
            console.log('fetching banners');
            fetchBanners();
        }, 5000);
    }
        , []);



    return (
        <Box sx={{
            height: {
                xs: '8rem',
                sm: '12rem',
                md: '16rem',
                lg: '20rem',
                xl: '26rem'
            },
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