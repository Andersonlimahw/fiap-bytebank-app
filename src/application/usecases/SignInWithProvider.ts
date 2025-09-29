import type { AuthRepository } from "@domain/repositories/AuthRepository";
import type { AuthProvider } from "@domain/entities/AuthProvider";
import type { User } from "@domain/entities/User";

export class SignInWithProvider {
  constructor(private readonly authRepo: AuthRepository) {}
  execute(
    provider: AuthProvider,
    options?: { email?: string; password?: string }
  ): Promise<User> {
    return this.authRepo.signIn(provider, options);
  }
}
