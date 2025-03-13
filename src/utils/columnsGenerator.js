/**
 * Generates table columns from a data object definition
 * @param {Object} dataDefinition - Object containing column definitions
 * @param {Object} config - Additional configuration
 * @param {Object} config.actionColumn - Custom action column to append (optional)
 * @returns {Array} Formatted columns for use with DataTable
 */
export const generateColumns = (dataDefinition, config = {}) => {
    if (!dataDefinition) return [];

    const { actionColumn, customCellRenderers = {} } = config;

    // Transform data object to array of column configs
    const dataArray = Object.entries(dataDefinition).map(([key, value]) => ({
        field: key,
        ...value
    }));

    // Format columns with required properties
    const columns = dataArray.map((item) => {
        const { value, header, resource_field_name, type, filters, options } = item;

        // Create the base column with an explicit id
        const column = {
            id: value,
            header: header,
            accessorKey: resource_field_name,
            type,
            flex: 1,
            enableSorting: true,
            filters
        };

        // Add options if they exist
        if (options) {
            column.options = options;
        }

        // Apply custom cell renderer if provided
        if (customCellRenderers[value]) {
            column.cell = customCellRenderers[value];
        }

        return column;
    });

    // Add action column if provided
    if (actionColumn) {
        const actionColumnWithId = {
            id: 'actions',
            ...actionColumn
        };
        columns.push(actionColumnWithId);
    }

    return columns;
};

// Helper function to generate initial column visibility state
export const generateInitialVisibility = (dataDefinition, visibleCount = 8) => {
    if (!dataDefinition) return {};

    // Get all fields in the data definition
    const fields = Object.keys(dataDefinition);

    // Get the maximum number of visible columns
    const maximumVisibleColumns = fields?.length > visibleCount ? visibleCount : fields;

    // Create visibility object with first N columns visible by default
    const initialVisibility = {};

    fields.forEach((field, index) => {
        const columnId = dataDefinition[field].value;
        if (columnId) {
            initialVisibility[columnId] = index < maximumVisibleColumns;
        }
    });

    return initialVisibility;
};

// Constant for maximum visible columns
export const MAX_VISIBLE_COLUMNS = 8;