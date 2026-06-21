'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if we are exactly at the root path.
    // This allows index.html to serve as a 404 fallback for dynamic routes
    // without immediately redirecting the user to /login.
    if (pathname === '/') {
      router.push('/login');
    }
  }, [pathname, router]);

  return null;
}
