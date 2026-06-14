import { useContext } from "react";
import { AuthContext } from "./authContext";
import type { AuthSessionContextValue } from "./types";

export function useAuth(): AuthSessionContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}