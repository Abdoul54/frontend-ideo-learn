// api/translations/[lang].js (Next.js API route)
import { NextResponse } from 'next/server';

// In a real app, this would come from a database or translation service
const centralTranslations = {
    en: {
        metadata: [
            { "title": "Dashboard", "description": "Dashboard", "path": "/dashboard" },
            { "title": "SSL Management", "description": "SSL Management", "path": "/ssl-management" },
            { "title": "Custom Domain Management", "description": "Custom Domain Management", "path": "/custom-domain-management" },
            { "title": "Tenant Management", "description": "Tenant Management", "path": "/tenant-management" },
            { "title": "Log In", "description": "Log In", "path": "/auth/login" }
        ],
        common: {
            welcome: "Welcome to our app!",
            greeting: "Hello, {name}!",
            changeLanguage: "Change language:",
            loading: "Loading...",
            error: "An error occurred",
            retry: "Retry",
            save: "Save",
            cancel: "Cancel",
            delete: "Delete",
            edit: "Edit",
            view: "View",
            search: "Search",
            filter: "Filter",
            sort: "Sort",
            noResults: "No results found",
            back: "Back",
            next: "Next",
            previous: "Previous"
        },
        auth: {
            login: "Log in",
            signup: "Sign up",
            logout: "Log out",
            forgotPassword: "Forgot password?",
            resetPassword: "Reset password",
            email: "Email",
            password: "Password",
            confirmPassword: "Confirm password",
            rememberMe: "Remember me",
            loginSuccess: "Logged in successfully",
            loginError: "Login failed. Please check your credentials and try again."
        },
        dashboard: {
            title: "Dashboard",
            summary: "Summary",
            recentActivity: "Recent Activity",
            statistics: "Statistics",
            quickActions: "Quick Actions"
        }
    },
    es: {
        metadata: [
            { "title": "Panel de control", "description": "Panel de control", "path": "/dashboard" },
            { "title": "Gestión de SSL", "description": "Gestión de SSL", "path": "/ssl-management" },
            { "title": "Gestión de dominios personalizados", "description": "Gestión de dominios personalizados", "path": "/custom-domain-management" },
            { "title": "Gestión de inquilinos", "description": "Gestión de inquilinos", "path": "/tenant-management" },
            { "title": "Iniciar sesión", "description": "Iniciar sesión", "path": "/auth/login" }
        ],
        common: {
            welcome: "¡Bienvenido a nuestra aplicación!",
            greeting: "¡Hola, {name}!",
            changeLanguage: "Cambiar idioma:",
            loading: "Cargando...",
            error: "Se produjo un error",
            retry: "Reintentar",
            save: "Guardar",
            cancel: "Cancelar",
            delete: "Eliminar",
            edit: "Editar",
            view: "Ver",
            search: "Buscar",
            filter: "Filtrar",
            sort: "Ordenar",
            noResults: "No se encontraron resultados",
            back: "Atrás",
            next: "Siguiente",
            previous: "Anterior"
        },
        auth: {
            login: "Iniciar sesión",
            signup: "Registrarse",
            logout: "Cerrar sesión",
            forgotPassword: "¿Olvidó su contraseña?",
            resetPassword: "Restablecer contraseña",
            email: "Correo electrónico",
            password: "Contraseña",
            confirmPassword: "Confirmar contraseña",
            rememberMe: "Recordarme",
            loginSuccess: "Inicio de sesión exitoso",
            loginError: "Error al iniciar sesión. Verifique sus credenciales e intente nuevamente."
        },
        dashboard: {
            title: "Panel de control",
            summary: "Resumen",
            recentActivity: "Actividad reciente",
            statistics: "Estadísticas",
            quickActions: "Acciones rápidas"
        }
    },
    fr: {
        metadata: [
            { "title": "Tableau de bord", "description": "Tableau de bord", "path": "/dashboard" },
            { "title": "Gestion SSL", "description": "Gestion SSL", "path": "/ssl-management" },
            { "title": "Gestion des domaines personnalisés", "description": "Gestion des domaines personnalisés", "path": "/custom-domain-management" },
            { "title": "Gestion des locataires", "description": "Gestion des locataires", "path": "/tenant-management" },
            { "title": "Connexion", "description": "Connexion", "path": "/auth/login" }
        ],
        common: {
            welcome: "Bienvenue dans notre application!",
            greeting: "Bonjour, {name}!",
            changeLanguage: "Changer de langue:",
            loading: "Chargement...",
            error: "Une erreur s'est produite",
            retry: "Réessayer",
            save: "Enregistrer",
            cancel: "Annuler",
            delete: "Supprimer",
            edit: "Modifier",
            view: "Voir",
            search: "Rechercher",
            filter: "Filtrer",
            sort: "Trier",
            noResults: "Aucun résultat trouvé",
            back: "Retour",
            next: "Suivant",
            previous: "Précédent"
        },
        auth: {
            login: "Se connecter",
            signup: "S'inscrire",
            logout: "Se déconnecter",
            forgotPassword: "Mot de passe oublié?",
            resetPassword: "Réinitialiser le mot de passe",
            email: "Email",
            password: "Mot de passe",
            confirmPassword: "Confirmer le mot de passe",
            rememberMe: "Se souvenir de moi",
            loginSuccess: "Connexion réussie",
            loginError: "Échec de la connexion. Veuillez vérifier vos identifiants et réessayer."
        },
        dashboard: {
            title: "Tableau de bord",
            summary: "Résumé",
            recentActivity: "Activité récente",
            statistics: "Statistiques",
            quickActions: "Actions rapides"
        }
    },
    ar: {
        metadata: [
            { "title": "لوحة التحكم", "description": "لوحة التحكم", "path": "/dashboard" },
            { "title": "إدارة SSL", "description": "إدارة SSL", "path": "/ssl-management" },
            { "title": "إدارة النطاقات المخصصة", "description": "إدارة النطاقات المخصصة", "path": "/custom-domain-management" },
            { "title": "إدارة المستأجرين", "description": "إدارة المستأجرين", "path": "/tenant-management" },
            { "title": "تسجيل الدخول", "description": "تسجيل الدخول", "path": "/auth/login" }
        ],
        common: {
            welcome: "مرحبًا بك في تطبيقنا!",
            greeting: "مرحبًا، {name}!",
            changeLanguage: "تغيير اللغة:",
            loading: "جار التحميل...",
            error: "حدث خطأ",
            retry: "إعادة المحاولة",
            save: "حفظ",
            cancel: "إلغاء",
            delete: "حذف",
            edit: "تعديل",
            view: "عرض",
            search: "بحث",
            filter: "تصفية",
            sort: "فرز",
            noResults: "لم يتم العثور على نتائج",
            back: "رجوع",
            next: "التالي",
            previous: "السابق"
        },
        auth: {
            login: "تسجيل الدخول",

            signup: "إنشاء حساب",
            logout: "تسجيل الخروج",
            forgotPassword: "نسيت كلمة المرور؟",
            resetPassword: "إعادة تعيين كلمة المرور",
            email: "البريد الإلكتروني",
            password: "كلمة المرور",
            confirmPassword: "تأكيد كلمة المرور",
            rememberMe: "تذكرني",
            loginSuccess: "تم تسجيل الدخول بنجاح",
            loginError: "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك والمحاولة مرة أخرى."
        },
        dashboard: {
            title: "لوحة التحكم",
            summary: "ملخص",
            recentActivity: "النشاط الأخير",
            statistics: "الإحصائيات",
            quickActions: "إجراءات سريعة"
        }
    },
};


const tenantTranslations = {
    en: {
        metadata: [
            { "title": "Users", "description": "User management", "path": "/manage/users-management" },
            { "title": "Power Users", "description": "Management of power users", "path": "/power-users" },
            { "title": "Groups", "description": "Management of user groups", "path": "/manage/groups" },
            { "title": "Courses Management", "description": "Course management", "path": "/learn/course" },
            { "title": "Course Catalog", "description": "Course catalog management", "path": "/manage/course-catalog" },
            { "title": "Learning Plans", "description": "Learning plans management", "path": "/learn/learning-plans" },
            { "title": "Skill Management", "description": "Skill management", "path": "/skills" },
            { "title": "Classroom Locations", "description": "Management of classroom locations", "path": "/learn/classroom-locations" },
            { "title": "Central Repository", "description": "Central repository management", "path": "/manage/central-repository" },
            { "title": "Reports", "description": "Reports management", "path": "/manage/reports" },
            { "title": "Domain management", "description": "Domain management", "path": "/settings/domain-management" },
            { "title": "Localization tool", "description": "Localization tool management", "path": "/settings/localization-tool" },
            { "title": "Advanced settings", "description": "Advanced settings management", "path": "/settings/advanced-settings" },
            { "title": "Configure branding and look", "description": "Branding and look configuration", "path": "/settings/branding" },
            { "title": "Log In", "description": "Log In", "path": "/login" },
            { "title": "Forgot Password", "description": "Reset your password", "path": "/forgot-password" },
            { "title": "Reset Password", "description": "Reset your password", "path": "/reset-password" },
            { "title": "Registration", "description": "Create a new account", "path": "/register" },
            { "title": "SSO", "description": "Single Sign-On", "path": "/sso" },
        ],
    },
    es: {
        metadata: [
            { "title": "Usuarios", "description": "Gestión de usuarios", "path": "/manage/users-management" },
            { "title": "Usuarios avanzados", "description": "Gestión de usuarios avanzados", "path": "/manage/power-users" },
            { "title": "Grupos", "description": "Gestión de grupos de usuarios", "path": "/manage/groups" },
            { "title": "Gestión de cursos", "description": "Gestión de cursos", "path": "/learn/course" },
            { "title": "Catálogo de cursos", "description": "Gestión del catálogo de cursos", "path": "/manage/course-catalog" },
            { "title": "Planes de aprendizaje", "description": "Gestión de planes de aprendizaje", "path": "/learn/learning-plans" },
            { "title": "Gestión de habilidades", "description": "Gestión de habilidades", "path": "/skills" },
            { "title": "Ubicaciones de aula", "description": "Gestión de ubicaciones de aula", "path": "/learn/classroom-locations" },
            { "title": "Repositorio central", "description": "Gestión del repositorio central", "path": "/manage/central-repository" },
            { "title": "Informes", "description": "Gestión de informes", "path": "/manage/reports" },
            { "title": "Gestión de dominios", "description": "Gestión de dominios", "path": "/settings/domain-management" },
            { "title": "Herramienta de localización", "description": "Gestión de la herramienta de localización", "path": "/settings/localization-tool" },
            { "title": "Configuración avanzada", "description": "Gestión de configuración avanzada", "path": "/settings/advanced-settings" },
            { "title": "Configurar marca y apariencia", "description": "Configuración de marca y apariencia", "path": "/settings/branding" },
            { "title": "Iniciar sesión", "description": "Iniciar sesión", "path": "/login" },
            { "title": "Olvidé mi contraseña", "description": "Restablecer su contraseña", "path": "/forgot-password" },
            { "title": "Restablecer contraseña", "description": "Restablecer su contraseña", "path": "/reset-password" },
            { "title": "Registro", "description": "Crear una nueva cuenta", "path": "/register" },
            { "title": "SSO", "description": "Inicio de sesión único", "path": "/sso" },
        ],
    },
    fr: {
        metadata: [
            { "title": "Utilisateurs", "description": "Gestion des utilisateurs", "path": "/manage/users-management" },
            { "title": "Utilisateurs avancés", "description": "Gestion des utilisateurs avancés", "path": "/manage/power-users" },
            { "title": "Groupes", "description": "Gestion des groupes d'utilisateurs", "path": "/manage/groups" },
            { "title": "Gestion des cours", "description": "Gestion des cours", "path": "/learn/course" },
            { "title": "Catalogue de cours", "description": "Gestion du catalogue de cours", "path": "/manage/course-catalog" },
            { "title": "Plans d'apprentissage", "description": "Gestion des plans d'apprentissage", "path": "/learn/learning-plans" },
            { "title": "Gestion des compétences", "description": "Gestion des compétences", "path": "/skills" },
            { "title": "Emplacements de classe", "description": "Gestion des emplacements de classe", "path": "/learn/classroom-locations" },
            { "title": "Répertoire central", "description": "Gestion du répertoire central", "path": "/manage/central-repository" },
            { "title": "Rapports", "description": "Gestion des rapports", "path": "/manage/reports" },
            { "title": "Gestion des domaines", "description": "Gestion des domaines", "path": "/settings/domain-management" },
            { "title": "Outil de localisation", "description": "Gestion de l'outil de localisation", "path": "/settings/localization-tool" },
            { "title": "Paramètres avancés", "description": "Gestion des paramètres avancés", "path": "/settings/advanced-settings" },
            { "title": "Configurer la marque et l'apparence", "description": "Configuration de la marque et de l'apparence", "path": "/settings/branding" },
            { "title": "Connexion", "description": "Connexion", "path": "/login" },
            { "title": "Mot de passe oublié", "description": "Réinitialiser votre mot de passe", "path": "/forgot-password" },
            { "title": "Réinitialiser le mot de passe", "description": "Réinitialiser votre mot de passe", "path": "/reset-password" },
            { "title": "Inscription", "description": "Créer un nouveau compte", "path": "/register" },
            { "title": "SSO", "description": "Authentification unique", "path": "/sso" },
        ],
    },
    ar: {
        metadata: [
            { "title": "المستخدمون", "description": "إدارة المستخدمين", "path": "/manage/users-management" },
            { "title": "المستخدمون المتقدمون", "description": "إدارة المستخدمين المتقدمين", "path": "/manage/power-users" },
            { "title": "المجموعات", "description": "إدارة مجموعات المستخدمين", "path": "/manage/groups" },
            { "title": "إدارة الدورات", "description": "إدارة الدورات", "path": "/learn/course" },
            { "title": "كتالوج الدورات", "description": "إدارة كتالوج الدورات", "path": "/manage/course-catalog" },
            { "title": "خطط التعلم", "description": "إدارة خطط التعلم", "path": "/learn/learning-plans" },
            { "title": "إدارة المهارات", "description": "إدارة المهارات", "path": "/skills" },
            { "title": "مواقع الفصول الدراسية", "description": "إدارة مواقع الفصول الدراسية", "path": "/learn/classroom-locations" },
            { "title": "المستودع المركزي", "description": "إدارة المستودع المركزي", "path": "/manage/central-repository" },
            { "title": "التقارير", "description": "إدارة التقارير", "path": "/manage/reports" },
            { "title": "إدارة النطاقات", "description": "إدارة النطاقات", "path": "/settings/domain-management" },
            { "title": "أداة الترجمة", "description": "إدارة أداة الترجمة", "path": "/settings/localization-tool" },
            { "title": "الإعدادات المتقدمة", "description": "إدارة الإعدادات المتقدمة", "path": "/settings/advanced-settings" },
            { "title": "تكوين العلامة التجارية والمظهر", "description": "إدارة العلامة التجارية والمظهر", "path": "/settings/branding" },
            { "title": "تسجيل الدخول", "description": "تسجيل الدخول", "path": "/login" },
            { "title": "نسيت كلمة المرور", "description": "إعادة تعيين كلمة المرور الخاصة بك", "path": "/forgot-password" },
            { "title": "إعادة تعيين كلمة المرور", "description": "إعادة تعيين كلمة المرور الخاصة بك", "path": "/reset-password" },
            { "title": "التسجيل", "description": "إنشاء حساب جديد", "path": "/register" },
            { "title": "SSO", "description": "تسجيل الدخول الموحد", "path": "/sso" },
        ],
    },
}

export async function GET(request, { params }) {
    try {
        // Await the params object before destructuring
        const { lang } = await params;

        // Get hostname from the request URL
        const host = request?.headers?.get('host');
        const mainDomains = (process.env.MAIN_DOMAINES?.split(',') || []).filter(Boolean);

        // Check if the host is in the main domains
        const isCentral = mainDomains.includes(host);
        const translations = isCentral ? centralTranslations : tenantTranslations;

        // Rest of your code remains the same
        if (!translations[lang]) {
            return NextResponse.json(
                { error: `Translations for language '${lang}' not found` },
                { status: 404 }
            );
        }

        return NextResponse.json(translations[lang]);
    } catch (error) {
        console.error('Error fetching translations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch translations' },
            { status: 500 }
        );
    }
}