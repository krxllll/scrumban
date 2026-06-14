const AUTH_TOKEN_KEY = "scrumban.authToken";

function getStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export function getAuthToken(): string | null {
  return getStorage()?.getItem(AUTH_TOKEN_KEY) ?? null;
}

export function setAuthToken(token: string): void {
  getStorage()?.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  getStorage()?.removeItem(AUTH_TOKEN_KEY);
}
