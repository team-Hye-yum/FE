import SampleOnboarding from "@/components/SampleOnboarding";
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
      {(isLoading || isError) && (
        <div
          className={`rounded-md border px-4 py-3 text-sm font-bold ${
            isError
              ? "border-[#fecaca] bg-[#fff7f7] text-[#b91c1c]"
              : "border-[#bfdbfe] bg-[#f6faff] text-[#1d4ed8]"
          }`}
        >
          {isError
            ? error instanceof Error
              ? error.message
              : "부산 리와인드 데이터를 불러오지 못해 샘플 데이터를 표시합니다."
            : "선택한 산업 기준으로 부산 리와인드 데이터를 불러오는 중입니다."}
        </div>
      )}
      <CurrentIndustryStatus data={data.currentStatus} supportPrograms={data.currentSupportPrograms} />
      <IndustryTrendBriefing data={data.trendBriefing} />
      <SimilarIndustryExplorer data={data.similarFlow} />
      <IndustrySupportExplorer data={data.pastSupportReview} />
      <SupportComparisonMap data={data.supportComparison} />
    </main>
  );
};

export default BusanRewind;
