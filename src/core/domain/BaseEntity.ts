export abstract class BaseEntity<TId = string> {
  protected readonly _id: TId;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  protected constructor(id: TId, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? new Date();
  }

  get id(): TId {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public equals(other?: BaseEntity<TId> | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    if (!(other instanceof BaseEntity)) {
      return false;
    }

    return this._id === other._id;
  }
}
