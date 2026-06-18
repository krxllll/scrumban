import { api } from "../../../shared/lib/apiClient";
import type {
  AuthResponse,
  AuthUser,
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from "../model/types.ts";

export function registerUser(payload: RegisterRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>("/api/auth/register", payload);
}

export function loginUser(payload: LoginRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>("/api/auth/login", payload);
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await api.get<CurrentUserResponse>("/api/auth/me", {
    token,
  });

  return response.user;
}

export const authApi = {
  registerUser,
  loginUser,
  getCurrentUser,
};
