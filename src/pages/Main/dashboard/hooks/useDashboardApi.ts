import { useQueries, useQuery } from "@tanstack/react-query";

type ApiDataResponse<T> = {
  data: T;
};

type DashboardRequestState<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
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
  useDashboardGetData<unknown>(companyId, path);
};

export const useDashboardGetData = <T,>(companyId: string, path: string) => {
  const query = useQuery<T, Error>({
    enabled: Boolean(companyId),
    queryFn: async ({ signal }) => {
      const response = await requestJson<T | ApiDataResponse<T>>(
        apiUrl(path.replace("{companyId}", encodeURIComponent(companyId))),
        undefined,
        signal,
      );

      return unwrapApiData(response);
    },
    queryKey: ["dashboard-get", companyId, path],
  });

  return {
    data: query.data ?? null,
    error: query.error,
    isLoading: query.isLoading,
  } satisfies DashboardRequestState<T>;
};

export const useDashboardGets = (companyId: string, paths: readonly string[]) => {
  useQueries({
    queries: paths.map((path) => ({
      enabled: Boolean(companyId),
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const response = await requestJson<unknown>(
          apiUrl(path.replace("{companyId}", encodeURIComponent(companyId))),
          undefined,
          signal,
        );

        return unwrapApiData(response);
      },
      queryKey: ["dashboard-get", companyId, path],
    })),
  });
};

export const useDashboardChainPost = (
  companyId: string,
  getPath: string,
  postPath: string,
) => {
  useDashboardChainPostData<unknown>(companyId, getPath, postPath);
};

export const useDashboardChainPostData = <T,>(
  companyId: string,
  getPath: string,
  postPath: string,
) => {
  const query = useQuery<T, Error>({
    enabled: Boolean(companyId),
    queryFn: async ({ signal }) => {
      const encodedCompanyId = encodeURIComponent(companyId);
      const payloadResponse = await requestJson<unknown>(
        apiUrl(getPath.replace("{companyId}", encodedCompanyId)),
        undefined,
        signal,
      );

      return requestJson<T>(
        aiUrl(postPath),
        {
          body: JSON.stringify(unwrapApiData(payloadResponse)),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
        signal,
      );
    },
    queryKey: ["dashboard-chain-post", companyId, getPath, postPath],
    staleTime: 60 * 60 * 1000,
  });

  return {
    data: query.data ?? null,
    error: query.error,
    isLoading: query.isLoading,
  } satisfies DashboardRequestState<T>;
};
