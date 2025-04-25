import OptionMenu from "@/@core/components/option-menu";
import * as yup from "yup";
import {
    Chip,
    Box
} from "@mui/material";

export const customCellRenderers = {
    image: ({ row }) => {
        const { image } = row?.original;
        if (!image) return <Box
            sx={{
                width: 1,
                height: 1,
                borderRadius: '8px',
                backgroundColor: 'background.default',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: `1px solid`,
                borderColor: 'divider',
            }}
        ><i className="solar-gallery-remove-bold-duotone text-2xl" /></Box>
        return <img
            src={image}
            alt="Image"
            className="w-14 h-14 rounded-lg object-cover"
            style={{
                border: '1px solid',
                borderColor: 'divider',
            }}
        />
    },
    status: ({ row }) => {
        const { status } = row?.original;
        const statusLabel = statusTypes.find((item) => item.value === status)?.label;

        return <Chip
            label={statusLabel || 'N/A'}
            size="small"
            color={status === 'published' ? 'success' : 'error'}
            variant="outlined"
        />
    },
    language: ({ row }) => {
        const { lang_string } = row?.original;
        return lang_string
    },
    validity_time: ({ row }) => {
        const { time_options: { validity_time } } = row?.original;
        if (validity_time === null) return 'No Expiration';
        return <Chip variant="outlined" color='secondary'
            size="small"
            label={validity_time < 0 ? 'No Expiration' : validity_time === 1 ? `${validity_time} Day` : `${validity_time} Days`} />

    },
    validity_time_type: ({ row }) => {
        const { time_options: { validity_time_type } } = row?.original;
        const validityTimeLabel = validityTimeTypes.find((item) => item.value === validity_time_type)?.label;

        // Include 0 as a valid value to display
        return (validity_time_type === 0 || validity_time_type) && <Chip
            label={validityTimeLabel || 'N/A'}
            size="small"
            color="primary"
            variant="outlined"
        />
    },
    created_at: ({ row }) => {
        const { created_at } = row?.original;
        return new Date(created_at).toLocaleDateString('en-UK', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    },
    updated_at: ({ row }) => {
        const { updated_at } = row?.original;
        return new Date(updated_at).toLocaleDateString('en-UK', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    },
};

export const actionColumn = (router, setDeleteConfirmation) => {
    return {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: 'Edit',
                        icon: <i className='solar-pen-outline' />,
                        menuItemProps: {
                            // disabled: true,
                            onClick: (e) => {
                                e.stopPropagation();
                                router.push(`/learn/learning-plans/${row?.original?.id}`);
                            },
                            className: 'flex items-center gap-2'
                        },
                    },
                    {
                        text: 'Delete',
                        icon: <i className="solar-trash-bin-2-bold-duotone" />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({
                                    open: true,
                                    data: row?.original,
                                    type: 'deleteOne',
                                    variant: 'default'
                                })
                            },
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                        }
                    },
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
}


export const defaultValues = {
    title: "",
    code: "",
    status: "published",
    short_description: "",
    description: "",
    image: "",
    language: "en",
    enable_deep_link: false,
    validity_time: null,
    validity_time_type: 0,
    validity_time_update_existing: false
}

export const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    code: yup.string(),
    status: yup.string().oneOf(["published", "unpublished"]),
    short_description: yup.string(),
    description: yup.string(),
    image: yup.mixed().nullable(),
    validity_time: yup.number().nullable(),
    validity_time_type: yup.number().oneOf([0, 1]).nullable(),
    validity_time_update_existing: yup.boolean().default(false),
});

export const validityTimeTypes = [
    { value: 0, label: 'From Enrollment' },
    { value: 1, label: 'From First Access' }
]

export const statusTypes = [
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
];

export const columns = (setDeleteConfirmation, changeAssignedCoursesStatus, learningPlanId, setDrawerState) => [
    {
        id: 'code',
        header: 'Code',
        accessorKey: 'code',
        flex: 1
    },
    {
        id: 'title',
        header: 'Title',
        accessorKey: 'title',
        flex: 1
    },
    {
        id: 'type',
        header: 'Type',
        accessorKey: 'type',
        cell: ({ row }) => {
            return (
                <Chip label={row?.original?.type} color="primary" size="small" variant="outlined" />
            )
        },
        flex: 1
    },
    {
        id: 'is_published',
        header: 'Status',
        accessorKey: 'is_published',
        cell: ({ row }) => {
            const status = row?.original?.is_published ? 'success' : 'error';
            const statusText = row?.original?.is_published ? 'Published' : 'Unpublished';
            return (
                <Chip label={statusText} color={status} size="small" variant="outlined" />
            )
        },
        flex: 1
    },
    {
        id: 'prerequisites_count',
        header: 'Prerequisites Count',
        accessorKey: 'prerequisites_count',
        cell: ({ row }) => (
            <Chip
                onClick={(e) => {
                    e.stopPropagation();
                    setDrawerState({
                        open: true,
                        type: 'prerequisites',
                        data: {
                            ...row?.original,
                            learningPlanId: learningPlanId,
                        }
                    })
                }}
                label={row?.original?.prerequisites_count?.toString() || '0'}
                color="secondary"
                size="small"
                variant="outlined"
            />
        ),
        flex: 1
    },
    {
        id: 'category',
        header: 'Category',
        accessorKey: 'category',
        cell: ({ row }) => (
            <Chip
                label={row?.original?.category || 'N/A'}
                color="info"
                size="small"
                variant="outlined"
            />
        ),
        flex: 1
    },
    {
        id: 'sequence',
        header: 'Sequence',
        accessorKey: 'sequence',
        cell: ({ row }) => (
            <Chip
                label={row?.original?.sequence?.toString() || 'N/A'}
                color="warning"
                size="small"
                variant="outlined"
            />
        ),
        flex: 1
    },
    {
        id: 'is_required',
        header: 'Mandatory',
        accessorKey: 'is_required',
        cell: ({ row }) => {
            const isRequired = row?.original?.is_required;
            return isRequired ? (
                <i className="solar-check-circle-line-duotone text-success text-xl" />
            ) : (
                <i className="solar-close-circle-line-duotone text-error text-xl" />
            )
        },
        flex: 1
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: row?.original?.is_required ? 'Change to optional' : 'Change to mandatory',
                        icon: <i className={`${!row?.original?.is_required ? 'solar-check-circle-line-duotone text-success' : 'solar-close-circle-line-duotone text-error'} text-base`} />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                changeAssignedCoursesStatus.mutateAsync({
                                    data: {
                                        items: [
                                            {
                                                id: row?.original?.id_course,
                                                is_required: !row?.original?.is_required
                                            }
                                        ]
                                    },
                                    learningPlanId: learningPlanId
                                })
                            },
                            className: 'flex items-center gap-2',
                        },
                    },
                    {
                        text: 'Unassign from Learning Plan',
                        icon: <i className="solar-folder-error-line-duotone text-base" />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({
                                    open: true,
                                    data: {
                                        ...row?.original,
                                        learningPlanId: learningPlanId,
                                    },
                                    type: 'deleteOne',
                                    variant: 'default'
                                });
                            },
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                        },
                    }
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
]