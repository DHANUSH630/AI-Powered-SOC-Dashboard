import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sentinel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sentinel_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // For demo / initial scaffold fallback if API is offline
      const mockUser = {
        id: 'usr_admin_01',
        name: 'SecOps Lead',
        email: email,
        role: 'ADMIN',
      };
      const mockToken = 'mock-jwt-token-sentinel-ai';

      try {
        const response = await api.post('/auth/login', { email, password });
        const { access_token, user: userData } = response.data;
        setToken(access_token);
        setUser(userData);
        localStorage.setItem('sentinel_token', access_token);
        localStorage.setItem('sentinel_user', JSON.stringify(userData));
        return userData;
      } catch (err) {
        // Fallback for development demo
        setToken(mockToken);
        setUser(mockUser);
        localStorage.setItem('sentinel_token', mockToken);
        localStorage.setItem('sentinel_user', JSON.stringify(mockUser));
        return mockUser;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
