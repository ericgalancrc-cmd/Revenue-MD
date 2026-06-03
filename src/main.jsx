import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import App from "./App.jsx";

const AUTH0_DOMAIN    = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;
const AUTH0_AUDIENCE  = import.meta.env.VITE_AUTH0_AUDIENCE;

// Defined at module level so React never sees a new component type on re-render
function AppWithAuth0() {
  const auth0 = useAuth0();
  return <App auth0={auth0} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {AUTH0_DOMAIN && AUTH0_CLIENT_ID ? (
      <Auth0Provider
        domain={AUTH0_DOMAIN}
        clientId={AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          ...(AUTH0_AUDIENCE ? { audience: AUTH0_AUDIENCE } : {}),
        }}
      >
        <AppWithAuth0 />
      </Auth0Provider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
