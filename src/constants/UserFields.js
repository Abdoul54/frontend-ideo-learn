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

// Create default values based on active languages
export const getDefaultValues = (activeLanguages = null) => {
    const translations = { all: '' };

    if (activeLanguages && Array.isArray(activeLanguages) && activeLanguages.length > 0) {
        activeLanguages.forEach(lang => {
            translations[lang.code] = '';
        });
    } else {
        // Fallback defaults
        translations.fr = '';
        translations.en = '';
        translations.es = '';
        translations.ar = '';
    }

    return {
        type: 'textfield',
        mandatory: false,
        invisible_to_user: false,
        sequence: 1,
        translations: translations,
        settings: {},
        dropdown_options: []
    };
};

// For backward compatibility, maintain the original defaultValues
export const defaultValues = getDefaultValues();

export const createSchema = (isUniversal, defaultLanguage = 'fr', activeLanguages = null) => {
    // Create dynamic validation for translations
    const createTranslationsValidation = () => {
        const translationValidation = {
            all: yup.string().max(255).when([], {
                is: () => isUniversal,
                then: (schema) => schema.required('Universal translation is required'),
                otherwise: (schema) => schema
            })
        };

        if (activeLanguages && Array.isArray(activeLanguages) && activeLanguages.length > 0) {
            // Add validation for each active language
            activeLanguages.forEach(lang => {
                translationValidation[lang.code] = yup.string().max(255).when([], {
                    is: () => !isUniversal && defaultLanguage === lang.code,
                    then: (schema) => schema.required(`${lang.name || lang.native_name} translation is required`),
                    otherwise: (schema) => schema
                });
            });
        } else {
            // Fallback for hardcoded common languages
            const languageConfig = [
                { code: 'en', name: 'English' },
                { code: 'fr', name: 'French' },
                { code: 'es', name: 'Spanish' },
                { code: 'ar', name: 'Arabic' }
            ];

            languageConfig.forEach(lang => {
                translationValidation[lang.code] = yup.string().max(255).when([], {
                    is: () => !isUniversal && defaultLanguage === lang.code,
                    then: (schema) => schema.required(`${lang.name} translation is required`),
                    otherwise: (schema) => schema
                });
            });
        }

        return translationValidation;
    };

    const translationsValidation = createTranslationsValidation();

    return yup.object({
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
                    translations: yup.object(translationsValidation)
                })
            ).required('Options are required for dropdown')
        }),
        translations: yup.object(translationsValidation).test(
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
};