// frontend/src/constants/haykal.js
import * as yup from 'yup';

export const haykalFilterSchema = yup.object().shape({
  haykal_id: yup.number().optional(),
  lang: yup.string().oneOf(['en', 'fr', 'ar', 'tzm']).optional(),
  search_text: yup.string().optional(),
  search_type: yup.number().oneOf([1, 2, 3]).optional(),
  flattened: yup.boolean().optional(),
  sort_attr: yup.string().oneOf(['id', 'code', 'title']).optional(),
  sort_dir: yup.string().oneOf(['asc', 'desc']).optional(),
  page: yup.number().optional(),
  page_size: yup.number().optional()
});

// Type definitions
/**
 * @typedef {Object} Haykal
 * @property {number} id
 * @property {string} code
 * @property {string} title
 * @property {number} lev
 * @property {number} iLeft
 * @property {number} iRight
 * @property {boolean} has_children
 * @property {number} parent_id
 * @property {string} parent_code
 */

/**
 * @typedef {Object} HaykalDetails
 * @property {number} idOrg
 * @property {number} idParent
 * @property {number} lev
 * @property {number} iLeft
 * @property {number} iRight
 * @property {string} code
 * @property {string} title
 * @property {Object.<string, string>} translations
 */