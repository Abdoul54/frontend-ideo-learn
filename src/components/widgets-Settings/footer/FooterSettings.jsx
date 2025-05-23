'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { useFooter } from '@/hooks/api/tenant/widgets/useWidgets';
import ContactInfoForm from '@/components/widgets-Settings/footer/ContactInfoForm';
import LinksManager from '@/components/widgets-Settings/footer/LinksManager';
import LogoUploader from '@/components/widgets-Settings/footer/LogoUploader';

const FooterSettings = () => {
    const { data: footerData, isLoading, error, refetch } = useFooter();
    const [contact, setContact] = useState({ title: "", tel: "", email: "" });
    const [links, setLinks] = useState([]);
    const [logo, setLogo] = useState(null);

    // Update local state when API data is loaded
    useEffect(() => {
        if (footerData) {
            setContact(footerData.contact || { title: "", tel: "", email: "" });
            setLinks(footerData.links || []);
            setLogo(footerData.logo || null);
        }
    }, [footerData]);

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load footer settings. Please try again later.
            </Alert>
        );
    }

    return (
        <Grid container spacing={4}>
            {isLoading ? (
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ ml: 2 }}>
                            Loading footer settings...
                        </Typography>
                    </Box>
                </Grid>
            ) : (
                <>
                    {/* Contact Information Card */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardHeader title="Contact Information" />
                            <CardContent>
                                <ContactInfoForm 
                                    contact={contact} 
                                    setContact={setContact} 
                                    refetchData={refetch}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Links Manager Card */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardHeader title="Useful Links" />
                            <CardContent>
                                <LinksManager 
                                    links={links} 
                                    setLinks={setLinks} 
                                    refetchData={refetch}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Logo Uploader Card */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardHeader title="Footer Logo" />
                            <CardContent>
                                <LogoUploader 
                                    logo={logo} 
                                    setLogo={setLogo} 
                                    refetchData={refetch}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Preview Card */}
                    {/* <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Footer Preview" />
                            <CardContent>
                                <FooterPreview 
                                    contact={contact}
                                    links={links}
                                    logo={logo}
                                />
                            </CardContent>
                        </Card>
                    </Grid> */}
                </>
            )}
        </Grid>
    );
};

export default FooterSettings;