
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  login as loginService,
  logout as logoutService,
  getStoredUser,
} from '../services/authService';

import { setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const removeUnauthorizedHandler = setUnauthorizedHandler(
      async () => {
        await logoutService();
        setUser(null);
      }
    );

    async function cargarSesion() {
      try {
        const storedUser = await getStoredUser();
        setUser(storedUser);
      } catch (error) {
        console.log('Error al recuperar la sesión:', error);
      } finally {
        setLoading(false);
      }
    }

    cargarSesion();

    return removeUnauthorizedHandler;
  }, []);

  async function login(email, password) {
    const userData = await loginService(email, password);
    setUser(userData);
    return userData;
  }

  async function logout() {
    await logoutService();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
