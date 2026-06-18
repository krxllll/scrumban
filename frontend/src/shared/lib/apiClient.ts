const DEFAULT_API_BASE_URL = "";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequestOptions = Omit<RequestInit, "body" | "method"> & {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
};

type ApiErrorBody = {
  error?: unknown;
  message?: unknown;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// Leave VITE_API_BASE_URL empty for local Vite proxy mode; set it only when the API is hosted elsewhere.
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

function buildUrl(path: string): string {
  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");

  return `${normalizedBaseUrl}/${normalizedPath}`;
}

function getErrorMessage(details: unknown): string {
  if (details && typeof details === "object") {
    const { error, message } = details as ApiErrorBody;

    if (typeof error === "string" && error.trim()) {
      return error;
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Request failed";
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, method = "GET", token, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const responseBody = await parseJsonResponse(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      getErrorMessage(responseBody),
      responseBody,
    );
  }

  return responseBody as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "body" | "method">,
  ) => apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "body" | "method">,
  ) => apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "body" | "method">,
  ) => apiRequest<T>(path, { ...options, method: "PATCH", body }),
  del: <T>(path: string, options?: Omit<ApiRequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
