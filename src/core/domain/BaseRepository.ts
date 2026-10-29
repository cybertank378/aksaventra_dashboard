import type { BaseEntity } from "./BaseEntity";

export interface BaseRepository<TEntity extends BaseEntity<TId>, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  save(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<boolean>;
}
