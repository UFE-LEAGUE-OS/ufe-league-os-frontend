const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setToken = (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token);

export const setRefreshToken = (token: string) =>
  localStorage.setItem(REFRESH_TOKEN_KEY, token);

export const setAuthTokens = (tokens: { accessToken?: string | null; refreshToken?: string | null }) => {
  if (tokens.accessToken) {
    setToken(tokens.accessToken);
  } else {
    removeToken();
  }

  if (tokens.refreshToken) {
    setRefreshToken(tokens.refreshToken);
  } else {
    removeRefreshToken();
  }
};

export const removeToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

export const removeRefreshToken = () => localStorage.removeItem(REFRESH_TOKEN_KEY);

export const clearAuthTokens = () => {
  removeToken();
  removeRefreshToken();
};
