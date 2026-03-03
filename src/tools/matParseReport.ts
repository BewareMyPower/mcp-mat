import type { MatService } from "../mat/service.js";
import type { ToolResponse } from "../types.js";
import { matParseReportSchema } from "./schemas.js";

export async function runMatParseReport(service: MatService, args: unknown): Promise<ToolResponse> {
  const input = matParseReportSchema.parse(args ?? {});
  return await service.matParseReport(input);
}
