export interface FormattedZodIssue {
  field: string;
  message: string;
  code?: string;
}

export function handleZodError(error: unknown): FormattedZodIssue[] {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  ) {
    return (
      error as {
        issues: { path: (string | number)[]; message: string; code?: string }[];
      }
    ).issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));
  }

  return [
    {
      field: "unknown",
      message: error instanceof Error ? error.message : "Validation failed",
    },
  ];
}
