import type { DashboardCompanyProps } from "../types";
import { useDashboardChainPost, useDashboardGet } from "../hooks/useDashboardApi";

const AiAnalysisReportSection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardGet(companyId, "/companies/{companyId}/ai-summary");
  useDashboardChainPost(
    companyId,
    "/companies/{companyId}/ai-analysis/payload",
    "/companies/analysis",
  );

  return null;
};

export default AiAnalysisReportSection;
