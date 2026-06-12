import { notifyAuthSessionError } from "@/components/features/AuthSessionProvider/authSessionStore";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  fetchApi,
} from "@/hooks/useFetchApi";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/features/AuthSessionProvider/authSessionStore", () => ({
  notifyAuthSessionError: vi.fn(),
}));

describe("hooks/useFetchApi (API通信モジュール)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchApi", () => {
    it("リクエストが成功した場合にレスポンスデータを正しく返すこと", async () => {
      const mockData = { id: 1, name: "Test" };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await fetchApi({ url: "/todos", method: "GET" });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/todos",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: null,
          credentials: "include",
        },
      );
      expect(result).toEqual(mockData);
    });

    it("ステータスコードが401の場合、セッションエラーを通知しエラーをスローすること", async () => {
      const mockErrorResponse = {
        detail: "Unauthorized",
        code: "auth.unauthorized",
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue(mockErrorResponse),
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(fetchApi({ url: "/todos", method: "GET" })).rejects.toEqual(
        mockErrorResponse,
      );
      expect(notifyAuthSessionError).toHaveBeenCalledWith(mockErrorResponse);
    });

    it("401以外のエラーレスポンスの場合、エラーデータをそのままスローすること", async () => {
      const mockErrorResponse = { detail: "Bad Request", code: "bad_request" };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue(mockErrorResponse),
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(fetchApi({ url: "/todos", method: "GET" })).rejects.toEqual(
        mockErrorResponse,
      );
      expect(notifyAuthSessionError).not.toHaveBeenCalled();
    });
  });

  describe("HTTP メソッドショートカット関数群", () => {
    it("apiGet が GET メソッドで fetchApi を呼び出すこと", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", mockFetch);

      await apiGet("/todos");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("apiPost が POST メソッドとボディを伴って fetchApi を呼び出すこと", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", mockFetch);

      await apiPost("/todos", JSON.stringify({ name: "New Task" }));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "New Task" }),
        }),
      );
    });

    it("apiPut が PUT メソッドで呼び出すこと", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", mockFetch);

      await apiPut("/todos/1", JSON.stringify({ name: "Updated" }));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "PUT" }),
      );
    });

    it("apiPatch が PATCH メソッドで呼び出すこと", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", mockFetch);

      await apiPatch("/todos/1", JSON.stringify({ status: 2 }));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    it("apiDelete が DELETE メソッドで呼び出すこと", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", mockFetch);

      await apiDelete("/todos/1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});
