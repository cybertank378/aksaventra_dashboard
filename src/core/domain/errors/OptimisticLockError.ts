import { DomainError } from "./DomainError";

export class OptimisticLockError extends DomainError {
  constructor(message = "Concurrency conflict: Entity was modified by another operation") {
    super(message, "OPTIMISTIC_LOCK_ERROR");
    this.name = "OptimisticLockError";
  }
}
