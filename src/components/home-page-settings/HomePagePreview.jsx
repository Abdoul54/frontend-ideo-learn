'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Skeleton,
    Divider,
    Chip,
    Paper,
    Alert,
    useMediaQuery,
    Card,
    CardHeader,
    CardContent
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import dynamic from 'next/dynamic';

// Component imports
import Banner from '@/components/Banner';
import WelcomeSection from '@/components/learner/WelcomeSection';
import MoocSection from '@/components/learner/MoocSection';
import SupportSection from '@/components/learner/SupportSection';
import MiniCard from "@/components/learner/MiniCard";
import NewsSection from '@/components/learner/NewsSection';
import Footer from '../learner/components/Footer';

// Import all hooks for data fetching
import { useSliders, useWelcomeDefault, useNews, useBanners, useFooter } from '@/hooks/api/tenant/widgets/useWidgets';
import { useWidgetSettings } from '@/hooks/api/tenant/widgets/useWidgets';
import theme from '@/@core/theme';
import OptionMenu from '@/@core/components/option-menu';


// Dynamic imports - matching the actual page
const AppReactApexCharts = dynamic(() => import('@/lib/styles/AppReactApexCharts'), {
    ssr: false,
    loading: () => (
        <Box sx={{ width: 150, height: 189, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Skeleton variant="circular" width={150} height={150} />
        </Box>
    )
});

const HomePagePreview = () => {
    // Client-side state
    const [hasMount, setHasMount] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const { data: widgetSettings, isLoading: isSettingsLoading } = useWidgetSettings();

    // Fetch data from the API using the hooks
    const { data: sliders, isLoading: slidersLoading, error: slidersError } = useSliders();
    const { data: welcome, isLoading: welcomeLoading, error: welcomeError } = useWelcomeDefault();
    const { data: news, isLoading: newsLoading, error: newsError } = useNews();
    const { data: banners, isLoading: bannersLoading, error: bannersError } = useBanners();
    const { data: footer, isLoading: footerLoading, error: footerError } = useFooter();
    const belowMdScreen = useMediaQuery((theme) => theme.breakpoints.down('md'));

    // Determine which widgets are enabled
    const isWelcomeEnabled = !isSettingsLoading && widgetSettings?.welcome_enabled !== false;
    const isNewsEnabled = !isSettingsLoading && widgetSettings?.news_enabled !== false;
    const isSlidersEnabled = !isSettingsLoading && widgetSettings?.sliders_enabled !== false;
    const isUserReportEnabled = !isSettingsLoading && widgetSettings?.userreport_enabled !== false;
    const isBannersEnabled = !isSettingsLoading && widgetSettings?.banners_enabled !== false;
    const isFooterEnabled = !isSettingsLoading && widgetSettings?.footer_enabled !== false;

    const hasRightSideWidgets = isUserReportEnabled || isBannersEnabled;
    const deliveryExceptionsChartSeries = [13, 25, 22, 40];
    const options = {
        chart: {
            sparkline: { enabled: true },
            height: 250,
        },
        grid: {
            padding: {
                left: 20,
                right: 20
            }
        },
        colors: [
            '#E9EDFC', // Design - green
            '#6E9DFF', // Development - blue
            '#FFD07C', // Research - orange
            '#EA8A72', // Testing - purple
        ],
        stroke: { width: 0 },
        legend: {
            show: true,
            position: 'right',
            offsetY: 10,
            markers: {
                width: 8,
                height: 8,
                offsetY: 1,
                offsetX: theme.direction === 'rtl' ? 8 : -4
            },
            itemMargin: {
                horizontal: 15,
                vertical: 5
            },
            fontSize: '13px',
            fontWeight: 400,
            labels: {
                colors: 'var(--mui-palette-text-primary)',
                useSeriesColors: false
            }
        },
        tooltip: { theme: false },
        dataLabels: { enabled: false },
        labels: ['Design', 'Development', 'Research', 'Testing'],
        states: {
            hover: {
                filter: { type: 'none' }
            },
            active: {
                filter: { type: 'none' }
            }
        },
        plotOptions: {
            pie: {
                customScale: 1,
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: {
                            offsetY: 20,
                            fontSize: '0.875rem'
                        },
                        value: {
                            offsetY: -15,
                            fontWeight: 500,
                            fontSize: '1.125rem',
                            formatter: value => `${value}%`,
                            color: '#4e991c'
                        },
                        total: {
                            show: true,
                            fontSize: '0.8125rem',
                            label: 'Total',
                            color: '#4e991c',
                            formatter: () => '100%'
                        }
                    }
                }
            }
        },
        responsive: [
            {
                breakpoint: 992,
                options: {
                    chart: {
                        height: 400
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            },
            {
                breakpoint: 576,
                options: {
                    chart: {
                        height: 320
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        ]
    };

    // Check for any errors in the API responses
    const hasErrors = slidersError || welcomeError || newsError || bannersError;

    // Set mount state and check mobile on client-side only
    useEffect(() => {
        setHasMount(true);

        const checkSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkSize();

        // Add resize listener
        window.addEventListener('resize', checkSize);

        // Cleanup
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    // // For debugging - log the fetched data
    // useEffect(() => {
    //     if (hasMount) {
    //         console.log('Sliders data:', sliders);
    //         console.log('Welcome data:', welcome);
    //         console.log('News data:', news);
    //         console.log('Banners data:', banners);
    //         console.log('Footer data:', footer);
    //     }
    // }, [sliders, welcome, news, banners, hasMount]);

    useEffect(() => {
        // Set hasMount to true once the component mounts
        setHasMount(true);

        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/courses/categories');
                const data = await response.json();
                console.log('response', data);
                setCategories(data.data.items || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Calculate dynamic grid sizes for Welcome and News sections
    const getWelcomeNewsGridSizes = () => {
        // Both enabled - default split
        if (isWelcomeEnabled && isNewsEnabled) {
            return {
                welcomeSize: { xs: 12, md: 8 },
                newsSize: { xs: 12, md: 4 }
            };
        }

        // Only Welcome enabled - full width
        if (isWelcomeEnabled && !isNewsEnabled) {
            return {
                welcomeSize: { xs: 12, md: 12 },
                newsSize: null
            };
        }

        // Only News enabled - full width
        if (!isWelcomeEnabled && isNewsEnabled) {
            return {
                welcomeSize: null,
                newsSize: { xs: 12, md: 12 }
            };
        }

        // Both disabled
        return {
            welcomeSize: null,
            newsSize: null
        };
    };

    // Calculate grid sizes for support section
    const getSupportGridSizes = () => {
        return { xs: 12, md: 6 }; // Default size for support sections
    };

    // Get dynamic grid sizes
    const { welcomeSize, newsSize } = getWelcomeNewsGridSizes();
    const supportSize = getSupportGridSizes();

    // Render the chart card component
    const renderChartCard = () => {
        if (hasMount && isUserReportEnabled) {
            return (
                <Card sx={{ mb: 5, pb: 2, height: '300px', borderRadius: 2 }}>
                    <CardHeader
                        title='Course Activity Stats'
                        titleTypographyProps={{ variant: 'h6' }}
                        action={<OptionMenu options={['Refresh', 'Export', 'Share']} />}
                    />
                    <CardContent>
                        <AppReactApexCharts
                            type='donut'
                            height={160}
                            width='100%'
                            series={deliveryExceptionsChartSeries}
                            options={options}
                        />
                    </CardContent>
                </Card>
            );
        }
        return null;
    };

    // Render the banners section
    const renderBanners = () => {
        if (!hasMount || !isBannersEnabled) return null;

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: isUserReportEnabled ? 4 : 0 }}>
                {bannersLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} variant="rectangular" height={200} width="100%" />
                    ))
                ) : banners && banners.length > 0 ? (
                    banners.map((banner) => (
                        <MiniCard
                            key={banner.id}
                            BackgroundImage={banner.image}
                            Link={banner.url}
                        />
                    ))
                ) : (
                    // Fallback mini cards if no banners available
                    <>
                        <MiniCard BackgroundImage="/assets/mooc.png" />
                        <MiniCard BackgroundImage="/assets/activite.png" />
                        <MiniCard BackgroundImage="/assets/metier.png" />
                    </>
                )}
            </Box>
        );
    };

    // Render the courses section
    const renderCourses = () => {
        if (!hasMount) {
            return (
                <Box sx={{ mt: 10 }}>
                    <Skeleton variant="text" width="25%" sx={{ fontSize: '1.75rem' }} />
                    <Skeleton variant="text" width="45%" sx={{ fontSize: '1.25rem' }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} variant="rectangular" width="calc(25% - 16px)" height={200} />
                        ))}
                    </Box>
                </Box>
            );
        }

        return (
            categories.length > 0 ? (
                categories.map((cat) => (
                    cat.courses?.length > 0 && (
                        <MoocSection
                            key={cat.id}
                            title={cat.code}
                            subheader={cat.title}
                            courses={cat.courses}
                        />
                    )
                ))
            ) : (
                <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Typography variant="h5" color="textSecondary" padding={10}>
                        {"Aucune vidéo pédagogique disponible"}
                    </Typography>
                </Box>
            )
        );
    };

    return (
        <Box sx={{ pb: 8 }}>
            <Paper
                elevation={0}
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 4,
                    backgroundColor: 'info.light',
                    borderColor: 'info.main'
                }}
            >
                <Typography variant="body2" color="info.dark">
                    <strong>Preview Mode:</strong> This shows how your home page will appear with current settings.
                </Typography>
            </Paper>

            {hasErrors && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    There was an error loading some content. The preview may not accurately reflect the live site.
                </Alert>
            )}

            <Container maxWidth="xl">
                {/* Banner with real slider data */}
                {/* Banner Section */}
                {hasMount && isSlidersEnabled ? (
                    <Banner isLoading={slidersLoading} />
                ) : hasMount && !isSettingsLoading ? null : (
                    <Skeleton variant="rectangular" height={300} width="100%" />
                )}

                {/* Welcome and News section */}
                {(welcomeSize || newsSize) && (
                    <Grid container spacing={3} sx={{ mt: isSlidersEnabled ? 10 : 4 }}>
                        {welcomeSize && (
                            <Grid item size={{ ...welcomeSize }}>
                                {hasMount ? (
                                    <WelcomeSection isLoading={welcomeLoading} />
                                ) : (
                                    <Skeleton variant="rectangular" height={300} width="100%" />
                                )}
                            </Grid>
                        )}

                        {newsSize && (
                            <Grid item size={{ ...newsSize }}>
                                {hasMount ? (
                                    <NewsSection isLoading={newsLoading} />
                                ) : (
                                    <Skeleton variant="rectangular" height={300} width="100%" />
                                )}
                            </Grid>
                        )}
                    </Grid>
                )}

                {/* Main Content Area - Courses on left, Chart+Banners on right */}
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    {/* Left Column - Courses */}
                    <Grid item size={{ xs: 12, md: hasRightSideWidgets ? 8 : 12 }}>
                        {renderCourses()}
                    </Grid>

                    {/* Right Column - Chart & Banners (only if at least one is enabled) */}
                    {hasRightSideWidgets && (
                        <Grid item size={{ xs: 12, md: 4 }}>
                            {/* Chart Card */}
                            {renderChartCard()}

                            {/* Banners */}
                            {renderBanners()}
                        </Grid>
                    )}
                </Grid>

                {/* Support and FAQ section */}
                <Grid container spacing={3} sx={{ mt: 3 }}>
                    <Grid item size={{ ...supportSize }}>
                        {hasMount ? (
                            <SupportSection type="support" />
                        ) : (
                            <Skeleton variant="rectangular" height={300} width="100%" />
                        )}
                    </Grid>
                    <Grid item size={{ ...supportSize }}>
                        {hasMount ? (
                            <SupportSection type="faq" />
                        ) : (
                            <Skeleton variant="rectangular" height={300} width="100%" />
                        )}
                    </Grid>
                </Grid>
            </Container>

            {/* Footer with real data */}
            {hasMount && isFooterEnabled ? (
                <Footer
                    preview={true}
                    footerData={footer}
                />
            ) : !hasMount ? (
                <Skeleton variant="rectangular" height={300} width="100%" />
            ) : null}
        </Box>
    );
};

export default HomePagePreview;