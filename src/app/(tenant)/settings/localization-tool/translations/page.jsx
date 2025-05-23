'use client';

import { useState } from "react";
import DataView from "@/views/DataView";
import { useTranslations } from "@/hooks/api/tenant/useLocalization";
import { IconButton, Tooltip } from "@mui/material";
import TranslationDialog from "@/views/Dialogs/TranslationDialog";
import { useTranslateSearch } from "@/hooks/useTranslateSearch";

const Page = () => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});

    const [dialogState, setDialogState] = useState({
        open: false,
        data: null
    });

    const {
        module,
        setModule,
        language,
        setLanguage,
        comparedTo,
        setComparedTo,
    } = useTranslateSearch();

    const { data, isLoading, error } = useTranslations({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        language: language?.code,  // Use just the code here
        module: module,
        compare_to: comparedTo?.code,  // Use just the code here
    });

    return (
        <>
            <DataView
                title="Translations"
                columns={[
                    {
                        accessorKey: 'group',
                        header: 'Group',
                        flex: 1,
                        enableSorting: false,
                    },
                    {
                        accessorKey: 'key',
                        header: 'Key',
                        flex: 1,
                        enableSorting: false,
                    },
                    {
                        accessorKey: 'text_language',
                        header: 'Text Language',
                        flex: 1,
                        enableSorting: false,
                    },
                    {
                        accessorKey: 'text_compare',
                        header: 'Text Compare',
                        flex: 1,
                        enableSorting: false,
                    },
                    {
                        accessorKey: 'translate',
                        header: '',
                        cell: ({ cell }) => (
                            <Tooltip title="Translate" arrow>
                                <IconButton onClick={() => {
                                    setDialogState({
                                        open: true,
                                        data: {
                                            ...cell.row.original,
                                            language,
                                            comparedTo,
                                        },
                                    })
                                }}>
                                    <i className="lucide-square-pen text-base" />
                                </IconButton>
                            </Tooltip>
                        ),
                        flex: .1,
                        enableSorting: false,
                    }
                ]}
                data={data?.items}
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                toolbar={{
                    breadcrumbs: [
                        { label: 'Localization Tool', link: '/settings/localization-tool' },
                        { label: 'Translations', link: '/settings/localization-tool/translations' }
                    ],
                    buttonGroup: [{
                        text: 'Import',
                        variant: 'contained',
                        tooltip: 'Import translations',
                        icon: 'solar-import-linear',
                        onClick: () => console.log('Importing..')
                    }]
                }}
                slots={{
                    globalFilter,
                    setGlobalFilter,
                    columnVisibility,
                    setColumnVisibility,
                    module: { value: module, onChange: setModule },
                    comparedTo: { value: comparedTo, onChange: setComparedTo },
                    language: { value: language, onChange: setLanguage },
                    features: {
                        search: true,
                        filter: false,
                        columnVisibility: true,
                        languageTools: true,
                    }
                }}
                enableSelection={false}
            />
            {
                dialogState.open && (
                    <TranslationDialog
                        open={dialogState.open}
                        onClose={() => setDialogState({ ...dialogState, open: false })}
                        data={dialogState.data}
                    />
                )
            }
        </>
    );
};

export default Page;