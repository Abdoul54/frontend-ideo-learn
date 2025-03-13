import * as yup from 'yup';

export const schema = yup.object().shape({
    custom_domain_status: yup.string()
        .oneOf(['enabled', 'disabled'])
        .required('Domain type is required'),
    custom_domain: yup.string()
        .when('custom_domain_status', {
            is: 'enabled',
            then: (schema) => schema
                .required('Custom domain is required')
                .matches(
                    /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
                    'Please enter a valid domain name'
                ),
            otherwise: (schema) => schema.nullable()
        }),
    ssl_provider: yup.string()
        .when('custom_domain_status', {
            is: 'enabled',
            then: (schema) => schema
                .oneOf(['letsencrypt', 'custom'], 'Invalid SSL provider')
                .required('SSL provider is required'),
            otherwise: (schema) => schema.nullable()
        }),
    ssl_certificate_id: yup.string()
        .when(['custom_domain_status', 'ssl_provider'], {
            is: (domainType, sslProvider) => domainType === 'enabled' && sslProvider === 'custom',
            then: (schema) => schema.required('SSL certificate is required'),
            otherwise: (schema) => schema.nullable()
        })
});

export const defaultValues = {
    custom_domain_status: "disabled",
    custom_domain: "",
    ssl_provider: "letsencrypt",
    ssl_certificate_id: null,
}