import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { RunResult } from "./types.js";

export interface RequestContext {
  requestId: string;
  tool: string;
  heapPathDisplay?: string;
  startedAtMs: number;
}

export function createRequestContext(tool: string, heapPath: string | undefined, privacyMode: boolean): RequestContext {
  const requestId = crypto.randomUUID();
  const heapPathDisplay = heapPath
    ? privacyMode
      ? `sha256:${crypto.createHash("sha256").update(heapPath).digest("hex")}`
      : heapPath
    : undefined;

  return {
    requestId,
    tool,
    heapPathDisplay,
    startedAtMs: Date.now(),
  };
}

export function logRequestStart(context: RequestContext): void {
  process.stderr.write(
    `${JSON.stringify({
      event: "request_start",
      request_id: context.requestId,
      tool: context.tool,
      heap: context.heapPathDisplay,
      ts: new Date().toISOString(),
    })}\n`,
  );
}

export function logRequestEnd(context: RequestContext, params: {
  exitCode?: number | null;
  elapsedMs: number;
  artifacts?: string[];
  status: "ok" | "error";
  category?: string;
}): void {
  process.stderr.write(
    `${JSON.stringify({
      event: "request_end",
      request_id: context.requestId,
      tool: context.tool,
      heap: context.heapPathDisplay,
      status: params.status,
      category: params.category,
      exit_code: params.exitCode ?? null,
      elapsed_ms: params.elapsedMs,
      artifacts: params.artifacts ?? [],
      ts: new Date().toISOString(),
    })}\n`,
  );
}

export function persistDebugLog(params: {
  enabled: boolean;
  logDir: string;
  context: RequestContext;
  run: RunResult;
}): void {
  if (!params.enabled) {
    return;
  }

  fs.mkdirSync(params.logDir, { recursive: true });
  const logPath = path.join(params.logDir, `${params.context.requestId}.log`);
  const payload = {
    request_id: params.context.requestId,
    tool: params.context.tool,
    heap: params.context.heapPathDisplay,
    started_at: new Date(params.context.startedAtMs).toISOString(),
    duration_ms: params.run.durationMs,
    exit_code: params.run.exitCode,
    signal: params.run.signal,
    timed_out: params.run.timedOut,
    command: params.run.command,
    args: params.run.args,
    stdout: params.run.stdout,
    stderr: params.run.stderr,
  };
  fs.writeFileSync(logPath, JSON.stringify(payload, null, 2));
}
