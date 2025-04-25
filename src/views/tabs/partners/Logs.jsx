
import ActivityLogsFilter from '@/components/ActivityLogsFilter';
import { logsColumns } from '@/constants/partners';
import { usePartnerActivityLogs } from '@/hooks/api/tenant/usePartners';
import DataView from '@/views/DataView';
import { useState } from 'react';

const Logs = ({ id }) => {

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState(null);

    const [columnVisibility, setColumnVisibility] = useState({});

    const { data, isLoading, error } = usePartnerActivityLogs({
        partnerId: id,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
        action: filters?.action,
        status: filters?.status,
        user_id: filters?.user_id,
        ip_address: filters?.ip_address,
        get_total_count: filters?.get_total_count,
        include_stats: filters?.include_stats,
        period: filters?.period,
        start_date: filters?.start_date,
        end_date: filters?.end_date
    });

    return (
        <DataView
            title="Activity Logs"
            columns={logsColumns}
            data={data?.items}
            height="calc(100vh - 328px)"
            isLoading={isLoading}
            error={error}
            enableSelection={false}
            pagination={{ ...pagination, total: data?.pagination?.total }}
            setPagination={setPagination}
            filterComponent={<ActivityLogsFilter onFilter={
                (filters) => {
                    setFilters(filters);
                    setPagination({ ...pagination, pageIndex: 0 });
                }
            } />}
            // selectedRows={selectedRows}
            // setSelectedRows={setSelectedRows}
            toolbar={{
                breadcrumbs: [{ label: 'Power Users', path: '/power-users' }],
                buttonGroup: [{
                    text: 'Add Profile',
                    variant: 'contained',
                    tooltip: 'Add new profile',
                    icon: 'solar-add-circle-outline',
                    onClick: () => setDrawerState({ open: true, data: null })
                }]
            }}
            // selectAll={selectAll}
            // onSelectAllChange={setSelectAll}
            slots={{
                globalFilter,
                setGlobalFilter,
                filters,
                setFilters,
                sorting,
                setSorting,
                columnVisibility,
                setColumnVisibility,
                features: {
                    search: true,
                    filter: true,
                    columnVisibility: true
                }, emptyState: {
                    height: 'calc(100vh - 484px)'
                }
            }}
            noToolBar
        />
    );
};

export default Logs;