'use client'

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthWrapper({ children, redirectPath }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.error === 'SessionExpired') {
      router.push(redirectPath);
    }
  }, [session, router]);

  return <div>{children}</div>;
}