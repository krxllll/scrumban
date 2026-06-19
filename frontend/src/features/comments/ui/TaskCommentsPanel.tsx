import { useState } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { useComments } from "../model/useComments";

type TaskCommentsPanelProps = {
  token: string | null;
  projectId: string | null;
  taskId: string | null;
};

function formatCommentDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function TaskCommentsPanel({
  token,
  projectId,
  taskId,
}: TaskCommentsPanelProps) {
  const [content, setContent] = useState("");
  const {
    comments,
    createCommentAction,
    errorMessage,
    isLoadingComments,
    isSubmittingComment,
  } = useComments(token, projectId, taskId);

  async function handlePostComment() {
    if (!content.trim()) {
      return;
    }

    try {
      await createCommentAction(content);
      setContent("");
    } catch {
      // useComments owns the visible error message.
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea
          className="min-h-24 w-full resize-y rounded-xl border border-glass-border bg-background/40 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent/50"
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a comment..."
          value={content}
        />
        <div className="flex justify-end">
          <Button
            disabled={isSubmittingComment || !content.trim()}
            onClick={() => void handlePostComment()}
            type="button"
            variant="primary"
          >
            {isSubmittingComment ? "Posting..." : "Post comment"}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-xl border border-error/30 bg-error/[0.08] px-3 py-2 text-sm font-semibold text-error">
          {errorMessage}
        </p>
      )}

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {isLoadingComments && (
          <p className="rounded-xl border border-glass-border bg-white/[0.03] px-3 py-3 text-sm font-medium text-text-secondary">
            Loading comments...
          </p>
        )}

        {!isLoadingComments && comments.length === 0 && (
          <p className="rounded-xl border border-glass-border bg-white/[0.03] px-3 py-3 text-sm font-medium text-text-secondary">
            No comments yet
          </p>
        )}

        {!isLoadingComments &&
          comments.map((comment) => (
            <article
              className="rounded-xl border border-glass-border bg-white/[0.04] px-3 py-3"
              key={comment.id}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-primary">User</p>
                <time className="text-xs text-text-secondary">
                  {formatCommentDate(comment.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-text-secondary">
                {comment.content}
              </p>
            </article>
          ))}
      </div>
    </div>
  );
}
