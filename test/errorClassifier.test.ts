import assert from "node:assert/strict";
import test from "node:test";
import { classifyRunFailure } from "../src/mat/errorClassifier.js";
import type { RunResult } from "../src/types.js";

function makeRunResult(overrides: Partial<RunResult>): RunResult {
  return {
    command: "java",
    args: [],
    exitCode: 1,
    signal: null,
    timedOut: false,
    stdout: "",
    stderr: "",
    durationMs: 1000,
    ...overrides,
  };
}

test("classifyRunFailure returns MAT_TIMEOUT for timed out process", () => {
  const error = classifyRunFailure(
    makeRunResult({
      timedOut: true,
      durationMs: 12_000,
    }),
    500,
  );

  assert.equal(error.category, "MAT_TIMEOUT");
});

test("classifyRunFailure returns WRITE_PERMISSION_DENIED for permission errors", () => {
  const error = classifyRunFailure(
    makeRunResult({
      stderr: "Permission denied while creating .lock.index",
    }),
    500,
  );

  assert.equal(error.category, "WRITE_PERMISSION_DENIED");
});

test("classifyRunFailure returns INVALID_QUERY for OQL syntax issues", () => {
  const error = classifyRunFailure(
    makeRunResult({
      stderr: "OQL parse error: syntax error near token",
    }),
    500,
  );

  assert.equal(error.category, "INVALID_QUERY");
});

test("classifyRunFailure returns MAT_PARSE_FAILED by default", () => {
  const error = classifyRunFailure(
    makeRunResult({
      stderr: "unexpected failure",
    }),
    500,
  );

  assert.equal(error.category, "MAT_PARSE_FAILED");
});
