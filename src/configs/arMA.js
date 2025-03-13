export const arMA = {
    // Calendar navigation
    previousMonth: 'الشهر السابق',
    nextMonth: 'الشهر القادم',

    // View navigation
    openPreviousView: 'فتح العرض السابق',
    openNextView: 'فتح العرض التالي',
    calendarViewSwitchingButtonAriaLabel: view =>
        view === 'year' ? 'عرض السنة مفتوح، انتقل إلى عرض التقويم' : 'عرض التقويم مفتوح، انتقل إلى عرض السنة',

    // DateRange labels
    start: 'البداية',
    end: 'النهاية',
    startDate: 'تاريخ البداية',
    startTime: 'وقت البداية',
    endDate: 'تاريخ النهاية',
    endTime: 'وقت النهاية',

    // Action bar
    cancelButtonLabel: 'إلغاء',
    clearButtonLabel: 'مسح',
    okButtonLabel: 'موافق',
    todayButtonLabel: 'اليوم',

    // Toolbar titles
    datePickerToolbarTitle: 'اختر التاريخ',
    dateTimePickerToolbarTitle: 'اختر التاريخ والوقت',
    timePickerToolbarTitle: 'اختر الوقت',
    dateRangePickerToolbarTitle: 'اختر نطاق التاريخ',

    // Clock labels
    clockLabelText: (view, time, utils, formattedTime) =>
        `اختر ${view}. ${!formattedTime && (time === null || !utils.isValid(time))
            ? 'لم يتم اختيار الوقت'
            : `الوقت المختار هو ${formattedTime ?? utils.format(time, 'fullTime')}`
        }`,
    hoursClockNumberText: hours => `${hours} ساعة`,
    minutesClockNumberText: minutes => `${minutes} دقيقة`,
    secondsClockNumberText: seconds => `${seconds} ثانية`,

    // Digital clock labels
    selectViewText: view => `اختر ${view}`,

    // Calendar labels
    calendarWeekNumberHeaderLabel: 'رقم الأسبوع',
    calendarWeekNumberHeaderText: '#',
    calendarWeekNumberAriaLabelText: weekNumber => `الأسبوع ${weekNumber}`,
    calendarWeekNumberText: weekNumber => `${weekNumber}`,

    // Open picker labels
    openDatePickerDialogue: (value, utils, formattedDate) =>
        formattedDate || (value !== null && utils.isValid(value))
            ? `اختر التاريخ، التاريخ المحدد هو ${formattedDate ?? utils.format(value, 'fullDate')}`
            : 'اختر التاريخ',
    openTimePickerDialogue: (value, utils, formattedTime) =>
        formattedTime || (value !== null && utils.isValid(value))
            ? `اختر الوقت، الوقت المحدد هو ${formattedTime ?? utils.format(value, 'fullTime')}`
            : 'اختر الوقت',
    fieldClearLabel: 'مسح',

    // Table labels
    timeTableLabel: 'اختر الوقت',
    dateTableLabel: 'اختر التاريخ',

    // Field section placeholders
    fieldYearPlaceholder: params => 'س'.repeat(params.digitAmount),
    fieldMonthPlaceholder: params => (params.contentType === 'letter' ? 'شهر' : 'شش'),
    fieldDayPlaceholder: () => 'يي',
    fieldWeekDayPlaceholder: params => (params.contentType === 'letter' ? 'يوم' : 'ي'),
    fieldHoursPlaceholder: () => 'سس',
    fieldMinutesPlaceholder: () => 'دد',
    fieldSecondsPlaceholder: () => 'ثث',
    fieldMeridiemPlaceholder: () => 'ص/م',

    // View names
    year: 'السنة',
    month: 'الشهر',
    day: 'اليوم',
    weekDay: 'يوم الأسبوع',
    hours: 'الساعات',
    minutes: 'الدقائق',
    seconds: 'الثواني',
    meridiem: 'الفترة',

    // Common
    empty: 'فارغ'
}