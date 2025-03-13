'use client';

import { useAdvancedSettings } from '@/@core/contexts/advancedSettingsContext';
import ForgotPassword from '@/views/auth/ForgotPassword';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Page = () => {
    const { advancedSettings } = useAdvancedSettings();
    const router = useRouter();

    useEffect(() => {
        if (!advancedSettings?.user?.allow_password_change) router.push('/login?error=Password change is disabled');
    }, [advancedSettings]);
    return (
        <ForgotPassword />
    );
};

export default Page;