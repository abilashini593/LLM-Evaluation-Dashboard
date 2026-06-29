import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authAPI.me();
        if (response.success) {
          setUser(response.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser({
          _id: response.data._id,
          username: response.data.username,
          email: response.data.email,
        });
        return true;
      }
      return false;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(username, email, password);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser({
          _id: response.data._id,
          username: response.data.username,
          email: response.data.email,
        });
        return true;
      }
      return false;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed. Try a different username/email.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
