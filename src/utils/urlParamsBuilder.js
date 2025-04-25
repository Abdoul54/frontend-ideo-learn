export const urlParamsBuilder = ({
    prefix,
    page,
    page_size = null,
    search = null,
    sort = [],
    filters = null,
    haykal_id = null,
    branch_id = null,
    selection_status = null,
    search_type = null,
    sort_attr = null,
    sort_dir = null,
    area = null,
    noPagination = null,
    action,
    status,
    user_id,
    ip_address,
    get_total_count,
    include_stats,
    period,
    start_date,
    end_date,
    parent_id,
    category_id,
    skip_all = null,
    with_pagination = null,
    with_extra_data = null,
    extra_filters = null,
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
    if (category_id !== null && category_id !== undefined) {
        // If category_id is an object with an id property, extract the id
        const id = typeof category_id === 'object' && category_id !== null ?
            category_id.id : parseInt(category_id, 10);

        // Only append if it's a valid number
        if (!isNaN(id)) {
            params.append('category_id', id);
        }
    }
    if (parent_id !== null && parent_id !== undefined) {
        // If parent_id is an object with an id property, extract the id
        const id = typeof parent_id === 'object' && parent_id !== null ?
            parent_id.id : parseInt(parent_id, 10);

        // Only append if it's a valid number
        if (!isNaN(id)) {
            params.append('parent_id', id);
        }
    }
    if (extra_filters) {
        params.append('extra_filters', JSON.stringify(extra_filters));
    }
    if (with_extra_data) {
        params.append('with_extra_data', with_extra_data)
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

    /** Special for Partner's logs */
    if (action) params.append('action', action);
    if (status) params.append('status', status);
    if (user_id) params.append('user_id', user_id);
    if (ip_address) params.append('ip_address', ip_address);
    if (get_total_count) params.append('get_total_count', get_total_count);
    if (include_stats) params.append('include_stats', include_stats);
    if (period) params.append('period', period);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (skip_all) params.append('skip_all', 1);
    if (!with_pagination) params.append('with_pagination', with_pagination);




    return `${prefix}${params.toString() ? '?' + params.toString() : ''}`;
};