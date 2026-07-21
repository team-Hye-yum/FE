import type { DashboardCompanyProps } from "../types";
import { useDashboardGet } from "../hooks/useDashboardApi";

const EmploymentInfoSection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardGet(companyId, "/companies/{companyId}/employments");

  return null;
};

export default EmploymentInfoSection;
