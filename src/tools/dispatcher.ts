import { ZodError } from "zod";
import { MatMcpError, type ToolResponse } from "../types.js";
import { MatService } from "../mat/service.js";
import { runMatHealthcheck } from "./matHealthcheck.js";
import { runMatIndexStatus } from "./matIndexStatus.js";
import { runMatOqlQuery } from "./matOqlQuery.js";
import { runMatOqlSpec } from "./matOqlSpec.js";
import { runMatParseReport } from "./matParseReport.js";

export async function executeTool(name: string, args: unknown, service: MatService): Promise<ToolResponse> {
  try {
    switch (name) {
      case "mat_healthcheck": {
        return await runMatHealthcheck(service, args);
      }
      case "mat_parse_report": {
        return await runMatParseReport(service, args);
      }
      case "mat_oql_query": {
        return await runMatOqlQuery(service, args);
      }
      case "mat_index_status": {
        return runMatIndexStatus(service, args);
      }
      case "mat_oql_spec": {
        return runMatOqlSpec(service, args);
      }
      default:
        return new MatMcpError({
          category: "MAT_PARSE_FAILED",
          message: `Unknown tool: ${name}`,
          hint: "Use one of: mat_healthcheck, mat_parse_report, mat_oql_query, mat_index_status, mat_oql_spec.",
        }).toResponse();
    }
  } catch (error) {
    if (error instanceof MatMcpError) {
      return error.toResponse();
    }

    if (error instanceof ZodError) {
      return new MatMcpError({
        category: "MAT_PARSE_FAILED",
        message: `Invalid input: ${error.issues.map((issue) => issue.message).join("; ")}`,
        hint: "Check tool input schema and required fields.",
      }).toResponse();
    }

    return new MatMcpError({
      category: "MAT_PARSE_FAILED",
      message: error instanceof Error ? error.message : String(error),
      hint: "Unexpected error while processing tool input.",
    }).toResponse();
  }
}
