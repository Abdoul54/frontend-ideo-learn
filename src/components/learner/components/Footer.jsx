'use client';
import React from 'react';
import { Box, Container, Typography, Grid2 as Grid, Link as MuiLink, Card } from '@mui/material';
import Link from '@/components/Link';
import { useFooter } from '@/hooks/api/tenant/widgets/useWidgets';

const Footer = ({ preview = false, footerData = null }) => {
    // If in preview mode and footerData is provided, use it
    // Otherwise, fetch data from the API
    const { data: apiFooterData, isLoading } = useFooter();

    // Use provided data in preview mode, otherwise use API data
    const data = preview && footerData ? footerData : apiFooterData;

    // Extract data if available
    const contactInfo = data?.contact || {
        title: 'Fondation Mohammed VI pour la protection de l\'environnement',
        tel: '0802 008 090',
        email: 'support@fm6education.ma'
    };
    const links = data?.links || [];
    const logoUrl = data?.logo || '/assets/logo.png';

    return (
        <footer className="w-full">
            <Card sx={{
                bgcolor: '#f5f5f5',
                color: '#333',
                mt: 8,
                p: 5,
            }}>
                <Container maxWidth="xl">
                    <Grid container sx={{ py: 3 }}>
                        {/* Foundation Information Section */}
                        <Grid item size={{ xs: 12, md: 4 }} sx={{ mb: { xs: 3, md: 0 } }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <Box
                                        component="span"
                                        sx={{
                                            color: '#c42e33',
                                            display: 'flex',
                                            fontSize: '1.5rem',
                                            mt: 0.5
                                        }}
                                    >
                                        <i className="solar-buildings-3-bold-duotone" />
                                    </Box>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#c42e33',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.3
                                        }}
                                    >
                                        {contactInfo.title}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 0.5, mt: 2 }}>
                                    <Box component="span" sx={{ color: '#555', display: 'flex' }}>
                                        <i className="solar-phone-bold" />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#555' }}>
                                        {contactInfo.tel}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 0.5, mt: 2 }}>
                                    <Box component="span" sx={{ color: '#555', display: 'flex' }}>
                                        <i className="solar-letter-bold" />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#555' }}>
                                        {contactInfo.email}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Links Section */}
                        <Grid
                            item
                            size={{ xs: 12, md: 4 }}
                            sx={{
                                borderLeft: { xs: 'none', md: '1px solid rgba(0, 0, 0, 0.1)' },
                                borderRight: { xs: 'none', md: '1px solid rgba(0, 0, 0, 0.1)' },
                                px: { xs: 0, md: 4 },
                                mb: { xs: 3, md: 0 }
                            }}
                        >
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 1,
                                    color: '#333'
                                }}
                            >
                                Liens utiles
                            </Typography>

                            {links && links.length > 0 ? (
                                links.map((link, index) => (
                                    <Box key={link.id || index} sx={{ mb: 0.5 }}>
                                        <MuiLink
                                            href={link.url || '#'}
                                            sx={{
                                                color: '#555',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                '&:hover': {
                                                    color: '#c42e33',
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            {link.title}
                                        </MuiLink>
                                    </Box>
                                ))
                            ) : (
                                <>
                                    <Box sx={{ mb: 0.5 }}>
                                        <MuiLink
                                            href="https://fm6e.org/"
                                            target="_blank"
                                            sx={{
                                                color: '#555',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                '&:hover': {
                                                    color: '#c42e33',
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            https://fm6e.org/
                                        </MuiLink>
                                    </Box>
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2" sx={{ color: '#555', fontSize: '0.9rem' }}>
                                            Le Centre International Hassan II de Formation à l'Environnement
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Grid>

                        {/* Logo Section */}
                        <Grid
                            item
                            size={{ xs: 12, md: 4 }}
                            sx={{
                                display: 'flex',
                                justifyContent: { xs: 'center', md: 'flex-end' },
                                alignItems: 'center'
                            }}
                        >
                            <Box
                                component="img"
                                src={logoUrl}
                                alt="Logo"
                                sx={{
                                    maxWidth: { xs: 200, md: 180 },
                                    height: 'auto'
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Card>

            {/* Copyright Footer - keeping this part from the original */}
            <Box
                sx={{
                    textAlign: 'center',
                    py: 1,
                    display: { xs: 'none', md: 'block' }
                }}
            >
                <Typography
                    variant="body2"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        fontWeight: 600
                    }}
                >
                    © Powered by IDEO
                </Typography>
            </Box>
        </footer>
    );
};

export default Footer;