import type { AuthUser } from "../../../features/auth/model/types";
import { Avatar } from "../ui/Avatar";

type UserMenuProps = {
  currentUser: AuthUser | null;
};

function getUserDisplayName(user: AuthUser | null): string {
  return user?.name?.trim() || user?.email?.trim() || "Signed in user";
}

export function UserMenu({ currentUser }: UserMenuProps) {
  const displayName = getUserDisplayName(currentUser);

  return (
    <button
      aria-label={`Open user menu for ${displayName}`}
      className="rounded-full ring-1 ring-white/10 transition-transform hover:scale-105"
      type="button"
    >
      <Avatar className="h-9 w-9" name={displayName} tone="blue" />
    </button>
  );
}
