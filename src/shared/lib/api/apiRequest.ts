export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  payload?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", payload, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (payload !== undefined && method !== "GET") {
    config.body = JSON.stringify(payload);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP error! Status: ${response.status}`;
    const err = new Error(message);
    (err as unknown as { response: unknown; status: number }).response = data;
    (err as unknown as { response: unknown; status: number }).status = response.status;
    throw err;
  }

  return data as T;
}
