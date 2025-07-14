/**
 * Validate 12-char hex UID (e.g., 20000DDD6F9F)
 */
export const isHexUid = (uid) => /^[0-9A-F]{12}$/i.test(uid);

/**
 * Validate MAC address (e.g., AA:BB:CC:DD:EE:FF)
 */
export const isMac = (mac) =>
  /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(mac);

/**
 * Quick email check (fallback to express-validator for complex)
 */
export const isEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
