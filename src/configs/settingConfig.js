
const settingConfig = {
  templateName: 'IDEO Learn',
  settingsCookieName: 'app-settings',
  mode: 'light', // 'system', 'light', 'dark'
  skin: 'bordered', // 'default', 'bordered'
  semiDark: false, // true, false
  layout: 'horizontal', // 'vertical', 'collapsed', 'horizontal'
  layoutPadding: 24, // Common padding for header, content, footer layout components (in px)
  compactContentWidth: 1440, // in px
  navbar: {
    type: 'fixed', // 'fixed', 'static'
    contentWidth: 'wide', // 'compact', 'wide'
    floating: false, //! true, false (This will not work in the Horizontal Layout)
    detached: true, //! true, false (This will not work in the Horizontal Layout or floating navbar is enabled)
    blur: false // true, false
  },
  contentWidth: 'width', // 'compact', 'wide'
  footer: {
    type: 'static', // 'fixed', 'static'
    contentWidth: 'compact', // 'compact', 'wide'
    detached: true //! true, false (This will not work in the Horizontal Layout)
  },
  disableRipple: false, // true, false
  toastPosition: 'top-right', // 'top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-center', 'bottom-left'
  language: {
    locale: 'en', // 'ar', 'en', 'es', 'fr', 'de', 'pt', 'ja', 'zh', 'ru'
    direction: 'ltr' // 'ltr', 'rtl'
  },
  "navigation": {
    "items": [
      {
        icon: 'solar-widget-5-bold-duotone',
        label: 'Dashboard',
        path: '/dashboard'
      },
      {
        icon: 'solar-lock-bold-duotone',
        label: 'SSL Management',
        path: '/ssl-management'
      },
      {
        icon: 'solar-link-square-bold-duotone',
        label: 'Custom Domain Management',
        path: '/custom-domain-management'
      },
      {
        icon: 'solar-window-frame-bold-duotone',
        label: 'Tenant Management',
        path: '/tenant-management'
      }
    ]
  },
  "header": {
    "page_title": "IDEO Learn",
    "header_message": {
      "status": "disabled",
      "content": ""
    },
    "logo": "https://api-mvp-dev.ideosandbox.com/app/logo.png",
    "favicon": "https://api-mvp-dev.ideosandbox.com/app/logo.png"
  },
  "sign_in": {
    "type": "color",
    "color_data": "#FFFFFF",
    "bg_data": null,
    "bg_video_data": {
      "video": null,
      "fallback_image": null
    }
  },
  colorScheme: {
    palette: {
      primary: {
        main: '#C2171A',
        light: '#8589FF',
        dark: '#5C61E6',
        lighterOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)',
        lightOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.16)',
        mainOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.24)',
        darkOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.32)',
        darkerOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.38)'
      },
      secondary: {
        main: '#6D788D',
        light: '#8A93A4',
        dark: '#626C7F',
        contrastText: '#FFF',
        lighterOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.08)',
        lightOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.16)',
        mainOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.24)',
        darkOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.32)',
        darkerOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.38)'
      },
      error: {
        main: '#FF4D49',
        light: '#FF716D',
        dark: '#E64542',
        contrastText: '#FFF',
        lighterOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.08)',
        lightOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.16)',
        mainOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.24)',
        darkOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.32)',
        darkerOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.38)'
      },
      warning: {
        main: '#FDB528',
        light: '#FDC453',
        dark: '#E4A324',
        contrastText: '#FFF',
        lighterOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.08)',
        lightOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.16)',
        mainOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.24)',
        darkOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.32)',
        darkerOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.38)'
      },
      info: {
        main: '#26C6F9',
        light: '#51D1FA',
        dark: '#22B3E1',
        contrastText: '#FFF',
        lighterOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.08)',
        lightOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.16)',
        mainOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.24)',
        darkOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.32)',
        darkerOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.38)'
      },
      success: {
        main: '#72E128',
        light: '#8EE753',
        dark: '#67CB24',
        contrastText: '#FFF',
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
        default: '#F7F7F9',
        paper: '#FFFFFF',
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
        defaultBg: '#F0EFF0'
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
        bg: '#282A42',
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
        bg: '#282A42'
      },
      TableCell: {
        border: 'var(--mui-palette-divider)'
      },
      customColors: {
        bodyBg: '#F7F7F9',
        chatBg: '#F7F6FA',
        greyLightBg: '#FAFAFA',
        inputBorder: `rgb(var(--mui-mainColorChannels-light) / 0.22)`,
        tableHeaderBg: '#F5F5F7',
        tooltipText: '#FFFFFF',
        trackBg: '#F5F5F8',
        headerBg: '#FFFFFF',
        headerIcon: 'rgb(var(--mui-mainColorChannels-light) / 0.9)',
        headerIconHover: '#5C61E6'
      }
    }
  }
}

export default settingConfig
