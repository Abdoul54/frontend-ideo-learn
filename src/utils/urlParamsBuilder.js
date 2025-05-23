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
    folderId = null,
    lang = null,
    type,
    exclude_learningunit_ids,
    last_updated_from,
    created_from,
    created_to,
    updated_from,
    updated_to,
    content_type,
    resource_type,
    language,
    module,
    compare_to,

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

    if (search_type) params.append('search_type', search_type);

    if (haykal_id !== null && haykal_id !== undefined) {
        // If haykal_id is an object with an id property, extract the id
        const id = typeof haykal_id === 'object' && haykal_id !== null ?
            haykal_id.id : parseInt(haykal_id, 10);

        // Only append if it's a valid number
        if (!isNaN(id)) {
            params.append('haykal_id', id);
        }
    }

    if (folderId !== null && folderId !== undefined) {
        // If folderId is an object with an id property, extract the id
        const id = typeof folderId === 'object' && folderId !== null ?
            folderId.id : parseInt(folderId, 10);

        // Only append if it's a valid number
        if (!isNaN(id)) {
            params.append('folder_id', id);
        }
    }

    if (status) {
        // Handle status as possible array
        if (Array.isArray(status)) {
            status.forEach(s => params.append('status', s));
        } else {
            params.append('status', status);
        }
    }

    if (type) {
        // Handle type as possible array
        if (Array.isArray(type)) {
            type.forEach(t => params.append('type', t));
        } else {
            params.append('type', type);
        }
    }
    if (exclude_learningunit_ids) params.append('exclude_learningunit_ids', exclude_learningunit_ids);
    if (last_updated_from) params.append('last_updated_from', last_updated_from);
    if (created_from) params.append('created_from', created_from);
    if (created_to) params.append('created_to', created_to);
    if (updated_from) params.append('updated_from', updated_from);
    if (updated_to) params.append('updated_to', updated_to);
    if (content_type) params.append('content_type', content_type);

    if (lang !== null && lang !== undefined) {
        params.append('lang', lang);
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

    if (sort?.length > 0 && sort[0]?.id) {
        params.append('sort_dir', sort[0]?.desc ? 'desc' : 'asc');
        params.append('sort_attr', sort[0]?.id);
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
    if (user_id) params.append('user_id', user_id);
    if (ip_address) params.append('ip_address', ip_address);
    if (get_total_count) params.append('get_total_count', get_total_count);
    if (include_stats) params.append('include_stats', include_stats);
    if (period) params.append('period', period);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (skip_all) params.append('skip_all', 1);
    if (with_pagination !== null && with_pagination !== undefined) params.append('with_pagination', with_pagination);


    if (language) {
        // Handle language as possible array
        if (Array.isArray(language)) {
            language.forEach(l => params.append('language', l));
        } else {
            params.append('language', language);
        }
    }
    // module has space in it
    if (module) {
        if (module) {
            params.set('module', module);
        }
    }

    if (compare_to) params.append('compare_to', compare_to);
    if (resource_type) params.append('resource_type', resource_type);


    return `${prefix}${params.toString() ? '?' + params.toString() : ''}`;
};


