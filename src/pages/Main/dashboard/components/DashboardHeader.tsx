import type { DashboardCompanyProps } from "../types";

const DashboardHeader = ({ companyId }: DashboardCompanyProps) => {
  const displayCompanyId = companyId || "-";

  return (
    <header className="mb-10">
      <h1 className="text-3xl font-medium text-[#333]">기업 일련번호 {displayCompanyId}</h1>
    </header>
  );
};

export default DashboardHeader;
