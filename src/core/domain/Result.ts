export class Result<T, E = string> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _error?: E;
  private readonly _value?: T;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error) {
      throw new Error("InvalidOperation: A successful result cannot have an error");
    }
    if (!isSuccess && error === undefined) {
      throw new Error("InvalidOperation: A failed result must have an error");
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;

    Object.freeze(this);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(`Cant retrieve the value from a failed result: ${String(this._error)}`);
    }

    return this._value as T;
  }

  public getError(): E {
    if (this.isSuccess) {
      throw new Error("Cant retrieve the error from a successful result");
    }

    return this._error as E;
  }

  public static ok<U, F = string>(value?: U): Result<U, F> {
    return new Result<U, F>(true, undefined, value);
  }

  public static fail<U, F = string>(error: F): Result<U, F> {
    return new Result<U, F>(false, error);
  }

  public static combine(results: Result<unknown, unknown>[]): Result<unknown, unknown> {
    for (const result of results) {
      if (result.isFailure) {
        return result;
      }
    }
    return Result.ok();
  }
}
