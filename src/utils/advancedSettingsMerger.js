import advancedSettingConfig from "@/configs/advancedSettingConfig"

export const advancedSettingsMerger = (newAdvancedSettings) => {
    if (!newAdvancedSettings) return advancedSettingConfig;

    const settings = {
        advanced: {
            send_cc_from_system_emails: newAdvancedSettings?.advanced?.send_cc_from_system_emails || advancedSettingConfig?.advanced?.send_cc_from_system_emails,
            sender_event: newAdvancedSettings?.advanced?.sender_event || advancedSettingConfig?.advanced?.sender_event,
            ttl_session: newAdvancedSettings?.advanced?.ttl_session || advancedSettingConfig?.advanced?.ttl_session,
            stop_concurrent_user: newAdvancedSettings?.advanced?.stop_concurrent_user || advancedSettingConfig?.advanced?.stop_concurrent_user,
        },
        date: {
            timezone_default: newAdvancedSettings?.date?.timezone_default || advancedSettingConfig?.date?.timezone_default,
            date_format: newAdvancedSettings?.date?.date_format || advancedSettingConfig?.date?.date_format,
            date_language: newAdvancedSettings?.date?.date_language || advancedSettingConfig?.date?.date_language
        },
        password: {
            pass_alpha_numeric: newAdvancedSettings?.password?.pass_alpha_numeric || advancedSettingConfig?.password?.pass_alpha_numeric,
            pass_not_username: newAdvancedSettings?.password?.pass_not_username || advancedSettingConfig?.password?.pass_not_username,
            pass_change_first_login: newAdvancedSettings?.password?.pass_change_first_login || advancedSettingConfig?.password?.pass_change_first_login,
            pass_dictionary_check: newAdvancedSettings?.password?.pass_dictionary_check || advancedSettingConfig?.password?.pass_dictionary_check,
            pass_min_char: newAdvancedSettings?.password?.pass_min_char || advancedSettingConfig?.password?.pass_min_char,
            pass_max_time_valid: newAdvancedSettings?.password?.pass_max_time_valid || advancedSettingConfig?.password?.pass_max_time_valid
        },
        register: {
            registerType: newAdvancedSettings?.register?.registerType || advancedSettingConfig?.register?.registerType,
            disable_registration_email_confirrmation: newAdvancedSettings?.register?.disable_registration_email_confirrmation || advancedSettingConfig?.register?.disable_registration_email_confirrmation,
            allow_quick_registration: newAdvancedSettings?.register?.allow_quick_registration || advancedSettingConfig?.register?.allow_quick_registration,
            mail_sender: newAdvancedSettings?.register?.mail_sender || advancedSettingConfig?.register?.mail_sender,
            last_first_modatory: newAdvancedSettings?.register?.last_first_modatory || advancedSettingConfig?.register?.last_first_modatory
        },
        user: {
            enable_email_verification: newAdvancedSettings?.user?.enable_email_verification || advancedSettingConfig?.user?.enable_email_verification,
            hide_personal_info: newAdvancedSettings?.user?.hide_personal_info || advancedSettingConfig?.user?.hide_personal_info,
            hide_preferences_tab: newAdvancedSettings?.user?.hide_preferences_tab || advancedSettingConfig?.user?.hide_preferences_tab,
            use_node_fields_visibility: newAdvancedSettings?.user?.use_node_fields_visibility || advancedSettingConfig?.user?.use_node_fields_visibility,
            show_first_name_first: newAdvancedSettings?.user?.show_first_name_first || advancedSettingConfig?.user?.show_first_name_first,
            auto_calculate_password: newAdvancedSettings?.user?.auto_calculate_password || advancedSettingConfig?.user?.auto_calculate_password,
            use_email_as_username: newAdvancedSettings?.user?.use_email_as_username || advancedSettingConfig?.user?.use_email_as_username,
            privacy_policy: newAdvancedSettings?.user?.privacy_policy || advancedSettingConfig?.user?.privacy_policy,
            terms_and_conditions: newAdvancedSettings?.user?.terms_and_conditions || advancedSettingConfig?.user?.terms_and_conditions,
            anonymize_deleted_user: newAdvancedSettings?.user?.anonymize_deleted_user || advancedSettingConfig?.user?.anonymize_deleted_user,
            allow_password_change: newAdvancedSettings?.user?.allow_password_change || advancedSettingConfig?.user?.allow_password_change,
            remenber_me_enabled: newAdvancedSettings?.user?.remenber_me_enabled || advancedSettingConfig?.user?.remenber_me_enabled,
            max_log_attemps: newAdvancedSettings?.user?.max_log_attemps || advancedSettingConfig?.user?.max_log_attemps,
            user_logout_redirect: {
                is_enabled: newAdvancedSettings?.user?.user_logout_redirect?.is_enabled || advancedSettingConfig?.user?.user_logout_redirect?.is_enabled,
                url: newAdvancedSettings?.user?.user_logout_redirect?.url || advancedSettingConfig?.user?.user_logout_redirect?.url
            },
            max_delete_users: newAdvancedSettings?.user?.max_delete_users || advancedSettingConfig?.user?.max_delete_users
        }
    }

    return settings;
}