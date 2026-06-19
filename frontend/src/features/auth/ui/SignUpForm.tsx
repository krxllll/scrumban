import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { ApiError } from "../../../shared/lib/apiClient";
import { useAuth } from "../model/useAuth";

function getRegistrationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Registration failed";
}

export function SignUpForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/projects/board", { replace: true });
    } catch (error) {
      setErrorMessage(getRegistrationErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="glass-panel flex w-full max-w-md flex-col gap-5 rounded-2xl p-6"
      onSubmit={handleSubmit}
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-text-primary">Create account</h1>
        <p className="text-sm text-text-secondary">Start tracking your Scrumban work.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary" htmlFor="signup-name">
          Name
        </label>
        <Input
          autoComplete="name"
          id="signup-name"
          onChange={(event) => setName(event.target.value)}
          required
          type="text"
          value={name}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary" htmlFor="signup-email">
          Email
        </label>
        <Input
          autoComplete="email"
          id="signup-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary" htmlFor="signup-password">
          Password
        </label>
        <Input
          autoComplete="new-password"
          id="signup-password"
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

      <Button
        className="w-full disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link className="font-semibold text-accent hover:underline" to="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
