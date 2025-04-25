/**
 * Generates table columns from a data object definition
 * @param {Object} dataDefinition - Object containing column definitions
 * @param {Object} config - Additional configuration
 * @param {Object} config.actionColumn - Custom action column to append (optional)
 * @returns {Array} Formatted columns for use with DataTable
 */
export const generateColumns = (dataDefinition, config = {}) => {
    if (!dataDefinition) return [];

    const { actionColumn, customCellRenderers = {}, lockedColumns = [] } = config;

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
            filters,
            locked: lockedColumns.includes(value),
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
export const generateInitialVisibility = (dataDefinition, visibleCount = 8, lockedColumns = []) => {
    if (!dataDefinition) return {};

    // Get all fields in the data definition
    const fields = Object.keys(dataDefinition);

    const lockedColumnsInDefinition = fields.filter(field =>
        lockedColumns.includes(dataDefinition[field].value)
    ).length;

    // Adjust remaining slots after accounting for locked columns
    const remainingSlots = Math.max(0, visibleCount - lockedColumnsInDefinition);

    // Create visibility object with first N columns visible by default
    const initialVisibility = {};
    let nonLockedVisibleCount = 0;

    // Iterate through fields to set visibility
    fields.forEach((field) => {
        const columnId = dataDefinition[field].value;
        if (columnId) {
            // If column is locked, it's always visible
            const isLocked = lockedColumns.includes(columnId);

            // For non-locked columns, only show up to the remaining slots
            const shouldBeVisible = isLocked || (nonLockedVisibleCount < remainingSlots);

            initialVisibility[columnId] = shouldBeVisible;

            // Only increment counter for non-locked columns that are visible
            if (shouldBeVisible && !isLocked) {
                nonLockedVisibleCount++;
            }
        }
    });

    return initialVisibility;
};

// Constant for maximum visible columns
export const MAX_VISIBLE_COLUMNS = 8;