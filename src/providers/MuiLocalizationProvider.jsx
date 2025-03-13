'use client'

import { LocalizationProvider } from '@mui/x-date-pickers'
import 'dayjs/locale/ar'

import { useSettings } from '@/@core/contexts/settingsContext'
import { getLocale } from '@/utils/getters/getLocale'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


export function MuiLocalizationProvider({ children }) {
    const { settings } = useSettings()

    const { localeText, adapterLocale } = getLocale(settings?.language?.locale)

    const dateFormats = {
        // Day formats
        dayOfMonth: 'D', // 1, 2, ..., 31
        dayOfMonthFull: 'DD', // 01, 02, ..., 31

        // Date formats
        fullDate: 'DD-MM-YYYY', // 2024-03-22
        normalDate: 'DD/MM/YYYY', // 22/03/2024
        shortDate: 'MM/DD', // 03/22

        // Date with weekday
        normalDateWithWeekday: 'ddd, MMM D', // Fri, Mar 22

        // Month formats
        month: 'MMMM', // March
        monthShort: 'MMM', // Mar

        // Weekday formats
        weekday: 'dddd', // Friday
        weekdayShort: 'ddd', // Fri

        // Year format
        year: 'YYYY', // 2024

        // Time formats
        fullTime: 'HH:mm:ss', // 14:30:00
        fullTime12h: 'hh:mm:ss A', // 02:30:00 PM
        fullTime24h: 'HH:mm:ss', // 14:30:00
        hours12h: 'hh', // 02
        hours24h: 'HH', // 14
        minutes: 'mm', // 30
        seconds: 'ss', // 00
        meridiem: 'A', // AM/PM

        // Keyboard input formats
        keyboardDate: 'DD-MM-YYYY', // 2024-03-22
        keyboardDateTime: 'DD-MM-YYYY HH:mm', // 2024-03-22 14:30
        keyboardDateTime12h: 'DD-MM-YYYY hh:mm A', // 2024-03-22 02:30 PM
        keyboardDateTime24h: 'DD-MM-YYYY HH:mm' // 2024-03-22 14:30
    }

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            dateFormats={dateFormats}
            adapterLocale={adapterLocale}
            localeText={localeText}
        >
            {children}
        </LocalizationProvider>
    )
}