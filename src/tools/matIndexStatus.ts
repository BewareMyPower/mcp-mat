import type { MatService } from "../mat/service.js";
import type { ToolResponse } from "../types.js";
import { matIndexStatusSchema } from "./schemas.js";

export function runMatIndexStatus(service: MatService, args: unknown): ToolResponse {
  const input = matIndexStatusSchema.parse(args ?? {});
  return service.matIndexStatus(input);
}
