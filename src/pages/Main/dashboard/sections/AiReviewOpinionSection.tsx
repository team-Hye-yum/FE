import type { DashboardCompanyProps } from "../types";
import DashboardSection from "../components/DashboardSection";
import { useDashboardChainPostData } from "../hooks/useDashboardApi";

type AiReviewOpinionResponse = {
  display: boolean;
  budgetMismatchLine: string | null;
  employmentCarouselLine: string | null;
};

const AiLoadingBox = ({ message }: { message: string }) => (
  <div className="rounded-[10px] bg-[#eef8ff] px-7 py-6">
    <div className="flex items-center gap-3 text-sm font-medium text-[#2b7fff]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#b8dcff] border-t-[#2b7fff]" />
      <span>{message}</span>
    </div>
    <div className="mt-5 space-y-3">
      <div className="h-3 w-11/12 animate-pulse rounded-full bg-white/80" />
      <div className="h-3 w-9/12 animate-pulse rounded-full bg-white/80" />
      <div className="h-3 w-10/12 animate-pulse rounded-full bg-white/80" />
    </div>
  </div>
);

const sampleReviewLines = [
  "샘플 검토 의견: 지원 이력과 사업 목적의 연결성을 확인하는 예시 문장입니다.",
  "샘플 검토 의견: 고용 변화와 지원 시점을 함께 비교하는 예시 문장입니다.",
];

const AiReviewOpinionSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const { data, error, isLoading } = useDashboardChainPostData<AiReviewOpinionResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/ai-review/payload",
    "/review/opinions",
  );

  const reviewLines = [
    data?.budgetMismatchLine,
    data?.employmentCarouselLine,
  ].filter((line): line is string => Boolean(line));

  if (isSample) {
    return (
      <DashboardSection id="ai-review" title="AI 검토 의견">
        <div className="rounded-[10px] bg-[#eef8ff] px-7 py-6">
          <ul className="space-y-2 text-sm leading-6 text-[#333]">
            {sampleReviewLines.map((line) => (
              <li className="flex gap-2" key={line}>
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#333]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </DashboardSection>
    );
  }

  if (data && !data.display) {
    return null;
  }

  if (error) {
    return (
      <DashboardSection id="ai-review" title="AI 검토 의견">
        <div className="rounded-[10px] bg-[#eef8ff] px-7 py-6 text-sm font-medium text-red-600">
          AI 검토 의견을 불러오지 못했습니다.
        </div>
      </DashboardSection>
    );
  }

  if (isLoading && reviewLines.length === 0) {
    return (
      <DashboardSection id="ai-review" title="AI 검토 의견">
        <AiLoadingBox message="AI 검토 의견을 생성하고 있습니다." />
      </DashboardSection>
    );
  }

  const displayLines =
    reviewLines.length > 0
        ? reviewLines
        : ["현재 데이터 기준으로 별도 검토 의견은 없습니다."];

  return (
    <DashboardSection id="ai-review" title="AI 검토 의견">
      <div className="rounded-[10px] bg-[#eef8ff] px-7 py-6">
        <ul className="space-y-2 text-sm leading-6 text-[#333]">
          {displayLines.map((line) => (
            <li className="flex gap-2" key={line}>
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#333]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardSection>
  );
};

export default AiReviewOpinionSection;
