declare global { var __SIMS_LOCALE__: string | undefined; }
export function setLocale(locale: string) { globalThis.__SIMS_LOCALE__ = locale; }
