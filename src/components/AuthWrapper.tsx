"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    // Check current session
    const checkUser = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session?.user) {
        router.push('/login');
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_OUT' || !session?.user) {
          router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

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

  if (!user) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
