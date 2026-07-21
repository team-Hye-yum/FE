import type { DashboardCompanyProps } from "../types";
import { useDashboardGet } from "../hooks/useDashboardApi";

const FinancialStatusSection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardGet(companyId, "/companies/{companyId}/financial-position");

  return null;
};

export default FinancialStatusSection;
