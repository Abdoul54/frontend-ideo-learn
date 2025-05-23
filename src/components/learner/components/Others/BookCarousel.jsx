'use client';
import React, { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import Slider from '@/components/Slider'; // Import your Slider component
import BookCard from '../Cards/BookCard';

const BookCarousel = ({ books = [], loading = false }) => {
    const [token, setToken] = useState('');

    // Get token for YouScribe books
    useEffect(() => {
        const getToken = async () => {
            try {
                const response = await fetch('/api/learner/home/bn/token');
                const data = await response.json();
                setToken(data.token || '');
            } catch (error) {
                console.error('Error fetching token:', error);
            }
        };

        getToken();
    }, []);

    // If loading, show placeholders
    if (loading) {
        const placeholderSlides = Array(6).fill(0).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Skeleton
                        variant="rectangular"
                        width={120}
                        height={180}
                        sx={{
                            borderRadius: 2,
                            mb: 1
                        }}
                    />
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="text" width={80} />
                </Box>
            </Box>
        ));

        return (
            <Slider
                slides={placeholderSlides}
                navigation={true}
                slidesPerView={{
                    base: 2,
                    sm: 3,
                    md: 4,
                    lg: 6,
                }}
                spaceBetween={1}
                sx={{ height: '380px' }}
            />
        );
    }

    // Map books to slides
    const bookSlides = books.map((book, index) => (
        <BookCard
            key={index}
            Title={book.title}
            Author={book.author}
            Img={book.thumbnail_urls}
            productNum={book.product_num}
            index={index}
            token={token}
        />
    ));

    return (
        <Slider
            slides={bookSlides}
            navigation={true}
            slidesPerView={{
                base: 2,
                sm: 3,
                md: 4,
                lg: 6,
            }}
            spaceBetween={1}
            sx={{ height: '380px' }}
        />
    );
};

export default BookCarousel;