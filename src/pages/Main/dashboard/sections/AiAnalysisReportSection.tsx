import type { DashboardCompanyProps } from "../types";
import { useDashboardChainPostData } from "../hooks/useDashboardApi";

type AnalysisLine = {
  type: "IDENTITY" | "PERFORMANCE" | "EMPLOYMENT_SUPPORT";
  line: string;
};

type AiAnalysisResponse = {
  analysisLines: AnalysisLine[];
};

const lineLabels: Record<AnalysisLine["type"], string> = {
  IDENTITY: "기업 정체성",
  PERFORMANCE: "성과 흐름",
  EMPLOYMENT_SUPPORT: "고용·지원",
};

const AiReportLoadingBox = () => (
  <div className="rounded-[10px] bg-[#eef8ff] px-7 py-6">
    <div className="flex items-center gap-3 text-sm font-medium text-[#2b7fff]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#b8dcff] border-t-[#2b7fff]" />
      <span>AI 분석 리포트를 생성하고 있습니다.</span>
    </div>
    <p className="mt-2 text-xs text-[#666]">
      첫 분석은 캐시 생성 때문에 시간이 조금 걸릴 수 있습니다.
    </p>
    <div className="mt-6 space-y-4">
      <div className="space-y-3">
        <div className="h-3 w-11/12 animate-pulse rounded-full bg-white/80" />
        <div className="h-3 w-10/12 animate-pulse rounded-full bg-white/80" />
        <div className="h-3 w-8/12 animate-pulse rounded-full bg-white/80" />
      </div>
    </div>
  </div>
);

const sampleAnalysisLines: AnalysisLine[] = [
  {
    type: "IDENTITY",
    line: "샘플 업종과 샘플 제품군을 기준으로 기업 정체성을 파악하는 예시 문장입니다.",
  },
  {
    type: "PERFORMANCE",
    line: "샘플 재무 지표, 특허, NTIS 이력을 나란히 보며 성과 흐름을 확인하는 예시 문장입니다.",
  },
  {
    type: "EMPLOYMENT_SUPPORT",
    line: "샘플 고용 변화와 지원사업 선정 시점을 함께 비교하는 예시 문장입니다.",
  },
];

const AiAnalysisReportSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const analysisState = useDashboardChainPostData<AiAnalysisResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/ai-analysis/payload",
    "/companies/analysis",
  );

  const analysisLines = isSample ? sampleAnalysisLines : analysisState.data?.analysisLines ?? [];
  const isLoading = analysisState.isLoading;
  const hasError = analysisState.error;

  if (hasError) {
    return (
      <div className="rounded-[10px] bg-[#eef8ff] px-7 py-6 text-sm font-medium text-red-600">
        AI 분석 리포트를 불러오지 못했습니다.
      </div>
    );
  }

  if (isLoading && analysisLines.length === 0) {
    return <AiReportLoadingBox />;
  }

  return (
    <div className="rounded-[10px] bg-[#eef8ff] px-7 py-6">
      {analysisLines.length > 0 && (
        <ul className="space-y-2 text-sm leading-6 text-[#333]">
          {analysisLines.map((item) => (
            <li className="flex gap-2" key={item.type}>
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#333]" />
              <span>
                <strong className="font-medium text-[#333]">{lineLabels[item.type]}: </strong>
                {item.line}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && analysisLines.length === 0 && (
        <p className="text-sm leading-6 text-[#333]">표시할 AI 분석 리포트가 없습니다.</p>
      )}
    </div>
  );
};

export default AiAnalysisReportSection;
