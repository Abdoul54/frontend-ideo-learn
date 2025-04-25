// utils/categoryUtils.js

/**
 * Extracts the root category from an API response
 * Uses the is_root flag to identify the root category
 */
export const findRootCategory = (apiResponse) => {
    if (!apiResponse) return null;
    
    // Look for root category in extra_data (most common case)
    if (apiResponse.data?.extra_data?.is_root === true) {
      return {
        id: apiResponse.data.extra_data.id,
        title: apiResponse.data.extra_data.title,
        is_root: true
      };
    }
    
    // Look for root category in items array
    if (apiResponse.data?.items && Array.isArray(apiResponse.data.items)) {
      const rootItem = apiResponse.data.items.find(item => item.is_root === true);
      if (rootItem) {
        return {
          id: rootItem.id,
          title: rootItem.title,
          is_root: true
        };
      }
    }
    
    // Fallback: If no is_root flag found, look for other indicators
    // Like id_parent === 0 or null, or lowest level
    if (apiResponse.data?.extra_data) {
      const extraData = apiResponse.data.extra_data;
      if (extraData.id_parent === 0 || extraData.id_parent === null || extraData.lev === 0) {
        return {
          id: extraData.id,
          title: extraData.title,
          is_root: true  // Adding the flag even though it wasn't in the response
        };
      }
    }
    
    // Return null if no root category could be identified
    return null;
  };
  
  /**
   * Checks if a category is a root category
   * Used to simplify parent category handling
   */
  export const isRootCategory = (category) => {
    if (!category) return false;
    
    // First priority: check is_root flag
    if (category.is_root === true) return true;
    
    // Second priority: check parent ID and level
    if (category.id_parent === 0 || category.id_parent === null || category.lev === 0) return true;
    
    return false;
  };
  
  /**
   * Creates a category name payload for API requests
   * Handles both single_value and multi_lang formats
   */
  export const createCategoryNamePayload = (translations, defaultLanguage = 'fr') => {
    const hasAllTranslation = translations.all && translations.all.trim() !== '';
    const hasDefaultTranslation = translations[defaultLanguage] && 
                                 translations[defaultLanguage].trim() !== '';
    
    if (hasAllTranslation) {
      return {
        type: 'single_value',
        value: translations.all.trim()
      };
    } else {
      // Prepare language-specific values
      const langValues = {};
      Object.entries(translations).forEach(([key, value]) => {
        if (key !== 'all' && value && value.trim()) {
          langValues[key] = value.trim();
        }
      });
      
      return {
        type: 'multi_lang',
        values: langValues
      };
    }
  };
  
  /**
   * Extracts category name from various API response formats
   */
  export const extractCategoryName = (category, defaultLanguage = 'fr') => {
    if (!category) return '';
    
    // Handle direct title property
    if (category.title) {
      return category.title;
    }
    
    // Handle names property in different formats
    if (category.names) {
      if (category.names.type === 'single_value') {
        return category.names.value || '';
      } else if (category.names.type === 'multi_lang' && category.names.values) {
        // Try default language first, then any available language
        return category.names.values[defaultLanguage] || 
               Object.values(category.names.values)[0] || '';
      }
    }
    
    // Fallbacks
    return category.category_name || category.code || 'Unnamed Category';
  };