import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import centralChecker from '@/utils/workers/centralChecker';

export default function AuthWrapper({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.error === 'SessionExpired') {
      const handleExpiredSession = async () => {
        try {
          const isCentral = await centralChecker();
          const redirectPath = isCentral ? '/auth/login' : '/login';

          // Use router.push for client-side navigation
          router.push(redirectPath);
        } catch (error) {
          console.error('Error redirecting to login:', error);
          // Fallback to direct redirect in case of error
          window.location.href = '/login';
        }
      };

      handleExpiredSession();
    }
  }, [session, router]);

  // Key-based remounting
  return <div key={session?.user?.id || 'unauthenticated'}>{children}</div>;
}