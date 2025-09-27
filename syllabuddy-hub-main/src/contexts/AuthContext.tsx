import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      console.log('Initializing auth - Token:', !!token, 'UserData:', !!userData);
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user data:', parsedUser);
          
          // Check if the stored data is valid
          if (parsedUser && parsedUser.email && parsedUser.user_name) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            console.log('Invalid user data found, clearing auth');
            logout();
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      } else {
        // Clear any partial auth state if either token or userData is missing
        if (token || userData) {
          console.log('Partial auth data found, clearing all');
          logout();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};