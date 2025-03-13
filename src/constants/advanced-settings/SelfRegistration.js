import * as yup from "yup";

export const schema = yup.object({
    registerType: yup.string().required("The registration type is required"),
    disable_registration_email_confirrmation: yup.boolean().required(""),
    allow_quick_registration: yup.boolean().required(),
    mail_sender: yup.string().required("Email sender is required"),
    last_first_modatory: yup.boolean().required()
})

export const defaultValues = {
    registerType: 'self',
    disable_registration_email_confirrmation: false,
    allow_quick_registration: false,
    mail_sender: '',
    last_first_modatory: false
}