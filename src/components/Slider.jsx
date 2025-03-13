'use client'
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import Box from '@mui/material/Box';

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
    sx = {} // Add sx prop
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

    return (
        <Box sx={{
            width: '100%',
            height: height, // Default height if provided
            '& .swiper': {
                width: '100%',
                height: '100%',
                margin: '0'
            },
            '& .swiper-slide': {
                height: '100%',
                width: '100% !important'
            },
            '& .swiper-button-next, & .swiper-button-prev': {
                color: '#fff',
                '&:after': {
                    fontSize: '24px'
                }
            },
            '& .swiper-pagination': {
                '& .swiper-pagination-bullet': {
                    backgroundColor: '#fff',
                    opacity: 0.7,
                    '&-active': {
                        opacity: 1
                    }
                }
            },
            ...sx // Merge with provided sx props
        }}>
            <Swiper
                modules={modules}
                spaceBetween={spaceBetween}
                slidesPerView={slidesPerView}
                navigation={navigation}
                pagination={pagination ? {
                    clickable: true,
                    dynamicBullets: true
                } : false}
                autoplay={autoplayConfig}
                effect={effect}
                style={{
                    width: '100%'
                }}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index} className={slideClassName}>
                        {React.cloneElement(slide, {
                            className: `${slide.props.className || ''} w-full h-full`
                        })}
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
};

export default Slider;