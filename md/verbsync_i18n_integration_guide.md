# Verbsync Translation API — Frontend Integration Guide

This document shows **supported integration patterns** for consuming the Verbsync Translation API across React and Next.js environments.

Only **practical, production-ready scenarios** are included.

---

## API Contract

### Endpoint
```
GET /api/translations/{namespace}/{locale}.json
```

### Headers
```
x-api-key: YOUR_API_KEY
```

### Example
```
GET /api/translations/common/ko.json
```

### Response
```json
{
  "submit": "제출",
  "cancel": "취소"
}
```

---

## 1. React (SPA) + i18next (Client-side)

**Recommended for React SPA (Vite / CRA)**

Translations are fetched directly from the browser using `i18next-http-backend`.

### Install
```bash
npm install i18next react-i18next i18next-http-backend
```

### Configure i18next
```ts
// src/i18n.ts
import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ko'],
    ns: ['common', 'home'],
    defaultNS: 'common',

    backend: {
      loadPath: `${import.meta.env.VITE_API_BASE_URL}/api/translations/{{ns}}/{{lng}}.json`,
      requestOptions: {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY
        }
      }
    },

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### Usage
```tsx
import {useTranslation} from 'react-i18next';

export function SubmitButton() {
  const {t} = useTranslation('common');
  return <button>{t('submit')}</button>;
}
```

### Notes
- API requests are executed in the browser.
- Use a **public, read-only API key** (domain-restricted & rate-limited).

---

## 2. Next.js (App Router) + next-intl (Server-side fetch)

**Recommended for modern Next.js (App Router + RSC)**

Translations are fetched on the server and injected as `messages`.

### Install
```bash
npm install next-intl
```

### Server configuration
```ts
// i18n.ts
import {getRequestConfig} from 'next-intl/server';

const namespaces = ['common', 'home'] as const;

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;

  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const res = await fetch(
        `${process.env.API_BASE_URL}/api/translations/${ns}/${locale}.json`,
        {
          headers: {
            'x-api-key': process.env.API_KEY!
          },
          next: {revalidate: 60}
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to load ${ns}/${locale}`);
      }

      return [ns, await res.json()] as const;
    })
  );

  return {
    locale,
    messages: Object.fromEntries(entries)
  };
});
```

### Provider
```tsx
// app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

export default async function LocaleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Server Component usage
```tsx
// app/[locale]/page.tsx
import {getTranslations} from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('home');
  return <h1>{t('title')}</h1>;
}
```

### Client Component usage
```tsx
'use client';

import {useTranslations} from 'next-intl';

export function CTAButton() {
  const t = useTranslations('common');
  return <button>{t('submit')}</button>;
}
```

### Notes
- API key is **never exposed** to the browser.
- Best choice for **SEO, security, and performance**.
- Recommended for **SaaS dashboards & marketing pages**.

---

## 3. Next.js (Pages Router) + next-intl (Server-side)

**Supported for legacy Pages Router projects**

### Server-side loading
```tsx
// pages/index.tsx
import {NextIntlProvider} from 'next-intl';

export async function getServerSideProps({locale}: {locale: string}) {
  const namespaces = ['common', 'home'];

  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const res = await fetch(
        `${process.env.API_BASE_URL}/api/translations/${ns}/${locale}.json`,
        {
          headers: {
            'x-api-key': process.env.API_KEY!
          }
        }
      );

      if (!res.ok) throw new Error('Translation load failed');

      return [ns, await res.json()] as const;
    })
  );

  return {
    props: {
      locale,
      messages: Object.fromEntries(entries)
    }
  };
}

export default function Page({messages, locale}: any) {
  return (
    <NextIntlProvider messages={messages} locale={locale}>
      <h1>Hello</h1>
    </NextIntlProvider>
  );
}
```

---

## 4. Next.js + i18next (Client-side only)

**When you want to reuse the same i18next setup across React & Next.js**

### Configure (same as React)
```ts
// i18n.ts
import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/translations/{{ns}}/{{lng}}.json`,
      requestOptions: {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY
        }
      }
    }
  });
```

### Usage (Client Component)
```tsx
'use client';

import {useTranslation} from 'react-i18next';

export function Label() {
  const {t} = useTranslation('common');
  return <span>{t('submit')}</span>;
}
```

### Notes
- API key is exposed (client-side).
- Not recommended for App Router server-first architectures.

---

## Recommended Usage Summary

| Environment | Library | Fetch Location | Recommended |
|---|---|---|---|
| React SPA | i18next | Client | ✅ |
| Next.js App Router | next-intl | Server | ✅ Best |
| Next.js Pages Router | next-intl | Server | ✅ |
| Next.js (any) | i18next | Client | ⚠️ |

---

## Final Recommendation

- **React / React Native / non-Next environments**  
  → `i18next + http-backend`

- **Next.js (App Router)**  
  → `next-intl + server-side fetch`

This provides the best balance of **security, performance, and developer experience**.
