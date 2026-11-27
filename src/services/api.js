
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN;

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

export async function apiRequest(
  endpoint,
  { method = 'GET', body, headers = {}, auth = true } = {}
) {
  if (!API_URL || !APP_TOKEN) {
    throw new Error('Falta configurar la conexión con la API.');
  }

  const token = await SecureStore.getItemAsync('biblioteca_token');

  const requestHeaders = {
    Accept: 'application/json',
    'x-api-token': APP_TOKEN,
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401 && auth) {
    try {
      if (unauthorizedHandler) {
        await unauthorizedHandler();
      }
    } catch (error) {
      console.log('Error al cerrar la sesión:', error);
    }

    const error = new Error(
      'Tu sesión ha expirado o no es válida. Inicia sesión nuevamente.'
    );
    error.status = 401;
    throw error;
  }

  if (response.status === 403) {
    const error = new Error(
      data?.message || 'No tienes permisos para realizar esta acción.'
    );
    error.status = 403;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Error en la petición: ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return data;
}
