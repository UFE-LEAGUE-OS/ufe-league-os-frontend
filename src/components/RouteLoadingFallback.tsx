type RouteLoadingFallbackProps = {
  message?: string;
};

export default function RouteLoadingFallback({
  message = 'Loading…',
}: RouteLoadingFallbackProps) {
  return (
    <div
      aria-live="polite"
      className="dashboard-access-loading"
      role="status"
    >
      {message}
    </div>
  );
}
