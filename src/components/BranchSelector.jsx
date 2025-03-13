import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Typography,
  Button,
  Breadcrumbs,
} from '@mui/material';
import CheckboxesGroup from '@/components/inputs/CheckboxesGroup';
import RadioButtonsGroup from '@/components/inputs/RadioButtonsGroup';
import { useHistoryNavigation } from '@/hooks/useHistoryNavigation';
import { useHaykal } from '@/hooks/api/tenant/useHaykal';

const BranchSelector = ({
  control,
  name,
  selectedValues = [],
  onChange,
  singleSelect = false,
  onBranchSelect,
  resetKey,
}) => {
  // State management
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

  // Branch navigation - properly destructured based on your hook
  const {
    history,
    currentItem,
    goForward,
    goBack,
    goToBreadcrumb,
    setCurrentItem
  } = useHistoryNavigation(
    { id: 1, title: 'Platform' },
    (item, action) => {
      if (action === 'forward') {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
        setSearchInput('');
      }
    }
  );

  // Manual reset function using the available methods
  const manualReset = () => {
    // Reset to the root item
    const rootItem = { id: 1, title: 'Platform' };

    // Use setCurrentItem if it's a function
    if (typeof setCurrentItem === 'function') {
      setCurrentItem(rootItem);
    }

    // Also reset history by going to the first breadcrumb if possible
    if (history && history.length > 0 && typeof goToBreadcrumb === 'function') {
      goToBreadcrumb(history[0]);
    }

    // Reset pagination and search
    setPagination({ pageIndex: 0, pageSize: 15 });
    setSearchInput('');
  };

  // Reset when resetKey changes
  useEffect(() => {
    if (resetKey) {
      manualReset();
    }
  }, [resetKey]);

  // Data fetching
  const { data: haykalData, isLoading: isHaykalLoading } = useHaykal({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    search: searchInput,
    haykal_id: currentItem?.id,
  });

  // Handlers
  const handleSearchChange = (value) => {
    setSearchInput(value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleHaykalItemClick = (id, title) => {
    if (typeof goForward === 'function') {
      goForward({ id, title });
    }
  };

  // Selection handler for radio buttons (single select mode)
  const handleRadioSelectionChange = (selectedId) => {
    if (typeof onChange === 'function') {
      onChange(selectedId);
    }

    if (typeof onBranchSelect === 'function') {
      if (selectedId) {
        const selectedItem = items.find(item => item.id === selectedId);
        if (selectedItem) {
          onBranchSelect(selectedItem);
        }
      } else {
        onBranchSelect({ id: 1, title: 'Platform (Default)' });
      }
    }
  };

  // Selection handler for checkboxes (multi-select mode)
  const handleCheckboxSelectionChange = (newSelectedValues) => {
    if (typeof onChange === 'function') {
      onChange(newSelectedValues);
    }

    if (typeof onBranchSelect === 'function') {
      if (newSelectedValues.length === 1) {
        const selectedItem = items.find(item => item.id === newSelectedValues[0]);
        if (selectedItem) {
          onBranchSelect(selectedItem);
        }
      } else if (newSelectedValues.length === 0) {
        onBranchSelect({ id: 1, title: 'Platform (Default)' });
      }
    }
  };

  // Process items for display - ensure it's never undefined
  const items = [
    ...(haykalData?.data?.items || [])
      .filter(item => item && item.id != null && !isNaN(item.id))
      .map(item => ({
        id: item.id,
        title: item.title || item.name ||
          (item.translations && (item.translations.all || item.translations.en)) ||
          item.code || 'Unnamed Item',
        has_children: Boolean(item.has_children),
        _style: {
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:hover': { backgroundColor: 'action.hover' },
        },
      })),
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Breadcrumbs */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        {history && history.length > 1 && (
          <IconButton onClick={goBack} size="small">
            <i className="lucide-chevron-left" />
          </IconButton>
        )}
        <Breadcrumbs separator="›">
          {history && history.map((item, index) => (
            <Button
              key={index}
              variant="text"
              color={currentItem && currentItem.id === item.id ? 'primary' : 'inherit'}
              onClick={() => goToBreadcrumb(item)}
            >
              {item.title}
            </Button>
          ))}
        </Breadcrumbs>
      </Box>

      {/* Search Field */}
      <TextField
        fullWidth
        placeholder="Search branches..."
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <i className="lucide-search" />
            </InputAdornment>
          ),
          endAdornment: searchInput && (
            <IconButton onClick={() => handleSearchChange('')} size="small">
              <i className="lucide-x" />
            </IconButton>
          ),
        }}
      />

      {/* Loading State */}
      {isHaykalLoading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={24} />
          <Typography variant="body2" ml={2}>
            Loading branches...
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {!isHaykalLoading && items.length === 0 && (
        <Box p={4} textAlign="center" border={1} borderColor="divider" borderRadius={1}>
          <i className="lucide-folder" style={{ fontSize: 40, opacity: 0.5 }} />
          <Typography mt={2}>
            {searchInput ? 'No branches found' : 'This branch is empty'}
          </Typography>
        </Box>
      )}

      {/* Branches List - Conditionally render RadioButtonsGroup or CheckboxesGroup */}
      {!isHaykalLoading && items.length > 0 && (
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0, // Important for nested flex containers
          overflow: 'hidden' // Hide overflow on the wrapper
        }}>
          {singleSelect ? (
            // Radio buttons for single selection
            <RadioButtonsGroup
              control={control}
              name={name}
              // For radio buttons, expect a single value, not an array
              defaultValue={Array.isArray(selectedValues) && selectedValues.length > 0 ? selectedValues[0] : null}
              onChange={handleRadioSelectionChange}
              items={items}
              getItemId={(item) => item.id}
              getItemLabel={(item) => item.title}
              onItemClick={handleHaykalItemClick}
              pagination={{
                count: haykalData?.data?.pagination?.total || 0,
                page: pagination.pageIndex,
                rowsPerPage: pagination.pageSize,
                onPaginationChange: (newPagination) => {
                  setPagination({
                    pageIndex: newPagination.pageIndex,
                    pageSize: newPagination.pageSize,
                  });
                },
              }}
              sx={{ height: '100%' }}
            />
          ) : (
            // Checkboxes for multi-selection
            <CheckboxesGroup
              control={control}
              name={name}
              selectedValues={selectedValues}
              onChange={handleCheckboxSelectionChange}
              items={items}
              getItemId={(item) => item.id}
              getItemLabel={(item) => item.title}
              onItemClick={handleHaykalItemClick}
              pagination={{
                count: haykalData?.data?.pagination?.total || 0,
                page: pagination.pageIndex,
                rowsPerPage: pagination.pageSize,
                onPaginationChange: (newPagination) => {
                  setPagination({
                    pageIndex: newPagination.pageIndex,
                    pageSize: newPagination.pageSize,
                  });
                },
              }}
              sx={{ height: '100%' }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default BranchSelector;