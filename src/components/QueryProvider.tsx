"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { AuthWrapper } from "@/components/AuthWrapper";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthWrapper>
        {children}
      </AuthWrapper>
    </QueryClientProvider>
  );
}
