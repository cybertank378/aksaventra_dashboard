export interface AppEnvConfig {
  databaseUrl: string;
  engineSignatureSecret?: string;
  nodeEnv: "development" | "production" | "test";
  port: number;
}

export function getAppEnv(): AppEnvConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing required environment variable: DATABASE_URL");
    }
  }

  return {
    databaseUrl:
      databaseUrl ?? "postgresql://postgres:postgres@localhost:5432/aksaventra_db?schema=public",
    engineSignatureSecret: process.env.ENGINE_SIGNATURE_SECRET,
    nodeEnv: (process.env.NODE_ENV as AppEnvConfig["nodeEnv"]) ?? "development",
    port: Number.parseInt(process.env.PORT ?? "3000", 10),
  };
}
