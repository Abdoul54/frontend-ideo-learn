'use client'

import { memo, useCallback, useMemo, useState } from 'react'

import {
  Box,
  Button,
  Stack,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Checkbox,
  FormControlLabel
} from '@mui/material'

// Import dayjs and date pickers
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// Map the filter types from column definitions to our internal operators
const FILTER_TYPE_TO_OPERATOR = {
  equals: { value: 'equals', label: 'Equals' },
  not_equals: { value: 'not_equals', label: 'Does not equal' },
  contains: { value: 'contains', label: 'Contains' },
  starts_with: { value: 'starts_with', label: 'Starts with' },
  ends_with: { value: 'ends_with', label: 'Ends with' },
  greater_than: { value: 'greater_than', label: 'Greater than' },
  less_than: { value: 'less_than', label: 'Less than' },
  between: { value: 'between', label: 'Between', requiresTwoValues: true },
  is_null: { value: 'is_null', label: 'Is empty', requiresFilterValue: false },
  is_not_null: { value: 'is_not_null', label: 'Is not empty', requiresFilterValue: false }
}

// Default filter operators for each type if not specified in column definition
const DEFAULT_FILTER_OPERATORS = {
  text: [
    'equals',
    'not_equals',
    'contains',
    'starts_with',
    'ends_with',
    'is_null',
    'is_not_null'
  ],
  number: [
    'equals',
    'not_equals',
    'greater_than',
    'less_than',
    'is_null',
    'is_not_null'
  ],
  date: [
    'equals',
    'not_equals',
    'greater_than',
    'less_than',
    'is_null',
    'is_not_null'
  ],
  datetime: [
    'equals',
    'not_equals',
    'greater_than',
    'less_than',
    'is_null',
    'is_not_null'
  ],
  select: [
    'equals',
    'not_equals',
    'is_null',
    'is_not_null'
  ],
  boolean: [
    'equals',
    'not_equals'
  ],
  email: [
    'equals',
    'not_equals',
    'contains',
    'starts_with',
    'ends_with',
    'is_null',
    'is_not_null'
  ]
}

const FilterRow = memo(({ filter, columns, onUpdate, onRemove, onAdd, isLast, isOnly }) => {
  const column = useMemo(
    () => columns.find(c => c.id === filter.field || c.id === filter.field),
    [columns, filter.field]
  )

  // Get available filter operators for the selected column
  const availableOperators = useMemo(() => {
    if (!column) return []

    // Use the filters array from the column definition if available
    if (column.filters && Array.isArray(column.filters)) {
      return column.filters.map(filterType => FILTER_TYPE_TO_OPERATOR[filterType])
        .filter(Boolean) // Remove any undefined operators
    }

    // Otherwise use default operators based on column type
    const columnType = column.type || 'text'
    const defaultFilters = DEFAULT_FILTER_OPERATORS[columnType] || DEFAULT_FILTER_OPERATORS.text

    return defaultFilters.map(filterType => FILTER_TYPE_TO_OPERATOR[filterType])
      .filter(Boolean)
  }, [column])

  const selectedOperator = useMemo(
    () => availableOperators.find(op => op.value === filter.operator),
    [availableOperators, filter.operator]
  )

  const handleDateChange = (date, field) => {
    if (date) {
      const formattedDate = dayjs(date).format('YYYY-MM-DD')
      onUpdate(field, formattedDate)
    } else {
      onUpdate(field, '')
    }
  }

  const renderInput = () => {
    if (!filter.operator || selectedOperator?.requiresFilterValue === false) return null

    if (!column) return null

    // Handle different input types based on column type
    switch (column.type) {
      case 'number':
        return (
          <TextField
            size='small'
            type='number'
            label='Value'
            sx={{ flex: 1 }}
            value={filter.value}
            onChange={e => onUpdate('value', e.target.value)}
            inputProps={{ step: 'any' }}
          />
        )
      case 'date':
      case 'datetime':
        return (
          <DatePicker
            label="Value"
            value={filter.value ? dayjs(filter.value) : null}
            onChange={(date) => handleDateChange(date, 'value')}
            slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
          />
        )
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={filter.value === 'true'}
                onChange={e => onUpdate('value', e.target.checked ? 'true' : 'false')}
              />
            }
            label="True"
            sx={{ flex: 1 }}
          />
        )
      case 'select':
        // Check if the column has options
        if (column.options && Array.isArray(column.options)) {
          return (
            <FormControl size='small' sx={{ flex: 1 }}>
              <InputLabel>Value</InputLabel>
              <Select
                value={filter.value || ''}
                onChange={e => onUpdate('value', e.target.value)}
                label='Value'
              >
                {column.options.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )
        }
        return (
          <TextField
            size='small'
            label='Value'
            sx={{ flex: 1 }}
            value={filter.value}
            onChange={e => onUpdate('value', e.target.value)}
          />
        )
      default:
        return (
          <TextField
            size='small'
            label='Value'
            sx={{ flex: 1 }}
            value={filter.value}
            onChange={e => onUpdate('value', e.target.value)}
          />
        )
    }
  }

  // Add second value input for "between" operator
  const renderSecondInput = () => {
    if (!selectedOperator?.requiresTwoValues) return null

    if (!column) return null

    switch (column.type) {
      case 'number':
        return (
          <TextField
            size='small'
            type='number'
            label='Second Value'
            sx={{ flex: 1 }}
            value={filter.secondValue || ''}
            onChange={e => onUpdate('secondValue', e.target.value)}
            inputProps={{ step: 'any' }}
          />
        )
      case 'date':
      case 'datetime':
        return (
          <DatePicker
            label="Second Value"
            value={filter.secondValue ? dayjs(filter.secondValue) : null}
            onChange={(date) => handleDateChange(date, 'secondValue')}
            slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
          />
        )
      default:
        return null
    }
  }

  const canAdd =
    isLast &&
    filter.field &&
    filter.operator &&
    (selectedOperator?.requiresFilterValue === false ||
      (filter.value && (!selectedOperator?.requiresTwoValues || filter.secondValue)))

  const filteredColumns = useMemo(() =>
    columns.filter(col => col.header && !col.id?.includes('actions')),
    [columns]
  )

  return (
    <Stack direction='row' spacing={2} alignItems='center' flexWrap="wrap">
      <FormControl size='small' sx={{ flex: 1, minWidth: '200px' }}>
        <InputLabel>Field</InputLabel>
        <Select
          value={filter.field || ''}
          onChange={e => onUpdate('field', e.target.value)}
          label='Field'
        >
          {filteredColumns.map(col => (
            <MenuItem key={col.id || col.id} value={col.id || col.id}>
              {col.header}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size='small' sx={{ flex: 1, minWidth: '200px' }}>
        <InputLabel>Operator</InputLabel>
        <Select
          value={filter.operator || ''}
          onChange={e => onUpdate('operator', e.target.value)}
          label='Operator'
          disabled={!filter.field}
        >
          {availableOperators.map(op => (
            <MenuItem key={op.value} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {renderInput()}
      {renderSecondInput()}

      <Stack direction='row' spacing={1}>
        <IconButton
          onClick={onRemove}
          disabled={isOnly}
          size='small'
          sx={{
            border: 1,
            borderColor: 'divider',
            '&:hover': { bgcolor: 'error.lighter' }
          }}
        >
          <i className='solar-trash-bin-minimalistic-bold-duotone' />
        </IconButton>
        <IconButton
          onClick={onAdd}
          size='small'
          disabled={!canAdd}
          sx={{
            border: 1,
            borderColor: 'divider',
            '&:hover': { bgcolor: 'primary.lighter' }
          }}
        >
          <i className='solar-add-circle-bold-duotone' />
        </IconButton>
      </Stack>
    </Stack>
  )
})

export const DataTableFilter = memo(({ filters, columns, onFilter }) => {
  // Convert incoming object-style filters to array format for UI
  const convertFiltersToArray = useCallback((filterObj) => {
    if (!filterObj || Object.keys(filterObj).length === 0) {
      return [{ id: Date.now(), field: '', operator: '', value: '' }];
    }

    return Object.entries(filterObj).map(([field, details]) => ({
      id: Date.now() + Math.random(),
      field,
      operator: details.operator,
      value: details.value,
      secondValue: details.secondValue
    }));
  }, []);

  // Initialize state with converted filters
  const [localFilters, setLocalFilters] = useState(() =>
    convertFiltersToArray(filters)
  );

  const handleUpdate = useCallback((id, key, value) => {
    setLocalFilters(prev =>
      prev.map(f => (f.id === id ? {
        ...f,
        [key]: value,
        ...(key === 'field' && { operator: '', value: '', secondValue: '' }),
        ...(key === 'operator' && { value: '', secondValue: '' })
      } : f))
    )
  }, [])

  const handleAdd = useCallback(() => {
    setLocalFilters(prev => [...prev, { id: Date.now(), field: '', operator: '', value: '' }])
  }, [])

  const handleRemove = useCallback(id => {
    setLocalFilters(prev => {
      const newFilters = prev.filter(f => f.id !== id)
      return newFilters.length ? newFilters : [{ id: Date.now(), field: '', operator: '', value: '' }]
    })
  }, [])

  const handleApply = useCallback(() => {
    const validFilters = localFilters.filter(f => {
      const column = columns.find(c => c.id === f.field || c.id === f.field)
      if (!column || !f.field || !f.operator) return false

      const operator = FILTER_TYPE_TO_OPERATOR[f.operator] || { value: f.operator }

      if (operator.requiresFilterValue === false) return true
      if (!f.value) return false
      if (operator.requiresTwoValues && !f.secondValue) return false

      return true
    });

    // Convert array format back to object format for API
    const filterObject = {};
    validFilters.forEach(({ field, operator, value, secondValue }) => {
      filterObject[field] = {
        operator,
        value,
        ...(secondValue && { secondValue })
      };
    });

    onFilter(filterObject);
  }, [localFilters, columns, onFilter])

  const handleReset = useCallback(() => {
    setLocalFilters([{ id: Date.now(), field: '', operator: '', value: '' }])
    onFilter(null)
  }, [onFilter])

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        width: '100%'
      }}
    >
      <Stack spacing={2}>
        {localFilters.map((filter, index) => (
          <FilterRow
            key={filter.id}
            filter={filter}
            columns={columns}
            onUpdate={(key, value) => handleUpdate(filter.id, key, value)}
            onRemove={() => handleRemove(filter.id)}
            onAdd={handleAdd}
            isLast={index === localFilters.length - 1}
            isOnly={localFilters.length === 1}
          />
        ))}

        <Stack direction='row' spacing={2}>
          <Button variant='contained' onClick={handleApply} startIcon={<i className='solar-filter-bold-duotone' />}>
            Apply Filters
          </Button>
          <Button variant='outlined' onClick={handleReset} startIcon={<i className='solar-refresh-bold-duotone' />}>
            Reset
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
})

DataTableFilter.displayName = 'DataTableFilter'
FilterRow.displayName = 'FilterRow'

export default DataTableFilter