import type { DashboardCompanyProps } from "../types";
import { useDashboardGets } from "../hooks/useDashboardApi";

const GrowthScenarioSection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardGets(companyId, [
    "/companies/{companyId}/growth-scenario",
    "/companies/{companyId}/activity-support-timeline",
    "/companies/{companyId}/support-history/review/latest-vs-past",
    "/companies/{companyId}/support-history/review/post-support-changes",
  ]);

  return null;
};

export default GrowthScenarioSection;
