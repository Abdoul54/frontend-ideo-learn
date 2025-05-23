'use client';
import React from 'react';
import { Box } from '@mui/material';
import Link from '@/components/Link';

const MiniCard = ({
    BackgroundImage,
    Headline,
    Img,
    Link: url,
    Action
}) => {
    // Determine if we should use Link component or onClick handler
    const hasUrl = url && typeof url === 'string' && url !== '#';

    // Default action if none provided
    const handleClick = Action || (() => {
        if (hasUrl) {
            window.open(url, '_blank');
        } else if (Headline) {
            console.log(Headline + " Card Clicked!");
        }
    });

    const cardContent = (
        <Box
            sx={{
                width: '100%',
                height: { xs: 200, xl: 200 },
                backgroundImage: `url("${BackgroundImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
            }}
        >
            <Box
                sx={{
                    gridColumn: 'span 1',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    ml: 5,
                    mr: -5,
                    pl: { xs: 0, xl: 8 },
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                        transform: 'scale(1.05)'
                    }
                }}
            >
                {Img && (
                    <Box
                        component="img"
                        src={Img}
                        alt="Side Image"
                        sx={{
                            width: 'fit-content',
                            height: 'fit-content',
                            maxWidth: 220,
                            maxHeight: 200
                        }}
                    />
                )}
            </Box>
            <Box
                sx={{
                    gridColumn: 'span 1',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pr: 2.5,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                        transform: 'scale(1.05)'
                    }
                }}
            >
                {Headline && (
                    <Box
                        component="span"
                        sx={{
                            textAlign: 'center',
                            fontSize: { xs: '14pt', md: '22pt' },
                            fontWeight: 'bold',
                            color: 'primary.main',
                            lineHeight: '40px',
                            pt: 1,
                            mt: 1
                        }}
                    >
                        {Headline}
                    </Box>
                )}
            </Box>
        </Box>
    );

    // Wrapper with card styling
    const cardWrapper = (content) => (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)'
                }
            }}
        >
            {content}
        </Box>
    );

    // Return either a Link-wrapped card or a click-handler card
    return hasUrl
        ? (
            <Link href={url} passHref>
                {cardWrapper(cardContent)}
            </Link>
        )
        : (
            <Box onClick={handleClick}>
                {cardWrapper(cardContent)}
            </Box>
        );
};

export default MiniCard;