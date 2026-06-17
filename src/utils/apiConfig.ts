const FALLBACK_API_ORIGIN = 'http://localhost:8000';

function getConfiguredApiOrigin() {
  const configured =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    FALLBACK_API_ORIGIN;

  return configured.replace(/\/api\/?$/, '').replace(/\/$/, '');
}

export function getApiBaseUrl() {
  return `${getConfiguredApiOrigin()}/api`;
}

export function getApiOrigin() {
  return getConfiguredApiOrigin();
}
