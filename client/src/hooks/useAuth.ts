import { useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "staff";
  establishmentId: number;
  staffId?: number; // For staff members
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const setDefaultUser = () => {
    const defaultUser: User = {
      id: 2,
      email: "admin@salaoonline.com",
      name: "Admin System",
      role: "admin",
      establishmentId: 2,
      staffId: 2
    };
    setUser(defaultUser);
    localStorage.setItem("user", JSON.stringify(defaultUser));
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");

    // Call logout endpoint to clear session
    fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(error => {
      console.error("Error during logout:", error);
    });
  };

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}