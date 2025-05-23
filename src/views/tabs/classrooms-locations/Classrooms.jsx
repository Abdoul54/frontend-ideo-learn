'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import { classroomColumns } from "@/constants/ClassroomsLocations";
import { useClassrooms, useDeleteClassroom, useUnassignLocation } from "@/hooks/api/tenant/learn/classrooms-locations/useClassrooms";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useTranslation } from '@/@core/contexts/translationContext';

const Classrooms = ({ setDrawerState }) => {
    const { translate } = useTranslation();
    
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const [columnVisibility, setColumnVisibility] = useState({});

    const { data, isLoading, error } = useClassrooms({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
    })


    const unassignLocation = useUnassignLocation()
    const deleteClassroom = useDeleteClassroom();

    const handleDeleteSubmit = async () => {
        try {
            if (deleteConfirmation?.type === 'deleteOne') {
                // Return the Promise so the dialog knows to wait
                return deleteClassroom.mutateAsync(deleteConfirmation?.data?.id);
            }
        } catch (error) {
            console.error('Error deleting classroom:', error);
            throw error; // Re-throw so dialog can handle it
        }
    }

    return (
        <>
            <DataView
                title={translate('CL management.TAB_CLASSROOMS', "Classrooms")}
                columns={classroomColumns(setDrawerState, setDeleteConfirmation, unassignLocation)}
                data={data?.items}
                height="calc(100vh - 325px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                enableSelection={false}
                noToolbar
                slots={{
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
                    }, 
                    emptyState: {
                        message: translate('CL management.NO_CLASSROOMS_FOUND', 'No classrooms found'),
                        description: translate('CL management.TRY_CREATING', 'Try creating a new classroom'),
                        height: 'calc(100vh - 465px)'
                    }
                }}
                datatablemulti={false}
            />

            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={translate('CL management.DIALOG_TITLE_DELETE_CLASSROOM', {name: deleteConfirmation?.data?.name})}
                    message={translate('CL management.DIALOG_MESSAGE_DELETE_CLASSROOM', {name: deleteConfirmation?.data?.name})}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            success: translate('CL management.CLASSROOM_DELETED', 'Classroom deleted successfully'),
                            error: translate('CL management.CLASSROOM_DELETE_ERROR', 'Error deleting classroom'),
                            show: false,
                        },
                        icons: {
                            confirm: null,
                            cancel: null
                        },
                        buttons: {
                            confirm: translate('common.delete', 'Delete'),
                            cancel: translate('common.cancel', 'Cancel'),
                            processing: translate('common.deleting', 'Deleting...'),
                        },
                        onConfirm: handleDeleteSubmit,
                        isLoading: deleteClassroom.isPending,
                    }}
                    confirmationWord={deleteConfirmation?.data?.name}
                    typingConfirmation
                    isAsync
                />
            }
        </>
    );
};

export default Classrooms;
