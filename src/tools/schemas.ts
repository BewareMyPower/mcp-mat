import { z } from "zod";

const optionValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const matHealthcheckSchema = z
  .object({
    mat_home: z.string().optional(),
    java_path: z.string().optional(),
  })
  .strict();

export const matParseReportSchema = z
  .object({
    heap_path: z.string().min(1),
    report_id: z.string().min(1),
    options: z.record(optionValueSchema).optional(),
    xmx_mb: z.number().int().optional(),
    timeout_sec: z.number().int().optional(),
  })
  .strict();

export const matOqlQuerySchema = z
  .object({
    heap_path: z.string().min(1),
    oql: z.string().min(1),
    format: z.enum(["txt", "html", "csv"]).optional(),
    unzip: z.boolean().optional(),
    limit: z.number().int().optional(),
    xmx_mb: z.number().int().optional(),
    timeout_sec: z.number().int().optional(),
  })
  .strict();

export const matIndexStatusSchema = z
  .object({
    heap_path: z.string().min(1),
  })
  .strict();

export const matOqlSpecSchema = z.object({}).strict();

export const toolDefinitions = [
  {
    name: "mat_healthcheck",
    description: "Validate MAT launcher and Java runtime availability.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        mat_home: { type: "string" },
        java_path: { type: "string" },
      },
    },
  },
  {
    name: "mat_parse_report",
    description: "Run a predefined MAT report headlessly and return generated artifacts.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["heap_path", "report_id"],
      properties: {
        heap_path: { type: "string" },
        report_id: { type: "string" },
        options: {
          type: "object",
          additionalProperties: {
            anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }],
          },
        },
        xmx_mb: { type: "integer" },
        timeout_sec: { type: "integer" },
      },
    },
  },
  {
    name: "mat_oql_query",
    description: "Execute a single MAT OQL query and return result artifacts.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["heap_path", "oql"],
      properties: {
        heap_path: { type: "string" },
        oql: { type: "string" },
        format: { type: "string", enum: ["txt", "html", "csv"] },
        unzip: { type: "boolean" },
        limit: { type: "integer" },
        xmx_mb: { type: "integer" },
        timeout_sec: { type: "integer" },
      },
    },
  },
  {
    name: "mat_index_status",
    description: "Report whether MAT index artifacts already exist for a heap dump.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["heap_path"],
      properties: {
        heap_path: { type: "string" },
      },
    },
  },
  {
    name: "mat_oql_spec",
    description: "Return MAT OQL parser-mode guidance, supported patterns, and known limitations.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
  },
] as const;
