import settingConfig from "@/configs/settingConfig"

export const settingsMerger = (newSettings) => {

    const settings = {
        templateName: newSettings?.templateName || settingConfig?.templateName,
        settingsCookieName: newSettings?.settingsCookieName || settingConfig?.settingsCookieName,
        mode: newSettings?.mode || settingConfig?.mode,
        skin: newSettings?.skin || settingConfig?.skin,
        semiDark: newSettings?.semiDark || settingConfig?.semiDark,
        layout: newSettings?.layout || settingConfig?.layout,
        layoutPadding: newSettings?.layoutPadding || settingConfig?.layoutPadding,
        compactContentWidth: newSettings?.compactContentWidth || settingConfig?.compactContentWidth,
        navbar: {
            type: newSettings?.navbar?.type || settingConfig?.navbar?.type,
            contentWidth: newSettings?.navbar?.contentWidth || settingConfig?.navbar?.contentWidth,
            floating: newSettings?.navbar?.floating || settingConfig?.navbar?.floating,
            detached: newSettings?.navbar?.detached || settingConfig?.navbar?.detached,
            blur: newSettings?.navbar?.blur || settingConfig?.navbar?.blur
        },
        contentWidth: newSettings?.contentWidth || settingConfig?.contentWidth,
        footer: {
            type: newSettings?.footer?.type || settingConfig?.footer?.type,
            contentWidth: newSettings?.footer?.contentWidth || settingConfig?.footer?.contentWidth,
            detached: newSettings?.footer?.detached || settingConfig?.footer?.detached
        },
        disableRipple: newSettings?.disableRipple || settingConfig?.disableRipple,
        toastPosition: newSettings?.toastPosition || settingConfig?.toastPosition,
        language: {
            locale: newSettings?.language?.locale || settingConfig?.language?.locale,
            direction: newSettings?.language?.direction || settingConfig?.language?.direction
        },
        navigation: {
            items: newSettings?.navigation?.items || settingConfig?.navigation?.items
        },
        header: {
            page_title: newSettings?.header?.page_title || settingConfig?.header?.page_title,
            header_message: {
                status: newSettings?.header?.header_message?.status || settingConfig?.header?.header_message?.status,
                content: newSettings?.header?.header_message?.content || settingConfig?.header?.header_message?.content
            },
            logo: newSettings?.header?.logo || settingConfig?.header?.logo,
            favicon: newSettings?.header?.favicon || settingConfig?.header?.favicon
        },
        sign_in: {
            type: newSettings?.sign_in?.type || settingConfig?.sign_in?.type,
            color_data: newSettings?.sign_in?.color_data || settingConfig?.sign_in?.color_data,
            bg_data: newSettings?.sign_in?.bg_data || settingConfig?.sign_in?.bg_data,
            bg_video_data: {
                video: newSettings?.sign_in?.bg_video_data?.video || settingConfig?.sign_in?.bg_video_data?.video,
                fallback_image: newSettings?.sign_in?.bg_video_data?.fallback_image || settingConfig?.sign_in?.bg_video_data?.fallback_image
            }
        },
        colorScheme: {
            palette: {
                primary: {
                    main: newSettings?.colors?.primary?.main || settingConfig?.colorScheme?.palette?.primary?.main,
                    light: newSettings?.colors?.primary?.light || settingConfig?.colorScheme?.palette?.primary?.light,
                    dark: newSettings?.colors?.primary?.dark || settingConfig?.colorScheme?.palette?.primary?.dark,
                    lighterOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.38)'
                },
                secondary: {
                    main: newSettings?.colors?.secondary?.main || settingConfig?.colorScheme?.palette?.secondary?.main,
                    light: newSettings?.colors?.secondary?.light || settingConfig?.colorScheme?.palette?.secondary?.light,
                    dark: newSettings?.colors?.secondary?.dark || settingConfig?.colorScheme?.palette?.secondary?.dark,
                    contrastText: newSettings?.colors?.secondary?.contrastText || settingConfig?.colorScheme?.palette?.secondary?.contrastText,
                    lighterOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.38)'
                },
                error: {
                    main: newSettings?.colors?.error?.main || settingConfig?.colorScheme?.palette?.error?.main,
                    light: newSettings?.colors?.error?.light || settingConfig?.colorScheme?.palette?.error?.light,
                    dark: newSettings?.colors?.error?.dark || settingConfig?.colorScheme?.palette?.error?.dark,
                    contrastText: newSettings?.colors?.error?.contrastText || settingConfig?.colorScheme?.palette?.error?.contrastText,
                    lighterOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.38)'
                },
                warning: {
                    main: newSettings?.colors?.warning?.main || settingConfig?.colorScheme?.palette?.warning?.main,
                    light: newSettings?.colors?.warning?.light || settingConfig?.colorScheme?.palette?.warning?.light,
                    dark: newSettings?.colors?.warning?.dark || settingConfig?.colorScheme?.palette?.warning?.dark,
                    contrastText: newSettings?.colors?.warning?.contrastText || settingConfig?.colorScheme?.palette?.warning?.contrastText,
                    lighterOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.38)'
                },
                info: {
                    main: newSettings?.colors?.info?.main || settingConfig?.colorScheme?.palette?.info?.main,
                    light: newSettings?.colors?.info?.light || settingConfig?.colorScheme?.palette?.info?.light,
                    dark: newSettings?.colors?.info?.dark || settingConfig?.colorScheme?.palette?.info?.dark,
                    contrastText: newSettings?.colors?.info?.contrastText || settingConfig?.colorScheme?.palette?.info?.contrastText,
                    lighterOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.38)'
                },
                success: {
                    main: newSettings?.colors?.success?.main || settingConfig?.colorScheme?.palette?.success?.main,
                    light: newSettings?.colors?.success?.light || settingConfig?.colorScheme?.palette?.success?.light,
                    dark: newSettings?.colors?.success?.dark || settingConfig?.colorScheme?.palette?.success?.dark,
                    contrastText: newSettings?.colors?.success?.contrastText || settingConfig?.colorScheme?.palette?.success?.contrastText,
                    lighterOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.38)'
                },
                text: {
                    primary: `rgb(var(--mui-mainColorChannels-light) / 0.9)`,
                    secondary: `rgb(var(--mui-mainColorChannels-light) / 0.7)`,
                    disabled: `rgb(var(--mui-mainColorChannels-light) / 0.4)`,
                    primaryChannel: 'var(--mui-mainColorChannels-light)',
                    secondaryChannel: 'var(--mui-mainColorChannels-light)'
                },
                divider: `rgb(var(--mui-mainColorChannels-light) / 0.12)`,
                dividerChannel: 'var(--mui-mainColorChannels-light)',
                background: {
                    default: newSettings?.colors?.background?.default || settingConfig?.colorScheme?.palette?.background?.default,
                    paper: newSettings?.colors?.background?.paper || settingConfig?.colorScheme?.palette?.background?.paper,
                    paperChannel: '255 255 255'
                },
                action: {
                    active: `rgb(var(--mui-mainColorChannels-light) / 0.6)`,
                    hover: `rgb(var(--mui-mainColorChannels-light) / 0.06)`,
                    selected: `rgb(var(--mui-mainColorChannels-light) / 0.08)`,
                    disabled: `rgb(var(--mui-mainColorChannels-light) / 0.3)`,
                    disabledBackground: `rgb(var(--mui-mainColorChannels-light) / 0.16)`,
                    focus: `rgb(var(--mui-mainColorChannels-light) / 0.1)`,
                    focusOpacity: 0.1,
                    activeChannel: 'var(--mui-mainColorChannels-light)',
                    selectedChannel: 'var(--mui-mainColorChannels-light)'
                },
                Alert: {
                    errorColor: 'var(--mui-palette-error-main)',
                    warningColor: 'var(--mui-palette-warning-main)',
                    infoColor: 'var(--mui-palette-info-main)',
                    successColor: 'var(--mui-palette-success-main)',
                    errorStandardBg: 'var(--mui-palette-error-lightOpacity)',
                    warningStandardBg: 'var(--mui-palette-warning-lightOpacity)',
                    infoStandardBg: 'var(--mui-palette-info-lightOpacity)',
                    successStandardBg: 'var(--mui-palette-success-lightOpacity)',
                    errorFilledColor: 'var(--mui-palette-error-contrastText)',
                    warningFilledColor: 'var(--mui-palette-warning-contrastText)',
                    infoFilledColor: 'var(--mui-palette-info-contrastText)',
                    successFilledColor: 'var(--mui-palette-success-contrastText)',
                    errorFilledBg: 'var(--mui-palette-error-main)',
                    warningFilledBg: 'var(--mui-palette-warning-main)',
                    infoFilledBg: 'var(--mui-palette-info-main)',
                    successFilledBg: 'var(--mui-palette-success-main)'
                },
                Avatar: {
                    defaultBg: newSettings?.colors?.background?.paper || settingConfig?.colorScheme?.palette?.background?.paper
                },
                Chip: {
                    defaultBorder: 'var(--mui-palette-divider)'
                },
                FilledInput: {
                    bg: 'var(--mui-palette-action-hover)',
                    hoverBg: 'var(--mui-palette-action-selected)',
                    disabledBg: 'var(--mui-palette-action-hover)'
                },
                LinearProgress: {
                    primaryBg: 'var(--mui-palette-primary-lightOpacity)',
                    secondaryBg: 'var(--mui-palette-secondary-lightOpacity)',
                    errorBg: 'var(--mui-palette-error-lightOpacity)',
                    warningBg: 'var(--mui-palette-warning-lightOpacity)',
                    infoBg: 'var(--mui-palette-info-lightOpacity)',
                    successBg: 'var(--mui-palette-success-lightOpacity)'
                },
                SnackbarContent: {
                    bg: newSettings?.colors?.background?.paper || settingConfig?.colorScheme?.palette?.background?.paper,
                    color: 'var(--mui-palette-background-paper)'
                },
                Switch: {
                    defaultColor: 'var(--mui-palette-common-white)',
                    defaultDisabledColor: 'var(--mui-palette-common-white)',
                    primaryDisabledColor: 'var(--mui-palette-common-white)',
                    secondaryDisabledColor: 'var(--mui-palette-common-white)',
                    errorDisabledColor: 'var(--mui-palette-common-white)',
                    warningDisabledColor: 'var(--mui-palette-common-white)',
                    infoDisabledColor: 'var(--mui-palette-common-white)',
                    successDisabledColor: 'var(--mui-palette-common-white)'
                },
                Tooltip: {
                    bg: newSettings?.colors?.primary?.main || settingConfig?.colorScheme?.palette?.primary?.main,
                },
                TableCell: {
                    border: 'var(--mui-palette-divider)'
                },
                customColors: {
                    bodyBg: newSettings?.colors?.customColors?.bodyBg || settingConfig?.colorScheme?.palette?.customColors?.bodyBg,
                    chatBg: newSettings?.colors?.customColors?.chatBg || settingConfig?.colorScheme?.palette?.customColors?.chatBg,
                    greyLightBg: newSettings?.colors?.customColors?.greyLightBg || settingConfig?.colorScheme?.palette?.customColors?.greyLightBg,
                    inputBorder: `rgb(var(--mui-mainColorChannels-light) / 0.22)`,
                    tableHeaderBg: newSettings?.colors?.customColors?.tableHeaderBg || settingConfig?.colorScheme?.palette?.customColors?.tableHeaderBg,
                    tooltipText: newSettings?.colors?.customColors?.tooltipText || settingConfig?.colorScheme?.palette?.customColors?.tooltipText,
                    trackBg: newSettings?.colors?.customColors?.trackBg || settingConfig?.colorScheme?.palette?.customColors?.trackBg,
                    headerBg: newSettings?.colors?.background_color || settingConfig?.colorScheme?.palette?.customColors?.headerBg,
                    headerIcon: newSettings?.colors?.icon_color || settingConfig?.colorScheme?.palette?.customColors?.headerIcon,
                    headerIconHover: newSettings?.colors?.customColors?.headerIconHover || settingConfig?.colorScheme?.palette?.customColors?.headerIconHover,
                }
            }
        }
    }

    return settings
}