import type { MatService } from "../mat/service.js";
import type { ToolResponse } from "../types.js";
import { matOqlQuerySchema } from "./schemas.js";

export async function runMatOqlQuery(service: MatService, args: unknown): Promise<ToolResponse> {
  const input = matOqlQuerySchema.parse(args ?? {});
  return await service.matOqlQuery(input);
}
