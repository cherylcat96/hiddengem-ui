import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [ready, setReady] = useState(false);

  // On mount, if a token exists, fetch the current user to rehydrate
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) { setReady(true); return; }

    client.get('/users/me/saves', { params: { limit: 1 } })
      .then(() => {
        // Token is valid — decode username from it to fetch profile
        const payload = JSON.parse(atob(stored.split('.')[1]));
        return client.get(`/users/${payload.username}`);
      })
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  const signIn = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Don't render children until we know auth state
  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);