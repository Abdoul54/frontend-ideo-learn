'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import ResetPassword from '@/views/auth/ResetPassword';
import { useEffect } from 'react';
import { useAdvancedSettings } from '@/@core/contexts/advancedSettingsContext';

const Page = () => {
    const searchParams = useSearchParams();
    const { advancedSettings } = useAdvancedSettings();
    const router = useRouter();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!advancedSettings?.user?.allow_password_change) router.push('/login?error=Password change is disabled');
        if (!token || !email) {
            router.push('/login');
        }
    }, [token, email, router, advancedSettings]);

    return <ResetPassword token={token} email={email} />;
};

export default Page;