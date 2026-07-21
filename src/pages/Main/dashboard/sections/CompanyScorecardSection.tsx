import type { DashboardCompanyProps } from "../types";
import { useDashboardGets } from "../hooks/useDashboardApi";

const CompanyScorecardSection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardGets(companyId, [
    "/companies/{companyId}/scorecard/summary",
    "/companies/{companyId}/scorecard/busan-axdx-evidence",
  ]);

  return null;
};

export default CompanyScorecardSection;
