import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    FormHelperText,
    CircularProgress
} from '@mui/material';
import TextEditorInput from '@/components/inputs/TextEditorInput';

/**
 * MultilangTextEditor - A component for editing rich text content in multiple languages
 * 
 * @param {Object} props
 * @param {string} props.name - Form field name
 * @param {Array} props.languages - Available languages array
 * @param {Function} props.setValue - React Hook Form setValue function
 * @param {Function} props.getValues - React Hook Form getValues function
 * @param {Function} props.watch - React Hook Form watch function
 * @param {string} props.label - Field label
 * @param {boolean} props.isLoading - Loading state
 * @param {Object} props.errors - Form errors
 * @returns {JSX.Element}
 */
const MultilangTextEditor = ({
    name,
    languages,
    setValue,
    getValues,
    watch,
    label,
    isLoading,
    errors
}) => {
    // Ensure languages is always an array
    const languagesArray = Array.isArray(languages) ? languages : [];
    
    // Find default language
    const defaultLanguage = languagesArray.find(lang => lang.is_default)?.code || 
                            languagesArray[0]?.code || 
                            'en';
    
    // State for current language
    const [currentLang, setCurrentLang] = useState(defaultLanguage);
    
    // Track editor content separately to avoid race conditions with form state
    const [editorContents, setEditorContents] = useState({});
    
    // Get all content from form
    const watchedContent = watch(name) || {};
    
    // Debug what's coming from the API/form
    useEffect(() => {
        console.log("Form content received:", watchedContent);
    }, [watchedContent]);
    
    // Initialize editor contents when form data changes
    useEffect(() => {
        if (watchedContent && Object.keys(watchedContent).length > 0) {
            console.log("Updating editor contents from form data:", watchedContent);
            setEditorContents(prevContents => {
                const newContents = { ...prevContents };
                
                // Update only languages that have content
                Object.entries(watchedContent).forEach(([lang, content]) => {
                    if (content) {
                        newContents[lang] = content;
                    }
                });
                
                return newContents;
            });
        }
    }, [watchedContent]);
    
    // Ensure content exists for all languages
    useEffect(() => {
        if (!languagesArray.length) return;
        
        const updatedContents = { ...editorContents };
        let hasChanges = false;
        
        languagesArray.forEach(lang => {
            const langCode = lang.code;
            // Check if we already have content from the API/form
            const existingContent = watchedContent[langCode];
            
            // If we have content from API/form but not in our state, use that
            if (existingContent && !updatedContents[langCode]) {
                updatedContents[langCode] = existingContent;
                hasChanges = true;
            }
            // If no content exists at all, initialize with empty paragraph
            else if (!updatedContents[langCode] && !existingContent) {
                updatedContents[langCode] = '<p></p>';
                hasChanges = true;
                
                // Update form state too
                const fieldPath = `${name}.${langCode}`;
                setValue(fieldPath, '<p></p>', { shouldDirty: false });
            }
        });
        
        if (hasChanges) {
            console.log("Updated all languages with content:", updatedContents);
            setEditorContents(updatedContents);
        }
    }, [languagesArray, watchedContent, name, setValue, editorContents]);
    
    // Handle language change
    const handleLangChange = (event) => {
        const newLang = event.target.value;
        // Save current content before changing
        saveCurrentContent();
        // Switch language
        setCurrentLang(newLang);
    };
    
    // Save content for current language
    const saveCurrentContent = () => {
        const content = editorContents[currentLang];
        if (content) {
            const fieldPath = `${name}.${currentLang}`;
            setValue(fieldPath, content, { shouldValidate: true });
        }
    };
    
    // Handle editor update
    const handleEditorUpdate = (content) => {
        console.log(`Updating content for ${currentLang}:`, content.substring(0, 50) + '...');
        
        // Update our local state
        setEditorContents(prev => ({
            ...prev,
            [currentLang]: content
        }));
        
        // Also update form state right away
        const fieldPath = `${name}.${currentLang}`;
        setValue(fieldPath, content, { shouldValidate: true });
    };
    
    // Make sure we're looking at the most current data
    const formContent = getValues(name) || {};
    
    // Get current content for selected language, prioritizing:
    // 1. Our local state (most current)
    // 2. Form state via getValues (more reliable than watch)
    // 3. Watched content (from form)
    // 4. Empty paragraph as fallback
    const currentContent = 
        editorContents[currentLang] || 
        formContent[currentLang] || 
        watchedContent[currentLang] || 
        '<p></p>';
    
    return (
        <FormControl fullWidth>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">{label}</Typography>
                {languagesArray.length > 0 && (
                    <Select
                        value={currentLang}
                        onChange={handleLangChange}
                        variant="standard"
                        disableUnderline
                    >
                        {languagesArray.map((lang) => (
                            <MenuItem key={lang.code} value={lang.code}>
                                {lang.name}
                            </MenuItem>
                        ))}
                    </Select>
                )}
            </Box>

            {isLoading ? (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TextEditorInput
                    key={`editor-${currentLang}`}
                    content={currentContent}
                    onUpdate={handleEditorUpdate}
                />
            )}

            {errors?.[currentLang] && (
                <FormHelperText error>{errors[currentLang].message}</FormHelperText>
            )}
        </FormControl>
    );
};

export default MultilangTextEditor;