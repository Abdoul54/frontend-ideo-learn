'use client'

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Box,
    IconButton,
    Alert,
    CircularProgress,
    Stack,
    Tooltip
} from '@mui/material';

const RegenerateKeysDialog = ({ open, onClose, keys, isLoading, error }) => {
    const [copiedApiKey, setCopiedApiKey] = useState(false);
    const [copiedSecretKey, setCopiedSecretKey] = useState(false);

    // Reset visibility and copy states when dialog closes
    useEffect(() => {
        if (!open) {
            setCopiedApiKey(false);
            setCopiedSecretKey(false);
        }
    }, [open]);

    // Function to copy text to clipboard
    const copyToClipboard = (text, keyType) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Set the appropriate copied state based on key type
                if (keyType === 'API Key') {
                    setCopiedApiKey(true);
                    // Reset icon after 2 seconds
                    setTimeout(() => setCopiedApiKey(false), 2000);
                } else if (keyType === 'Secret Key') {
                    setCopiedSecretKey(true);
                    // Reset icon after 2 seconds
                    setTimeout(() => setCopiedSecretKey(false), 2000);
                } else if (keyType === 'All keys') {
                    setCopiedApiKey(true);
                    setCopiedSecretKey(true);
                    // Reset icons after 2 seconds
                    setTimeout(() => {
                        setCopiedApiKey(false);
                        setCopiedSecretKey(false);
                    }, 2000);
                }
            })
            .catch(() => {
                console.error('Failed to copy text to clipboard');
            });
    };

    // Function to mask sensitive information
    const maskText = (text) => {
        if (!text) return '••••••••••••••••';
        return '•'.repeat(Math.max(text.length - 4, 0)) + text.slice(-4);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Regenerated Partner Keys
                </DialogTitle>
                <DialogContent>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            {/* <Alert severity="warning" sx={{ mb: 2 }}>
                                Please copy the keys and store them securely. You won't be able to see the secret key again.
                            </Alert> */}

                            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                                API Key
                            </Typography>
                            <Stack
                                direction='row'
                                gap={2}
                                justifyContent='space-between'
                                alignItems='center'
                                padding={1}
                                bgcolor='action.hover'
                                borderRadius={1}
                            >
                                <Typography variant='body2' fontWeight={600} >
                                    {maskText(keys?.apiKey)}
                                </Typography>
                                <Tooltip title={copiedApiKey ? 'Copied!' : 'Copy API Key'}>
                                    <IconButton sx={{
                                        fontSize: 16,
                                        color: copiedApiKey ? 'success.main' : 'text.secondary'
                                    }}
                                        onClick={() => copyToClipboard(keys?.apiKey, 'API Key')}
                                    >
                                        <i className={copiedApiKey ? 'solar-check-circle-outline' : 'solar-copy-outline'} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>

                            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                                Secret Key
                            </Typography>
                            <Stack
                                direction='row'
                                gap={2}
                                justifyContent='space-between'
                                alignItems='center'
                                padding={1}
                                bgcolor='action.hover'
                                borderRadius={1}
                            >
                                <Typography variant='body2' fontWeight={600}>
                                    <strong>{maskText(keys?.secretKey)}</strong>
                                </Typography>
                                <Tooltip title={copiedSecretKey ? 'Copied!' : 'Copy Secret Key'}>
                                    <IconButton sx={{
                                        fontSize: 16,
                                        color: copiedSecretKey ? 'success.main' : 'text.secondary'
                                    }}
                                        onClick={() => copyToClipboard(keys?.secretKey, 'Secret Key')}
                                    >
                                        <i className={copiedSecretKey ? 'solar-check-circle-outline' : 'solar-copy-outline'} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                    {!isLoading && !error && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                copyToClipboard(`API Key: ${keys?.apiKey}\nSecret Key: ${keys?.secretKey}`, 'All keys');
                            }}
                        >
                            Copy All
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RegenerateKeysDialog;