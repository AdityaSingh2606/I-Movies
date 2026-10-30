import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('imovies_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('imovies_token') || '');
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Mumbai');

  // Verify auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('imovies_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
        } catch (err) {
          localStorage.removeItem('imovies_token');
          localStorage.removeItem('imovies_user');
          setUser(null);
          setToken('');
        }
      }
      setLoading(false);
    };

    checkAuth();

    const handleLogoutEvent = () => {
      setUser(null);
      setToken('');
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('imovies_token', newToken);
      localStorage.setItem('imovies_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      toast.success(`Welcome back, ${newUser.name}! 🍿`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('imovies_token', newToken);
      localStorage.setItem('imovies_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      toast.success(`Welcome to IMovies, ${newUser.name}! 🎬`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
    setUser(null);
    setToken('');
    toast.info('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const res = await api.put('/auth/profile', userData);
      setUser(res.data.user);
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        selectedCity,
        setSelectedCity,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
