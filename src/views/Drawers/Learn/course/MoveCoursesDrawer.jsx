'use client';
import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import { useMoveCourses } from '@/hooks/api/tenant/learn/course/useCourse';
import { axiosInstance } from "@/lib/axios";
import toast from 'react-hot-toast';

/**
 * Drawer component to move courses to a different category
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onClose - Function to close the drawer
 * @param {Array} props.selectedRows - Selected course rows
 * @param {number} props.currentCategoryId - Current category ID
 */
const MoveCoursesDrawer = ({ open, onClose, selectedRows = [], currentCategoryId }) => {
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState({ id: 1, title: 'Root' });
  const [categoryPath, setCategoryPath] = useState([{ id: 1, title: 'Root' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const moveCoursesMutation = useMoveCourses();
  
  // Load categories when drawer opens
  useEffect(() => {
    if (open) {
      fetchCategories(currentCategory.id);
    }
  }, [open, currentCategory.id]);
  
  const fetchCategories = async (categoryId) => {
    setIsLoading(true);
    try {
      let url = '/tenant/taallum/v1/categories';
      
      if (categoryId !== 1) {
        url = `/tenant/taallum/v1/categories/${categoryId}/childs`;
      }
      
      const response = await axiosInstance.get(url);
      
      if (response.data?.success) {
        let categoriesData;
        
        if (categoryId === 1) {
          // Root categories
          categoriesData = response.data.data.items.map(item => ({
            id: item.id,
            title: item.title,
            code: item.code,
            has_children: item.has_child
          }));
        } else {
          // Child categories
          categoriesData = response.data.data.map(item => ({
            id: item.idCategory,
            title: item.category_name,
            code: item.code,
            has_children: !!item.has_child
          }));
        }
        
        setCategories(categoriesData);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    setCategoryPath([...categoryPath, category]);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };
  
  const handleNavigateToCategory = (index) => {
    const newPath = categoryPath.slice(0, index + 1);
    setCategoryPath(newPath);
    setCurrentCategory(newPath[newPath.length - 1]);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };
  
  const handleBackClick = () => {
    if (categoryPath.length > 1) {
      const newPath = categoryPath.slice(0, -1);
      setCategoryPath(newPath);
      setCurrentCategory(newPath[newPath.length - 1]);
      setSearchQuery('');
      setSearchResults([]);
      setIsSearching(false);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    
    if (e.target.value.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    searchCategories(e.target.value);
  };
  
  const searchCategories = async (query) => {
    try {
      const response = await axiosInstance.get(`/tenant/taallum/v1/categories/search?q=${query}`);
      
      if (response.data?.success) {
        setSearchResults(response.data.data.map(item => ({
          id: item.id,
          title: item.title,
          code: item.code,
          has_children: !!item.has_child
        })));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching categories:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleMoveCourses = async () => {
    if (selectedRows.length === 0) return;
    
    // Don't allow moving to the current category
    if (currentCategory.id === currentCategoryId) {
      toast.error('Please select a different category');
      return;
    }
    
    try {
      const courseIds = selectedRows.map(row => row.id);
      await moveCoursesMutation.mutateAsync({
        courseIds,
        targetCategoryId: currentCategory.id
      });
      onClose();
    } catch (error) {
      console.error('Error moving courses:', error);
      toast.error('Failed to move courses');
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
        <Typography variant="h6">
          Move {selectedRows.length} Course{selectedRows.length !== 1 ? 's' : ''}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <i className="solar-close-circle-bold" />
        </IconButton>
      </Box>
      
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="Search categories..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="solar-magnifer-linear" style={{ width: 20, height: 20 }} />
              </InputAdornment>
            )
          }}
          size="small"
        />
      </Box>
      
      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="small" 
            onClick={handleBackClick}
            disabled={categoryPath.length <= 1 || isSearching}
            sx={{ mr: 1 }}
          >
            <i className="solar-alt-arrow-left-linear" style={{ width: 20, height: 20 }} />
          </IconButton>
          
          <Breadcrumbs separator="›" aria-label="category-navigation">
            {categoryPath.map((category, index) => (
              <Link
                key={category.id}
                component="button"
                underline="hover"
                color={index === categoryPath.length - 1 ? 'primary' : 'inherit'}
                onClick={() => handleNavigateToCategory(index)}
                sx={{ 
                  textDecoration: 'none', 
                  fontWeight: index === categoryPath.length - 1 ? 'bold' : 'normal'
                }}
              >
                {category.title}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : searchQuery ? (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Search Results:
            </Typography>
            
            {isSearching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : searchResults.length > 0 ? (
              <List disablePadding>
                {searchResults.map((category) => (
                  <ListItem
                    key={category.id}
                    button
                    onClick={() => handleCategoryClick(category)}
                    sx={{ 
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': { bgcolor: 'action.hover' } 
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <i className="solar-folder-linear" style={{ width: 24, height: 24 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={category.title} 
                      secondary={category.code} 
                      primaryTypographyProps={{ variant: 'body2' }} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No categories found matching "{searchQuery}"
              </Typography>
            )}
          </>
        ) : (
          <>
            {categories.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No categories found in this location
              </Typography>
            ) : (
              <List disablePadding>
                {categories.map((category) => (
                  <ListItem
                    key={category.id}
                    button
                    onClick={() => handleCategoryClick(category)}
                    sx={{ 
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': { bgcolor: 'action.hover' },
                      // Highlight if it's the current category
                      bgcolor: category.id === currentCategoryId ? 'action.selected' : undefined,
                    }}
                    disabled={category.id === currentCategoryId}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <i className="solar-folder-linear" style={{ width: 24, height: 24 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={category.title} 
                      secondary={category.code} 
                      primaryTypographyProps={{ variant: 'body2' }} 
                    />
                    {category.has_children && (
                      <i className="solar-alt-arrow-right-linear" style={{ width: 16, height: 16, opacity: 0.7 }} />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>
      
      <Divider />
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2">
            Current: {currentCategory.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedRows.length} course{selectedRows.length !== 1 ? 's' : ''} selected
          </Typography>
        </Box>
        
        <Box>
          <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleMoveCourses}
            disabled={
              selectedRows.length === 0 || 
              moveCoursesMutation.isLoading || 
              currentCategory.id === currentCategoryId
            }
            startIcon={moveCoursesMutation.isLoading ? <CircularProgress size={20} /> : null}
          >
            {moveCoursesMutation.isLoading ? 'Moving...' : 'Move Here'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MoveCoursesDrawer;