'use client';
import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import toast from 'react-hot-toast';
import { useCourse, useUpdateCourse } from '@/hooks/api/tenant/learn/course/useCourse';

/**
 * Drawer component to edit a course
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onClose - Function to close the drawer
 * @param {number} props.courseId - Course ID to edit
 */
const EditCourseDrawer = ({ open, onClose, courseId }) => {
  const [formData, setFormData] = useState({
    title: '',
    course_code: '',
    description: '',
    course_type: 'elearning',
    status: 'draft',
    duration: '',
    instructor: ''
  });
  
  const { 
    data: courseData, 
    isLoading: isCourseLoading, 
    error: courseError,
    isError: isCourseError
  } = useCourse(courseId);
  
  const updateCourseMutation = useUpdateCourse();
  
  // Update form data when course data is loaded
  useEffect(() => {
    if (courseData) {
      setFormData({
        title: courseData.title || '',
        course_code: courseData.course_code || '',
        description: courseData.description || '',
        course_type: courseData.course_type || 'elearning',
        status: courseData.status || 'draft',
        duration: courseData.duration?.toString() || '',
        instructor: courseData.instructor || ''
      });
    }
  }, [courseData]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedCourseData = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration, 10) : 0
      };
      
      await updateCourseMutation.mutateAsync({
        courseId,
        data: updatedCourseData
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    }
  };

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
        <Typography variant="h6">Edit Course</Typography>
        <IconButton onClick={onClose} size="small">
          <i className="solar-close-circle-bold" />
        </IconButton>
      </Box>
      
      <DialogContent>
        {isCourseLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : isCourseError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {courseError?.message || 'Failed to load course data. Please try again.'}
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
              />
              
              <TextField
                label="Course Code"
                name="course_code"
                value={formData.course_code}
                onChange={handleChange}
                fullWidth
                helperText="A unique identifier for this course"
              />
              
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
              
              <FormControl fullWidth>
                <InputLabel>Course Type</InputLabel>
                <Select
                  name="course_type"
                  value={formData.course_type}
                  onChange={handleChange}
                  label="Course Type"
                >
                  <MenuItem value="elearning">E-Learning</MenuItem>
                  <MenuItem value="classroom">Classroom</MenuItem>
                  <MenuItem value="webinar">Webinar</MenuItem>
                  <MenuItem value="blended">Blended</MenuItem>
                </Select>
                <FormHelperText>The type of learning experience</FormHelperText>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
                <FormHelperText>The current status of this course</FormHelperText>
              </FormControl>
              
              <TextField
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0 }}
                helperText="Estimated completion time in minutes"
              />
              
              <TextField
                label="Instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                fullWidth
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button variant="outlined" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  type="submit"
                  disabled={!formData.title || updateCourseMutation.isLoading}
                  startIcon={updateCourseMutation.isLoading ? <CircularProgress size={20} /> : null}
                >
                  {updateCourseMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Stack>
          </form>
        )}
      </DialogContent>
    </Drawer>
  );
};

export default EditCourseDrawer;