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
import { useCategoryDetails, useUpdateCategory } from '@/hooks/api/tenant/learn/course/useCategories';
import { useActiveLanguages } from '@/hooks/api/tenant/useLocalization';
import { Controller, useForm } from 'react-hook-form';
import MultilingualTextInput from '@/components/inputs/MultilingualTextInput';
import CategorySelector from '@/components/CategorySelector';
import { axiosInstance } from '@/lib/axios';
import { extractCategoryName, createCategoryNamePayload, isRootCategory } from '@/utils/categoryUtils';
import { useTranslation } from '@/@core/contexts/translationContext';

const EditCategoryDrawer = ({ open, onClose, categoryId, rootCategory }) => {
  // Translation hook
  const { translate } = useTranslation();

  // Fetch category details
  const {
    data: categoryDetails,
    isLoading: isLoadingDetails,
    error: detailsError
  } = useCategoryDetails(open ? categoryId : null);

  // Fetch active languages
  const { data: activeLanguages, isLoading: isLoadingLanguages, error: languagesError } = useActiveLanguages();

  // Find default language from active languages
  const defaultLanguage = activeLanguages?.find(lang => lang.is_default)?.code || 'fr';

  // Create form data (will be populated with details when they load)
  const getInitialFormData = () => {
    const translations = { all: '' };

    // Add active languages
    if (activeLanguages && activeLanguages.length > 0) {
      activeLanguages.forEach(lang => {
        translations[lang.code] = '';
      });
    }

    return {
      code: '',
      id_parent: null,
      translations: translations
    };
  };

  const methods = useForm({
    defaultValues: getInitialFormData(),
  });

  // Form state
  const { handleSubmit, control, formState: { errors }, setValue, watch, setError, reset, getValues } = methods;
  const [currentLang, setCurrentLang] = useState('all');
  const [initialCategory, setInitialCategory] = useState(null);
  const [isMultiLangMode, setIsMultiLangMode] = useState(false);

  // Category selector state
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [isManuallyToggled, setIsManuallyToggled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    id: null,
    title: 'Loading...'
  });
  const [initialHistoryForDrawer, setInitialHistoryForDrawer] = useState([]);
  const [hasInitializedForm, setHasInitializedForm] = useState(false);

  // Initialize navigation path for parent category
  useEffect(() => {
    if (open && categoryDetails && categoryDetails.id_parent && !isLoadingDetails) {
      // Fetch the parent category to build the navigation path
      const fetchParentPath = async () => {
        try {
          const response = await axiosInstance.get(`/tenant/taallum/v1/categories/${categoryDetails.id_parent}`);
          if (response.data && response.data.success) {
            const parentData = response.data.data;

            // Create navigation history - starting with an empty array
            const historyPath = [];

            // Only add root category if the parent is NOT the root
            if (rootCategory && !parentData.is_root) {
              historyPath.push({
                id: rootCategory.id,
                title: rootCategory.title,
                is_root: true
              });
            }

            // Add parent to history
            const parentTitle = extractCategoryName(parentData, defaultLanguage);

            historyPath.push({
              id: categoryDetails.id_parent,
              title: parentTitle,
              is_root: !!parentData.is_root
            });

            setInitialHistoryForDrawer(historyPath);

            // Update parent category display
            setSelectedCategory({
              id: categoryDetails.id_parent,
              title: parentTitle,
              is_root: !!parentData.is_root
            });
          }
        } catch (error) {
          console.error('Error fetching parent category details:', error);
          // Fallback to just showing the parent ID
          setSelectedCategory({
            id: categoryDetails.id_parent,
            title: 'Parent ID: ' + categoryDetails.id_parent
          });
        }
      };

      // Only fetch if we don't already have a path set up
      if (initialHistoryForDrawer.length === 0) {
        fetchParentPath();
      }
    }
  }, [open, categoryDetails, defaultLanguage, isLoadingDetails, initialHistoryForDrawer.length, rootCategory]);

  // Populate form with category details when they load - FIXED VERSION
  useEffect(() => {
    if (categoryDetails && !hasInitializedForm && activeLanguages?.length > 0) {
      console.log("Loading category details:", categoryDetails);

      // Store initial category data for reference
      setInitialCategory(categoryDetails);

      // Set code
      setValue('code', categoryDetails.code || '');

      // Set parent ID (if null or undefined, it's root)
      const parentId = categoryDetails.id_parent;
      setValue('id_parent', parentId);

      // Initialize translations object
      const newTranslations = { ...getValues().translations };

      // Store the language to initially display
      let initialLanguage = 'all';

      // Handle single value title
      if (categoryDetails.names?.type === 'single_value' && categoryDetails.names?.value) {
        // For single_value, set "all" field AND populate all languages
        newTranslations.all = categoryDetails.names.value;
        setIsMultiLangMode(false);
        initialLanguage = 'all';

        // Also set it for each language to ensure it's visible
        activeLanguages.forEach(lang => {
          newTranslations[lang.code] = categoryDetails.names.value;
        });
      }

      // Handle multi-language titles
      if (categoryDetails.names?.type === 'multi_lang' && categoryDetails.names?.values) {
        // Clear the "all" field to ensure we stay in multi-language mode
        newTranslations.all = '';
        setIsMultiLangMode(true);

        // Set individual language values
        Object.entries(categoryDetails.names.values).forEach(([lang, value]) => {
          if (newTranslations[lang] !== undefined) {
            newTranslations[lang] = value;
          }
        });

        // Determine which language to display initially:
        // Priority: default language, first language with content, or first language
        if (defaultLanguage && categoryDetails.names.values[defaultLanguage]) {
          initialLanguage = defaultLanguage;
        } else if (Object.keys(categoryDetails.names.values).length > 0) {
          initialLanguage = Object.keys(categoryDetails.names.values)[0];
        }
      }

      // Set form values first, THEN update the current language
      setValue('translations', newTranslations, { shouldDirty: true });

      // Set the selected category display
      if (parentId) {
        setSelectedCategory(prev => ({
          ...prev,
          id: parentId
        }));
      } else {
        setSelectedCategory({
          id: null,
          title: 'Root'
        });
      }

      // Use a short timeout to ensure the form values are set before switching language
      setTimeout(() => {
        setCurrentLang(initialLanguage);
        setHasInitializedForm(true);
      }, 50);
    }
  }, [categoryDetails, setValue, getValues, activeLanguages, defaultLanguage, hasInitializedForm]);

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      reset(getInitialFormData());
      setHasInitializedForm(false);
      setInitialHistoryForDrawer([]);
      setShowCategorySelector(false);
      setIsManuallyToggled(false);
      setInitialCategory(null);
      setIsMultiLangMode(false);
      setCurrentLang('all'); // Always reset to 'all' when closing
    }
  }, [open, reset]);

  // Auto-open category selector if we have navigation history
  useEffect(() => {
    if (open && initialHistoryForDrawer.length > 0 && !showCategorySelector && !isManuallyToggled) {
      setShowCategorySelector(true);
    }
  }, [open, initialHistoryForDrawer, showCategorySelector, isManuallyToggled]);

  // Mutation hook with explicit reset
  const updateCategoryMutation = useUpdateCategory();
  const { mutate: updateCategory, isLoading, isError, error, isSuccess, reset: resetMutation } = updateCategoryMutation;

  // Error handling
  const [generalError, setGeneralError] = useState('');

  // Reset when drawer opens/closes
  useEffect(() => {
    if (open) {
      // When drawer opens, reset mutation state
      resetMutation();
    } else {
      // When drawer closes, reset form and error state
      reset(getInitialFormData());
      setGeneralError('');
    }
  }, [open, resetMutation, reset]);

  // Effect to close drawer on successful submission
  useEffect(() => {
    if (isSuccess) {
      handleCloseDrawer();
    }
  }, [isSuccess]);

  const handleCloseDrawer = () => {
    reset(getInitialFormData());
    setGeneralError('');
    resetMutation();
    setHasInitializedForm(false);
    onClose();
  };

  // Handle category selection
  const handleCategoryChange = (selectedValues) => {
    if (selectedValues && selectedValues.length === 1) {
      const selectedId = selectedValues[0];

      // Prevent selecting the current category as its own parent
      if (selectedId === categoryId) {
        setError('id_parent', {
          type: 'manual',
          message: "Category cannot be its own parent"
        });
        return;
      }

      if (rootCategory && selectedId === rootCategory.id) {
        setValue('id_parent', null);
      } else {
        setValue('id_parent', parseInt(selectedId, 10));
      }
    } else {
      // No selection means root category
      setValue('id_parent', null);
    }
  };

  // Handle language change (add extra validation/logic if needed)
  const handleLanguageChange = (newLang) => {
    const prevLang = currentLang;
    const translations = getValues().translations || {};

    // When changing FROM "all" TO a specific language
    if (prevLang === 'all' && newLang !== 'all') {
      // Enter multi-language mode
      setIsMultiLangMode(true);

      // The MultilingualTextInput component will handle copying values
      // and clearing the "all" field
    }

    // When changing TO "all" FROM a specific language
    if (prevLang !== 'all' && newLang === 'all') {
      // Only leave multi-language mode if the user actually enters a value in the "all" field
      // This will be handled when they submit the form
    }

    // Update the current language
    setCurrentLang(newLang);
  };

  // Form submission handler
  const onSubmit = (data) => {
    const translations = data.translations || {};
    console.log("Form data before submission:", translations);

    // Check if at least one translation is provided
    const hasAllTranslation = translations.all && translations.all.trim() !== '';
    const hasDefaultTranslation = defaultLanguage && translations[defaultLanguage] &&
      translations[defaultLanguage].trim() !== '';

    // Check if any language has a value
    const hasAnyLanguage = Object.entries(translations).some(([lang, value]) =>
      lang !== 'all' && value && value.trim() !== ''
    );

    if (!hasAllTranslation && !hasDefaultTranslation && !hasAnyLanguage) {
      setError('translations', {
        type: 'manual',
        message: `Either "All Languages" or at least one language translation is required`
      });
      return;
    }

    // Create title payload using our utility function
    const titlePayload = createCategoryNamePayload(translations, defaultLanguage);
    console.log("Generated payload:", titlePayload);

    // Create update payload - start with required fields only
    const payload = {
      code: data.code || null,
      title: titlePayload
    };

    // Only add id_parent to payload if it's NOT the root category
    const parentId = data.id_parent;

    // Only include id_parent in the payload if it's not null
    if (parentId !== undefined && parentId !== null) {
      payload.id_parent = parentId;
    }

    console.log('Updating category with payload:', payload);

    // Submit to API
    updateCategory(
      { id: categoryId, data: payload },
      {
        onError: (err) => {
          console.error('Category update error:', err?.response?.data || err);
          if (err?.response?.data?.message) {
            const errorMessage = Array.isArray(err.response.data.message)
              ? err.response.data.message[0]
              : err.response.data.message;

            setGeneralError(errorMessage);

            if (errorMessage.includes('default language') && defaultLanguage) {
              setCurrentLang(defaultLanguage);
            }
          } else {
            setGeneralError('Failed to update category');
          }
        }
      }
    );
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

  // For debugging - log what language is currently selected
  // This helps in troubleshooting issues with initialization
  useEffect(() => {
    if (hasInitializedForm) {
      console.log("Current language set to:", currentLang);
      console.log("Current translation for this language:", getValues().translations[currentLang]);
    }
  }, [currentLang, hasInitializedForm, getValues]);

  return (
    <DrawerFormContainer
      open={open}
      onClose={onClose}
      title="Edit category"
      description="Update category details or move it to a different parent"
      width={500}
    >
      {(isError || detailsError) && (generalError || detailsError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalError || "Error loading category details"}
        </Alert>
      )}

      {isLoadingDetails ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <Stack spacing={3}>
                {/* General Information */}
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'black' }}>
                  {translate('Course management.SECTION_COURSE_INFORMATION', 'General Information')}
                </Typography>

                <Controller
                  name="code"
                  control={control}
                  rules={{ maxLength: { value: 50, message: 'Code must not exceed 50 characters' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={translate('Course management.FIELD_COURSE_CODE', 'Code')}
                      error={!!errors.code}
                      helperText={errors.code?.message || translate('Course management.PLACEHOLDER_COURSE_CODE', 'Unique code for the category (optional)')}
                    />
                  )}
                />

                {/* Parent Category Selection */}
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'black' }}>
                  {translate('Course management.SECTION_PARENT_CATEGORY', 'Parent Category')}
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
                        {!watch('id_parent')
                          ? rootCategory?.title || 'Root'
                          : selectedCategory.title}
                      </Typography>
                    </Stack>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setShowCategorySelector(prev => !prev);
                        setIsManuallyToggled(true);
                      }}
                      startIcon={<i className={`solar-${showCategorySelector ? 'x' : 'folder'}-bold-duotone`} style={{ width: 16, height: 16 }} />}
                    >
                      {showCategorySelector ?  'Close Panel' : translate('Course management.BUTTON_SELECT_CATEGORY', 'Select Parent')}
                    </Button>
                  </Stack>

                  {errors.id_parent && (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {errors.id_parent.message}
                    </Typography>
                  )}

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
                              if (selectedIds && selectedIds.length === 1) {
                                setSelectedCategory(prev => ({
                                  ...prev,
                                  id: selectedIds[0]
                                }));
                              }
                            }}
                            singleSelect={true}
                            onCategorySelect={(category) => {
                              setSelectedCategory({
                                id: category.id,
                                title: category.title,
                                is_root: category.is_root
                              });
                            }}
                            initialHistory={initialHistoryForDrawer}
                          />
                        )}
                      />
                    </Box>
                  )}
                </Box>

                {/* Translations */}
                <Typography variant="subtitle1" fontWeight="bold">
                  {translate('Course management.SECTION_CATEGORY_NAME', 'Category Name')}
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
                      {currentLang === 'all' ?
                        "Using 'All Languages' will set the same text for all languages." :
                        `You are currently editing the ${currentLang.toUpperCase()} version of this category name.`
                      }
                    </Alert>
                    <Controller
                      name="translations"
                      control={control}
                      render={({ field }) => (
                        <MultilingualTextInput
                          name="translations"
                          control={control}
                          label={translate('Course management.FIELD_CATEGORY_NAME', 'Category Name')}
                          currentLang={currentLang}
                          onLanguageChange={handleLanguageChange}
                          defaultLanguage={defaultLanguage}
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
                    {translate('common.cancel', 'Cancel')}
                  </Button>
                </Grid>
                <Grid item>
                  <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Category'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </form>
      )}
    </DrawerFormContainer>
  );
};

export default EditCategoryDrawer;