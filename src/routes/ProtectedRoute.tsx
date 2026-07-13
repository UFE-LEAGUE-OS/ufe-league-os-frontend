import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  type ReactNode,
  useEffect,
} from "react";

import { useAuthStore } from "../store/authStore.js";
import { getToken } from "../utils/tokenManager.js";
import {
  LOGIN_ROUTE,
  VERIFY_EMAIL_ROUTE,
} from "../utils/authFlow.js";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const requiresEmailVerification = useAuthStore(
    (state) => state.requiresEmailVerification,
  );

  const user = useAuthStore((state) => state.user);

  const accessToken =
    useAuthStore((state) => state.accessToken) ??
    getToken();

  /*
   * Handle browser back/forward cache safely.
   *
   * Do not force authenticated administrators away from the
   * Fan Dashboard. Every authenticated League OS account can
   * use its normal fan experience alongside its admin role.
   */
  useEffect(() => {
    function handlePageShow(
      event: PageTransitionEvent,
    ) {
      if (!event.persisted) {
        return;
      }

      if (!getToken()) {
        navigate(LOGIN_ROUTE, {
          replace: true,
        });
      }
    }

    window.addEventListener(
      "pageshow",
      handlePageShow,
    );

    return () => {
      window.removeEventListener(
        "pageshow",
        handlePageShow,
      );
    };
  }, [navigate]);

  if (requiresEmailVerification) {
    const email =
      typeof user?.email === "string"
        ? user.email
        : undefined;

    const postLoginRedirect =
      `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={VERIFY_EMAIL_ROUTE}
        replace
        state={{
          email,
          message:
            "Please verify your email address before continuing.",
          postLoginRedirect,
        }}
      />
    );
  }

  if (!accessToken) {
    const postLoginRedirect =
      `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={LOGIN_ROUTE}
        replace
        state={{
          message:
            "Please log in to continue.",
          postLoginRedirect,
        }}
      />
    );
  }

  return children;
}
