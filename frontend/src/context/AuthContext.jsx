import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    // Support different backend response shapes
    const payload = res?.data?.data ?? res?.data;
    const accessToken = payload?.accessToken;
    const user = payload?.user;

    if (!accessToken || !user) {
      throw new Error('Invalid login response from server');
    }

    const normalizedUser = {
      ...user,
      role: user?.role ? String(user.role).toUpperCase() : user.role,
    };

    localStorage.setItem('accessToken', accessToken);
    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore logout errors
    }
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}