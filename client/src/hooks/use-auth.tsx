import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@/lib/types";
import { getQueryFn, apiRequest, queryClient, saveAuthToken, removeAuthToken } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData extends LoginData {
  displayName: string;
  avatar?: string;
  description?: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Add useEffect to ensure token is correctly used across browser refreshes
  useEffect(() => {
    // Check if token exists in localStorage but user is not loaded
    const token = localStorage.getItem('authToken');
    if (token) {
      // Force refresh the user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    }
  }, []);

  // Add useQuery with query key /api/user to check if user is already authenticated
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    initialData: null, // Set initial data to null to avoid undefined
    // Use staleTime to avoid too many requests
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      const userData = await res.json();
      
      // Save auth token in localStorage
      if (userData.token) {
        saveAuthToken(userData.token);
      }
      
      return userData;
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["/api/user"], response);
      toast({
        title: "Welcome back!",
        description: `You've successfully logged in as ${response.displayName}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      const userData = await res.json();
      
      // Save auth token in localStorage
      if (userData.token) {
        saveAuthToken(userData.token);
      }
      
      return userData;
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["/api/user"], response);
      toast({
        title: "Registration successful!",
        description: `Welcome to VidVault, ${response.displayName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
      // Remove auth token from localStorage
      removeAuthToken();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ensure user is never undefined
  const authContext: AuthContextType = {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  };
  
  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
