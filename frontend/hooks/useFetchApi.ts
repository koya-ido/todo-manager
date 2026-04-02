export type FetchApiArgs = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: HeadersInit;
  body?: BodyInit | null;
};

/**
 * ベース API 通信関数
 * @template T - レスポンスの型
 */
export const useFetchApi = async <T = unknown>({
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
    });

    if (!response.ok) {
      throw await response.json();
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
  return useFetchApi<T>({
    url,
    method: "GET",
    ...options,
  });
};

/**
 * POST リクエスト用関数
 * @template T - レスポンスの型
 */
export const apiPost = async <T = any>(
  url: string,
  body?: BodyInit | null,
  options?: Omit<FetchApiArgs, "url" | "method" | "body">,
): Promise<T> => {
  return useFetchApi<T>({
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
export const apiPut = async <T = any>(
  url: string,
  body?: BodyInit | null,
  options?: Omit<FetchApiArgs, "url" | "method" | "body">,
): Promise<T> => {
  return useFetchApi<T>({
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
export const apiDelete = async <T = any>(
  url: string,
  options?: Omit<FetchApiArgs, "url" | "method">,
): Promise<T> => {
  return useFetchApi<T>({
    url,
    method: "DELETE",
    ...options,
  });
};
