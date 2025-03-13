import settingConfig from '@/configs/settingConfig';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const theme = {
        "templateName": "Gamma",
        "settingsCookieName": "gamma-settings",
        "language": {
            "locale": "fr",
            "direction": "ltr"
        },
        "colorScheme": {
            "palette": {
                "primary": {
                    "main": "#673AB7",
                    "light": "#9A67EA",
                    "dark": "#320B86",
                    "lighterOpacity": "rgb(var(--mui-palette-primary-mainChannel) / 0.15)",
                    "lightOpacity": "rgb(var(--mui-palette-primary-mainChannel) / 0.25)",
                    "mainOpacity": "rgb(var(--mui-palette-primary-mainChannel) / 0.35)",
                    "darkOpacity": "rgb(var(--mui-palette-primary-mainChannel) / 0.45)"
                },
                "secondary": {
                    "main": "#FF5252",
                    "light": "#FF867F",
                    "dark": "#D50000",
                    "contrastText": "#FFF"
                },
                "background": {
                    "default": "#F1F8E9",
                    "paper": "#F9FBE7"
                },
                "text": {
                    "primary": "rgb(var(--mui-mainColorChannels-light) / 0.8)",
                    "secondary": "rgb(var(--mui-mainColorChannels-light) / 0.6)"
                },
                "customColors": {
                    "bodyBg": "#F3E5F5",
                    "headerBg": "#512DA8",
                    "headerIcon": "#FF4081",
                    "headerIconHover": "#9A67EA"
                }
            }
        }
    }

    const settings = {
        templateName: theme?.templateName || settingConfig?.templateName,
        settingsCookieName: theme?.settingsCookieName || settingConfig?.settingsCookieName,
        mode: theme?.mode || settingConfig?.mode,
        skin: theme?.skin || settingConfig?.skin,
        semiDark: theme?.semiDark || settingConfig?.semiDark,
        layout: theme?.layout || settingConfig?.layout,
        layoutPadding: theme?.layoutPadding || settingConfig?.layoutPadding,
        compactContentWidth: theme?.compactContentWidth || settingConfig?.compactContentWidth,
        navbar: {
            type: theme?.navbar?.type || settingConfig?.navbar?.type,
            contentWidth: theme?.navbar?.contentWidth || settingConfig?.navbar?.contentWidth,
            floating: theme?.navbar?.floating || settingConfig?.navbar?.floating,
            detached: theme?.navbar?.detached || settingConfig?.navbar?.detached,
            blur: theme?.navbar?.blur || settingConfig?.navbar?.blur
        },
        contentWidth: theme?.contentWidth || settingConfig?.contentWidth,
        footer: {
            type: theme?.footer?.type || settingConfig?.footer?.type,
            contentWidth: theme?.footer?.contentWidth || settingConfig?.footer?.contentWidth,
            detached: theme?.footer?.detached || settingConfig?.footer?.detached
        },
        disableRipple: theme?.disableRipple || settingConfig?.disableRipple,
        toastPosition: theme?.toastPosition || settingConfig?.toastPosition,
        language: {
            locale: theme?.language?.locale || settingConfig?.language?.locale,
            direction: theme?.language?.direction || settingConfig?.language?.direction
        },
        colorScheme: {
            palette: {
                primary: {
                    main: theme?.colorScheme?.palette?.primary?.main || settingConfig?.colorScheme?.palette?.primary?.main,
                    light: theme?.colorScheme?.palette?.primary?.light || settingConfig?.colorScheme?.palette?.primary?.light,
                    dark: theme?.colorScheme?.palette?.primary?.dark || settingConfig?.colorScheme?.palette?.primary?.dark,
                    lighterOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.38)'
                },
                secondary: {
                    main: theme?.colorScheme?.palette?.secondary?.main || settingConfig?.colorScheme?.palette?.secondary?.main,
                    light: theme?.colorScheme?.palette?.secondary?.light || settingConfig?.colorScheme?.palette?.secondary?.light,
                    dark: theme?.colorScheme?.palette?.secondary?.dark || settingConfig?.colorScheme?.palette?.secondary?.dark,
                    contrastText: theme?.colorScheme?.palette?.secondary?.contrastText || settingConfig?.colorScheme?.palette?.secondary?.contrastText,
                    lighterOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.38)'
                },
                error: {
                    main: theme?.colorScheme?.palette?.error?.main || settingConfig?.colorScheme?.palette?.error?.main,
                    light: theme?.colorScheme?.palette?.error?.light || settingConfig?.colorScheme?.palette?.error?.light,
                    dark: theme?.colorScheme?.palette?.error?.dark || settingConfig?.colorScheme?.palette?.error?.dark,
                    contrastText: theme?.colorScheme?.palette?.error?.contrastText || settingConfig?.colorScheme?.palette?.error?.contrastText,
                    lighterOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.38)'
                },
                warning: {
                    main: theme?.colorScheme?.palette?.warning?.main || settingConfig?.colorScheme?.palette?.warning?.main,
                    light: theme?.colorScheme?.palette?.warning?.light || settingConfig?.colorScheme?.palette?.warning?.light,
                    dark: theme?.colorScheme?.palette?.warning?.dark || settingConfig?.colorScheme?.palette?.warning?.dark,
                    contrastText: theme?.colorScheme?.palette?.warning?.contrastText || settingConfig?.colorScheme?.palette?.warning?.contrastText,
                    lighterOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.38)'
                },
                info: {
                    main: theme?.colorScheme?.palette?.info?.main || settingConfig?.colorScheme?.palette?.info?.main,
                    light: theme?.colorScheme?.palette?.info?.light || settingConfig?.colorScheme?.palette?.info?.light,
                    dark: theme?.colorScheme?.palette?.info?.dark || settingConfig?.colorScheme?.palette?.info?.dark,
                    contrastText: theme?.colorScheme?.palette?.info?.contrastText || settingConfig?.colorScheme?.palette?.info?.contrastText,
                    lighterOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.08)',
                    lightOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.16)',
                    mainOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.24)',
                    darkOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.32)',
                    darkerOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.38)'
                },
                success: {
                    main: theme?.colorScheme?.palette?.success?.main || settingConfig?.colorScheme?.palette?.success?.main,
                    light: theme?.colorScheme?.palette?.success?.light || settingConfig?.colorScheme?.palette?.success?.light,
                    dark: theme?.colorScheme?.palette?.success?.dark || settingConfig?.colorScheme?.palette?.success?.dark,
                    contrastText: theme?.colorScheme?.palette?.success?.contrastText || settingConfig?.colorScheme?.palette?.success?.contrastText,
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
                    default: theme?.colorScheme?.palette?.background?.default || settingConfig?.colorScheme?.palette?.background?.default,
                    paper: theme?.colorScheme?.palette?.background?.paper || settingConfig?.colorScheme?.palette?.background?.paper,
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
                    defaultBg: theme?.colorScheme?.palette?.background?.paper || settingConfig?.colorScheme?.palette?.background?.paper
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
                    bg: theme?.colorScheme?.palette?.background?.paper || settingConfig?.colorScheme?.palette?.background?.paper,
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
                    bg: theme?.colorScheme?.palette?.primary?.main || settingConfig?.colorScheme?.palette?.primary?.main,
                },
                TableCell: {
                    border: 'var(--mui-palette-divider)'
                },
                customColors: {
                    bodyBg: theme?.colorScheme?.palette?.customColors?.bodyBg || settingConfig?.colorScheme?.palette?.customColors?.bodyBg,
                    chatBg: theme?.colorScheme?.palette?.customColors?.chatBg || settingConfig?.colorScheme?.palette?.customColors?.chatBg,
                    greyLightBg: theme?.colorScheme?.palette?.customColors?.greyLightBg || settingConfig?.colorScheme?.palette?.customColors?.greyLightBg,
                    inputBorder: `rgb(var(--mui-mainColorChannels-light) / 0.22)`,
                    tableHeaderBg: theme?.colorScheme?.palette?.customColors?.tableHeaderBg || settingConfig?.colorScheme?.palette?.customColors?.tableHeaderBg,
                    tooltipText: theme?.colorScheme?.palette?.customColors?.tooltipText || settingConfig?.colorScheme?.palette?.customColors?.tooltipText,
                    trackBg: theme?.colorScheme?.palette?.customColors?.trackBg || settingConfig?.colorScheme?.palette?.customColors?.trackBg,
                    headerBg: theme?.colorScheme?.palette?.customColors?.headerBg || settingConfig?.colorScheme?.palette?.customColors?.headerBg,
                    headerIcon: theme?.colorScheme?.palette?.customColors?.headerIcon || settingConfig?.colorScheme?.palette?.customColors?.headerIcon,
                    headerIconHover: theme?.colorScheme?.palette?.customColors?.headerIconHover || settingConfig?.colorScheme?.palette?.customColors?.headerIconHover,
                }
            }
        }
    }

    return NextResponse.json({ ...settings });
}