import assert from "node:assert/strict";
import test from "node:test";
import { normalizeOqlInput, MAT_OQL_SPEC } from "../src/mat/oqlSpec.js";
import { MatMcpError } from "../src/types.js";

test("normalizeOqlInput strips outer double quotes", () => {
  const normalized = normalizeOqlInput('"SELECT p FROM INSTANCEOF com.example.Topic p"');
  assert.equal(normalized, "SELECT p FROM INSTANCEOF com.example.Topic p");
});

test("normalizeOqlInput strips outer single quotes", () => {
  const normalized = normalizeOqlInput("'SELECT p.topic FROM OBJECTS 0x123 p'");
  assert.equal(normalized, "SELECT p.topic FROM OBJECTS 0x123 p");
});

test("normalizeOqlInput rejects empty query", () => {
  assert.throws(
    () => normalizeOqlInput('   ""   '),
    (error: unknown) => error instanceof MatMcpError && error.category === "INVALID_QUERY",
  );
});

test("MAT_OQL_SPEC exposes parser mode guidance", () => {
  assert.ok(MAT_OQL_SPEC.parser_mode.includes("parse-application"));
  assert.ok(MAT_OQL_SPEC.supported_patterns.length >= 3);
});
