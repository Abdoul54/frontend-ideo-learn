import * as yup from 'yup';

export const schema = yup.object({
    host: yup.string().required('Host is required'),
    port: yup.string().matches(/^[0-9]+$/, 'Port must be numeric').required('Port is required'),
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    encryption: yup.string().required('Encryption is required'),
    from_address: yup.string().required('From Address is required').email('Invalid email address'),
    from_name: yup.string().required('From Name is required')
})

export const defaultValues = {
    host: "",
    port: "",
    username: "",
    password: "",
    encryption: "",
    from_address: "",
    from_name: ""
}