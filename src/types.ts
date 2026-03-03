export type MatErrorCategory =
  | "MAT_NOT_FOUND"
  | "HEAP_NOT_FOUND"
  | "WRITE_PERMISSION_DENIED"
  | "MAT_PARSE_FAILED"
  | "MAT_TIMEOUT"
  | "INVALID_QUERY";

export interface MatErrorResponse {
  status: "error";
  category: MatErrorCategory;
  message: string;
  hint: string;
  stdout_tail: string;
  stderr_tail: string;
  exit_code: number | null;
}

export interface RunCommand {
  command: string;
  args: string[];
  timeoutSec: number;
}

export interface RunResult {
  command: string;
  args: string[];
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface MatParseReportSuccess {
  status: "ok";
  exit_code: number;
  report_dir: string | null;
  report_zip: string | null;
  generated_files: string[];
  stdout_tail: string;
  stderr_tail: string;
}

export interface MatOqlQuerySuccess {
  status: "ok";
  exit_code: number;
  query_dir: string | null;
  query_zip: string | null;
  result_txt: string | null;
  result_preview: string[];
  generated_files: string[];
  stdout_tail: string;
  stderr_tail: string;
}

export interface MatHealthcheckSuccess {
  status: "ok";
  ok: true;
  mat_launcher: string;
  java_version: string;
  notes: string[];
}

export interface MatIndexStatusSuccess {
  status: "ok";
  index_present: boolean;
  index_files: string[];
  threads_file: string | null;
  last_modified: string | null;
}

export interface MatOqlSpecSuccess {
  status: "ok";
  parser_mode: string;
  command_format: string;
  client_input_rules: string[];
  supported_patterns: Array<{
    name: string;
    query: string;
    description: string;
  }>;
  unsupported_patterns: string[];
  notes: string[];
}

export type ToolResponse =
  | MatHealthcheckSuccess
  | MatParseReportSuccess
  | MatOqlQuerySuccess
  | MatIndexStatusSuccess
  | MatOqlSpecSuccess
  | MatErrorResponse;

export class MatMcpError extends Error {
  public readonly category: MatErrorCategory;
  public readonly hint: string;
  public readonly stdoutTail: string;
  public readonly stderrTail: string;
  public readonly exitCode: number | null;

  constructor(params: {
    category: MatErrorCategory;
    message: string;
    hint: string;
    stdoutTail?: string;
    stderrTail?: string;
    exitCode?: number | null;
  }) {
    super(params.message);
    this.name = "MatMcpError";
    this.category = params.category;
    this.hint = params.hint;
    this.stdoutTail = params.stdoutTail ?? "";
    this.stderrTail = params.stderrTail ?? "";
    this.exitCode = params.exitCode ?? null;
  }

  toResponse(): MatErrorResponse {
    return {
      status: "error",
      category: this.category,
      message: this.message,
      hint: this.hint,
      stdout_tail: this.stdoutTail,
      stderr_tail: this.stderrTail,
      exit_code: this.exitCode,
    };
  }
}
