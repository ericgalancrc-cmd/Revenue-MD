"""
JWT verification for Auth0 tokens.
Falls back to demo mode (org_id="demo") when AUTH0_DOMAIN is not set.
"""
from __future__ import annotations

import os
from typing import Optional

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

AUTH0_DOMAIN   = os.getenv("AUTH0_DOMAIN", "")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE", "")

_bearer = HTTPBearer(auto_error=False)
_jwks_cache: Optional[dict] = None


async def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"https://{AUTH0_DOMAIN}/.well-known/jwks.json", timeout=10
            )
            r.raise_for_status()
            _jwks_cache = r.json()
    return _jwks_cache


async def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    """Validate Auth0 JWT and return payload. Demo mode if AUTH0_DOMAIN not set."""
    if not AUTH0_DOMAIN:
        return {"sub": "demo", "org": "demo"}

    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = creds.credentials
    try:
        jwks = await _get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key: dict = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header.get("kid"):
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key.get("use", "sig"),
                    "n":   key["n"],
                    "e":   key["e"],
                }
                break
        if not rsa_key:
            raise HTTPException(status_code=401, detail="No matching signing key found")

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/",
        )
        return payload
    except JWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")
