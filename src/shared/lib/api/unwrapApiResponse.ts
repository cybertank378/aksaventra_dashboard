export interface ApiResponseWrapper<T> {
  success?: boolean;
  valid?: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
  error?: string;
}

export function unwrapApiResponse<T>(response: ApiResponseWrapper<T> | T): T {
  if (response && typeof response === "object") {
    const wrapped = response as ApiResponseWrapper<T>;

    if (wrapped.success === false) {
      throw new Error(wrapped.message || wrapped.error || "Request failed");
    }

    if (wrapped.valid === false) {
      throw new Error(wrapped.message || "License validation failed");
    }

    if ("data" in wrapped && wrapped.data !== undefined) {
      return wrapped.data as T;
    }
  }

  return response as T;
}
