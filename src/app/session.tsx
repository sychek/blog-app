'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

const SessionRedirect = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const hydrate = async () => {
      const session = await getSession();

      if (session?.user) {
        return;
      }

      const isPublic = () =>
        pathname.startsWith('/register') ||
        pathname.startsWith('/login');

      if (!isPublic()) {
        router.push('/login');
      }
    };

    hydrate();
  }, [pathname, router]);

  return null;
};

export default SessionRedirect;

