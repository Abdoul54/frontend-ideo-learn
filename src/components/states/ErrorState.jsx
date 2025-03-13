import { Box, Button, Stack, Typography } from "@mui/material";
import Error from "../illustrations/Error";
import { memo } from "react";

/**
 * ErrorState component displays a user-friendly error message with customizable content and actions.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.error - Error information
 * @param {string} props.error.header - Error header text
 * @param {string} props.error.message - Error message text
 * @param {React.ReactNode} props.illustration - Custom illustration component
 * @param {Object} props.illustrationProps - Props for the default Error illustration
 * @param {Object} props.actions - Action buttons configuration
 * @returns {React.ReactElement}
 */
const ErrorState = ({
    error = {
        header: "Unable to Load Group",
        message: "An error occurred while fetching group data.",
    },
    illustration = null,
    illustrationProps = {
        primaryColor: 'var(--mui-palette-error-main)',
        secondaryColor: 'var(--mui-palette-primary-main)',
        accentColor: 'var(--mui-palette-text-primary)',
        detailColor: 'var(--mui-palette-background-paper)',
        height: '15%',
        width: '15%',
    },
    actions = {
        back: {
            label: 'Go Back To Groups',
            action: () => { },
            icon: 'solar-round-arrow-left-outline'
        },
        retry: {
            label: 'Reload Page',
            action: () => { },
            icon: 'solar-refresh-circle-outline'
        }
    }
}) => {
    // Safe action handlers with fallbacks
    const handleBackAction = (e) => {
        e.preventDefault();
        if (actions?.back?.action && typeof actions.back.action === 'function') {
            actions.back.action();
        }
    };

    const handleRetryAction = (e) => {
        e.preventDefault();
        if (actions?.retry?.action && typeof actions.retry.action === 'function') {
            actions.retry.action();
        }
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
            role="alert"
            aria-live="polite"
        >
            <Box width="100%" height="100%" mb={3}>
                {illustration ? (
                    illustration
                ) : (
                    <Error {...illustrationProps} />
                )}
            </Box>
            <Typography variant="h5" color="error" gutterBottom>
                {error?.header || "An Error Occurred"}
            </Typography>
            <Typography color="text.secondary" mb={3}>
                {error?.message || "An error occurred while fetching data."}
            </Typography>
            <Stack direction="row" gap={2}>
                {actions?.back && (
                    <Button
                        variant="outlined"
                        size="medium"
                        color="primary"
                        onClick={handleBackAction}
                        startIcon={actions.back.icon && <i className={actions.back.icon} />}
                        aria-label={actions.back.label}
                    >
                        {actions.back.label}
                    </Button>
                )}
                {actions?.retry && (
                    <Button
                        variant="contained"
                        size="medium"
                        color="primary"
                        onClick={handleRetryAction}
                        startIcon={actions.retry.icon && <i className={actions.retry.icon} />}
                        aria-label={actions.retry.label}
                    >
                        {actions.retry.label}
                    </Button>
                )}
            </Stack>
        </Box>
    );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(ErrorState);