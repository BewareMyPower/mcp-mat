import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { ensureAllowedHeapPath } from "../src/security/pathGuard.js";
import { MatMcpError } from "../src/types.js";

function setup(): { root: string; heapFile: string; otherHeap: string } {
  const rootRaw = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-mat-path-"));
  const heapFileRaw = path.join(rootRaw, "heap.hprof");
  fs.writeFileSync(heapFileRaw, "heap");

  const otherRootRaw = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-mat-other-"));
  const otherHeapRaw = path.join(otherRootRaw, "other.hprof");
  fs.writeFileSync(otherHeapRaw, "heap");

  const root = fs.realpathSync(rootRaw);
  const heapFile = fs.realpathSync(heapFileRaw);
  const otherHeap = fs.realpathSync(otherHeapRaw);

  return { root, heapFile, otherHeap };
}

test("ensureAllowedHeapPath accepts heap in allowed root", () => {
  const { root, heapFile } = setup();
  const resolved = ensureAllowedHeapPath(heapFile, [root]);
  assert.equal(resolved, fs.realpathSync(heapFile));
});

test("ensureAllowedHeapPath rejects heap outside allowlist", () => {
  const { root, otherHeap } = setup();

  assert.throws(
    () => ensureAllowedHeapPath(otherHeap, [root]),
    (error: unknown) => error instanceof MatMcpError && error.category === "HEAP_NOT_FOUND",
  );
});
