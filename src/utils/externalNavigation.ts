export function redirectToExternalUrl(
  destination: string,
) {
  const parsedUrl = new URL(
    destination,
    window.location.origin,
  );

  if (
    parsedUrl.protocol !== 'https:' &&
    parsedUrl.protocol !== 'http:'
  ) {
    throw new Error(
      'Unsupported external checkout URL.',
    );
  }

  window.location.assign(
    parsedUrl.toString(),
  );
}
