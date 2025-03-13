import * as yup from 'yup';

export const selfRegistrationSchema = yup.object({
    registerType: yup.string().required('Register type is required'),
    disable_registration_email_confirrmation: yup.boolean().required('Disable registration email confirmation is required'),
    allow_quick_registration: yup.boolean().required('Allow quick registration is required'),
    mail_sender: yup.string().email().required('Mail sender is required'),
    last_first_modatory: yup.boolean().required( 'Last first modatory is required')
});

export const defaultValues = {
    registerType: 'self',
    disable_registration_email_confirrmation: false,
    allow_quick_registration: false,
    mail_sender: 'noreply@example.com',
    last_first_modatory: false
};