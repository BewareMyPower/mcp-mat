import type { MatService } from "../mat/service.js";
import type { ToolResponse } from "../types.js";
import { matHealthcheckSchema } from "./schemas.js";

export async function runMatHealthcheck(service: MatService, args: unknown): Promise<ToolResponse> {
  const input = matHealthcheckSchema.parse((args ?? {}) as object);
  return await service.matHealthcheck(input);
}
