// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'https://blogpro.tech',
  wsURL: import.meta.env.VITE_WS_URL || 'wss://blogpro.tech',
  timeout: 30000,
  withCredentials: false, // Using JWT tokens instead of cookies
} as const;

export const getApiUrl = (path: string): string => {
  const baseUrl = API_CONFIG.baseURL;
  return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
};

export const getWsUrl = (path: string = '/ws'): string => {
  const wsUrl = API_CONFIG.wsURL;
  return path.startsWith('/') ? `${wsUrl}${path}` : `${wsUrl}/${path}`;
};
