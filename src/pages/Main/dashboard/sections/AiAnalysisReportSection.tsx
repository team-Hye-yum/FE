import type { DashboardCompanyProps } from "../types";
import { useDashboardChainPostData, useDashboardGetData } from "../hooks/useDashboardApi";

type AiSummaryResponse = {
  aiSummary: string | null;
};

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

const splitSummary = (summary: string | null | undefined) =>
  summary
    ?.split(/\r?\n/)
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean) ?? [];

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
      {[0, 1, 2].map((item) => (
        <div className="rounded-[8px] bg-white/70 px-5 py-4" key={item}>
          <div className="h-3 w-24 animate-pulse rounded-full bg-[#cfeaff]" />
          <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-[#edf6ff]" />
          <div className="mt-2 h-3 w-9/12 animate-pulse rounded-full bg-[#edf6ff]" />
        </div>
      ))}
    </div>
  </div>
);

const AiAnalysisReportSection = ({ companyId }: DashboardCompanyProps) => {
  const summaryState = useDashboardGetData<AiSummaryResponse>(
    companyId,
    "/companies/{companyId}/ai-summary",
  );
  const analysisState = useDashboardChainPostData<AiAnalysisResponse>(
    companyId,
    "/companies/{companyId}/ai-analysis/payload",
    "/companies/analysis",
  );

  const summaryLines = splitSummary(summaryState.data?.aiSummary);
  const analysisLines = analysisState.data?.analysisLines ?? [];
  const isLoading = summaryState.isLoading || analysisState.isLoading;
  const hasError = summaryState.error || analysisState.error;

  if (hasError) {
    return (
      <div className="rounded-[10px] bg-[#eef8ff] px-7 py-6 text-sm font-medium text-red-600">
        AI 분석 리포트를 불러오지 못했습니다.
      </div>
    );
  }

  if (isLoading && summaryLines.length === 0 && analysisLines.length === 0) {
    return <AiReportLoadingBox />;
  }

  return (
    <div className="rounded-[10px] bg-[#eef8ff] px-7 py-6">
      {summaryLines.length > 0 && (
        <ul className="space-y-2 text-sm leading-6 text-[#333]">
          {summaryLines.map((line) => (
            <li className="flex gap-2" key={line}>
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#333]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      {analysisLines.length > 0 && (
        <div className={summaryLines.length > 0 ? "mt-5 space-y-3" : "space-y-3"}>
          {analysisLines.map((item) => (
            <article className="rounded-[8px] bg-white/70 px-5 py-4" key={item.type}>
              <h3 className="text-sm font-semibold text-[#2b7fff]">{lineLabels[item.type]}</h3>
              <p className="mt-2 text-sm leading-6 text-[#333]">{item.line}</p>
            </article>
          ))}
        </div>
      )}

      {!isLoading && summaryLines.length === 0 && analysisLines.length === 0 && (
        <p className="text-sm leading-6 text-[#333]">표시할 AI 분석 리포트가 없습니다.</p>
      )}
    </div>
  );
};

export default AiAnalysisReportSection;
