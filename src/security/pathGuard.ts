import fs from "node:fs";
import path from "node:path";
import { MatMcpError } from "../types.js";

function isWithinRoot(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function ensureAllowedHeapPath(heapPath: string, allowedRoots: string[]): string {
  const absoluteInput = path.resolve(heapPath);

  let canonical: string;
  try {
    canonical = fs.realpathSync(absoluteInput);
  } catch {
    throw new MatMcpError({
      category: "HEAP_NOT_FOUND",
      message: `Heap path does not exist: ${absoluteInput}`,
      hint: "Verify the heap dump path and server filesystem permissions.",
    });
  }

  const stat = fs.statSync(canonical);
  if (!stat.isFile()) {
    throw new MatMcpError({
      category: "HEAP_NOT_FOUND",
      message: `Heap path is not a file: ${canonical}`,
      hint: "Provide a MAT-supported heap dump file path.",
    });
  }

  try {
    fs.accessSync(canonical, fs.constants.R_OK);
  } catch {
    throw new MatMcpError({
      category: "HEAP_NOT_FOUND",
      message: `Heap path is not readable: ${canonical}`,
      hint: "Grant read permission for the heap file and parent directory.",
    });
  }

  if (!allowedRoots.some((root) => isWithinRoot(canonical, root))) {
    throw new MatMcpError({
      category: "HEAP_NOT_FOUND",
      message: `Heap path is outside allowed roots: ${canonical}`,
      hint: "Update MAT_ALLOWED_ROOTS to include this heap location.",
    });
  }

  return canonical;
}

export function ensureWriteAccessNearHeap(heapPath: string): void {
  const parentDir = path.dirname(heapPath);
  try {
    fs.accessSync(parentDir, fs.constants.W_OK);
  } catch {
    throw new MatMcpError({
      category: "WRITE_PERMISSION_DENIED",
      message: `Missing write access near heap: ${parentDir}`,
      hint: "Grant write access near the heap or copy it to a writable location.",
    });
  }
}
