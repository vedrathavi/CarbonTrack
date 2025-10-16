export const HOST = import.meta.env.VITE_SERVER_URL;

// base API prefix
const API_PREFIX = "api";

// auth routes
export const AUTH_ROUTES = `${API_PREFIX}/auth`;
export const AUTH_GOOGLE_LOGIN_ROUTE = `${HOST}/${AUTH_ROUTES}/google`; // GET = redirect flow, POST = token-exchange
export const AUTH_GOOGLE_CALLBACK = `${HOST}/${AUTH_ROUTES}/google/callback`;
export const GET_USER_INFO = `${AUTH_ROUTES}/me`;
export const LOGOUT_ROUTE = `${HOST}/${AUTH_ROUTES}/logout`;
