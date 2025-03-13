'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import { columns } from "@/constants/manager-service/ManagerSubordinate";
import { useSubordinates } from "@/hooks/api/tenant/useManager";

const Page = () => {
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});


    const { data, isLoading, error } = useSubordinates({
        search_text: globalFilter,
        page: pagination.pageIndex,
        page_size: pagination.pageSize,
        sort: sorting,
        filters
    })

    return (
        <>
            <DataView
                title="Team Requests"
                columns={columns}
                data={data?.items}
                height="calc(100vh - 182px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                toolbar={{
                    breadcrumbs: [{ label: 'Manage Team Requests', link: "/manage/manage-team-requests" }]
                }}
                slots={{
                    filters,
                    setFilters,
                    globalFilter,
                    setGlobalFilter,
                    sorting,
                    setSorting,
                    columnVisibility,
                    setColumnVisibility,
                    features: {
                        search: true,
                        filter: false,
                        columnVisibility: true
                    }
                }}
                emptyState={{
                    title: 'No team requests found',
                    description: 'Try changing the filters or search query'
                }}
            />
        </>
    );
};


export default Page;