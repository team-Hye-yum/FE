import type { DashboardCompanyProps } from "../types";
import { useDashboardChainPost } from "../hooks/useDashboardApi";

const AiReviewOpinionSection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardChainPost(
    companyId,
    "/companies/{companyId}/ai-review/payload",
    "/review/opinions",
  );

  return null;
};

export default AiReviewOpinionSection;
