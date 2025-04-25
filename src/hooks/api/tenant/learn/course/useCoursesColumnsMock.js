/**
 * Mock data for course columns
 * Used as a temporary replacement for the /tenant/taallum/v1/courses/importer_fields API
 */

export const courseColumnsData = {
  "success": true,
  "name": "Course Mappable fields retrieved successfully",
  "data": {
    "name": {
      "value": "name",
      "resource_field_name": "name",
      "header": "Course Name",
      "type": "text",
      "filters": ["equals", "not_equals", "contains", "starts_with", "ends_with"]
    },
    "code": {
      "value": "code",
      "resource_field_name": "code",
      "header": "Course Code",
      "type": "text",
      "filters": ["equals", "not_equals", "contains", "starts_with", "ends_with"]
    },
    "short_description": {
      "value": "short_description",
      "resource_field_name": "short_description",
      "header": "Short Description",
      "type": "text",
      "filters": ["equals", "not_equals", "contains", "is_null", "is_not_null"]
    },
    "course_type": {
      "value": "course_type",
      "resource_field_name": "course_type",
      "header": "Course Type",
      "type": "select",
      "filters": ["equals", "not_equals"],
      "options": [
        { "value": "elearning", "label": "E-Learning" },
        { "value": "classroom", "label": "Classroom" },
        { "value": "webinar", "label": "Webinar" }
      ]
    },
    "status": {
      "value": "status",
      "resource_field_name": "status",
      "header": "Status",
      "type": "select",
      "filters": ["equals", "not_equals"],
      "options": [
        { "value": "published", "label": "Published" },
        { "value": "unpublished", "label": "Unpublished" }
      ]
    },
    "category_id": {
      "value": "category_id",
      "resource_field_name": "category_id",
      "header": "Category",
      "type": "select",
      "filters": ["equals", "not_equals", "is_null", "is_not_null"]
    },
    "language": {
      "value": "language",
      "resource_field_name": "language",
      "header": "Language",
      "type": "text",
      "filters": ["equals", "not_equals"]
    },
    "duration_hours": {
      "value": "duration_hours",
      "resource_field_name": "duration_hours",
      "header": "Duration (Hours)",
      "type": "number",
      "filters": ["equals", "not_equals", "greater_than", "less_than", "between"]
    },
    "duration_minutes": {
      "value": "duration_minutes",
      "resource_field_name": "duration_minutes",
      "header": "Duration (Minutes)",
      "type": "number",
      "filters": ["equals", "not_equals", "greater_than", "less_than", "between"]
    },
    "can_subscribe": {
      "value": "can_subscribe",
      "resource_field_name": "can_subscribe",
      "header": "Can Subscribe",
      "type": "boolean",
      "filters": ["equals", "not_equals"]
    },
    "sub_start_date": {
      "value": "sub_start_date",
      "resource_field_name": "sub_start_date",
      "header": "Subscription Start Date",
      "type": "date",
      "filters": ["equals", "not_equals", "greater_than", "less_than", "between", "is_null", "is_not_null"]
    },
    "sub_end_date": {
      "value": "sub_end_date",
      "resource_field_name": "sub_end_date",
      "header": "Subscription End Date",
      "type": "date",
      "filters": ["equals", "not_equals", "greater_than", "less_than", "between", "is_null", "is_not_null"]
    },
    "date_begin": {
      "value": "date_begin",
      "resource_field_name": "date_begin",
      "header": "Course Start Date",
      "type": "date",
      "filters": ["equals", "not_equals", "greater_than", "less_than", "between", "is_null", "is_not_null"]
    },
    "date_end": {
      "value": "date_end",
      "resource_field_name": "date_end",
      "header": "Course End Date",
      "type": "date",
      "filters": ["equals", "not_equals", "greater_than", "less_than", "between", "is_null", "is_not_null"]
    },
    "enable_deep_link": {
      "value": "enable_deep_link",
      "resource_field_name": "enable_deep_link",
      "header": "Enable Deep Link",
      "type": "boolean",
      "filters": ["equals", "not_equals"]
    },
    "uuid": {
      "value": "uuid",
      "resource_field_name": "uuid",
      "header": "UUID",
      "type": "text",
      "filters": ["equals", "not_equals"]
    },
    "created_at": {
      "value": "created_at",
      "resource_field_name": "created_at",
      "header": "Creation Date",
      "type": "datetime",
      "filters": ["equals", "not_equals", "greater_than", "less_than", "between"]
    },
    "updated_at": {
      "value": "updated_at",
      "resource_field_name": "updated_at",
      "header": "Last Updated",
      "type": "datetime",
      "filters": ["equals", "not_equals", "greater_than", "less_than", "between"]
    }
  },
  "status": 200
};

/**
 * Mock service function that simulates the API call
 * Returns a promise to mimic asynchronous behavior
 */
export const mockGetCourseColumns = () => {
  return new Promise((resolve) => {
    // Add a small delay to simulate network latency
    setTimeout(() => {
      resolve(courseColumnsData);
    }, 300);
  });
};