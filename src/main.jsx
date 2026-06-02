import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const AUTH0_DOMAIN    = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;
const AUTH0_AUDIENCE  = import.meta.env.VITE_AUTH0_AUDIENCE;

function Root() {
  const [auth0Mod, setAuth0Mod] = React.useState(null);

  React.useEffect(() => {
    if (AUTH0_DOMAIN && AUTH0_CLIENT_ID) {
      import("@auth0/auth0-react").then(setAuth0Mod);
    }
  }, []);

  if (AUTH0_DOMAIN && AUTH0_CLIENT_ID) {
    if (!auth0Mod) return null; // loading Auth0 SDK

    const { Auth0Provider, useAuth0 } = auth0Mod;

    function Inner() {
      const auth0 = useAuth0();
      return <App auth0={auth0} />;
    }

    return (
      <Auth0Provider
        domain={AUTH0_DOMAIN}
        clientId={AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          ...(AUTH0_AUDIENCE ? { audience: AUTH0_AUDIENCE } : {}),
        }}
      >
        <Inner />
      </Auth0Provider>
    );
  }

  // Demo mode — no Auth0 credentials configured
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
