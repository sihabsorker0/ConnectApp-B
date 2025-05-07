import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get the auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Save the auth token to localStorage
export function saveAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

// Remove the auth token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem('authToken');
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { fromAction?: boolean }
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add Authorization header if token exists
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add header for like/dislike actions to prevent view increment
  if (options?.fromAction || url.includes('/like') || url.includes('/dislike')) {
    headers['x-from-action'] = 'true';
  }
  
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      // Add cache-control to avoid browser caching
      cache: 'no-cache'
    });

    // Check for unauthorized access
    if (res.status === 401 && token) {
      console.warn('Token invalid or expired, removing from storage');
      removeAuthToken();
    }
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Add Authorization header if token exists
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add special header for request coming from like/dislike operation
    // to avoid incrementing view count in video view API
    const url = queryKey[0] as string;
    if (url.includes('/videos/') && window.location.href.includes('fromAction=true')) {
      headers['x-from-action'] = 'true';
    }
    
    try {
      const res = await fetch(url, {
        headers,
        // Add cache-control to avoid browser caching
        cache: 'no-cache'
      });
  
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        // If unauthorized and token exists, it may be expired or invalid
        // Remove it to prevent further invalid requests
        if (token) {
          console.warn('Token invalid or expired, removing from storage');
          removeAuthToken();
        }
        return null;
      }
  
      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error('API request error:', error);
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
