export type FetchApiArgs = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: HeadersInit;
  body?: BodyInit | null;
};

const notifyAuthError = (error: unknown) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("auth:error", {
      detail: error,
    }),
  );
};

/**
 * ベース API 通信関数
 * @template T - レスポンスの型
 */
export const fetchApi = async <T = unknown>({
  url,
  method,
  headers = {},
  body = null,
}: FetchApiArgs): Promise<T> => {
  try {
    const response = await fetch(`http://localhost:8000/api${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body,
      credentials: "include", // クッキーを自動的に送信・受信
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      if (response.status === 401) {
        notifyAuthError(errorResponse);
      }
      throw errorResponse;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * GET リクエスト用関数
 * @template T - レスポンスの型
 */
export const apiGet = async <T = unknown>(
  url: string,
  options?: Omit<FetchApiArgs, "url" | "method">,
): Promise<T> => {
  return fetchApi<T>({
    url,
    method: "GET",
    ...options,
  });
};

/**
 * POST リクエスト用関数
 * @template T - レスポンスの型
 */
export const apiPost = async <T = unknown>(
  url: string,
  body?: BodyInit | null,
  options?: Omit<FetchApiArgs, "url" | "method" | "body">,
): Promise<T> => {
  return fetchApi<T>({
    url,
    method: "POST",
    body,
    ...options,
  });
};

/**
 * PUT リクエスト用関数
 * @template T - レスポンスの型
 */
export const apiPut = async <T = unknown>(
  url: string,
  body?: BodyInit | null,
  options?: Omit<FetchApiArgs, "url" | "method" | "body">,
): Promise<T> => {
  return fetchApi<T>({
    url,
    method: "PUT",
    body,
    ...options,
  });
};

/**
 * DELETE リクエスト用関数
 * @template T - レスポンスの型
 */
export const apiDelete = async <T = unknown>(
  url: string,
  options?: Omit<FetchApiArgs, "url" | "method">,
): Promise<T> => {
  return fetchApi<T>({
    url,
    method: "DELETE",
    ...options,
  });
};
