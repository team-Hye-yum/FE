import type { DashboardCompanyProps } from "../types";
import { useDashboardGet } from "../hooks/useDashboardApi";

const IntellectualPropertySection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardGet(companyId, "/companies/{companyId}/certifications-ip-summary");

  return null;
};

export default IntellectualPropertySection;
