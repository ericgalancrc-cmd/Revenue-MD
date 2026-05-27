/**
 * Auth0Bridge — sits inside Auth0Provider and passes auth state to App.
 *
 * This component is only rendered when VITE_AUTH0_DOMAIN and
 * VITE_AUTH0_CLIENT_ID are both set.  Calling useAuth0() here is always
 * safe because Auth0Provider is guaranteed to be an ancestor.
 */

import { useAuth0 } from "@auth0/auth0-react";
import App from "./App.jsx";

export default function Auth0Bridge() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  return (
    <App
      auth0={{ isAuthenticated, isLoading, loginWithRedirect, logout }}
    />
  );
}
