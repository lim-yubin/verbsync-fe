// ========== User ==========
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ========== Auth ==========
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ========== Project ==========
export interface Project {
  id: string;
  name: string;
  defaultLocale: string;
  apiKey: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  defaultLocale: string;
}

// ========== Locale ==========
export interface Locale {
  id: string;
  projectId: string;
  code: string; // "en", "ko", "ja"
  name: string; // "English", "한국어"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocaleDto {
  code: string;
  name: string;
}

export interface UpdateLocaleStatusDto {
  isActive: boolean;
}

// ========== Key ==========
export interface Key {
  id: string;
  projectId: string;
  name: string; // "login.title"
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeyDto {
  name: string;
  description?: string;
}

// ========== Translation ==========
export interface Translation {
  id: string;
  key: string;
  locale: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranslationUpdateItem {
  key: string;
  locale: string;
  value: string;
}

export interface UpdateTranslationsDto {
  updates: TranslationUpdateItem[];
}

// ========== Translation Matrix (테이블용) ==========
export interface TranslationMatrix {
  locales: Array<{
    code: string;
    name: string;
  }>;
  rows: Array<{
    key: string;
    description: string | null;
    translations: {
      [localeCode: string]: string; // { "en": "Login", "ko": "로그인" }
    };
  }>;
}

