import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadConfig } from "../src/config.js";

test("loadConfig parses defaults", () => {
  const allowed = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-mat-allow-"));
  const config = loadConfig({
    MAT_ALLOWED_ROOTS: allowed,
  });

  assert.equal(config.allowedRoots.length, 1);
  assert.equal(config.defaultXmxMb, 4096);
  assert.equal(config.defaultTimeoutSec, 1800);
  assert.equal(config.oqlMaxBytes, 16 * 1024);
  assert.equal(config.resultPreviewLines, 20);
});

test("loadConfig rejects missing MAT_ALLOWED_ROOTS", () => {
  assert.throws(() => loadConfig({}), /required/i);
});

test("loadConfig rejects non-directory allowed roots", () => {
  const filePath = path.join(os.tmpdir(), `mcp-mat-file-${Date.now()}`);
  fs.writeFileSync(filePath, "x");

  assert.throws(
    () =>
      loadConfig({
        MAT_ALLOWED_ROOTS: filePath,
      }),
    /MAT_ALLOWED_ROOTS must be a directory/i,
  );
});
