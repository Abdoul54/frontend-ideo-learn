'use client'

import { memo, useCallback, useMemo, useState } from 'react'

import {
    Box,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Checkbox,
    FormControlLabel
} from '@mui/material'

// Import dayjs and date pickers
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

const ActivityLogsFilter = memo(({ onFilter }) => {
    // Initial filter state matching API parameters (excluding per_page, page, and search_text)
    const [filters, setFilters] = useState({
        action: '',
        status: '',
        start_date: '',
        end_date: '',
        user_id: '',
        ip_address: '',
        get_total_count: false,
        include_stats: false,
        period: ''
    })

    // console.log('Activity Filters:', filters);
    
    // Status options from API documentation
    const statusOptions = [
        { value: 'success', label: 'Success' },
        { value: 'error', label: 'Error' },
        { value: 'pending', label: 'Pending' }
    ]

    // Period options from API documentation
    const periodOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'this_week', label: 'This Week' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'this_year', label: 'This Year' },
        { value: 'custom', label: 'Custom Period' }
    ]

    // Handle input changes
    const handleChange = useCallback((field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }))
    }, [])

    // Handle date changes
    const handleDateChange = useCallback((field, date) => {
        if (date) {
            const formattedDate = dayjs(date).format('YYYY-MM-DD')
            handleChange(field, formattedDate)
        } else {
            handleChange(field, '')
        }
    }, [handleChange])

    // Handle period selection
    const handlePeriodChange = useCallback((period) => {
        // Update period
        handleChange('period', period)

        // Clear custom dates if predefined period is selected
        if (period !== 'custom') {
            handleChange('start_date', '')
            handleChange('end_date', '')
        }
    }, [handleChange])

    // Show date pickers only when period is 'custom'
    const showDatePickers = useMemo(() =>
        filters.period === 'custom' || (!filters.period && (filters.start_date || filters.end_date)),
        [filters.period, filters.start_date, filters.end_date]
    )

    // Apply filters
    const handleApply = useCallback(() => {
        // Remove empty values and convert boolean checkboxes
        const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            // Skip empty strings but keep boolean values
            if (value === '' && typeof value !== 'boolean') return acc

            // For boolean values, only include if true
            if (typeof value === 'boolean' && !value) return acc

            acc[key] = value
            return acc
        }, {})

        // Call the onFilter callback with cleaned filters
        onFilter(cleanedFilters)
    }, [filters, onFilter])

    // Reset filters
    const handleReset = useCallback(() => {
        setFilters({
            action: '',
            status: '',
            start_date: '',
            end_date: '',
            user_id: '',
            ip_address: '',
            get_total_count: false,
            include_stats: false,
            period: ''
        })
        onFilter(null)
    }, [onFilter])

    return (
        <Box
            sx={{
                p: 2,
                bgcolor: 'background.paper',
                width: '100%',
                borderRadius: 1,
                boxShadow: 1
            }}
        >
            <Stack spacing={3}>
                {/* First row of filters */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        label="Action"
                        size="small"
                        fullWidth
                        value={filters.action}
                        onChange={(e) => handleChange('action', e.target.value)}
                        placeholder="e.g. login"
                        helperText="Filter logs by specific action type"
                    />

                    <FormControl size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status}
                            label="Status"
                            onChange={(e) => handleChange('status', e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="User ID"
                        size="small"
                        fullWidth
                        value={filters.user_id}
                        onChange={(e) => handleChange('user_id', e.target.value)}
                        placeholder="e.g. 1"
                        helperText="Filter logs by user ID"
                    />
                </Stack>

                {/* Second row of filters */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        label="IP Address"
                        size="small"
                        fullWidth
                        value={filters.ip_address}
                        onChange={(e) => handleChange('ip_address', e.target.value)}
                        placeholder="e.g. 192.168.1"
                        helperText="Filter logs by IP address"
                    />

                    <FormControl size="small" fullWidth>
                        <InputLabel>Period</InputLabel>
                        <Select
                            value={filters.period}
                            label="Period"
                            onChange={(e) => handlePeriodChange(e.target.value)}
                        >
                            {periodOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>

                {/* Date pickers (only shown when period is 'custom' or not set) */}
                {showDatePickers && (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <DatePicker
                            label="Start Date"
                            value={filters.start_date ? dayjs(filters.start_date) : null}
                            onChange={(date) => handleDateChange('start_date', date)}
                            slotProps={{ textField: { size: 'small', fullWidth: true, helperText: 'Filter from this date' } }}
                        />

                        <DatePicker
                            label="End Date"
                            value={filters.end_date ? dayjs(filters.end_date) : null}
                            onChange={(date) => handleDateChange('end_date', date)}
                            slotProps={{ textField: { size: 'small', fullWidth: true, helperText: 'Filter until this date' } }}
                        />
                    </Stack>
                )}

                {/* Additional options */}
                <Stack direction="row" spacing={4} sx={{ pl: 1 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={filters.get_total_count}
                                onChange={(e) => handleChange('get_total_count', e.target.checked)}
                            />
                        }
                        label="Get Total Count"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={filters.include_stats}
                                onChange={(e) => handleChange('include_stats', e.target.checked)}
                            />
                        }
                        label="Include Statistics"
                    />
                </Stack>

                {/* Action buttons */}
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        onClick={handleApply}
                        startIcon={<i className="solar-filter-bold-duotone" />}
                    >
                        Apply Filters
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handleReset}
                        startIcon={<i className="solar-refresh-bold-duotone" />}
                    >
                        Reset Filters
                    </Button>
                </Stack>
            </Stack>
        </Box>
    )
})

ActivityLogsFilter.displayName = 'ActivityLogsFilter'

export default ActivityLogsFilter