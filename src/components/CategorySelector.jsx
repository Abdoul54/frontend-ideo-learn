'use client';
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
import { useCategories } from '@/hooks/api/tenant/learn/course/useCategories';
import { findRootCategory, extractCategoryName } from '@/utils/categoryUtils';

const CategorySelector = ({
    control,
    name,
    selectedValues = [],
    onChange,
    singleSelect = false,
    onCategorySelect,
    resetKey,
    initialHistory = [],
}) => {
    // State management
    const [searchInput, setSearchInput] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [isInitialized, setIsInitialized] = useState(false);
    const [initializationAttempted, setInitializationAttempted] = useState(false);
    const [rootCategory, setRootCategory] = useState(null);

    // Category navigation with null initialItem (will be set dynamically)
    const {
        history,
        currentItem,
        goForward,
        goBack,
        goToBreadcrumb,
        setCurrentItem,
        setHistory
    } = useHistoryNavigation(
        null, // Will be set dynamically once we determine the root
        (item, action) => {
            if (action === 'forward') {
                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                setSearchInput('');
            }
        },
        initialHistory // Pass the initial history if provided
    );

    // Data fetching - use the categories API
    const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: searchInput,
        sort_attr: 'title',
        sort_dir: 'asc',
        category_id: currentItem?.id,
    });

    // Find and set the root category when data is loaded
    useEffect(() => {
        if (categoriesData && !rootCategory) {
            const foundRoot = findRootCategory(categoriesData);
            if (foundRoot) {
                setRootCategory(foundRoot);

                // If we don't have a current item yet, initialize with the root
                if (!currentItem || currentItem.id === undefined) {
                    setCurrentItem(foundRoot);
                    // Only initialize history if it wasn't provided
                    if (!initialHistory || initialHistory.length === 0) {
                        setHistory([foundRoot]);
                    }
                }
            }
        }
    }, [categoriesData, rootCategory, currentItem, setCurrentItem, setHistory, initialHistory]);

    // Initialize the component with initialHistory
    useEffect(() => {
        if (!isInitialized && !initializationAttempted && initialHistory && initialHistory.length > 0) {
            try {
                // First, validate that each item in initialHistory has an id
                const validHistory = initialHistory.filter(item => item && item.id != null);

                if (validHistory.length === 0) {
                    console.warn("Invalid initialHistory - no valid items found");
                    setInitializationAttempted(true);
                    return;
                }

                // Create a deep copy of the initialHistory to avoid reference issues
                const historyCopy = JSON.parse(JSON.stringify(validHistory));

                // Set the history directly
                setHistory(historyCopy);

                // Set the current item to the last item in the history
                const lastItem = historyCopy[historyCopy.length - 1];
                if (lastItem && lastItem.id != null) {
                    setCurrentItem(lastItem);

                    // Also pre-select the item if we're in single select mode
                    if (singleSelect && typeof onChange === 'function') {
                        onChange([lastItem.id]);

                        if (typeof onCategorySelect === 'function') {
                            onCategorySelect(lastItem);
                        }
                    }
                }

                setIsInitialized(true);
            } catch (err) {
                console.error("Error initializing history:", err);
            }

            // Mark initialization as attempted to avoid infinite loops
            setInitializationAttempted(true);
        }
    }, [initialHistory, isInitialized, initializationAttempted, setHistory, setCurrentItem, singleSelect, onChange, onCategorySelect]);

    // Manual reset function
    const manualReset = () => {
        // Reset to the root item if available
        if (rootCategory) {
            setCurrentItem(rootCategory);
            setHistory([rootCategory]);
        }

        // Reset pagination and search
        setPagination({ pageIndex: 0, pageSize: 15 });
        setSearchInput('');
        setIsInitialized(false);
        setInitializationAttempted(false);
    };

    // Reset when resetKey changes
    useEffect(() => {
        if (resetKey) {
            manualReset();
        }
    }, [resetKey]);

    // Process items for display - ensure it's never undefined
    const items = (() => {
        let categoryItems = [];

        if (categoriesData?.data) {
            // Use a consistent data access pattern
            categoryItems = categoriesData.data.items || [];
        }

        return categoryItems
            .filter(item => item && (item.id != null || item.idCategory != null))
            .map(item => ({
                id: item.id || item.idCategory,
                title: extractCategoryName(item), // Use our helper function
                has_children: !!item.has_child,
                is_root: !!item.is_root, // Preserve the is_root flag
                _style: {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { backgroundColor: 'action.hover' },
                },
            }));
    })();

    // Handlers
    const handleSearchChange = (value) => {
        setSearchInput(value);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const handleCategoryItemClick = (id, title) => {
        if (typeof goForward === 'function') {
            // Get the full item to preserve properties like is_root
            const item = items.find(item => item.id === id) || { id, title };
            goForward(item);
        }
    };

    // Selection handler for radio buttons (single select mode)
    const handleRadioSelectionChange = (selectedId) => {
        if (typeof onChange === 'function') {
            onChange(selectedId ? [selectedId] : []);
        }

        if (typeof onCategorySelect === 'function') {
            if (selectedId) {
                const selectedItem = items.find(item => item.id === selectedId);
                if (selectedItem) {
                    onCategorySelect(selectedItem);
                } else {
                    // If the item is not in the current list, it might be a parent or from another level
                    // Try to use the currentItem if it matches the selectedId
                    if (currentItem && currentItem.id === selectedId) {
                        onCategorySelect(currentItem);
                    } else if (rootCategory && rootCategory.id === selectedId) {
                        onCategorySelect(rootCategory);
                    } else {
                        // Fallback - just create a basic object with the ID
                        onCategorySelect({ id: selectedId, title: `Category ${selectedId}` });
                    }
                }
            } else if (rootCategory) {
                onCategorySelect(rootCategory);
            }
        }
    };

    // Selection handler for checkboxes (multi-select mode)
    const handleCheckboxSelectionChange = (newSelectedValues) => {
        if (typeof onChange === 'function') {
            onChange(newSelectedValues);
        }

        if (typeof onCategorySelect === 'function') {
            if (newSelectedValues.length === 1) {
                const selectedItem = items.find(item => item.id === newSelectedValues[0]);
                if (selectedItem) {
                    onCategorySelect(selectedItem);
                } else if (currentItem && currentItem.id === newSelectedValues[0]) {
                    onCategorySelect(currentItem);
                } else if (rootCategory && rootCategory.id === newSelectedValues[0]) {
                    onCategorySelect(rootCategory);
                } else {
                    onCategorySelect({ id: newSelectedValues[0], title: `Category ${newSelectedValues[0]}` });
                }
            } else if (newSelectedValues.length === 0 && rootCategory) {
                onCategorySelect(rootCategory);
            }
        }
    };

    // Don't render until we have determined the root category, unless we're using initialHistory
    if (!rootCategory && !currentItem && !initialHistory.length && !isCategoriesLoading) {
        return (
            <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={24} />
                <Typography variant="body2" ml={2}>
                    Initializing categories...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Breadcrumbs */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                {history && history.length > 1 && (
                    <IconButton onClick={goBack} size="small">
                        <i className="solar-alt-arrow-left-bold-duotone" />
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
                placeholder="Search categories..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <i className="solar-magnifier-bold-duotone" />
                        </InputAdornment>
                    ),
                    endAdornment: searchInput && (
                        <IconButton onClick={() => handleSearchChange('')} size="small">
                            <i className="solar-close-circle-bold-duotone" />
                        </IconButton>
                    ),
                }}
            />

            {/* Loading State */}
            {isCategoriesLoading && (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" ml={2}>
                        Loading categories...
                    </Typography>
                </Box>
            )}

            {/* Empty State */}
            {!isCategoriesLoading && items.length === 0 && (
                <Box p={4} textAlign="center" border={1} borderColor="divider" borderRadius={1}>
                    <i className="solar-folder-bold-duotone" style={{ fontSize: 40, opacity: 0.5 }} />
                    <Typography mt={2}>
                        {searchInput ? 'No categories found' : 'This category is empty'}
                    </Typography>
                </Box>
            )}

            {/* Categories List - Conditionally render RadioButtonsGroup or CheckboxesGroup */}
            {!isCategoriesLoading && items.length > 0 && (
                <Box sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    overflow: 'hidden'
                }}>
                    {singleSelect ? (
                        // Radio buttons for single selection
                        <RadioButtonsGroup
                            control={control}
                            name={name}
                            defaultValue={Array.isArray(selectedValues) && selectedValues.length > 0 ? selectedValues[0] : null}
                            onChange={handleRadioSelectionChange}
                            items={items}
                            getItemId={(item) => item.id}
                            getItemLabel={(item) => item.title}
                            onItemClick={handleCategoryItemClick}
                            pagination={{
                                count: categoriesData?.data?.pagination?.total || 0,
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
                            onItemClick={handleCategoryItemClick}
                            pagination={{
                                count: categoriesData?.data?.pagination?.total || 0,
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

export default CategorySelector;