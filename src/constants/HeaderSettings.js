import * as yup from 'yup';

export const schema = yup.object().shape({
    page_title: yup.string().required('Page title is required').max(255),
    header_message: yup.object().shape({
        status: yup.string().oneOf(['enabled', 'disabled']).required(),
        content: yup.string().when('status', {
            is: 'enabled',
            then: (schema) => schema.required('Header message content is required'),
            otherwise: (schema) => schema.nullable()
        })
    }),
    logo: yup.mixed().nullable(),
    favicon: yup.mixed().nullable()
});

export const defaultValues = {
    page_title: "",
    header_message: {
        status: "disabled",
        content: ""
    },
    logo: null,
    favicon: null
};