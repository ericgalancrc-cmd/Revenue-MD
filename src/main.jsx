import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import Auth0Bridge from "./Auth0Bridge.jsx";
import App from "./App.jsx";

const DOMAIN    = import.meta.env.VITE_AUTH0_DOMAIN    || "";
const CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || "";

// When Auth0 env vars are set: wrap with Auth0Provider and let Auth0Bridge
// bridge auth state into App via props.
// When not set (demo / local dev): render App directly with auth0=null.
const tree = (DOMAIN && CLIENT_ID) ? (
  <Auth0Provider
    domain={DOMAIN}
    clientId={CLIENT_ID}
    authorizationParams={{ redirect_uri: window.location.origin }}
  >
    <Auth0Bridge />
  </Auth0Provider>
) : (
  <App auth0={null} />
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{tree}</React.StrictMode>
);
