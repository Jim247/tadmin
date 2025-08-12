"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import { supabaseClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Check current session
    const checkUser = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      // Only redirect to login if we're not already on a public route
      if (!session?.user && !isPublicRoute) {
        router.push('/login');
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if ((event === 'SIGNED_OUT' || !session?.user) && !isPublicRoute) {
          router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, isPublicRoute]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // If it's a public route, always render the children
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, only render if user is authenticated
  if (!user) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
