'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import MoocCard from './components/Cards/MoocCard';
import Slider from '../Slider';

const MoocSection = ({
    title,
    subheader,
    courses = [],
    cardsPerPage = 4
}) => {
    // Prepare slides for the Slider component
    const slides = courses.map((course, index) => (
        <MoocCard
            key={index}
            id={course.id}
            helper={course.link}
            Title={course.title}
            Language={course.lang_code}
            image={course.thumbnail || '/images/books/2.png'}
            status={course.enrollement_status || "Non débuté"}
            Initiated={course.Initiated}
            Type={course.type}
        />
    ));

    return (
        <Box sx={{ mb: 5, position: 'relative' }}>
            {/* Section Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4
                }}
            >
                <Box>
                    <Typography variant="h5" component="h2" fontWeight="bold" color="#c5262c">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {subheader}
                    </Typography>
                </Box>
            </Box>

            {/* Courses Slider with overflow container */}
            <Box sx={{ 
                position: 'relative', 
                height: '350px',
                // This container has overflow hidden to prevent content from spilling out
                overflow: 'hidden',
                // Ensure this container has proper z-index
                zIndex: 1
            }}>
                <Slider
                    slides={slides}
                    navigation={true}
                    slidesPerView={{
                        base: 1,
                        sm: 2,
                        md: 4,
                        lg: cardsPerPage,
                    }}
                    spaceBetween={17}
                    // Add padding instead of changing overflow
                    sx={{ 
                        height: '100%',
                        '& .swiper': {
                            paddingTop: '10px',
                            paddingBottom: '60px'
                        },
                        '& .swiper-slide': {
                            // Center card content
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }
                    }}
                    navigationOptions={{
                        color: '#c5262c',
                        buttonsBgColor: 'white',
                        buttonsShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        buttonsRadius: '8px',
                        size: '36px',
                        visibleOnlyOnHover: true,
                        // Position buttons a bit higher to be centered with cards
                        buttonsPosition: {
                            top: '45%',
                            transform: 'translateY(-50%)'
                        },
                        // Bring navigation buttons forward
                        zIndex: 5
                    }}
                />
            </Box>
        </Box>
    );
};

export default MoocSection;