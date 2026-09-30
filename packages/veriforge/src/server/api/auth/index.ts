import { procedure } from "../trpc";
import { authService } from "../../services/auth";
import type { LoginInput } from "../../../types/auth";

export const authRouter = {
  orgLogin: procedure((input: LoginInput) => authService.orgLogin(input)),
  orgSignup: procedure((body: Record<string, unknown>) => authService.orgSignup(body)),
  clientLogin: procedure((input: LoginInput) => authService.clientLogin(input)),
  developerLogin: procedure((input: LoginInput) => authService.developerLogin(input)),
};
