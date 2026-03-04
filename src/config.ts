import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";

export const ALLOWED_REPORT_IDS = [
  "org.eclipse.mat.api:suspects",
  "org.eclipse.mat.api:overview",
  "org.eclipse.mat.api:top_components",
  "org.eclipse.mat.api:compare",
  "org.eclipse.mat.api:suspects2",
] as const;

const envSchema = z
  .object({
    MAT_ALLOWED_ROOTS: z.string().min(1),
    MAT_HOME: z.string().optional(),
    MAT_LAUNCHER: z.string().optional(),
    JAVA_PATH: z.string().optional(),
    MAT_XMX_MB: z.string().optional(),
    MAT_TIMEOUT_SEC: z.string().optional(),
    MAT_CONFIG_DIR: z.string().optional(),
    MAT_DATA_DIR: z.string().optional(),
    MAT_DEBUG: z.string().optional(),
    MAT_DEBUG_LOG_DIR: z.string().optional(),
    MAT_PRIVACY_MODE: z.string().optional(),
    MAT_OQL_MAX_BYTES: z.string().optional(),
    MAT_RESULT_PREVIEW_LINES: z.string().optional(),
    MAT_STDIO_TAIL_CHARS: z.string().optional(),
  })
  .passthrough();

export interface ServerConfig {
  allowedRoots: string[];
  matHome?: string;
  matLauncher?: string;
  javaPath: string;
  defaultXmxMb: number;
  defaultTimeoutSec: number;
  matConfigDir: string;
  matDataDir: string;
  debug: boolean;
  debugLogDir: string;
  privacyMode: boolean;
  oqlMaxBytes: number;
  resultPreviewLines: number;
  stdioTailChars: number;
}

function parseIntInRange(name: string, value: string | undefined, fallback: number, min: number, max: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  throw new Error(`Invalid boolean value: ${value}`);
}

function normalizeDirectory(inputPath: string, envName: string): string {
  const absolute = path.resolve(inputPath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`${envName} does not exist: ${absolute}`);
  }
  if (!fs.statSync(absolute).isDirectory()) {
    throw new Error(`${envName} must be a directory: ${absolute}`);
  }
  return fs.realpathSync(absolute);
}

function parseAllowedRoots(rawRoots: string): string[] {
  const parsedRoots = rawRoots
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((root) => normalizeDirectory(root, "MAT_ALLOWED_ROOTS"));

  if (parsedRoots.length === 0) {
    throw new Error("MAT_ALLOWED_ROOTS must contain at least one directory.");
  }

  return [...new Set(parsedRoots)];
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const parsed = envSchema.parse(env);

  const allowedRoots = parseAllowedRoots(parsed.MAT_ALLOWED_ROOTS);
  const matConfigDir = path.resolve(parsed.MAT_CONFIG_DIR ?? path.join(os.tmpdir(), "mat-config"));
  const matDataDir = path.resolve(parsed.MAT_DATA_DIR ?? path.join(os.tmpdir(), "mat-workspace"));
  fs.mkdirSync(matConfigDir, { recursive: true });
  fs.mkdirSync(matDataDir, { recursive: true });

  const debug = parseBool(parsed.MAT_DEBUG, false);
  const debugLogDir = path.resolve(parsed.MAT_DEBUG_LOG_DIR ?? path.join(os.tmpdir(), "mcp-mat-logs"));
  if (debug) {
    fs.mkdirSync(debugLogDir, { recursive: true });
  }

  const matHome = parsed.MAT_HOME ? path.resolve(parsed.MAT_HOME) : undefined;
  if (matHome && !fs.existsSync(matHome)) {
    throw new Error(`MAT_HOME does not exist: ${matHome}`);
  }

  const matLauncher = parsed.MAT_LAUNCHER ? path.resolve(parsed.MAT_LAUNCHER) : undefined;
  if (matLauncher && !fs.existsSync(matLauncher)) {
    throw new Error(`MAT_LAUNCHER does not exist: ${matLauncher}`);
  }

  return {
    allowedRoots,
    matHome,
    matLauncher,
    javaPath: parsed.JAVA_PATH?.trim() || "java",
    defaultXmxMb: parseIntInRange("MAT_XMX_MB", parsed.MAT_XMX_MB, 4096, 256, 262144),
    defaultTimeoutSec: parseIntInRange("MAT_TIMEOUT_SEC", parsed.MAT_TIMEOUT_SEC, 1800, 5, 172800),
    matConfigDir,
    matDataDir,
    debug,
    debugLogDir,
    privacyMode: parseBool(parsed.MAT_PRIVACY_MODE, false),
    oqlMaxBytes: parseIntInRange("MAT_OQL_MAX_BYTES", parsed.MAT_OQL_MAX_BYTES, 16 * 1024, 256, 1024 * 1024),
    resultPreviewLines: parseIntInRange("MAT_RESULT_PREVIEW_LINES", parsed.MAT_RESULT_PREVIEW_LINES, 20, 1, 2000),
    stdioTailChars: parseIntInRange("MAT_STDIO_TAIL_CHARS", parsed.MAT_STDIO_TAIL_CHARS, 4000, 256, 100000),
  };
}
