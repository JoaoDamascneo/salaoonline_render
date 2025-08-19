import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        return apiRequest(url);
      },
    },
  },
});

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export async function apiRequest(
  url: string,
  method: RequestMethod = "GET",
  data?: any
): Promise<any> {
  const config: RequestInit = {
    method,
    credentials: 'include', // Important: Include cookies/session
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Get user data from localStorage to send as headers
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      config.headers = {
        ...config.headers,
        'x-user-id': user.id.toString(),
        'x-establishment-id': user.establishmentId.toString(),
        'x-user-role': user.role,
      };
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  if (data && method !== "GET") {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}