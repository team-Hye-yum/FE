import DimLoadingOverlay from "@/components/DimLoadingOverlay";
import SampleOnboarding from "@/components/SampleOnboarding";
import AiReviewBriefing from "./components/AiReviewBriefing";
import CurrentIndustryStatus from "./components/CurrentIndustryStatus";
import IndustrySupportExplorer from "./components/IndustrySupportExplorer";
import IndustryTrendBriefing from "./components/IndustryTrendBriefing";
import SimilarIndustryExplorer from "./components/SimilarIndustryExplorer";
import SupportComparisonMap from "./components/SupportComparisonMap";
import { useBusanRewindData } from "./hooks/useBusanRewindData";

const BusanRewind = () => {
  const { data, error, isError, isLoading, isSample } = useBusanRewindData();

  return (
    <main className="mx-auto max-w-[1200px] space-y-5 px-4 py-5 lg:px-6">
      {isSample && (
        <div className="flex justify-end">
          <SampleOnboarding variant="busan-rewind" />
        </div>
      )}
      {isError && (
        <div className="rounded-md border border-[#fecaca] bg-[#fff7f7] px-4 py-3 text-sm font-bold text-[#b91c1c]">
          {error instanceof Error ? error.message : "부산 리와인드 데이터를 불러오지 못해 샘플 데이터를 표시합니다."}
        </div>
      )}
      <div className="relative space-y-5">
        {isLoading && <DimLoadingOverlay message="선택한 산업 기준으로 부산 리와인드 데이터를 불러오는 중입니다." />}
        <CurrentIndustryStatus data={data.currentStatus} supportPrograms={data.currentSupportPrograms} />
        <IndustryTrendBriefing data={data.trendBriefing} />
        <SimilarIndustryExplorer data={data.similarFlow} />
        <IndustrySupportExplorer data={data.pastSupportReview} />
        <SupportComparisonMap data={data.supportComparison} />
        <AiReviewBriefing data={data.aiReviewBriefing} />
      </div>
    </main>
  );
};

export default BusanRewind;
