import { Box, CircularProgress, Typography, Skeleton, Stack } from "@mui/material";
import { memo } from "react";

/**
 * LoadingState component displays a user-friendly loading indicator with customizable content.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message text
 * @param {boolean} props.useSkeletons - Whether to use skeleton loaders instead of spinner
 * @param {number} props.skeletonCount - Number of skeleton rows to display if useSkeletons is true
 * @param {Object} props.loadingProps - Props for the CircularProgress component
 * @param {React.ReactNode} props.loadingIcon - Custom loading icon component
 * @returns {React.ReactElement}
 */
const LoadingState = ({
    message = "Loading data...",
    useSkeletons = false,
    skeletonCount = 3,
    loadingProps = {
        size: 60,
        thickness: 4,
        color: "primary"
    },
    loadingIcon = null
}) => {
    const renderSkeletons = () => {
        return Array(skeletonCount).fill(0).map((_, index) => (
            <Skeleton
                key={`skeleton-${index}`}
                variant="rectangular"
                width={`${Math.max(50, Math.min(95, 80 + (Math.random() * 30 - 15)))}%`}
                height={48}
                animation="wave"
                sx={{ my: 1, borderRadius: 1 }}
            />
        ));
    };

    return (
        <Box
            component="section"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
            p={3}
            textAlign="center"
            role="status"
            aria-live="polite"
        >
            {useSkeletons ? (
                <Box width="100%" maxWidth="600px">
                    <Box mb={2} display="flex" justifyContent="center">
                        <CircularProgress size={40} />
                    </Box>
                    {renderSkeletons()}
                </Box>
            ) : (
                <>
                    <Box mb={3}>
                        {loadingIcon || <CircularProgress {...loadingProps} />}
                    </Box>
                    <Typography variant="h6" color="text.secondary" mb={1}>
                        {message}
                    </Typography>
                </>
            )}
        </Box>
    );
};

/**
 * LoadingStateWithContent component shows a loading indicator alongside content placeholders.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title text shown above the loading content
 * @param {boolean} props.showProgress - Whether to display the circular progress indicator
 * @param {Object} props.layout - Configuration for the skeleton layout
 * @returns {React.ReactElement}
 */
export const LoadingStateWithContent = ({
    title = "Loading Content",
    showProgress = true,
    layout = {
        header: true,
        image: false,
        lines: 4,
        cards: 0
    }
}) => {
    return (
        <Box
            component="section"
            p={3}
            role="status"
            aria-live="polite"
        >
            {layout.header && (
                <Box mb={4}>
                    <Typography variant="h5" gutterBottom>
                        {title}
                    </Typography>
                    <Skeleton variant="text" width="60%" height={24} />
                </Box>
            )}

            {showProgress && (
                <Box display="flex" justifyContent="center" my={3}>
                    <CircularProgress size={40} />
                </Box>
            )}

            {layout.image && (
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={200}
                    sx={{ borderRadius: 1, mb: 2 }}
                />
            )}

            {layout.lines > 0 && (
                <Stack spacing={1} my={2}>
                    {Array(layout.lines).fill(0).map((_, i) => (
                        <Skeleton
                            key={`line-${i}`}
                            variant="text"
                            width={`${Math.max(60, Math.min(95, 100 - (i * 5)))}%`}
                            height={24}
                        />
                    ))}
                </Stack>
            )}

            {layout.cards > 0 && (
                <Stack direction="row" spacing={2} sx={{ overflowX: "auto", py: 2 }}>
                    {Array(layout.cards).fill(0).map((_, i) => (
                        <Box
                            key={`card-${i}`}
                            sx={{
                                minWidth: 200,
                                borderRadius: 1,
                                overflow: "hidden"
                            }}
                        >
                            <Skeleton variant="rectangular" width={200} height={120} />
                            <Box p={1}>
                                <Skeleton variant="text" width="80%" />
                                <Skeleton variant="text" width="60%" />
                            </Box>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default memo(LoadingState);