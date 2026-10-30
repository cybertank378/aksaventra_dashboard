import { ArgonProvider } from "@/modules/auth/infrastructure/providers/ArgonProvider";
import { UserServices } from "@/modules/users/application/services/UserServices";
import { UserAdminController } from "@/modules/users/infrastructure/http/UserAdminController";
import { UserRepository } from "@/modules/users/infrastructure/repo/UserRepository";

export function buildUserAdminController(): UserAdminController {
  const userRepo = new UserRepository();
  const passwordHasher = new ArgonProvider();
  const userServices = new UserServices(userRepo, passwordHasher);

  return new UserAdminController(userServices);
}
