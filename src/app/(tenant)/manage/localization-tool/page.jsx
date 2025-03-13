'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import { useChangeLocalizationStatus, useLocalization } from "@/hooks/api/tenant/useLocalization";
import { columns } from "@/constants/LocalizationTool";
import LocalizationToolDrawer from "@/views/Forms/LocalizationTool/LocalizationToolDrawer";

const Page = () => {
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [drawerState, setDrawerState] = useState({
        open: false,
        data: null

    });
    const [columnVisibility, setColumnVisibility] = useState({});
    const changeLocalizationStatus = useChangeLocalizationStatus()


    const { data, isLoading, error } = useLocalization({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
        filters
    })

    return (
        <>
            <DataView
                title="Users"
                columns={columns(drawerState, setDrawerState, changeLocalizationStatus)}
                data={data?.items}
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                toolbar={{
                    breadcrumbs: [{ label: 'Localization Tool', link: '/manage/localization-tool' }],
                    buttonGroup: [{
                        text: 'Import',
                        variant: 'contained',
                        tooltip: 'Import translations',
                        icon: 'solar-import-linear',
                        onClick: () => console.log('Importing..')
                    }]
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
                enableSelection={false}
            />
            <LocalizationToolDrawer
                open={drawerState?.open}
                onClose={() => setDrawerState({ open: false, data: null })}
                localization={drawerState?.data}
            />
        </>
    );
};


export default Page