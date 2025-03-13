import { enUS, frFR } from '@mui/x-date-pickers/locales'

import { arMA } from '@/configs/arMA'

import 'dayjs/locale/ar'
import 'dayjs/locale/en'
import 'dayjs/locale/fr'

export const getLocale = locale => {
    switch (locale) {
        case 'ar':
            return {
                adapterLocale: 'ar',
                localeText: arMA
            }
        case 'en':
            return {
                adapterLocale: 'en',
                localeText: enUS.components.MuiLocalizationProvider.defaultProps.localeText
            }
        case 'fr':
            return {
                adapterLocale: 'fr',
                localeText: frFR.components.MuiLocalizationProvider.defaultProps.localeText
            }
        default:
            return {
                adapterLocale: 'en',
                localeText: enUS.components.MuiLocalizationProvider.defaultProps.localeText
            }
    }
}