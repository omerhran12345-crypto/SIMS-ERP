import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = globalThis.__SIMS_LOCALE__ || process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "ar";
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
