import { X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";

export type CreateProjectFormValues = {
  name: string;
  description?: string | null;
};

type CreateProjectModalProps = {
  errorMessage: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CreateProjectFormValues) => Promise<void>;
};

export function CreateProjectModal({
  errorMessage,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName("");
    setDescription("");
    setValidationMessage(null);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const visibleErrorMessage = validationMessage ?? errorMessage;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setValidationMessage("Project name is required");
      return;
    }

    setValidationMessage(null);

    try {
      await onSubmit({
        name: trimmedName,
        description: trimmedDescription ? trimmedDescription : null,
      });
    } catch {
      // The caller owns the visible API error message.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/65 px-4 backdrop-blur-sm">
      <form
        className="glass-panel w-full max-w-[440px] rounded-[22px] border-glass-border bg-[#111B2A]/95 p-5 shadow-[0_28px_120px_rgba(0,0,0,0.55)]"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-text-primary">
            Create project
          </h2>
          <button
            aria-label="Close create project modal"
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-white/[0.08] hover:text-text-primary"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-text-primary">
              Project name <span className="text-error">*</span>
            </span>
            <Input
              className="mt-2 w-full"
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter project name"
              required
              value={name}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text-primary">
              Description
            </span>
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-glass-border bg-background/40 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent/50"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add description (optional)"
              value={description}
            />
          </label>

          {visibleErrorMessage && (
            <p className="rounded-xl border border-error/30 bg-error/[0.08] px-3 py-2 text-sm font-semibold text-error">
              {visibleErrorMessage}
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            className="min-w-20"
            disabled={isSubmitting}
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            className="min-w-32"
            disabled={isSubmitting}
            type="submit"
            variant="primary"
          >
            {isSubmitting ? "Creating..." : "Create project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
