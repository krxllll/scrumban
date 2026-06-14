import { createContext } from "react";
import type { AuthSessionContextValue } from "./types";

export const AuthContext = createContext<AuthSessionContextValue | undefined>(
    undefined,
);