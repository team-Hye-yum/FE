import type { DashboardCompanyProps } from "../types";

const DashboardHeader = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const displayCompanyId = companyId || "-";
  const handlePdfExport = () => {
    window.print();
  };

  return (
    <header className="mb-10 flex items-start justify-between gap-4">
      <h1 className="text-3xl font-medium text-[#333]">기업 일련번호 {displayCompanyId}</h1>
      <div className="flex items-center gap-3">
        {isSample && (
          <span className="inline-flex h-8 min-w-[92px] items-center justify-center rounded-full bg-[#d10000] px-5 text-base font-bold text-white">
            SAMPLE
          </span>
        )}
        <button
          className="inline-flex h-9 items-center gap-1.5 rounded-[7px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-[#777] hover:border-[#51a2ff] hover:text-[#2b7fff]"
          onClick={handlePdfExport}
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 16V4m0 0 4 4m-4-4-4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          PDF 내보내기
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
