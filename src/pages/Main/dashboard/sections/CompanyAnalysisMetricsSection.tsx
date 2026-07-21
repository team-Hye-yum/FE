import type { DashboardCompanyProps } from "../types";
import { useDashboardGet } from "../hooks/useDashboardApi";

const CompanyAnalysisMetricsSection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardGet(companyId, "/companies/{companyId}/computed-metrics");

  return null;
};

export default CompanyAnalysisMetricsSection;
