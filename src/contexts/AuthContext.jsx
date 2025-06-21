import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData, type = 'establishment') => {
    try {
      if (type === 'admin') {
        return await authService.registerAdmin(userData);
      } else {
        return await authService.registerEstablishment(userData);
      }
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      return await authService.updatePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isEstablishment = () => {
    return user && user.role === 'establishment';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    updatePassword,
    isAdmin,
    isEstablishment,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

