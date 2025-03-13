import * as yup from "yup";

export const schema = yup.object({
    enable_email_verification: yup.boolean().required('This field is required'),
    hide_personal_info: yup.boolean().required('This field is required'),
    hide_preferences_tab: yup.boolean().required('This field is required'),
    use_node_fields_visibility: yup.boolean().required('This field is required'),
    show_first_name_first: yup.boolean().required('This field is required'),
    auto_calculate_password: yup.boolean().required('This field is required'),
    use_email_as_username: yup.boolean().required('This field is required'),
    privacy_policy: yup.boolean().required('This field is required'),
    terms_and_conditions: yup.boolean().required('This field is required'),
    anonymize_deleted_user: yup.boolean().required('This field is required'),
    allow_password_change: yup.boolean().required('This field is required'),
    remenber_me_enabled: yup.boolean().required('This field is required'),
    max_log_attemps: yup.number().required('This field is required').positive('This field must be a positive number'),
    user_logout_redirect: yup.object({
        url: yup.string().required('This field is required')
    }),
    max_delete_users: yup.number().required('This field is required').positive('This field must be a positive number')
})

export const defaultValues = {
    enable_email_verification: false,
    hide_personal_info: false,
    hide_preferences_tab: false,
    use_node_fields_visibility: false,
    show_first_name_first: false,
    auto_calculate_password: false,
    use_email_as_username: false,
    privacy_policy: false,
    terms_and_conditions: false,
    anonymize_deleted_user: false,
    allow_password_change: false,
    remenber_me_enabled: false,
    max_log_attemps: 3,
    user_logout_redirect: {
        url: ""
    },
    max_delete_users: 100
}