export const ENV = {
  appId: process.env.VITE_APP_ID ?? "m4-pos-erp",
  cookieSecret: process.env.JWT_SECRET ?? "m4-pos-erp-secret-key",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "", // Optional - not required for Railway
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "", // Optional - not required for Railway
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "", // Optional
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "", // Optional
};
