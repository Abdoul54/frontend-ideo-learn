'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import { useRemovePowerUser, useUnassignPowerUserProfiles } from "@/hooks/api/tenant/usePowerUsers";
import { classroomColumns } from "@/constants/ClassroomsLocations";
import ClassroomDrawer from "@/views/Forms/Classrooms/ClassroomDrawer";
import { useClassrooms, useDeleteClassroom, useUnassignLocation } from "@/hooks/api/tenant/learn/classrooms-locations/useClassrooms";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import AssignLocationDrawer from "@/views/Forms/Classrooms/AssignLocationDrawer";


const Classrooms = () => {
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    const [drawerState, setDrawerState] = useState({
        open: false,
        data: null,
        type: null,
    });

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
        filters
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
                title="Classrooms"
                columns={classroomColumns(setDrawerState, setDeleteConfirmation,unassignLocation)}
                data={data?.items}
                height="calc(100vh - 300px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                enableSelection={false}

                toolbar={{
                    buttonGroup: [
                        {
                            text: "Add Classroom",
                            variant: "contained",
                            tooltip: "Create a new classroom",
                            icon: "lucide-plus",
                            onClick: () => setDrawerState({ open: true, data: null, type: 'add' }),
                        },
                    ]
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
                    }, emptyState: {
                        height: 'calc(100vh - 455px)'
                    }
                }}

                datatablemulti={false}
            />
            {
                drawerState?.open && (drawerState?.type === 'edit' || drawerState?.type === 'add') && <ClassroomDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, data: null })}
                    data={drawerState?.data}
                />
            }
            {
                drawerState?.open && drawerState?.type === 'assign' && <AssignLocationDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, data: null })}
                    data={drawerState?.data}
                />
            }
            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={`Delete "${deleteConfirmation?.data?.name}"`}
                    message={`Are you sure you want to delete "${deleteConfirmation?.data?.name}"?`}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            success: 'Classroom deleted successfully',
                            error: 'Error deleting classroom',
                            show: false,
                        },
                        icons: {
                            confirm: null,
                            cancel: null
                        },
                        buttons: {
                            confirm: 'Delete',
                            cancel: 'Cancel',
                            processing: 'Deleting...',
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

export default Classrooms
