import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { ServerConfig } from "../src/config.js";
import { MatService } from "../src/mat/service.js";
import type { RunCommand, RunResult } from "../src/types.js";

function setupRuntime() {
  const rootRaw = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-mat-service-"));
  const heapRaw = path.join(rootRaw, "heap.hprof");
  fs.writeFileSync(heapRaw, "heap");

  const root = fs.realpathSync(rootRaw);
  const heap = fs.realpathSync(heapRaw);

  const launcher = path.join(root, "org.eclipse.equinox.launcher_1.0.0.jar");
  fs.writeFileSync(launcher, "jar");

  const config: ServerConfig = {
    allowedRoots: [root],
    matLauncher: launcher,
    matHome: undefined,
    javaPath: "java",
    defaultXmxMb: 4096,
    defaultTimeoutSec: 300,
    matConfigDir: path.join(root, "config"),
    matDataDir: path.join(root, "workspace"),
    debug: false,
    debugLogDir: path.join(root, "logs"),
    privacyMode: false,
    oqlMaxBytes: 16 * 1024,
    resultPreviewLines: 20,
    stdioTailChars: 1000,
  };
  fs.mkdirSync(config.matConfigDir, { recursive: true });
  fs.mkdirSync(config.matDataDir, { recursive: true });

  return { root, heap, config };
}

function successRunResult(command: RunCommand): RunResult {
  return {
    command: command.command,
    args: command.args,
    exitCode: 0,
    signal: null,
    timedOut: false,
    stdout: "ok",
    stderr: "",
    durationMs: 10,
  };
}

test("matParseReport returns generated artifacts when run succeeds", async () => {
  const { root, heap, config } = setupRuntime();
  const reportDir = path.join(root, "heap_Leak_Suspects");
  const reportZip = path.join(root, "heap_Leak_Suspects.zip");

  const service = new MatService(config, {
    runCommand: async (command) => {
      fs.mkdirSync(reportDir, { recursive: true });
      fs.writeFileSync(reportZip, "zip");
      return successRunResult(command);
    },
  });

  const result = await service.matParseReport({
    heap_path: heap,
    report_id: "org.eclipse.mat.api:suspects",
  });

  assert.equal(result.status, "ok");
  if (result.status === "ok") {
    assert.equal(result.report_dir, reportDir);
    assert.equal(result.report_zip, reportZip);
  }
});

test("matOqlQuery returns INVALID_QUERY on non-zero oql syntax failure", async () => {
  const { heap, config } = setupRuntime();
  const service = new MatService(config, {
    runCommand: async (command) => ({
      ...successRunResult(command),
      exitCode: 1,
      stderr: "OQL parse error: invalid query",
    }),
  });

  const result = await service.matOqlQuery({
    heap_path: heap,
    oql: "select from",
  });

  assert.equal(result.status, "error");
  if (result.status === "error") {
    assert.equal(result.category, "INVALID_QUERY");
  }
});

test("matOqlQuery enforces max oql size", async () => {
  const { heap, config } = setupRuntime();
  const service = new MatService(config, {
    runCommand: async (command) => successRunResult(command),
  });

  const oversized = "a".repeat(config.oqlMaxBytes + 1);
  const result = await service.matOqlQuery({
    heap_path: heap,
    oql: oversized,
  });

  assert.equal(result.status, "error");
  if (result.status === "error") {
    assert.equal(result.category, "INVALID_QUERY");
  }
});

test("matOqlQuery accepts user-quoted input and wraps command safely", async () => {
  const { heap, config } = setupRuntime();
  let commandArg = "";
  const service = new MatService(config, {
    runCommand: async (command) => {
      commandArg = command.args.find((arg) => arg.startsWith("-command=oql ")) ?? "";
      return successRunResult(command);
    },
  });

  const result = await service.matOqlQuery({
    heap_path: heap,
    oql: '"SELECT p FROM INSTANCEOF com.example.Topic p"',
  });

  assert.equal(result.status, "ok");
  assert.equal(commandArg, '-command=oql "SELECT p FROM INSTANCEOF com.example.Topic p"');
});

test("matIndexStatus returns index metadata", () => {
  const { root, heap, config } = setupRuntime();
  fs.writeFileSync(path.join(root, "heap.hprof.index"), "idx");
  fs.writeFileSync(path.join(root, "heap.hprof.threads"), "th");

  const service = new MatService(config, {
    runCommand: async (command) => successRunResult(command),
  });

  const result = service.matIndexStatus({ heap_path: heap });
  assert.equal(result.status, "ok");
  if (result.status === "ok") {
    assert.equal(result.index_present, true);
    assert.ok(result.index_files.length >= 1);
  }
});

test("matOqlSpec returns oql parser guidance", () => {
  const { config } = setupRuntime();
  const service = new MatService(config, {
    runCommand: async (command) => successRunResult(command),
  });

  const result = service.matOqlSpec();
  assert.equal(result.status, "ok");
  assert.ok(result.parser_mode.includes("parse-application"));
  assert.ok(result.supported_patterns.length >= 3);
});
