import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { busanRewindApiSources, fetchBusanRewindData } from "../api";
import { sampleBusanRewindData, SAMPLE_INDUSTRY_CODE } from "../sampleData";

export const useBusanRewindData = () => {
  const [searchParams] = useSearchParams();
  const selectedIndustryCode = searchParams.get("industryCode") || searchParams.get("divisionCode") || "";
  const shouldFetch = selectedIndustryCode.length > 0;
  const query = useQuery({
    enabled: shouldFetch,
    queryFn: () => fetchBusanRewindData(selectedIndustryCode),
    queryKey: ["busan-rewind", selectedIndustryCode],
  });

  return useMemo(
    () => ({
      apiSources: busanRewindApiSources,
      data: query.data ?? sampleBusanRewindData,
      error: query.error,
      industryCode: selectedIndustryCode || SAMPLE_INDUSTRY_CODE,
      isError: query.isError,
      isLoading: query.isFetching,
      isSample: !query.data,
    }),
    [query.data, query.error, query.isError, query.isFetching, selectedIndustryCode],
  );
};
