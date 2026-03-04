import type { MatService } from "../mat/service.js";
import type { ToolResponse } from "../types.js";
import { matRunCommandSchema } from "./schemas.js";

export async function runMatRunCommand(service: MatService, args: unknown): Promise<ToolResponse> {
  const input = matRunCommandSchema.parse(args ?? {});
  return await service.matRunCommand(input);
}
