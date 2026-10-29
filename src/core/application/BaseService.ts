export abstract class BaseService {
  protected readonly serviceName: string;

  protected constructor(serviceName = "Service") {
    this.serviceName = serviceName;
  }

  protected async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      this.error("Execution failure", err);
      throw err;
    }
  }

  protected log(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[${this.serviceName}] ${message}`, context ?? "");
    }
  }

  protected error(message: string, err?: unknown): void {
    console.error(`[${this.serviceName}] ${message}`, err ?? "");
  }
}
