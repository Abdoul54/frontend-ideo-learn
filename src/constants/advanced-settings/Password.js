import * as yup from "yup";

export const schema = yup.object({
    pass_alpha_numeric: yup.boolean().required('This field is required'),
    pass_not_username: yup.boolean().required('This field is required'),
    pass_change_first_login: yup.boolean().required('This field is required'),
    pass_dictionary_check: yup.boolean().required('This field is required'),
    pass_min_char: yup.number().required('This field is required').positive('This field must be a positive number'),
    pass_max_time_valid: yup.number().required('This field is required').positive('This field must be a positive number'),
})

export const defaultValues = {
    pass_alpha_numeric: false,
    pass_not_username: false,
    pass_change_first_login: false,
    pass_dictionary_check: false,
    pass_min_char: 8,
    pass_max_time_valid: 90,
}