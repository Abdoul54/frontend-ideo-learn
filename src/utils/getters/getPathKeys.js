export const pathKeys = [
    {
        "title": "path/home-title",
        "description": "path/home-description",
        "path": "/home"
    },
    {
        "title": "path/manage/users-management-title",
        "description": "path/manage/users-management-description",
        "path": "/manage/users-management"
    },
    {
        "title": "path/power-users-title",
        "description": "path/power-users-description",
        "path": "/powerusers"
    },
    {
        "title": "path/manage/groups-title",
        "description": "path/manage/groups-description",
        "path": "/manage/groups"
    },
    {
        "title": "path/learn/course-title",
        "description": "path/learn/course-description",
        "path": "/learn/course"
    },
    {
        "title": "path/learn/course-catalog-title",
        "description": "path/learn/course-catalog-description",
        "path": "/learn/course-catalog"
    },
    {
        "title": "path/learn/learning-plans-title",
        "description": "path/learn/learning-plans-description",
        "path": "/learn/learning-plans"
    },
    {
        "title": "path/skills-title",
        "description": "path/skills-description",
        "path": "/skills"
    },
    {
        "title": "path/learn/classroom-locations-title",
        "description": "path/learn/classroom-locations-description",
        "path": "/learn/classroom-locations"
    },
    {
        "title": "path/learn/central-repository-title",
        "description": "path/learn/central-repository-description",
        "path": "/learn/central-repository"
    },
    {
        "title": "path/manage/reports-title",
        "description": "path/manage/reports-description",
        "path": "/manage/reports"
    },
    {
        "title": "path/settings/domain-management-title",
        "description": "path/settings/domain-management-description",
        "path": "/settings/domain-management"
    },
    {
        "title": "path/settings/localization-tool-title",
        "description": "path/settings/localization-tool-description",
        "path": "/settings/localization-tool"
    },
    {
        "title": "path/settings/advanced-settings-title",
        "description": "path/settings/advanced-settings-description",
        "path": "/settings/advanced-settings"
    },
    {
        "title": "path/settings/branding-title",
        "description": "path/settings/branding-description",
        "path": "/settings/branding"
    },
    {
        "title": "path/login-title",
        "description": "path/login-description",
        "path": "/login"
    },
    {
        "title": "path/forgot-password-title",
        "description": "path/forgot-password-description",
        "path": "/forgot-password"
    },
    {
        "title": "path/reset-password-title",
        "description": "path/reset-password-description",
        "path": "/reset-password"
    },
    {
        "title": "path/register-title",
        "description": "path/register-description",
        "path": "/register"
    },
    {
        "title": "path/sso-title",
        "description": "path/sso-description",
        "path": "/sso"
    },
    {
        "title": "path/profile-title",
        "description": "path/profile-description",
        "path": "/profile"
    },
]

export const getPathKeys = (path) => {
    const pathKey = pathKeys.find((key) => key.path === path);
    return pathKey ? { title: pathKey?.title, description: pathKey?.description } : null;
}

