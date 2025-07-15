// app/index.tsx
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Slight delay to ensure root layout mounts first
    const id = setTimeout(() => {
      router.replace('/app/splash/page');
    }, 0);
    return () => clearTimeout(id);
  }, [router]);

  return null;
}
