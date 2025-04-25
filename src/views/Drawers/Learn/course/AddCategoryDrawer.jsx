'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
  Grid,
  CircularProgress
} from '@mui/material';
import DrawerFormContainer from '@/components/DrawerFormContainer';
import { useAddCategory } from '@/hooks/api/tenant/learn/course/useCategories';
import { useActiveLanguages } from '@/hooks/api/tenant/useLocalization';
import { Controller, useForm } from 'react-hook-form';
import MultilingualTextInput from '@/components/inputs/MultilingualTextInput';
import CategorySelector from '@/components/CategorySelector';
import { axiosInstance } from '@/lib/axios';

const AddCategoryDrawer = ({ open, onClose, parentCategoryId, initialHistory = [] }) => {
  // Fetch active languages
  const { data: activeLanguages, isLoading: isLoadingLanguages, error: languagesError } = useActiveLanguages();

  // Find default language from active languages
  const defaultLanguage = activeLanguages?.find(lang => lang.is_default)?.code || 'fr';

  // Ensure initialHistory is always valid
  const safeInitialHistory = Array.isArray(initialHistory) ? initialHistory : [];

  // Create initial form data
  const getInitialFormData = () => {
    const translations = { all: '' };
    if (activeLanguages && activeLanguages.length > 0) {
      activeLanguages.forEach(lang => {
        translations[lang.code] = '';
      });
    }
    return {
      code: '',
      id_parent: parentCategoryId, // Always set to parentCategoryId, even if 2
      translations: translations
    };
  };

  const methods = useForm({
    defaultValues: getInitialFormData(),
  });

  // Form state
  const { handleSubmit, control, formState: { errors }, setValue, watch, setError, reset } = methods;
  const [currentLang, setCurrentLang] = useState('all');

  // Category selector state
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    id: parentCategoryId,
    title: 'Loading...'
  });
  const [hasInitialized, setHasInitialized] = useState(false);

  // Effect to initialize parent category details when drawer opens
  useEffect(() => {
    if (open && parentCategoryId && !hasInitialized) {
      // Fetch the parent category details
      const fetchParentDetails = async () => {
        try {
          // Don't fetch for root categories
          if (parentCategoryId === 1 || parentCategoryId === 2) {
            setSelectedCategory({
              id: parentCategoryId,
              title: 'Root'
            });
            setValue('id_parent', null);
            setHasInitialized(true);
            return;
          }

          const response = await axiosInstance.get(`/tenant/taallum/v1/categories/${parentCategoryId}`);
          if (response.data && response.data.success) {
            const parentData = response.data.data;
            let categoryTitle = 'Parent Category';

            // Try to extract the name from different possible formats
            if (parentData.names?.type === 'single_value') {
              categoryTitle = parentData.names.value || categoryTitle;
            } else if (parentData.names?.type === 'multi_lang' && parentData.names.values) {
              // Try default language first, then any language
              categoryTitle = parentData.names.values[defaultLanguage] ||
                Object.values(parentData.names.values)[0] ||
                categoryTitle;
            } else if (parentData.title) {
              categoryTitle = parentData.title;
            }

            setSelectedCategory({
              id: parentCategoryId,
              title: categoryTitle
            });

            // Set the form value
            setValue('id_parent', parentCategoryId);
            setHasInitialized(true);
          }
        } catch (error) {
          console.error('Error fetching parent category details:', error);
          setSelectedCategory({
            id: parentCategoryId,
            title: 'Unknown Category'
          });
          setHasInitialized(true);
        }
      };

      fetchParentDetails();
    }
  }, [open, parentCategoryId, setValue, defaultLanguage, hasInitialized]);

  // Mutation hook
  const addCategoryMutation = useAddCategory();
  const { mutate: addCategory, isLoading, isError, error, isSuccess, reset: resetMutation } = addCategoryMutation;

  // Error handling
  const [generalError, setGeneralError] = useState('');

  // Update form when languages load
  useEffect(() => {
    if (activeLanguages && activeLanguages.length > 0) {
      // Update form with current values
      const currentValues = methods.getValues();
      const updatedTranslations = { all: currentValues.translations?.all || '' };

      // Add each active language
      activeLanguages.forEach(lang => {
        updatedTranslations[lang.code] = currentValues.translations?.[lang.code] || '';
      });

      // Update form
      methods.setValue('translations', updatedTranslations);
    }
  }, [activeLanguages]);

  // Reset when drawer opens/closes
  useEffect(() => {
    if (open) {
      // When drawer opens, reset mutation state
      resetMutation();
      // Show Category Selector by default when creating a subcategory
      if (initialHistory && initialHistory.length > 0) {
        setShowCategorySelector(true);
      }
    } else {
      // When drawer closes, reset form and error state
      reset(getInitialFormData());
      setGeneralError('');
      setShowCategorySelector(false);
      setHasInitialized(false);
    }
  }, [open, activeLanguages, resetMutation, reset, initialHistory]);

  const handleCloseDrawer = () => {
    reset(getInitialFormData());
    setGeneralError('');
    resetMutation(); // Reset mutation state
    setHasInitialized(false);
    onClose();
  };

  // Effect to close drawer on successful submission
  useEffect(() => {
    if (isSuccess) {
      handleCloseDrawer();
    }
  }, [isSuccess]);

  // Handle category selection
  const handleCategoryChange = (selectedValues) => {
    if (selectedValues && selectedValues.length === 1) {
      const selectedId = selectedValues[0];
      setValue('id_parent', parseInt(selectedId, 10)); // Always set to selected ID
    } else {
      setValue('id_parent', null); // Only null if no parent is selected (rare in your UI)
    }
  };

  // Prepare language options for the MultilingualTextInput
  const getLanguageOptions = () => {
    // Always include "All Languages" option
    const options = [{ code: 'all', label: 'All Languages' }];

    // Add active languages from API
    if (activeLanguages && activeLanguages.length > 0) {
      activeLanguages.forEach(lang => {
        options.push({
          code: lang.code,
          label: lang.name || lang.native_name,
          isDefault: lang.is_default
        });
      });
    } else {
      // Fallback languages
      options.push({ code: 'fr', label: 'French', isDefault: true });
      options.push({ code: 'en', label: 'English' });
    }

    return options;
  };

  // Form submission handler
  const onSubmit = (data) => {
    const translations = data.translations || {};
    const hasAllTranslation = translations.all && translations.all.trim() !== '';
    const hasDefaultTranslation = defaultLanguage && translations[defaultLanguage] && translations[defaultLanguage].trim() !== '';
    if (!hasAllTranslation && !hasDefaultTranslation) {
      setError('translations', {
        type: 'manual',
        message: `Either "All Languages" or the default language (${defaultLanguage}) translation is required`
      });
      return;
    }

    let titlePayload;
    if (hasAllTranslation) {
      titlePayload = { type: 'single_value', value: translations.all.trim() };
    } else {
      const langValues = {};
      Object.entries(translations).forEach(([key, value]) => {
        if (key !== 'all' && value && value.trim()) {
          langValues[key] = value.trim();
        }
      });
      titlePayload = { type: 'multi_lang', values: langValues };
    }

    const payload = {
      code: data.code || null,
      title: titlePayload
    };
    if (data.id_parent !== null && data.id_parent !== undefined) {
      payload.id_parent = data.id_parent; // Include id_parent unless explicitly null
    }

    console.log('Submitting category with payload:', payload);
    addCategory(payload, {
      onError: (err) => {
        const errorMessage = err?.response?.data?.message;
        setGeneralError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage || 'Failed to create category');
        if (errorMessage?.includes('default language') && defaultLanguage) {
          setCurrentLang(defaultLanguage);
        }
      }
    });
  };

  // Determine drawer title based on whether we're creating a category or subcategory
  const drawerTitle = initialHistory && initialHistory.length > 0
    ? `Create a new subcategory under "${selectedCategory.title}"`
    : "Create a new category";

  return (
    <DrawerFormContainer
      open={open}
      onClose={onClose}
      title={drawerTitle}
      description="Add a new category to your course structure"
      width={500}
    >
      {isError && generalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <Stack spacing={3}>
              {/* General Information */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'black' }}>
                General Information
              </Typography>

              <Controller
                name="code"
                control={control}
                rules={{ maxLength: { value: 50, message: 'Code must not exceed 50 characters' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Code"
                    error={!!errors.code}
                    helperText={errors.code?.message || "Unique code for the category (optional)"}
                  />
                )}
              />

              {/* Parent Category Selection */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'black' }}>
                Parent Category
              </Typography>

              <Box sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                position: 'relative'
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <i className="solar-folder-bold-duotone" style={{ width: 20, height: 20 }} />
                    <Typography variant="body2">
                      {!watch('id_parent') || watch('id_parent') === 1 || watch('id_parent') === 2
                        ? 'Root'
                        : selectedCategory.title}
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowCategorySelector(!showCategorySelector)}
                    startIcon={<i className={`solar-${showCategorySelector ? 'x' : 'folder'}-bold-duotone`} style={{ width: 16, height: 16 }} />}
                  >
                    {showCategorySelector ? 'Close Panel' : 'Select Category'}
                  </Button>
                </Stack>

                {showCategorySelector && (
                  <Box sx={{ mt: 2, height: 400 }}>
                    <Controller
                      name="id_parent"
                      control={control}
                      render={({ field }) => (
                        <CategorySelector
                          control={control}
                          name="id_parent"
                          selectedValues={field.value != null ? [field.value] : []}
                          onChange={(selectedIds) => {
                            handleCategoryChange(selectedIds);
                            // Update selected category info for display
                            if (selectedIds && selectedIds.length === 1) {
                              // This would be set from CategorySelector's onCategorySelect callback
                              // For now, we'll just update the ID
                              setSelectedCategory(prev => ({
                                ...prev,
                                id: selectedIds[0]
                              }));
                            }
                          }}
                          singleSelect={true} // Enable single select mode
                          onCategorySelect={(category) => {
                            setSelectedCategory({
                              id: category.id,
                              title: category.title
                            });
                          }}
                          initialHistory={initialHistory}
                        />
                      )}
                    />
                  </Box>
                )}
              </Box>

              {/* Translations */}
              <Typography variant="subtitle1" fontWeight="bold">
                Category Name
              </Typography>

              {isLoadingLanguages ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : languagesError ? (
                <Alert severity="error">
                  Failed to load languages. Please try again.
                </Alert>
              ) : (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {defaultLanguage ?
                      `You must provide either an "All Languages" translation or a translation in the default language (${defaultLanguage}).` :
                      "You must provide at least one translation."
                    }
                  </Alert>
                  <Controller
                    name="translations"
                    control={control}
                    render={({ field }) => (
                      <MultilingualTextInput
                        name="translations"
                        control={control}
                        label="Category Name"
                        currentLang={currentLang}
                        onLanguageChange={setCurrentLang}
                        defaultLanguage="all"
                        languages={getLanguageOptions()}
                        applyToAllLanguages={currentLang === 'all'}
                        required
                        defaultLocale={defaultLanguage}
                        InputProps={{
                          startAdornment: <i className="solar-globe-bold-duotone" style={{ marginRight: 8 }} />,
                        }}
                        error={!!errors.translations}
                        helperText={errors.translations?.message}
                      />
                    )}
                  />
                </>
              )}

              {errors.translations && (
                <Typography color="error" variant="body2">
                  {errors.translations.message}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ p: 2, mt: 2, backgroundColor: 'background.paper' }}>
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid item>
                <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Category'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </form>
    </DrawerFormContainer>
  );
};

export default AddCategoryDrawer;