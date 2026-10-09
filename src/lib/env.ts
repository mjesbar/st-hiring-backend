import path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '../../.env') });

/** Validated, immutable environment configuration loaded once at startup. */
export interface Env {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  MONGO_URI: string;
}

const REQUIRED = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'MONGO_URI'] as const;

/** Reads and validates every env var, throwing a detailed error listing all problems. */
const loadEnv = (): Env => {
  const errors: string[] = [];

  for (const key of REQUIRED) {
    if (!process.env[key]?.trim()) errors.push(`${key} is missing`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join('\n- ')}`);
  }

  return {
    PORT: Number(process.env.PORT ?? 3000),
    DB_HOST: process.env.DB_HOST as string,
    DB_PORT: Number(process.env.DB_PORT),
    DB_USER: process.env.DB_USER as string,
    DB_PASSWORD: process.env.DB_PASSWORD as string,
    DB_NAME: process.env.DB_NAME as string,
    MONGO_URI: process.env.MONGO_URI as string,
  };
};

export const ENV: Env = loadEnv();
