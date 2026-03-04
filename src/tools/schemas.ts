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

export const matRunCommandSchema = z
  .object({
    heap_path: z.string().min(1),
    command_name: z.string().min(1),
    command_args: z.string().optional(),
    format: z.enum(["txt", "html", "csv"]).optional(),
    unzip: z.boolean().optional(),
    limit: z.number().int().optional(),
    xmx_mb: z.number().int().optional(),
    timeout_sec: z.number().int().optional(),
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
    name: "mat_run_command",
    description:
      "Execute a named MAT analysis command headlessly and return result artifacts. " +
      "Supports 56 built-in commands including: dominator_tree, path2gc, merge_shortest_paths, " +
      "histogram, thread_overview, thread_details, collection_fill_ratio, gc_roots, " +
      "find_strings, component_report, system_properties, and many more. " +
      "Use mat_oql_query for OQL queries instead.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["heap_path", "command_name"],
      properties: {
        heap_path: { type: "string" },
        command_name: {
          type: "string",
          description:
            "MAT command name, e.g. histogram, dominator_tree, path2gc, thread_overview, " +
            "collection_fill_ratio, gc_roots, find_strings, etc.",
        },
        command_args: {
          type: "string",
          description:
            "Optional arguments for the command. Format depends on the command, e.g. " +
            "an object address like '0x12345678' for path2gc, or a class pattern for histogram.",
        },
        format: { type: "string", enum: ["txt", "html", "csv"] },
        unzip: { type: "boolean" },
        limit: { type: "integer" },
        xmx_mb: { type: "integer" },
        timeout_sec: { type: "integer" },
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
