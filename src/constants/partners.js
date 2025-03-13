import * as yup from "yup";


export const FIELDS = [{
    value: "username",
    label: "Username",
},
{
    value: "first_name",
    label: "First name",
},
{
    value: "last_name",
    label: "Last name",
},
{
    value: "email",
    label: "Email",
}]

export const schema = yup.object().shape({
    display_name: yup.string().required('Display name is required'),
    // app_url: yup.string().url('Invalid URL'),
    is_active: yup.boolean(),
    // enable_user_provisioning: yup.boolean(),
    // provisioning_fields: yup.array().when('enable_user_provisioning', (enable_user_provisioning) => {
    //     return enable_user_provisioning
    //         ? yup.array().of(
    //             yup.object().shape({
    //                 field: yup.string().required('Please select a field'),
    //                 attribute: yup.string().required('Attribute is required')
    //             })
    //         )
    //         : yup.array();
    // })
});


export const defaultValues = {
    display_name: '',
    is_active: false,
    // enable_user_provisioning: false,
    // provisioning_fields: []
}