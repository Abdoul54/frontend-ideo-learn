import { useAssignedCourses, useDeleteAssignedCourses, useUpdateAssignedCoursesStatus } from "@/hooks/api/tenant/learn/useLearningPlan";
import DataView from "@/views/DataView";
import { useState } from "react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import ButtonOptionMenu from "@/@core/components/button-option-menu";
import { columns } from "@/constants/LearningPlan";
import PrerequisitesDrawer from "@/views/Forms/LearningPlans/PrerequisitesDrawer";

const Courses = ({ learningPlanId }) => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [drawerState, setDrawerState] = useState({
        open: false,
        type: null,
        data: null
    });


    const { data, isLoading, error } = useAssignedCourses({
        learningPlanId,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    });


    // const data = {
    //     "items": [
    //         {
    //             "id_course": 4,
    //             "uid": "300ff2e4-0419-4475-be75-8c65694b29dc",
    //             "code": "E-AABJUC",
    //             "title": "f",
    //             "type": "elearning",
    //             "language": {
    //                 "code": "fr",
    //                 "name": "French",
    //                 "browser_code": null
    //             },
    //             "create_date": "2025-04-11",
    //             "is_published": false,
    //             "prerequisites_count": 1,
    //             "prerequisites_completion": {
    //                 "all_courses": true,
    //                 "courses_to_be_completed": null,
    //                 "postpone_access": false,
    //                 "time": null,
    //                 "time_unit": null
    //             },
    //             "is_required": false,
    //             "category": null,
    //             "sequence": 1
    //         },
    //         {
    //             "id_course": 5,
    //             "uid": "059e5bc9-8a3b-4839-83e4-5403b22713ea",
    //             "code": "E-TXZ8PZ",
    //             "title": "teest lp",
    //             "type": "elearning",
    //             "language": {
    //                 "code": "fr",
    //                 "name": "French",
    //                 "browser_code": null
    //             },
    //             "create_date": "2025-04-11",
    //             "is_published": false,
    //             "prerequisites_count": 2,
    //             "prerequisites_completion": {
    //                 "all_courses": false,
    //                 "courses_to_be_completed": 1,
    //                 "postpone_access": false,
    //                 "time": null,
    //                 "time_unit": null
    //             },
    //             "is_required": true,
    //             "category": null,
    //             "sequence": 2
    //         },
    //         {
    //             "id_course": 6,
    //             "uid": "0328a721-5157-48c2-aca2-8a2bce73c28e",
    //             "code": "E-XVM9GR",
    //             "title": "lp test course 001",
    //             "type": "elearning",
    //             "language": {
    //                 "code": "fr",
    //                 "name": "French",
    //                 "browser_code": null
    //             },
    //             "create_date": "2025-04-11",
    //             "is_published": false,
    //             "prerequisites_count": 1,
    //             "prerequisites_completion": {
    //                 "all_courses": true,
    //                 "courses_to_be_completed": null,
    //                 "postpone_access": false,
    //                 "time": null,
    //                 "time_unit": null
    //             },
    //             "is_required": true,
    //             "category": null,
    //             "sequence": 3
    //         }
    //     ],
    //     "pagination": {
    //         "total": 3,
    //         "per_page": 15,
    //         "current_page": 1,
    //         "last_page": 1,
    //         "has_more": false
    //     }
    // }

    // const isLoading = false;
    // const error = null;



    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const changeAssignedCoursesStatus = useUpdateAssignedCoursesStatus();
    const deleteAssignedCourses = useDeleteAssignedCourses();

    const handleDeleteSubmit = async (data) => {
        try {
            if (deleteConfirmation?.type === 'deleteMany') {
                // Return the Promise so the dialog knows to wait
                // items should be an array of ids
                const result = await deleteAssignedCourses.mutateAsync({
                    data: {
                        items: deleteConfirmation?.data?.items?.map(row => row?.id_course),
                    },
                    learningPlanId: learningPlanId
                });
                // Clear selection after successful deletion
                setSelectedRows([]);
                return result;
            } else if (deleteConfirmation?.type === 'deleteOne') {
                // Return the Promise so the dialog knows to wait
                const result = await deleteAssignedCourses.mutateAsync({
                    data: {
                        items: [
                            deleteConfirmation?.data?.id_course,
                        ],
                    },
                    learningPlanId: learningPlanId
                });
                // Clear selection after successful deletion
                setSelectedRows([]);
                return result;
            }
        } catch (error) {
            console.error('Error deleting skills:', error);
            throw error; // Re-throw so dialog can handle it
        }
    }

    return (
        <>
            <DataView
                title="Courses"
                columns={columns(setDeleteConfirmation, changeAssignedCoursesStatus, learningPlanId, setDrawerState)}
                data={data?.items}
                height="calc(100vh - 328px)"
                isLoading={isLoading}
                error={error}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                getRowId={row => row?.id_course}
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
                        height: 'calc(100vh - 484px)'
                    }
                }}
                noToolBar
                multiselectionActionBar={{
                    selectedRows,
                    total: data?.pagination?.total,
                    onClearSelection: () => setSelectedRows([]),
                    primaryActions: [
                        {
                            id: 'delete',
                            label: 'Unassign from Learning Plan',
                            color: 'error',
                            handler: () => setDeleteConfirmation({ open: true, data: { items: selectedRows, learningPlanId }, type: 'deleteMany', variant: 'simple' }),
                        },
                        {
                            component: <ButtonOptionMenu
                                buttonText="Change Status"
                                buttonVariant="outlined"
                                buttonSize="small"
                                buttonColor="secondary"
                                options={[
                                    {
                                        text: 'Mandatory',
                                        icon: <i className="solar-check-circle-line-duotone text-success" />,
                                        menuItemProps: {
                                            onClick: () => changeAssignedCoursesStatus.mutateAsync({
                                                data: {
                                                    items: selectedRows?.map(row => ({ id: row?.id_course, is_required: true })),

                                                },
                                                learningPlanId: learningPlanId
                                            })
                                        }
                                    },
                                    {
                                        text: 'Optional',
                                        icon: <i className="solar-close-circle-line-duotone text-error" />,
                                        menuItemProps: {
                                            onClick: () => changeAssignedCoursesStatus.mutateAsync({
                                                data: { items: selectedRows?.map(row => ({ id: row?.id_course, is_required: false })) },
                                                learningPlanId: learningPlanId
                                            })
                                        }
                                    },
                                ]
                                }
                            />
                        },
                    ]
                }}

                datatablemulti
                enableSelection
            />
            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={deleteConfirmation?.type === 'deleteMany' ? `Delete ${selectedRows?.length} learning plans` : `Delete "${deleteConfirmation?.data?.title}"`}
                    message={deleteConfirmation?.type === 'deleteMany' ? 'Are you sure you want to delete the selected learning plans?' : `Are you sure you want to delete "${deleteConfirmation?.data?.title}"?`}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
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
                        isLoading: deleteConfirmation.isLoading,
                    }}
                    confirmationWord={deleteConfirmation?.data?.title}
                    typingConfirmation={deleteConfirmation?.type === 'deleteOne' ? true : false}
                    isAsync
                />
            }
            {
                drawerState?.open && drawerState?.type === 'prerequisites' &&
                <PrerequisitesDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
        </>
    );
};

export default Courses;