export abstract class BaseService {
  protected readonly serviceName: string;

  protected constructor(serviceName: string) {
    this.serviceName = serviceName;
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
