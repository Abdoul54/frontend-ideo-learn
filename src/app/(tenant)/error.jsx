'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    Stack,
    Grid,
    Fade,
    Divider
} from '@mui/material'
// Using iconify with <i> tags for icons instead of MUI icons

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <Container maxWidth="md">
            <Fade in={true} timeout={800}>
                <Stack
                    gap={4}
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        height: 'calc(100vh - 114px)',
                        py: 6
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            borderRadius: 2,
                            maxWidth: '600px',
                            width: '100%',
                            border: 1,
                            borderColor: 'divider',
                            background: 'background.paper',
                        }}
                    >
                        <Stack spacing={3} alignItems="center">
                            <Box sx={{ fontSize: 64, color: 'error.main', display: 'flex', justifyContent: 'center' }}>
                                <i className="solar-sad-circle-outline" />
                            </Box>

                            <Typography variant="h4" fontWeight="bold" align="center">
                                Something went wrong
                            </Typography>

                            <Divider flexItem />

                            <Typography variant="body1" color="text.secondary" align="center">
                                We encountered an unexpected error while loading this page.
                                You can try reloading or contact support if the problem persists.
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2} justifyContent="center">
                                    <Grid item>
                                        <Button
                                            onClick={reset}
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            startIcon={<i className="lucide-refresh-cw" />}
                                            sx={{ px: 3, py: 1 }}
                                        >
                                            Try Again
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            size="large"
                                            startIcon={<i className="lucide-home" />}
                                            sx={{ px: 3, py: 1 }}
                                            onClick={() => window.location.href = '/'}
                                        >
                                            Return Home
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>

                            {process.env.NODE_ENV === 'development' && (
                                <Box sx={{ mt: 4, width: '100%' }}>
                                    <Typography variant="subtitle2" color="error" gutterBottom>
                                        Error Details (visible in development only):
                                    </Typography>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            background: '#161616',
                                            color: 'error.dark',
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            overflowX: 'auto',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        {error?.message || 'Unknown error'}
                                        {error?.stack && (
                                            <Typography
                                                variant="body2"
                                                component="pre"
                                                sx={{
                                                    mt: 1,
                                                    color: '#e1e1e1',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {error.stack}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Box>
                            )}
                        </Stack>
                    </Paper>
                </Stack>
            </Fade>
        </Container>
    )
}