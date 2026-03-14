import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import { syncService } from "./lib/syncService";
import { offlineDB } from "./lib/offlineDB";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {};
        
        // Copiar headers existentes
        if (init?.headers) {
          if (init.headers instanceof Headers) {
            init.headers.forEach((value, key) => {
              headers[key] = value;
            });
          } else if (Array.isArray(init.headers)) {
            init.headers.forEach(([key, value]) => {
              headers[key] = value;
            });
          } else {
            Object.assign(headers, init.headers);
          }
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers,
        });
      },
    }),
  ],
});

// Inicializar Service Worker y funcionalidad offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await syncService.registerServiceWorker();
      await offlineDB.init();
      console.log('[App] Offline functionality initialized');
      
      // Sincronizar automáticamente cuando se recupera la conexión
      window.addEventListener('online', () => {
        console.log('[App] Connection restored, syncing...');
        syncService.syncNow().then((result) => {
          if (result.synced > 0) {
            console.log(`[App] Synced ${result.synced} operations`);
          }
        });
      });
    } catch (error) {
      console.error('[App] Error initializing offline functionality:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
