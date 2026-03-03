import type { MatService } from "../mat/service.js";
import type { ToolResponse } from "../types.js";
import { matOqlSpecSchema } from "./schemas.js";

export function runMatOqlSpec(service: MatService, args: unknown): ToolResponse {
  matOqlSpecSchema.parse(args ?? {});
  return service.matOqlSpec();
}
