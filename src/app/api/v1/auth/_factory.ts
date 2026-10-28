/* ============================================================
 * BUILD AUTH CONTROLLER
 * ============================================================
 */

import { AuthServices } from "@/modules/auth/application/services/AuthServices";
import { AuthController } from "@/modules/auth/infrastructure/http/AuthController";
import { ArgonProvider } from "@/modules/auth/infrastructure/providers/ArgonProvider";
import { JwtProvider } from "@/modules/auth/infrastructure/providers/JwtProvider";
import { MailProvider } from "@/modules/auth/infrastructure/providers/MailProvider";
import { AuthRepository } from "@/modules/auth/infrastructure/repo/AuthRepository";

export function buildAuthController(): AuthController {
  //////////////////////////////////////////////////////////////
  // REPOSITORY
  //////////////////////////////////////////////////////////////

  const repository = new AuthRepository();

  //////////////////////////////////////////////////////////////
  // PROVIDERS
  //////////////////////////////////////////////////////////////

  const passwordHasher = new ArgonProvider();

  const tokenProvider = new JwtProvider();

  const mailer = new MailProvider();

  //////////////////////////////////////////////////////////////
  // SERVICE
  //////////////////////////////////////////////////////////////

  const authService = new AuthServices(repository, passwordHasher, tokenProvider, mailer);

  //////////////////////////////////////////////////////////////
  // CONTROLLER
  //////////////////////////////////////////////////////////////

  return new AuthController(authService);
}
