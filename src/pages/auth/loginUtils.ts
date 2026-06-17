export function buildGoogleAuthUrl({
  apiBaseUrl,
  googleClientId,
  googleRedirectUri,
}: {
  apiBaseUrl: string;
  googleClientId?: string;
  googleRedirectUri?: string;
}) {
  const clientId = googleClientId?.trim();
  const redirectUri = googleRedirectUri?.trim() || `${apiBaseUrl}/api/accounts/google/callback/`;

  if (!clientId || !redirectUri) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
