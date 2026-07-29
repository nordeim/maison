'use client';

/**
 * Maison — tRPC React client + provider.
 *
 * `trpc` is used by Client Components for type-safe queries/mutations:
 *   const { data } = trpc.products.search.useQuery({ q })
 *   const mutate = trpc.cart.addItem.useMutation()
 *
 * `TRPCProvider` wires tRPC + React Query. Mount it once near the app root.
 *
 * Pattern source: nextjs16-react19-tailwind4-better-auth-monorepo skill
 * (apps/web/src/lib/trpc/client.tsx, Stillwater reference).
 */

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from '@maison/api';

export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 1 minute — avoids refetch thrash on navigation; pages that need
            // fresher data can opt out per-query.
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
