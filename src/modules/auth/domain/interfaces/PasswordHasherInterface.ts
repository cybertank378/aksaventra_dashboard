export interface PasswordHasherInterface {
  hash(password: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}
