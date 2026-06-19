import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function HomeRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-text-secondary">
        Loading...
      </main>
    );
  }

  return (
    <Navigate
      replace
      to={isAuthenticated ? "/projects/board" : "/login"}
    />
  );
}
