import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { userService, UserCredentials, UserRegistrationData } from '../services/userService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: UserCredentials) => Promise<User>;
  logout: () => void;
  register: (userData: UserRegistrationData) => Promise<User>;
}

export const AuthContext = createContext<Partial<AuthContextType>>({});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session on initial load
    const checkLoggedInUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await userService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // This is expected if not logged in, so we don't need to log an error.
        // The service itself will log actual parsing errors.
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoggedInUser();
  }, []);

  const login = async (credentials: UserCredentials) => {
    const loggedInUser = await userService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    userService.logout();
    setUser(null);
  };

  const register = async (userData: UserRegistrationData) => {
    const newUser = await userService.register(userData);
    setUser(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
