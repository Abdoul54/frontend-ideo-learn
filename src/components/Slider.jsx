'use client'
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Slider = ({
    slides = [],
    slidesPerView = 1,
    spaceBetween = 0,
    height,
    navigation = false,
    pagination = false,
    autoplay = false,
    effect = 'slide',
    autoplayDelay = 3000,
    autoplayDisableOnInteraction = true,
    slideClassName = "",
    sx = {},
    // New navigation customization props
    navigationOptions = {
        color: '#c5262c', // Primary color for buttons
        size: '40px',     // Size of navigation buttons
        buttonsBgColor: 'white', // Background color for buttons
        buttonsRadius: '50%', // Border radius of buttons
        buttonsPosition: { // Custom positioning
            top: '50%',
            transform: 'translateY(-50%)'
        },
        // Override specific button positions if needed
        prevButtonPosition: { left: '5px' },
        nextButtonPosition: { right: '5px' },
        // Custom icons (optional)
        prevIcon: null, // Custom React component for prev button
        nextIcon: null, // Custom React component for next button
        // Navigation button visibility on hover only
        visibleOnlyOnHover: false,
        // Add shadow to buttons
        buttonsShadow: '0 4px 10px rgba(0,0,0,0.1)'
    }
}) => {
    const modules = [];
    if (navigation) modules.push(Navigation);
    if (pagination) modules.push(Pagination);
    if (autoplay) modules.push(Autoplay);
    if (effect === 'fade') modules.push(EffectFade);

    const autoplayConfig = autoplay ? {
        delay: autoplayDelay,
        disableOnInteraction: autoplayDisableOnInteraction,
    } : false;

    // Set up responsive breakpoints for slidesPerView
    const breakpoints = {};

    // Handle responsive slidesPerView if it's an object
    if (typeof slidesPerView === 'object' && slidesPerView !== null) {
        // Map the custom breakpoints to Swiper's breakpoint values
        if (slidesPerView.base) breakpoints[0] = { slidesPerView: slidesPerView.base };
        if (slidesPerView.sm) breakpoints[640] = { slidesPerView: slidesPerView.sm };
        if (slidesPerView.md) breakpoints[768] = { slidesPerView: slidesPerView.md };
        if (slidesPerView.lg) breakpoints[1024] = { slidesPerView: slidesPerView.lg };
        if (slidesPerView.xl) breakpoints[1280] = { slidesPerView: slidesPerView.xl };
    }

    // Custom navigation buttons reference
    const navigationPrevRef = React.useRef(null);
    const navigationNextRef = React.useRef(null);

    return (
        <Box sx={{
            position: 'relative',
            width: '100%',
            height: height,
            '& .swiper': {
                width: '100%',
                height: '100%',
                margin: '0',
                padding: navigation ? '0 50px' : '0' // Add padding if navigation is enabled
            },
            '& .swiper-slide': {
                height: '100%',
                display: 'flex',
                justifyContent: 'center'
            },
            // Hide default Swiper navigation buttons if we're using custom ones
            ...(navigationOptions.prevIcon || navigationOptions.nextIcon) && {
                '& .swiper-button-prev, & .swiper-button-next': {
                    display: 'none'
                }
            },
            // Custom styling for Swiper's default navigation buttons
            ...(!navigationOptions.prevIcon && !navigationOptions.nextIcon) && {
                '& .swiper-button-prev, & .swiper-button-next': {
                    color: navigationOptions.color,
                    backgroundColor: navigationOptions.buttonsBgColor,
                    width: navigationOptions.size,
                    height: navigationOptions.size,
                    borderRadius: navigationOptions.buttonsRadius,
                    boxShadow: navigationOptions.buttonsShadow,
                    '&:after': {
                        fontSize: `calc(${navigationOptions.size} / 2.5)`,
                        fontWeight: 'bold'
                    },
                    ...navigationOptions.buttonsPosition,
                    opacity: navigationOptions.visibleOnlyOnHover ? 0 : 1,
                    transition: 'opacity 0.3s ease'
                },
                '& .swiper-button-prev': {
                    ...navigationOptions.prevButtonPosition,
                },
                '& .swiper-button-next': {
                    ...navigationOptions.nextButtonPosition,
                },
                '&:hover .swiper-button-prev, &:hover .swiper-button-next': {
                    opacity: 1
                }
            },
            '& .swiper-pagination': {
                '& .swiper-pagination-bullet': {
                    backgroundColor: navigationOptions.color,
                    opacity: 0.7,
                    '&-active': {
                        opacity: 1
                    }
                }
            },
            ...sx
        }}>
            {/* Custom Previous Button */}
            {navigation && navigationOptions.prevIcon && (
                <IconButton
                    ref={navigationPrevRef}
                    aria-label="Previous slide"
                    sx={{
                        position: 'absolute',
                        zIndex: 10,
                        backgroundColor: navigationOptions.buttonsBgColor,
                        color: navigationOptions.color,
                        width: navigationOptions.size,
                        height: navigationOptions.size,
                        borderRadius: navigationOptions.buttonsRadius,
                        boxShadow: navigationOptions.buttonsShadow,
                        opacity: navigationOptions.visibleOnlyOnHover ? 0 : 1,
                        transition: 'opacity 0.3s ease, background-color 0.3s ease',
                        '&:hover': {
                            backgroundColor: navigationOptions.buttonsBgColor,
                            opacity: 1
                        },
                        ...navigationOptions.buttonsPosition,
                        ...navigationOptions.prevButtonPosition
                    }}
                >
                    {navigationOptions.prevIcon || <i className="solar-alt-arrow-left-bold" />}
                </IconButton>
            )}

            {/* Custom Next Button */}
            {navigation && navigationOptions.nextIcon && (
                <IconButton
                    ref={navigationNextRef}
                    aria-label="Next slide"
                    sx={{
                        position: 'absolute',
                        zIndex: 10,
                        backgroundColor: navigationOptions.buttonsBgColor,
                        color: navigationOptions.color,
                        width: navigationOptions.size,
                        height: navigationOptions.size,
                        borderRadius: navigationOptions.buttonsRadius,
                        boxShadow: navigationOptions.buttonsShadow,
                        opacity: navigationOptions.visibleOnlyOnHover ? 0 : 1,
                        transition: 'opacity 0.3s ease, background-color 0.3s ease',
                        '&:hover': {
                            backgroundColor: navigationOptions.buttonsBgColor,
                            opacity: 1
                        },
                        ...navigationOptions.buttonsPosition,
                        ...navigationOptions.nextButtonPosition
                    }}
                >
                    {navigationOptions.nextIcon || <i className="solar-alt-arrow-right-bold" />}
                </IconButton>
            )}

            <Swiper
                modules={modules}
                spaceBetween={spaceBetween}
                slidesPerView={typeof slidesPerView === 'number' ? slidesPerView : 1}
                breakpoints={Object.keys(breakpoints).length > 0 ? breakpoints : undefined}
                navigation={navigationOptions.prevIcon || navigationOptions.nextIcon ? {
                    // Use custom navigation buttons if provided
                    prevEl: navigationPrevRef.current,
                    nextEl: navigationNextRef.current,
                } : navigation}
                pagination={pagination ? {
                    clickable: true,
                    dynamicBullets: true
                } : false}
                autoplay={autoplayConfig}
                effect={effect}
                style={{ width: '100%' }}
                onInit={(swiper) => {
                    // Update swiper instance when navigation elements are rendered
                    if (navigationOptions.prevIcon || navigationOptions.nextIcon) {
                        swiper.params.navigation.prevEl = navigationPrevRef.current;
                        swiper.params.navigation.nextEl = navigationNextRef.current;
                        swiper.navigation.init();
                        swiper.navigation.update();
                    }
                }}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index} className={slideClassName}>
                        {React.cloneElement(slide, {
                            className: `${slide.props.className || ''} h-full`
                        })}
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
};

export default Slider;