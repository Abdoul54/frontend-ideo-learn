export const urlParamsBuilder = ({
    prefix,
    page,
    page_size = null,
    search = null,
    sort = [],
    filters = [],
    haykal_id = null,
    branch_id = null,
    selection_status = null,
    search_type = null,
    sort_attr = null,
    sort_dir = null,
    area = null,
    noPagination = null
}) => {
    const params = new URLSearchParams();

    // Only add parameters if they have values
    if (page && page >= 0) params.append('page', page);
    if (page_size) params.append('page_size', page_size);

    // Only include search_text if there's a search
    if (search) {
        params.append('search_text', search);
        // Only include search_type when there's a search query
        if (search_type) params.append('search_type', search_type);
    }

    if (haykal_id !== null && haykal_id !== undefined) {
        // If haykal_id is an object with an id property, extract the id
        const id = typeof haykal_id === 'object' && haykal_id !== null ?
            haykal_id.id : parseInt(haykal_id, 10);

        // Only append if it's a valid number
        if (!isNaN(id)) {
            params.append('haykal_id', id);
        }
    }
    if (branch_id !== null && branch_id !== undefined) {
        // If branch_id is an object with an id property, extract the id
        const id = typeof branch_id === 'object' && branch_id !== null ?
            branch_id.id : parseInt(branch_id, 10);

        // Only append if it's a valid number
        if (!isNaN(id)) {
            params.append('branch_id', id);
        }
    }
    if (selection_status) params.append('selection_status', selection_status);
    if (sort_attr) params.append('sort_attr', sort_attr);
    if (sort_dir) params.append('sort_dir', sort_dir);

    if (sort?.length > 0) {
        params.append('sort', JSON.stringify(sort));
    }

    if (filters) {
        params.append('filters', JSON.stringify(filters));
    }

    if (noPagination) {
        params.append('no_pagination', noPagination)
    }

    if (area) {
        params.append('area', area)
    }

    return `${prefix}${params.toString() ? '?' + params.toString() : ''}`;
};