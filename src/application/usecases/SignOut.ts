import type { AuthRepository } from "@domain/repositories/AuthRepository";

export class SignOut {
  constructor(private readonly authRepo: AuthRepository) {}
  execute(): Promise<void> {
    return this.authRepo.signOut();
  }
}
