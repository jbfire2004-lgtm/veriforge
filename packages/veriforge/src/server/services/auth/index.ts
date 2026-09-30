import { saasGateway } from "../_gateway";
import type { LoginInput, SessionTokens } from "../../../types/auth";

export const authService = {
  orgLogin(input: LoginInput) {
    return saasGateway.request<{ tokens: SessionTokens }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  orgSignup(body: Record<string, unknown>) {
    return saasGateway.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  clientLogin(input: LoginInput) {
    return saasGateway.request<{ tokens: SessionTokens }>("/client/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  developerLogin(input: LoginInput) {
    return saasGateway.request<{ tokens: SessionTokens }>("/developer/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
