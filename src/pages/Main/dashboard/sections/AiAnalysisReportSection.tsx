import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DashboardCompanyProps } from "../types";
import { useDashboardChainPostData } from "../hooks/useDashboardApi";

type AnalysisLine = {
  type: "IDENTITY" | "PERFORMANCE" | "EMPLOYMENT_SUPPORT";
  line: string;
};

type AiAnalysisResponse = {
  analysisMarkdown?: string;
  analysisLines: AnalysisLine[];
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

const sampleAnalysisMarkdown = [
  "## 기업 개요",
  "- **샘플 업종과 제품군**을 기준으로 기업의 주요 활동 영역을 먼저 확인할 수 있습니다.",
  "- 사업목적, 연구·활동, 특허·인증 근거를 함께 보면 기업 정체성을 더 안정적으로 파악할 수 있습니다.",
  "## 산업 대비 흐름",
  "- 2021~2024년 기준 기업 매출지수와 산업 성장지수를 비교해, 산업 역풍을 방어했는지 또는 산업 호황을 따라갔는지 확인할 수 있습니다.",
  "## 성과 흐름",
  "- 산업 대비 격차가 큰 구간은 지원 이력과 매출, R&D, 특허, NTIS 성과를 같은 시점에 놓고 비교하면 변화의 흐름이 더 잘 보입니다.",
  "- 매출 증가만 단독으로 보기보다 산업 평균과의 차이, 영업이익률, 부채비율 중 두드러진 값을 함께 확인하는 것이 좋습니다.",
  "## 우선 확인할 지표",
  "- **산업 대비 매출 격차**가 크면 기업 고유 요인인지 업종 흐름인지 먼저 나누어 볼 수 있습니다.",
  "- **부채비율 또는 영업이익률**처럼 재무 부담이 두드러질 때는 성장보다 지속가능성 관점이 우선입니다.",
  "## 참고 사항",
  "- 본 리포트는 대시보드 해석을 돕는 참고자료이며 평가 결과나 지원 여부를 제시하지 않습니다.",
].join("\n\n");

const markdownFromLines = (lines: AnalysisLine[]) =>
  [
    "## 기업 개요",
    `- ${lines.find((item) => item.type === "IDENTITY")?.line ?? "기업의 업종, 사업목적, 기술 근거를 먼저 확인할 수 있습니다."}`,
    "## 산업 대비 흐름",
    "- 기업 매출 흐름을 산업 성장 흐름과 비교해 방어력 또는 시장 추종 여부를 먼저 확인할 수 있습니다.",
    "## 성과 흐름",
    `- ${lines.find((item) => item.type === "PERFORMANCE")?.line ?? "지원 이력과 재무·R&D 성과 흐름을 함께 확인할 수 있습니다."}`,
    "## 우선 확인할 지표",
    `- ${lines.find((item) => item.type === "EMPLOYMENT_SUPPORT")?.line ?? "고용, 재무, 지원 시점을 함께 확인할 수 있습니다."}`,
    "- 산업 대비 격차가 크면 매출 흐름을 먼저 보고, 격차가 작으면 재무 안정성이나 기술 활동처럼 더 두드러진 지표를 우선 확인합니다.",
    "## 참고 사항",
    "- 본 리포트는 대시보드 해석을 돕는 참고자료이며 평가 결과나 지원 여부를 제시하지 않습니다.",
  ].join("\n\n");

const AiAnalysisReportSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const analysisState = useDashboardChainPostData<AiAnalysisResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/ai-analysis/payload",
    "/companies/analysis",
  );

  const analysisLines = isSample ? sampleAnalysisLines : analysisState.data?.analysisLines ?? [];
  const analysisMarkdown = isSample
    ? sampleAnalysisMarkdown
    : analysisState.data?.analysisMarkdown?.trim() || (analysisLines.length > 0 ? markdownFromLines(analysisLines) : "");
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
    <div className="rounded-[10px] border border-[#d5e9ff] bg-[#f5fbff] px-7 py-6 shadow-[0_8px_24px_rgba(43,127,255,0.07)]">
      {analysisMarkdown && (
        <div className="ai-analysis-markdown text-sm font-medium leading-7 text-[#334155]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="mb-2 mt-5 flex items-center gap-2 text-[15px] font-extrabold text-[#123b7a] first:mt-0">
                  <span className="h-2 w-2 rounded-full bg-[#2b7fff]" />
                  {children}
                </h2>
              ),
              li: ({ children }) => <li className="pl-1">{children}</li>,
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-extrabold text-[#17376b]">{children}</strong>,
              ul: ({ children }) => (
                <ul className="mb-4 space-y-1.5 rounded-md border border-[#e1efff] bg-white/75 px-4 py-3 last:mb-0">{children}</ul>
              ),
            }}
          >
            {analysisMarkdown}
          </ReactMarkdown>
        </div>
      )}

      {!isLoading && !analysisMarkdown && (
        <p className="text-sm leading-6 text-[#333]">표시할 AI 분석 리포트가 없습니다.</p>
      )}
    </div>
  );
};

export default AiAnalysisReportSection;
