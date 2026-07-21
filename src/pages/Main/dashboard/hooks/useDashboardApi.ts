import { useEffect } from "react";

// TODO: 실제 데이터 렌더링 단계에서는 React Query로 요청 캐싱/상태 관리를 묶어 중복 호출을 줄인다.

type ApiDataResponse<T> = {
  data: T;
};

const apiUrl = (path: string) => {
  const baseUrl = import.meta.env.API_URL || import.meta.env.VITE_API_URL || "/api";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const aiUrl = (path: string) => {
  const baseUrl = import.meta.env.AI_URL || import.meta.env.VITE_AI_URL || "/ai";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const unwrapApiData = <T,>(response: T | ApiDataResponse<T>) => {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiDataResponse<T>).data;
  }

  return response as T;
};

const requestJson = async <T,>(
  url: string,
  init: RequestInit | undefined,
  signal: AbortSignal,
) => {
  const response = await fetch(url, { ...init, signal });

  if (!response.ok) {
    throw new Error(`Dashboard API request failed. (${response.status})`);
  }

  return (await response.json()) as T;
};

export const useDashboardGet = (companyId: string, path: string) => {
  useEffect(() => {
    if (!companyId) {
      return undefined;
    }

    const abortController = new AbortController();

    void requestJson(apiUrl(path.replace("{companyId}", encodeURIComponent(companyId))), undefined, abortController.signal)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to load dashboard data.", { path, error });
      });

    return () => {
      abortController.abort();
    };
  }, [companyId, path]);
};

export const useDashboardGets = (companyId: string, paths: readonly string[]) => {
  const pathsKey = paths.join("|");

  useEffect(() => {
    if (!companyId) {
      return undefined;
    }

    const abortController = new AbortController();
    const requestedPaths = pathsKey.split("|").filter(Boolean);

    void Promise.all(
      requestedPaths.map((path) =>
        requestJson(
          apiUrl(path.replace("{companyId}", encodeURIComponent(companyId))),
          undefined,
          abortController.signal,
        ),
      ),
    ).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Failed to load dashboard data.", { paths: requestedPaths, error });
    });

    return () => {
      abortController.abort();
    };
  }, [companyId, pathsKey]);
};

export const useDashboardChainPost = (
  companyId: string,
  getPath: string,
  postPath: string,
) => {
  useEffect(() => {
    if (!companyId) {
      return undefined;
    }

    const abortController = new AbortController();
    const encodedCompanyId = encodeURIComponent(companyId);

    void requestJson<unknown>(
      apiUrl(getPath.replace("{companyId}", encodedCompanyId)),
      undefined,
      abortController.signal,
    )
      .then((payloadResponse) =>
        requestJson(
          aiUrl(postPath),
          {
            body: JSON.stringify(unwrapApiData(payloadResponse)),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          },
          abortController.signal,
        ),
      )
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to load chained dashboard data.", { getPath, postPath, error });
      });

    return () => {
      abortController.abort();
    };
  }, [companyId, getPath, postPath]);
};
