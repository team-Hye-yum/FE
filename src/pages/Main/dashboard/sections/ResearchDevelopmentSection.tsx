import type { DashboardCompanyProps } from "../types";
import { useDashboardGets } from "../hooks/useDashboardApi";

const ResearchDevelopmentSection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardGets(companyId, [
    "/companies/{companyId}/research-development/status",
    "/companies/{companyId}/productive-activities/summary",
  ]);

  return null;
};

export default ResearchDevelopmentSection;
