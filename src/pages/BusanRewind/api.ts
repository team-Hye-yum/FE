import type {
  ApiDataResponse,
  BusanRewindApiKey,
  BusanRewindData,
  CurrentStatusData,
  CurrentSupportProgramsData,
  PastSupportReviewData,
  SimilarFlowData,
  SupportComparisonData,
  TrendBriefingData,
} from "./types";

const apiUrl = (path: string) => {
  const baseUrl = import.meta.env.API_URL || import.meta.env.VITE_API_URL || "/api";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const withIndustryCode = (path: string, industryCode: string) =>
  apiUrl(`${path}?${new URLSearchParams({ industryCode })}`);

export const busanRewindApiSources: Record<BusanRewindApiKey, string> = {
  currentStatus: "/api/busan-rewind/current-status",
  currentSupportPrograms: "/api/busan-rewind/current-support-programs",
  pastSupportReview: "/api/busan-rewind/past-support-review",
  similarFlow: "/api/busan-rewind/similar-flow",
  supportComparison: "/api/busan-rewind/support-comparison",
  trendBriefing: "/api/busan-rewind/trend-briefing",
};

export const busanRewindComponentApiMap = {
  CurrentIndustryStatus: busanRewindApiSources.currentStatus,
  CurrentSupportProgramList: busanRewindApiSources.currentSupportPrograms,
  IndustryTrendBriefing: busanRewindApiSources.trendBriefing,
  IndustrySupportExplorer: busanRewindApiSources.pastSupportReview,
  SimilarIndustryExplorer: busanRewindApiSources.similarFlow,
  SupportComparisonMap: busanRewindApiSources.supportComparison,
} as const;

const fetchData = async <T>(path: string, industryCode: string): Promise<T> => {
  const response = await fetch(withIndustryCode(path, industryCode));

  if (!response.ok) {
    throw new Error(`부산 리와인드 데이터를 불러오지 못했습니다. (${response.status})`);
  }

  const result = (await response.json()) as ApiDataResponse<T>;
  return result.data;
};

export const busanRewindApi = {
  currentStatus: (industryCode: string) =>
    fetchData<CurrentStatusData>(busanRewindApiSources.currentStatus, industryCode),
  currentSupportPrograms: (industryCode: string) =>
    fetchData<CurrentSupportProgramsData>(busanRewindApiSources.currentSupportPrograms, industryCode),
  pastSupportReview: (industryCode: string) =>
    fetchData<PastSupportReviewData>(busanRewindApiSources.pastSupportReview, industryCode),
  similarFlow: (industryCode: string) =>
    fetchData<SimilarFlowData>(busanRewindApiSources.similarFlow, industryCode),
  supportComparison: (industryCode: string) =>
    fetchData<SupportComparisonData>(busanRewindApiSources.supportComparison, industryCode),
  trendBriefing: (industryCode: string) =>
    fetchData<TrendBriefingData>(busanRewindApiSources.trendBriefing, industryCode),
};

export const fetchBusanRewindData = async (industryCode: string): Promise<BusanRewindData> => {
  const [
    currentStatus,
    currentSupportPrograms,
    trendBriefing,
    similarFlow,
    pastSupportReview,
    supportComparison,
  ] = await Promise.all([
    busanRewindApi.currentStatus(industryCode),
    busanRewindApi.currentSupportPrograms(industryCode),
    busanRewindApi.trendBriefing(industryCode),
    busanRewindApi.similarFlow(industryCode),
    busanRewindApi.pastSupportReview(industryCode),
    busanRewindApi.supportComparison(industryCode),
  ]);

  return {
    currentStatus,
    currentSupportPrograms,
    pastSupportReview,
    similarFlow,
    supportComparison,
    trendBriefing,
  };
};
