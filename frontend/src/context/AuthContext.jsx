import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 🔥 LOGIN
  const login = async (data) => {
  localStorage.setItem('token', data.token);

  try {
    const res = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${data.token}` }
    });

    setUser({
      ...res.data,
      token: data.token
    });

  } catch (err) {
    console.error("Failed to fetch user after login");
  }
};

  // 🔥 LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // 🔥 AUTO LOAD USER ON REFRESH (FIXED)
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) return;

      try {
        const res = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser({
          ...res.data,
          token
        });

      } catch (err) {
        console.log('Session expired or invalid token');
        localStorage.removeItem('token');
        setUser(null);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);