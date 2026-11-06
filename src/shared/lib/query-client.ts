import { isServer, QueryClient } from "@tanstack/react-query";

// Same defaults as NEW_PROJECT's queryClient, adapted for SSR: one client per request
// on the server, a singleton in the browser.
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        retry: 1,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
      },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
