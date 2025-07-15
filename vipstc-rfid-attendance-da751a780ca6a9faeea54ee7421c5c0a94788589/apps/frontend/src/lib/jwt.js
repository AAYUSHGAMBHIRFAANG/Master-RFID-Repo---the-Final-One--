/**
 * Basic JWT token decoder.
 * Note: This does NOT verify the token's signature.
 * It's only for reading the payload on the client side.
 *
 * @param {string} token - The JWT token.
 * @returns {object|null} The decoded payload or null if invalid.
 */
export function decodeJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}