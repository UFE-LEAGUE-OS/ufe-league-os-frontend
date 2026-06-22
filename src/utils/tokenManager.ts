const ACCESS_TOKEN_KEY = 'league_os_access_token';

export const getToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('access_token');

export const setToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem('access_token', token);
};

export const removeToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem('access_token');
};
