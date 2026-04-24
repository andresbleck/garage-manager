import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('garage_token');
    const storedUser = localStorage.getItem('garage_user');
    if (storedToken && storedUser) {
      api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      setUser(JSON.parse(storedUser));
    }
    setInitialized(true);
  }, []);

  const login = ({ token, user }) => {
    localStorage.setItem('garage_token', token);
    localStorage.setItem('garage_user', JSON.stringify(user));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('garage_token');
    localStorage.removeItem('garage_user');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, initialized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
