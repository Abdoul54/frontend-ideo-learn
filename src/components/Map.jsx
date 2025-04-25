'use client';

import { useState, useEffect } from 'react';
// MUI imports
import {
    TextField,
    Button,
    Paper,
    Box,
    Typography,
    Alert,
    InputAdornment,
    CircularProgress,
    Grid2 as Grid,
    IconButton,
} from '@mui/material';

import { useSettings } from "@/@core/contexts/settingsContext";

/**
 * @typedef {Object} MapProps
 * @property {string} [apiKey] - Google Maps API key (optional if provided at component level)
 * @property {string} [defaultAddress=''] - Initial address to display on map load
 * @property {boolean} [noForm=false] - Whether to hide the search form and controls
 * @property {('roadmap'|'satellite')} [defaultMapType='roadmap'] - Initial map type
 * @property {string} [defaultZoom='14'] - Initial zoom level
 * @property {string} [defaultLocale='en'] - Initial locale for map labels
 * @property {string} [defaultRegion='ma'] - Region code for map bias
 * @property {string} [defaultMapUrl=''] - Initial map URL to display
 * @property {boolean} [disableMapType=false] - Whether to disable map type selection
 * @property {boolean} [disableZoom=false] - Whether to disable zoom level selection
 * @property {string} [mapHeight='600px'] - Height of the map iframe
 * @property {string|number} [containerHeight='auto'] - Height of the map container
 * @property {Object} [paperSx={}] - Additional styles for the Paper component
 * @property {Object} [iframeSx={}] - Additional styles for the iframe component
 */

/**
 * Interactive Map component that allows users to search locations and display them on Google Maps
 * 
 * @param {MapProps} props - Component properties
 * @returns {JSX.Element} - Rendered Map component
 */
const Map = ({
    apiKey,
    defaultAddress = '',
    noForm = false,
    defaultMapType = 'roadmap',
    defaultZoom = '14',
    defaultLocale = 'en',
    defaultRegion = 'ma',
    defaultMapUrl = '',
    disableMapType = false,
    disableZoom = false,
    // New customization props
    mapHeight = '600px',
    containerHeight = 'auto',
    paperSx = {},
    iframeSx = {},
}) => {
    // Get locale from settings context
    const { settings: { language: { locale = defaultLocale } = {} } = {} } = useSettings() || {};

    // State management
    const [address, setAddress] = useState(defaultAddress || '');
    const [mapUrl, setMapUrl] = useState(defaultMapUrl);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Map configuration options
    const [mapType, setMapType] = useState(disableMapType ? null : defaultMapType);
    const [zoom, setZoom] = useState(disableZoom ? null : defaultZoom);

    // Your Google Maps API key - prefer prop over hardcoded value
    const GOOGLE_MAPS_API_KEY = apiKey || 'AIzaSyCLyW-rs4nPU-z1xgd4rL3rPVHy-gWTVb0';

    // Initialize map with default address if provided
    useEffect(() => {
        if (defaultAddress && !mapUrl) {
            generateMapUrl(defaultAddress);
        }
    }, []);

    // Update when defaultAddress changes
    useEffect(() => {
        if (defaultAddress) {
            setAddress(defaultAddress);

            // Only generate a new map URL if the address is not empty
            if (defaultAddress.trim()) {
                setIsLoading(true);
                try {
                    const url = generateMapUrl(defaultAddress);
                    setMapUrl(url);
                } catch (err) {
                    setError('Error updating map. Please try again.');
                    console.error('Map update error:', err);
                } finally {
                    setTimeout(() => setIsLoading(false), 300);
                }
            }
        }
    }, [defaultAddress]);

    /**
     * Generates the Google Maps embed URL with the provided address and current map settings
     */
    const generateMapUrl = (searchAddress) => {
        // Create the Google Maps Embed URL with all parameters
        let embedUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(searchAddress)}`;

        // Add optional parameters if they're set
        if (mapType) embedUrl += `&maptype=${mapType}`;
        if (zoom) embedUrl += `&zoom=${zoom}`;
        if (locale) embedUrl += `&language=${locale}`;
        if (defaultRegion) embedUrl += `&region=${defaultRegion}`; // Add region parameter

        return embedUrl;
    };

    /**
     * Handles form submission to search for an address
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!address.trim()) {
            setError('Please enter an address');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const url = generateMapUrl(address);
            setMapUrl(url);
        } catch (err) {
            setError('Error generating map URL. Please try again.');
            console.error('Map URL generation error:', err);
        } finally {
            // Short delay for better UX
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    };

    /**
     * Handles errors that occur when loading the map iframe
     */
    const handleMapError = () => {
        setError('Unable to load map. Please check the address or API key permissions.');
    };

    /**
     * Updates map settings and regenerates the map URL if an address is already set
     */
    const updateMapSettings = () => {
        if (address.trim() && mapUrl) {
            setIsLoading(true);
            try {
                const url = generateMapUrl(address);
                setMapUrl(url);
            } catch (err) {
                setError('Error updating map settings. Please try again.');
            } finally {
                setTimeout(() => setIsLoading(false), 300);
            }
        }
    };

    // Update map when settings change
    useEffect(() => {
        if (address.trim() && mapUrl) {
            updateMapSettings();
        }
    }, [mapType, zoom, locale]);

    return (
        <Grid container spacing={3} width={1}>
            {!noForm && <>
                <Grid item size={12}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item size={11}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter any address on Earth"
                                    size="small"
                                />
                            </Grid>
                            <Grid item size={1}>
                                <IconButton
                                    type="submit"
                                    edge="end"
                                    disabled={!address.trim() || isLoading}
                                    onClick={handleSubmit}
                                    color='primary'
                                    sx={{
                                        borderRadius: 1,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                    }}
                                >
                                    <i className={`${isLoading ? 'lucide-loader animate-spin' : 'lucide-search'} `} />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>

                {/* Map Options */}
                <Grid item size={12}>
                    <Grid container spacing={2}>
                        {!disableMapType && (
                            <Grid item size={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Map Type"
                                    value={mapType}
                                    onChange={(e) => setMapType(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    SelectProps={{
                                        native: true,
                                    }}
                                >
                                    <option value="roadmap">Road Map</option>
                                    <option value="satellite">Satellite</option>
                                </TextField>
                            </Grid>
                        )}
                        {!disableZoom && (
                            <Grid item size={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Zoom Level"
                                    value={zoom}
                                    onChange={(e) => setZoom(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    SelectProps={{
                                        native: true,
                                    }}
                                >
                                    <option value="5">Country Level (5)</option>
                                    <option value="10">City Level (10)</option>
                                    <option value="14">Street Level (14)</option>
                                    <option value="18">Building Level (18)</option>
                                    <option value="20">Maximum Zoom (20)</option>
                                </TextField>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </>
            }

            {/* Error Alert */}
            {error && (
                <Grid item size={12}>
                    <Alert
                        severity="error"
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                </Grid>
            )}

            {/* Map Container */}
            <Grid item size={12} >
                <Paper
                    variant="outlined"
                    sx={{
                        overflow: 'hidden',
                        borderRadius: 1,
                        height: mapUrl ? containerHeight : '400px',
                        position: 'relative',
                        ...paperSx,
                    }}
                >
                    {isLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(255,255,255,0.7)',
                                zIndex: 10,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    )}
                    {mapUrl ? (
                        <Box
                            component="iframe"
                            title="Google Maps"
                            width="100%"
                            height={mapHeight}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={mapUrl}
                            onError={handleMapError}
                            sx={iframeSx}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'grey.100',
                                color: 'text.secondary',
                            }}
                        >
                            <Typography variant="body1">Enter an address and click Search to display the map</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Map;