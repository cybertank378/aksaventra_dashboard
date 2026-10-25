import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContextData {
  requestId: string;
  userId?: string;
  role?: string;
  clientIp?: string;
  userAgent?: string;
  timestamp: Date;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContextData>();

export function runWithRequestContext<T>(
  context: RequestContextData,
  fn: () => Promise<T> | T,
): Promise<T> | T {
  return asyncLocalStorage.run(context, fn);
}

export function getRequestContext(): RequestContextData | undefined {
  return asyncLocalStorage.getStore();
}
