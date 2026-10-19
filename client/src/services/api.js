import { setCachedData, getCachedData, enqueueOfflineAction } from './db';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getAuthToken() {
  return localStorage.getItem('shiksha_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('shiksha_token', token);
  } else {
    localStorage.removeItem('shiksha_token');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE}${endpoint}`;

  // If offline and it's a GET request, attempt to return cached data
  if (!navigator.onLine && (!options.method || options.method === 'GET')) {
    const cached = await getCachedData(endpoint);
    if (cached) {
      return { success: true, data: cached, _cached: true };
    }
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data?.error?.message || 'API request failed');
      error.status = res.status;
      error.code = data?.error?.code || 'API_ERROR';
      error.details = data?.error?.details;
      throw error;
    }

    // Cache successful GET responses in IndexedDB
    if (!options.method || options.method === 'GET') {
      await setCachedData(endpoint, data.data);
    }

    return data;
  } catch (err) {
    if (!navigator.onLine) {
      // Offline fallback
      if (!options.method || options.method === 'GET') {
        const cached = await getCachedData(endpoint);
        if (cached) {
          return { success: true, data: cached, _cached: true };
        }
      } else {
        // Enqueue mutation for later sync
        await enqueueOfflineAction({ endpoint, options });
      }
    }
    throw err;
  }
}
