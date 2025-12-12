export const APP_NAME = "Verbasync";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// LocalStorage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "verbasync-auth-token",
  AUTH_USER: "verbasync-auth-user",
  THEME: "verbasync-theme",
} as const;

// Query Keys
export const QUERY_KEYS = {
  AUTH_ME: ["auth", "me"],
  PROJECTS: ["projects"],
  PROJECT: (id: string) => ["projects", id],
  LOCALES: (projectId: string) => ["projects", projectId, "locales"],
  KEYS: (projectId: string) => ["projects", projectId, "keys"],
  TRANSLATIONS_MATRIX: (projectId: string) => ["projects", projectId, "matrix"],
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
  PROJECT_NEW: "/projects/new",
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
  PROJECT_LOCALES: (id: string) => `/projects/${id}/locales`,
  PROJECT_KEYS: (id: string) => `/projects/${id}/keys`,
  PROJECT_TRANSLATIONS: (id: string) => `/projects/${id}/translations`,
  PROJECT_SETTINGS: (id: string) => `/projects/${id}/settings`,
} as const;

