import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const AsyncButton = ({
    onClick,
    children,
    disabled = false,
    variant = 'contained',
    color = 'primary',
    startIcon,
    status = 'idle', // 'idle' | 'loading' | 'success' | 'error'
    loadingText,
    successText,
    errorText,
    autoResetDelay = 2000, // Time in ms to reset success/error state
    onStatusReset,
    size = 'medium',
    ...props
}) => {
    const [internalStatus, setInternalStatus] = React.useState(status);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        setInternalStatus(status);
    }, [status]);

    React.useEffect(() => {
        let timeoutId;
        if ((internalStatus === 'success' || internalStatus === 'error') && autoResetDelay) {
            timeoutId = setTimeout(() => {
                setInternalStatus('idle');
                onStatusReset?.();
            }, autoResetDelay);
        }
        return () => timeoutId && clearTimeout(timeoutId);
    }, [internalStatus, autoResetDelay, onStatusReset]);

    const handleClick = async (event) => {
        if (isLoading) return;

        try {
            setIsLoading(true);
            setInternalStatus('loading');
            await onClick(event);
            setInternalStatus('success');
        } catch (error) {
            console.error('Button action failed:', error);
            setInternalStatus('error');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = () => {
        if (isLoading || internalStatus === 'loading') {
            return <CircularProgress size={size === 'small' ? 16 : 20} color="inherit" />;
        }

        switch (internalStatus) {
            case 'success':
                return <i className="solar-check-circle-linear" />;
            case 'error':
                return <i className="solar-close-circle-linear" />;
            default:
                return startIcon || null;
        }
    };

    const getButtonText = () => {
        if (isLoading || internalStatus === 'loading') return loadingText || children;
        if (internalStatus === 'success') return successText || children;
        if (internalStatus === 'error') return errorText || children;
        return children;
    };

    const getButtonColor = () => {
        switch (internalStatus) {
            case 'error':
                return 'error';
            case 'success':
                return 'success';
            default:
                return color;
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={disabled || isLoading || internalStatus === 'loading'}
            variant={variant}
            color={getButtonColor()}
            startIcon={getIcon()}
            size={size}
            {...props}
        >
            {getButtonText()}
        </Button>
    );
};

export default AsyncButton;