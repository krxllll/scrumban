import { useState, type FormEvent } from "react";
import { ApiError } from "../../../shared/lib/apiClient";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { useAuth } from "../model/useAuth";

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Login failed";
}

export function SignInForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="glass-panel flex w-full max-w-md flex-col gap-5 rounded-2xl p-6" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-text-primary">Sign in</h1>
        <p className="text-sm text-text-secondary">Use your Scrumban account to continue.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary" htmlFor="signin-email">
          Email
        </label>
        <Input
          autoComplete="email"
          id="signin-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary" htmlFor="signin-password">
          Password
        </label>
        <Input
          autoComplete="current-password"
          id="signin-password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}

      <Button className="w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit" variant="primary">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
