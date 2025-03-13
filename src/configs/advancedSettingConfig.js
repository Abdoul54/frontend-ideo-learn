const advancedSettingConfig = {
  advanced: {
    send_cc_from_system_emails: null,
    sender_event: null,
    ttl_session: 60,
    stop_concurrent_user: false
  },
  date: {
    timezone_default: "Africa/Casablanca",
    date_format: "d-m-Y H:m:s",
    date_language: "fr"
  },
  password: {
    pass_alpha_numeric: false,
    pass_not_username: false,
    pass_change_first_login: false,
    pass_dictionary_check: false,
    pass_min_char: 8,
    pass_max_time_valid: 90
  },
  register: {
    registerType: "admin",
    disable_registration_email_confirrmation: false,
    allow_quick_registration: false,
    mail_sender: null,
    last_first_modatory: false
  },
  user: {
    enable_email_verification: false,
    hide_personal_info: false,
    hide_preferences_tab: false,
    use_node_fields_visibility: false,
    show_first_name_first: true,
    auto_calculate_password: false,
    use_email_as_username: false,
    privacy_policy: false,
    terms_and_conditions: false,
    anonymize_deleted_user: false,
    allow_password_change: false,
    remenber_me_enabled: false,
    max_log_attemps: 3,
    user_logout_redirect: {
      is_enabled: false,
      url: null
    },
    max_delete_users: 100
  }
}

export default advancedSettingConfig