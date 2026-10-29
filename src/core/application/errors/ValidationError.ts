import { AppError } from "./AppError";

export interface FieldValidationError {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  public readonly errors: FieldValidationError[];

  constructor(message: string, errors: FieldValidationError[] = []) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
    this.errors = errors;
  }
}
