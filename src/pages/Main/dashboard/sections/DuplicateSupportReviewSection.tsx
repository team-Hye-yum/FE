import type { DashboardCompanyProps } from "../types";
import { useDashboardGet } from "../hooks/useDashboardApi";

const DuplicateSupportReviewSection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardGet(companyId, "/companies/{companyId}/ai-analysis/payload");

  return null;
};

export default DuplicateSupportReviewSection;
