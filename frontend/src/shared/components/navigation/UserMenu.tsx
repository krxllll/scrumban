import { Avatar } from "../ui/Avatar";

export function UserMenu() {
  return (
    <button className="rounded-full ring-1 ring-white/10 transition-transform hover:scale-105" type="button" aria-label="Open user menu">
      <Avatar className="h-9 w-9" name="Roman Kroliak" tone="blue" />
    </button>
  );
}
