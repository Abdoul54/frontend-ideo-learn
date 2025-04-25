'use client';
import { Masonry } from '@mui/lab';
import ColorSettingsPanel from "@/components/branding-cards/ColorSettingsPanel";
import CustomCssEditor from "@/components/branding-cards/CustomCssEditor";
import HeaderSettings from "@/components/branding-cards/HeaderSettings";
import SignInSettings from "@/components/branding-cards/SignInSettings";
import { Card, CardHeader, useTheme, useMediaQuery } from "@mui/material";
import { Box, Typography, Container } from "@mui/material";
import { useForm } from "react-hook-form";
import { useRef, useEffect } from 'react';

export default function BrandingSettings() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { control, watch, setValue } = useForm();
    const masonryRef = useRef(null);
    const containerRef = useRef(null);

    // Cards configuration
    const brandingCards = [
        {
            id: 'header-settings',
            component: <HeaderSettings />,
            span: 1
        },
        {
            id: 'sign-in-settings',
            component: <SignInSettings control={control} watch={watch} />,
            span: 1
        },
        {
            id: 'colors-appearance',
            component: (
                <Card sx={{ 
                    height: "100%", 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'visible' 
                }}>
                    <CardHeader title="Colors & Appearance" />
                    <ColorSettingsPanel control={control} />
                </Card>
            ),
            span: 1
        },
        {
            id: 'custom-css',
            component: (
                <CustomCssEditor
                    value={watch('customCss')}
                    onChange={(value) => setValue('customCss', value)}
                    label="Custom CSS"
                />
            ),
            span: 1
        }
    ];

    // Masonry layout handling
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            if (masonryRef.current) {
                masonryRef.current.forceLayout();
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, []);

    return (
        <Container maxWidth="xl" ref={containerRef}>
            <Typography variant="h5" sx={{ mb: 3, px: { xs: 2, sm: 3 } }}>
                Configure Branding and Look
            </Typography>

            <Box sx={{ width: '100%', px: { xs: 2, sm: 3 } }}>
                <Masonry
                    sequential
                    ref={masonryRef}
                    columns={isMobile ? 1 : 2}
                    spacing={3}
                    sx={{
                        width: '100%',
                        margin: '0 !important',
                        '& > div': {
                            transition: 'transform 0.3s ease-out',
                        },
                    }}
                >
                    {brandingCards.map(({ id, component, span }) => (
                        <Box key={id} sx={{ gridColumn: `span ${span}` }}>
                            {component}
                        </Box>
                    ))}
                </Masonry>
            </Box>
        </Container>
    );
}