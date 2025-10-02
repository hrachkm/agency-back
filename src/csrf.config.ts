// src/config/csrf.config.ts
import { doubleCsrf } from 'csrf-csrf';

export const {
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_KEY,
  getSessionIdentifier: (req) => req.ip,
  cookieName: 'XSRF_TOKEN',
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  },
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});