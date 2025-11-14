export const HOST = import.meta.env.VITE_SERVER_URL;

// base API prefix (leading slash so axios baseURL + route composes correctly)
const API_PREFIX = "/api";

// auth routes
export const AUTH_ROUTES = `${API_PREFIX}/auth`;
// OAuth redirect/callback need full URL
export const AUTH_GOOGLE_LOGIN_ROUTE = `${HOST}${AUTH_ROUTES}/google`; // GET = redirect flow, POST = token-exchange
export const AUTH_GOOGLE_CALLBACK = `${HOST}${AUTH_ROUTES}/google/callback`;
export const GET_USER_INFO = `${AUTH_ROUTES}/me`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;

// Home routes
export const HOME_ROUTES = `${API_PREFIX}/home`;
export const CREATE_HOME_ROUTE = `${HOME_ROUTES}`; // POST
export const JOIN_HOME_ROUTE = `${HOME_ROUTES}/join`; // POST
export const GET_MY_HOME_ROUTE = `${HOME_ROUTES}/me`; // GET
export const UPDATE_HOME_ROUTE = `${HOME_ROUTES}`; // PATCH
export const HOME_STATS_ROUTE = `${HOME_ROUTES}/stats`; // GET
export const HOME_MEMBERS_ROUTE = `${HOME_ROUTES}/members`; // GET

// Emission factor API route
export const EMISSION_FACTOR_ROUTE = `${API_PREFIX}/emission-factor`; // GET with query params: city, state, country
