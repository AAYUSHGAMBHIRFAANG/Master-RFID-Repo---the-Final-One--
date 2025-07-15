#!/usr/bin/env python3
"""
generate_jwt_secret.py
Creates a cryptographically-secure random string that you can use
as the signing secret for JWT tokens (HS256, HS384, HS512, etc.).
Usage:
    python generate_jwt_secret.py [BYTES]
If BYTES is omitted, 32 bytes (256 bits) are used.
"""

import secrets
import sys
import base64

DEFAULT_BYTES = 32  # 256-bit key (strong enough for HS256, HS384, HS512)

def generate_secret(n_bytes: int = DEFAULT_BYTES) -> str:
    """
    Returns a URL-safe Base64-encoded secret string.
    """
    raw = secrets.token_bytes(n_bytes)
    # urlsafe_b64encode removes '+' and '/' so the string is safe in URLs & env vars
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")

def main():
    try:
        n_bytes = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_BYTES
        if n_bytes < 16:
            print("⚠️  Using fewer than 16 bytes (<128 bits) is not recommended.")
    except ValueError:
        print("First argument must be an integer (number of bytes).")
        sys.exit(1)

    secret = generate_secret(n_bytes)
    print(f"Generated {n_bytes*8}-bit JWT secret:\n{secret}")

if __name__ == "__main__":
    main()
