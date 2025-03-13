'use client'

// Server Action Imports
import { useAdvancedSettings } from '@/@core/contexts/advancedSettingsContext';
import Register from '@/views/auth/Register'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


const Page = () => {
  const { advancedSettings } = useAdvancedSettings();
  const router = useRouter();

  useEffect(() => {
    if (advancedSettings?.register?.registerType === "admin") router.push('/login?error=Registration is disabled');
  }, [advancedSettings]);
  return <Register />
}

export default Page
