import * as yup from "yup";

export const schema = yup.object({
    send_cc_from_system_emails: yup.string().email('Invalid email').required('Email is required'),
    sender_event: yup.string().required('Sender event is required'),
    ttl_session: yup.number().min(1, 'TTL Session must be at least 1').required('TTL Session is required'),
    stop_concurrent_user: yup.boolean()
})

export const defaultValues = {
    send_cc_from_system_emails: '',
    sender_event: '',
    ttl_session: 1,
    stop_concurrent_user: false
}