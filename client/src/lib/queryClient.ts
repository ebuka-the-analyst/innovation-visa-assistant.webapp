import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const json = await res.json();
      // Create error message that includes details if available
      let message = json.error || json.message || `Request failed with status ${res.status}`;
      if (json.details) {
        message = `${message}: ${json.details}`;
      }
      throw new Error(message);
    } catch (e) {
      if (e instanceof SyntaxError) {
        const text = res.statusText || `Request failed with status ${res.status}`;
        throw new Error(text);
      }
      throw e;
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build URL from queryKey, handling objects as query parameters
    let url: string;
    const lastItem = queryKey[queryKey.length - 1];
    
    if (typeof lastItem === 'object' && lastItem !== null && !Array.isArray(lastItem)) {
      // Last item is an object - convert to query parameters
      const basePath = queryKey.slice(0, -1).join("/");
      const params = new URLSearchParams();
      
      Object.entries(lastItem as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const queryString = params.toString();
      url = queryString ? `${basePath}?${queryString}` : basePath;
    } else {
      // All items are strings - join with "/"
      url = queryKey.join("/") as string;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // Data is stale after 1 minute
      retry: false,
      gcTime: 1000 * 60 * 60 * 24, // Keep unused data in cache for 24 hours
      refetchOnMount: true, // Refetch on mount if data is stale
      refetchOnReconnect: false, // Don't refetch on network reconnect
      networkMode: "online", // Only run queries when online
      structuralSharing: true,
    },
    mutations: {
      retry: false,
      networkMode: "online",
    },
  },
});
