
import * as SecureStore from 'expo-secure-store';
import { apiRequest } from './api';

export async function login(email, password) {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });

  await SecureStore.setItemAsync('biblioteca_token', data.token);
  await SecureStore.setItemAsync(
    'biblioteca_user',
    JSON.stringify(data.user)
  );

  return data.user;
}

export async function register(nombre, matricula, email, password) {
  return await apiRequest('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: {
      nombre,
      matricula,
      email,
      password,
      rol: 'USER',
    },
  });
}

export async function logout() {
  await SecureStore.deleteItemAsync('biblioteca_token');
  await SecureStore.deleteItemAsync('biblioteca_user');
}

export async function getStoredUser() {
  const user = await SecureStore.getItemAsync('biblioteca_user');

  return user ? JSON.parse(user) : null;
}
