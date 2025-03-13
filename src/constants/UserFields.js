import OptionMenu from "@/@core/components/option-menu";
import * as yup from "yup";

export const columns = (setDrawerState, setDeleteConfirmation, setAssignUserFieldsToHaykalDrawerOpen) => [
    {
        header: 'Field Name',
        accessorKey: 'title',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Field Category',
        accessorKey: 'type',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Mandatory',
        accessorKey: 'mandatory',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Invisible to the user',
        accessorKey: 'invisible_to_user',
        flex: 1,
        enableSorting: true
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: 'Edit',
                        icon: <i className="solar-pen-2-bold-duotone text-base" />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({
                                    open: true, data: row.original
                                })
                            },
                            className: 'flex items-center gap-2',
                        }
                    },
                    // {
                    //     text: 'Assign userFields to Haykal',
                    //     icon: <i className="solar-text-field-bold-duotone text-base" />,
                    //     menuItemProps: {
                    //         onClick: (e) => {
                    //             e.stopPropagation();
                    //             setAssignUserFieldsToHaykalDrawerOpen([row.original.id], true);
                    //         },
                    //         className: 'flex items-center gap-2'
                    //     }
                    // },
                    {
                        text: 'Delete',
                        icon: <i className="solar-trash-bin-2-bold-duotone" />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({
                                    open: true, data: row.original
                                })
                            },
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                        }
                    }
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
];

export const fieldTypes = [
    { value: 'dropdownfield', label: 'Dropdown Field' },
    { value: 'textfield', label: 'Text Field' },
    { value: 'iframe', label: 'IFrame' },
    { value: 'fiscalecode', label: 'Fiscale Code' },
    { value: 'country', label: 'Country' },
    { value: 'datefield', label: 'Date Field' },
    { value: 'filefield', label: 'File Field' },
    { value: 'yesnofield', label: 'Yes/No Field' },
    { value: 'textarea', label: 'Text Area' }
];


export const defaultValues = {
    type: 'textfield',
    mandatory: false,
    invisible_to_user: false,
    sequence: 1,
    translations: {
        all: '',
        en: '',
        fr: '',
        es: '',
        ar: ''
    },
    settings: {},
    dropdown_options: []
}

export const createSchema = (isUniversal, defaultLanguage = 'en') => yup.object({
    type: yup.string().oneOf(fieldTypes.map(ft => ft.value)).required('Field type is required'),
    mandatory: yup.boolean(),
    invisible_to_user: yup.boolean(),
    sequence: yup.number().integer().nullable(),
    settings: yup.object().when('type', {
        is: 'iframe',
        then: () => yup.object({
            url: yup.string().url('Must be a valid URL').required('URL is required for iframe'),
            field_name: yup.string(),
            iframe_height: yup.string().required('Height is required for iframe')
        })
    }),
    dropdown_options: yup.array().when('type', {
        is: 'dropdownfield',
        then: () => yup.array().of(
            yup.object({
                translations: yup.object({
                    all: yup.string().max(255).when([], {
                        is: () => isUniversal,
                        then: (schema) => schema.required('Universal translation is required'),
                        otherwise: (schema) => schema
                    }),
                    en: yup.string().max(255).when([], {
                        is: () => !isUniversal && defaultLanguage === 'en',
                        then: (schema) => schema.required('English translation is required'),
                        otherwise: (schema) => schema
                    }),
                    fr: yup.string().max(255).when([], {
                        is: () => !isUniversal && defaultLanguage === 'fr',
                        then: (schema) => schema.required('French translation is required'),
                        otherwise: (schema) => schema
                    }),
                    es: yup.string().max(255).when([], {
                        is: () => !isUniversal && defaultLanguage === 'es',
                        then: (schema) => schema.required('Spanish translation is required'),
                        otherwise: (schema) => schema
                    }),
                    ar: yup.string().max(255).when([], {
                        is: () => !isUniversal && defaultLanguage === 'ar',
                        then: (schema) => schema.required('Arabic translation is required'),
                        otherwise: (schema) => schema
                    })
                })
            })
        ).required('Options are required for dropdown')
    }),
    translations: yup.object({
        all: yup.string().max(255).when([], {
            is: () => isUniversal,
            then: (schema) => schema.required('Universal translation is required'),
            otherwise: (schema) => schema
        }),
        en: yup.string().max(255).when([], {
            is: () => !isUniversal && defaultLanguage === 'en',
            then: (schema) => schema.required('English translation is required'),
            otherwise: (schema) => schema
        }),
        fr: yup.string().max(255).when([], {
            is: () => !isUniversal && defaultLanguage === 'fr',
            then: (schema) => schema.required('French translation is required'),
            otherwise: (schema) => schema
        }),
        es: yup.string().max(255).when([], {
            is: () => !isUniversal && defaultLanguage === 'es',
            then: (schema) => schema.required('Spanish translation is required'),
            otherwise: (schema) => schema
        }),
        ar: yup.string().max(255).when([], {
            is: () => !isUniversal && defaultLanguage === 'ar',
            then: (schema) => schema.required('Arabic translation is required'),
            otherwise: (schema) => schema
        })
    }).test(
        'required-translation',
        'Translation is required',
        function (value) {
            if (isUniversal) {
                return value.all && value.all.length > 0;
            }

            return value && value[defaultLanguage] && value[defaultLanguage].length > 0;
        }
    )
});