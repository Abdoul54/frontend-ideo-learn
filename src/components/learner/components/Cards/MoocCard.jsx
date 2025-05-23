'use client';
import React, { useEffect, useState } from "react";
import { Box, Typography, Tooltip, Paper, Button } from "@mui/material";
import { useSession } from "next-auth/react";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";

const MoocCard = ({
    image,
    id,
    Type,
    Title,
    status = "Non débuté",
    Initiated = false,
    showEnrollButton = false,
    onEnroll,
    isEnrollable = true,
    formatted_duration,
    enrollmentStatus = null,
}) => {
    const { data: session } = useSession();
    const [token, setToken] = useState();
    const router = useRouter();

    const getStatusColor = () => {
        switch (status) {
            case "Non débuté": return '#ff4d49';
            case "En cours": return '#e9a31a';
            default: return '#4e991c'; // Terminé
        }
    };

    const handleClick = async (courseId) => {
        router.push('/test');
    };

    const handleEnrollClick = (e) => {
        e.stopPropagation(); // Prevent card click from triggering
        if (onEnroll && isEnrollable) {
            onEnroll(id);
        }
    };

    useEffect(() => {
        if (session?.access_token) {
            setToken(session.access_token);
        }
    }, [session]);

    return (
        <Tooltip title={Title}>
            <Paper
                elevation={2}
                sx={{
                    width: '100%',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 2
                    },
                    // Add height constraint to ensure consistent sizing
                    height: '320px',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={() => handleClick(id)}
            >
                <Box sx={{ position: 'relative' }}>
                    {status && (
                        <Box
                            component="div"
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: getStatusColor(),
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                zIndex: 1
                            }}
                        >
                            {status}
                        </Box>
                    )}
                    <Box
                        component="img"
                        src={image}
                        alt={Title}
                        sx={{
                            width: '100%',
                            height: 130,
                            objectFit: 'cover'
                        }}
                    />
                </Box>

                <Box sx={{
                    p: 2,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.3,
                            mb: 1
                        }}
                    >
                        {Title}
                    </Typography>

                    {showEnrollButton && (
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={handleEnrollClick}
                            disabled={!isEnrollable || enrollmentStatus === "enrolled"}
                            sx={{
                                mt: 'auto',
                                mb: 1,
                                textTransform: 'none'
                            }}
                        >
                            {enrollmentStatus === "enrolled" ? "Enrolled" : "Enroll Now"}
                        </Button>
                    )}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        px: 2,
                        py: 1,
                        borderTop: 1,
                        borderColor: 'divider',
                        mt: 'auto' // Push to bottom
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box component="i" className="solar-play-circle-bold-duotone" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {Type}
                        </Typography>
                    </Box>
                    {/* {formatted_duration && (
                        <Typography variant="caption" color="text.secondary">
                            {formatted_duration}
                        </Typography>
                    )} */}
                </Box>
            </Paper>
        </Tooltip >
    );
};

export default MoocCard;