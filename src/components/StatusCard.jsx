import React from 'react';

/**
 * StatusCard - A versatile card component for displaying status information with various styling options
 * 
 * @param {string} type - The type of status ('info', 'success', 'error', 'warning')
 * @param {string} title - The card title
 * @param {string} message - The card message/description
 * @param {Array} actions - Array of action objects for footer buttons
 * @param {string} imageUrl - Optional URL for an image to display instead of an icon
 * @param {React.ReactNode} customIcon - Optional custom icon element
 * @param {boolean} showDivider - Whether to show a divider between header and content
 * @param {number} elevation - Shadow elevation level (0-5)
 * @param {boolean} hideChip - Whether to hide the status chip
 * @param {string} className - Additional CSS classes to apply
 */
const StatusCard = ({
    type = 'info',
    title,
    message,
    actions = [],
    imageUrl = null,
    customIcon = null,
    showDivider = true,
    elevation = 0,
    hideChip = false,
    className = ''
}) => {
    // Status type configuration with icon classes, colors, and other styling properties
    const configs = {
        info: {
            iconClass: 'lucide-circle-alert',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            chipBg: 'bg-blue-100',
            chipText: 'text-blue-800',
            buttonColor: 'text-blue-600 hover:bg-blue-50',
            containedBtnBg: 'bg-blue-600 hover:bg-blue-700'
        },
        success: {
            iconClass: 'lucide-circle-check',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            chipBg: 'bg-green-100',
            chipText: 'text-green-800',
            buttonColor: 'text-green-600 hover:bg-green-50',
            containedBtnBg: 'bg-green-600 hover:bg-green-700'
        },
        error: {
            iconClass: 'lucide-circle-x',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            chipBg: 'bg-red-100',
            chipText: 'text-red-800',
            buttonColor: 'text-red-600 hover:bg-red-50',
            containedBtnBg: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            iconClass: 'lucide-triangle-alert',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            chipBg: 'bg-yellow-100',
            chipText: 'text-yellow-800',
            buttonColor: 'text-yellow-600 hover:bg-yellow-50',
            containedBtnBg: 'bg-yellow-600 hover:bg-yellow-700'
        }
    };

    const config = configs[type] || configs.info;

    // Determine shadow based on elevation (MUI-like)
    const getShadow = () => {
        const shadows = {
            0: 'shadow-none',
            1: 'shadow-sm',
            2: 'shadow',
            3: 'shadow-md',
            4: 'shadow-lg',
            5: 'shadow-xl'
        };
        return shadows[elevation] || shadows[1];
    };

    // Determine which icon/image to display
    const renderIcon = () => {
        if (customIcon) {
            return customIcon;
        } else if (imageUrl) {
            return <img src={imageUrl} alt={`${title || type} icon`} className="h-10 w-10 rounded-full object-cover" />;
        } else {
            return <i className={`${config.iconClass} h-8 w-8 ${config.color}`}></i>;
        }
    };

    return (
        <div
            className={`rounded-lg ${getShadow()} overflow-hidden bg-white border ${config.borderColor} transition-all duration-200 ${className}`}
            role={type === 'error' ? 'alert' : 'status'}
            aria-live={type === 'error' ? 'assertive' : 'polite'}
        >
            {/* Card Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${config.bgColor} bg-opacity-30`}>
                <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${config.bgColor} bg-opacity-60`}>
                        {renderIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">{title}</h3>

                        {/* Status Chip */}
                        {!hideChip && (
                            <div className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.chipBg} ${config.chipText}`}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            {showDivider && <div className="h-px bg-gray-200" />}

            {/* Card Content */}
            <div className="px-6 py-5">
                <p className="text-sm text-gray-600">{message}</p>
            </div>

            {/* Card Actions */}
            {actions.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 flex flex-wrap justify-end gap-2">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 
                            ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            ${action.contained
                                    ? `${config.containedBtnBg} text-white`
                                    : `${config.buttonColor} ${action.bordered ? 'border border-current' : ''}`
                                }`}
                            aria-label={action.ariaLabel || action.label}
                        >
                            {action.iconPosition === 'left' && action.icon && (
                                <span className="mr-1">
                                    {action.icon}
                                </span>
                            )}
                            {action.iconPosition === 'left' && action.iconClass && (
                                <span className="mr-1">
                                    <i className={`${action.iconClass} h-4 w-4`}></i>
                                </span>
                            )}

                            {action.label}

                            {(!action.iconPosition || action.iconPosition === 'right') && action.icon && (
                                <span className="ml-1">
                                    {action.icon}
                                </span>
                            )}
                            {(!action.iconPosition || action.iconPosition === 'right') && action.iconClass && (
                                <span className="ml-1">
                                    <i className={`${action.iconClass} h-4 w-4`}></i>
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatusCard;

