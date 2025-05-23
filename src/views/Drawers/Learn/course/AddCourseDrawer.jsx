'use client';
import React, { useState, useCallback, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  DialogContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { useCreateCourse } from '@/hooks/api/tenant/learn/course/useCourse';
import toast from 'react-hot-toast';
import { useSkills } from '@/hooks/api/tenant/skills/useSkills';
import debounce from 'lodash/debounce';
import CategorySelector from '@/components/CategorySelector';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import TextEditorInput from '@/components/inputs/TextEditorInput';
import { useTranslation } from '@/@core/contexts/translationContext';

/**
 * Drawer component to add a new course
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onClose - Function to close the drawer
 * @param {number} props.categoryId - Category ID
 */
const AddCourseDrawer = ({ open, onClose, categoryId }) => {
  // Initialize Next.js router for navigation
  const router = useRouter();

  // Translation hook
  const { translate } = useTranslation();

  // Initialize react-hook-form to provide control to CategorySelector
  const { control, watch, setValue } = useForm();

  const [formData, setFormData] = useState({
    title: '',
    course_code: '',
    description: '',
    course_type: 'elearning',
    category_id: categoryId || null,
    skill_codes: []
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [description, setDescription] = useState('');

  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState(categoryId ? [categoryId] : []);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [resetCategorySelector, setResetCategorySelector] = useState(0);

  // Debounced search handler
  const debouncedSetSkillSearch = useCallback(
    debounce((term) => {
      setSkillSearchTerm(term);
    }, 300),
    []
  );

  // Fetch skills based on search term
  const { data: skillsData, isLoading: skillsLoading } = useSkills({
    search: skillSearchTerm,
    page: 1,
    page_size: 10
  });

  const skills = skillsData?.items || [];

  const createCourseMutation = useCreateCourse();

  // Set initial category from props when drawer opens
  useEffect(() => {
    if (open && categoryId) {
      // Set selected category from prop
      setSelectedCategory([categoryId]);

      // IMPORTANT: Also set the form value
      setValue('category_id', categoryId, { shouldDirty: true });
      console.log('Initialized form category_id to:', categoryId);
    }
  }, [open, categoryId, setValue]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditorUpdate = (content) => {
    setDescription(content);
    setFormData({
      ...formData,
      description: content
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log('Selected category array before submission:', selectedCategory);

      const formCategoryId = watch('category_id');
      console.log('Form category_id:', formCategoryId);

      const categoryIdToSubmit = formCategoryId || (selectedCategory.length > 0 ? selectedCategory[0] : null);
      console.log('Final categoryIdToSubmit to be sent:', categoryIdToSubmit);

      if (!categoryIdToSubmit) {
        toast.error('Please select a category');
        return;
      }

      // Create FormData object to match the multipart/form-data content type
      const formDataToSend = new FormData();

      // Add form fields to FormData
      formDataToSend.append('name', formData.title);
      if (formData.course_code) formDataToSend.append('code', formData.course_code);
      if (formData.description) formDataToSend.append('description', formData.description);
      formDataToSend.append('course_type', formData.course_type);

      if (!formCategoryId) {
        toast.error('Please select a category');
        return;
      }

      formDataToSend.append('category_id', categoryIdToSubmit);

      // Add skill_codes as strings
      selectedSkills.forEach((skill, index) => {
        formDataToSend.append(`skill_codes[${index}]`, String(skill.predefined_UID));
      });

      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Call the mutation with FormData
      const result = await createCourseMutation.mutateAsync(formDataToSend);

      console.log('Course creation result:', result);

      // After successful creation, redirect to the edit page
      if (result && result.course_id) {
        // Close the drawer (optional if redirecting immediately)
        onClose();
        // Navigate to the edit page
        router.push(`/learn/course/edit/${result.course_id}`);
      } else {
        // If we don't have a course ID for some reason, just close the drawer
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('Failed to create course');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      course_code: '',
      description: '',
      course_type: 'elearning',
      category_id: null,
      skill_codes: []
    });
    setDescription('');
    setSelectedSkills([]);
    setSkillSearchTerm('');
    setInputValue('');

    // Reset category selection
    if (categoryId) {
      setSelectedCategory([categoryId]);
    } else {
      setSelectedCategory([]);
    }
    setCategoryDetails(null);

    // Trigger a reset of the CategorySelector component
    setResetCategorySelector(prev => prev + 1);
  };

  // Handle selected category change
  const handleCategoryChange = (categoryIds) => {
    console.log('Category changed to:', categoryIds);
    setSelectedCategory(categoryIds);

    // Update form value directly with setValue
    if (categoryIds && categoryIds.length > 0) {
      setValue('category_id', categoryIds[0], { shouldDirty: true });
      console.log('Updated form category_id to:', categoryIds[0]);
    } else {
      setValue('category_id', null, { shouldDirty: true });
      console.log('Cleared form category_id');
    }
  };

  // Store the selected category details
  const handleCategorySelect = (category) => {
    setCategoryDetails(category);
  };

  // Handle skill selection
  const handleSkillChange = (event, newValue) => {
    if (newValue) {
      // Avoid duplicates
      if (!selectedSkills.some(skill => skill.id === newValue.id)) {
        setSelectedSkills([...selectedSkills, newValue]);
      }
      setInputValue(''); // Clear input after selection
    }
  };

  // Handle skill deletion
  const handleDeleteSkill = (skillToDelete) => {
    setSelectedSkills(selectedSkills.filter(skill => skill.id !== skillToDelete.id));
  };

  // Reset component state when drawer closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600 } }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6">{translate('Course management.MODAL_TITLE_ADD_NEW_COURSE', 'Add New Course')}</Typography>
        <IconButton onClick={onClose} size="small">
          <i className="lucide-x" />
        </IconButton>
      </Box>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ mt: 2 }}>

            <Typography variant="subtitle1" fontWeight="bold" color="black">
              {translate('Course management.FIELD_COURSE_TYPE', 'Course Type')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {translate('Course management.SECTION_SUBTITLE_COURSE_TYPE', 'Select the type of course you want to create')}
            </Typography>
            {/* Course Type Selector */}

            <FormControl fullWidth>
              <InputLabel>{translate('Course management.FIELD_COURSE_TYPE', 'Course Type')}</InputLabel>
              <Select
                name="course_type"
                value={formData.course_type}
                onChange={handleChange}
                label={translate('Course management.FIELD_COURSE_TYPE', 'Course Type')}
              >
                <MenuItem value="elearning">{translate('Course management.DROPDOWN_ELEARNING', 'E-Learning')}</MenuItem>
                <MenuItem value="classroom">{translate('Course management.DROPDOWN_CLASSROOM', 'Classroom')}</MenuItem>
                {/* <MenuItem value="webinar">Webinar</MenuItem> */}
              </Select>
            </FormControl>

            {/* Course Title and Code */}
            <Typography variant="subtitle1" fontWeight="bold" color="black">
              {translate('Course management.SECTION_COURSE_INFORMATION', 'Course Information')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {translate('Course management.SECTION_SUBTITLE_COURSE_INFO', 'Fill in the course details below.')}
            </Typography>

            <TextField
              label={translate('Course management.FIELD_COURSE_NAME', 'Course Title')}
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label={translate('Course management.PLACEHOLDER_COURSE_CODE', 'Course Code (optional)')}
              name="course_code"
              value={formData.course_code}
              onChange={handleChange}
              fullWidth
              helperText={translate('Course management.FIELD_CODE_DESCRIPTION', 'A unique identifier for this course')}
            />

            <Typography variant="subtitle1" fontWeight="bold" color="black" sx={{ mt: 2 }}>
              {translate('Course management.SECTION_DESCRIPTION', 'Description')}
            </Typography>
            <TextEditorInput
              content={description}
              onUpdate={handleEditorUpdate}
            />

            <Divider />

            <Typography variant="subtitle1" fontWeight="bold" color="black">
              {translate('Course management.SECTION_SKILLS_SUGGESTIONS', 'Skills suggestions')}
            </Typography>

            {/* Display selected skills as chips */}
            {selectedSkills.length > 0 && (
              <Paper
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  listStyle: 'none',
                  p: 1,
                  m: 0,
                  gap: 1
                }}
              >
                {selectedSkills.map((skill) => (
                  <Chip
                    key={skill.id}
                    label={skill.name}
                    onDelete={() => handleDeleteSkill(skill)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Paper>
            )}

            {/* Skills autocomplete */}
            <Autocomplete
              value={null}
              onChange={handleSkillChange}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
                debouncedSetSkillSearch(newInputValue);
              }}
              options={skills}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="No skills found"
              loading={skillsLoading}
              loadingText="Loading skills..."
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={translate('Course management.FIELD_SEARCH_SKILLS', 'Search for skills')}
                  placeholder='Type to search...'
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {skillsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Typography variant="body2">
                    {option.name} {option.is_custom ? '(Custom)' : ''}
                  </Typography>
                </li>
              )}
            />

            <Divider />

            {/* Category Selector */}
            <Typography variant="subtitle1" fontWeight="bold" color="black">
              {translate('Course management.SECTION_CATEGORY_DESTINATION', 'Category destination')}
            </Typography>

            {categoryDetails && (
              console.log('Category Details:', categoryDetails) ||
              <Box mb={2}>
                <Typography variant="body1" fontWeight="medium">
                  {translate('Course management.TEXT_SELECTED_CATEGORY', 'Selected category')}: {categoryDetails.title}
                </Typography>
              </Box>
            )}

            <Box sx={{
              height: '400px',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              overflow: 'auto'
            }}>
              <CategorySelector
                control={control}
                name="category_id"
                selectedValues={selectedCategory}
                onChange={handleCategoryChange}
                onCategorySelect={handleCategorySelect}
                singleSelect={true}
                resetKey={resetCategorySelector}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
              >
                {translate('common.cancel', 'Cancel')}
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={!formData.title || selectedCategory.length === 0 || createCourseMutation.isLoading}
                startIcon={createCourseMutation.isLoading ? <CircularProgress size={20} /> : null}
              >
                {createCourseMutation.isLoading ? 'Adding...' : 'Create & Edit'}
              </Button>
            </Box>
          </Stack>
        </form>
      </DialogContent>
    </Drawer>
  );
};

export default AddCourseDrawer;