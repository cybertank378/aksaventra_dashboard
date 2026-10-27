export interface AuditQueryParams {
  userId?: string;
  action?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export class AuthQueryBuilder {
  private params: AuditQueryParams = {};

  public byUser(userId: string): this {
    this.params.userId = userId;
    return this;
  }

  public byAction(action: string): this {
    this.params.action = action;
    return this;
  }

  public inDateRange(from: Date, to: Date): this {
    this.params.from = from;
    this.params.to = to;
    return this;
  }

  public paginate(limit: number, offset = 0): this {
    this.params.limit = limit;
    this.params.offset = offset;
    return this;
  }

  public build(): AuditQueryParams {
    return { ...this.params };
  }
}
