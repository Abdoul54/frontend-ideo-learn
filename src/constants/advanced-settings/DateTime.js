import * as yup from "yup";

export const schema = yup.object({
    timezone_default: yup.string().required('Timezone is required'),
    date_format: yup.string().required('Date format is required'),
    date_language: yup.string().required('Date language is required')
})

export const defaultValues = {
    timezone_default: 'Europe/Paris',
    date_format: 'd/m/Y',
    date_language: 'fr'
}