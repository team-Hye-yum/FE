import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AnnouncementAnalysisLoadingModal from "./components/AnnouncementAnalysisLoadingModal";
import SupportProgramRegisterModal from "./components/SupportProgramRegisterModal";
import type { SupportProgramPeriod, SupportProgramSaveRequest } from "./types";

type TabKey = "companies" | "uploads";
type UploadStatus = { type: "idle" | "loading" | "success" | "error"; message: string };

type ApiDataResponse<T> = {
  data: T;
};

type SupportProgramAnalysisPayload = {
  programYear: number | null;
  budgetProgramName: string | null;
  programCategory: string | null;
  supportType: string | null;
  period: SupportProgramPeriod | null;
  departmentName: string | null;
  localGovernmentName: string | null;
  programSummary: string | null;
};

type SupportProgramAnnouncementAnalysisResponse = {
  extractedTextPreview: string;
  analysis: SupportProgramAnalysisPayload;
};

type SupportProgramSaveResponse = {
  supportProgramCode: string;
  created: boolean;
};

type CompanyTemplateImportResponse = {
  importedRows: number;
  createdCompanies: number;
  updatedCompanies: number;
  supportHistoryRows: number;
  metricUpdatedCompanies: number;
  errors: string[];
};

type CompanyRow = {
  companyId: string;
  region: string;
  foundedAt: string;
  industry: string;
  products: string;
  sales: string;
  employees: string;
  ipCount: string;
  ntisCount: string;
  supportCount: string;
  supportAmount: string;
  debtRatio: string;
  salesGrowthRate: string;
};

type SupportProgramSearchItem = {
  code: string;
  programYear: number;
  budgetProgramName: string;
};

type MoneyAmount = {
  value: number | null;
  unit: string;
};

type YearlyMoneyAmount = MoneyAmount & {
  year: number | null;
};

type SupportProgramCompanyItem = {
  companyId: number | null;
  companyName: string | null;
  region: string | null;
  establishedYear: number | null;
  industryName: string | null;
  mainProduct: string | null;
  latestSalesAmount: YearlyMoneyAmount | null;
  latestEmployeeCount: number | null;
  registeredPatentCount: number | null;
  ntisProjectCount: number | null;
  supportCount: number | null;
  cumulativeSupportAmount: MoneyAmount | null;
  debtRatio: number | null;
  salesGrowthRate: number | null;
};

type SupportProgramCompaniesLoadedEvent = CustomEvent<{
  companies: SupportProgramCompanyItem[];
  supportProgram: SupportProgramSearchItem;
}>;

const fallbackCompanies: CompanyRow[] = Array.from({ length: 7 }, () => ({
  companyId: "샘플-001",
  region: "샘플 지역",
  foundedAt: "2020",
  industry: "샘플 업종",
  products: "샘플 주요제품",
  sales: "0",
  employees: "0",
  ipCount: "0",
  ntisCount: "0",
  supportCount: "0",
  supportAmount: "0",
  debtRatio: "0%",
  salesGrowthRate: "0%",
}));

const menuItems: Array<{ key: TabKey; label: string }> = [
  { key: "companies", label: "기업 목록" },
  { key: "uploads", label: "사업 공고 및 기업 목록 등록" },
];

const apiUrl = (path: string) => {
  const baseUrl = import.meta.env.API_URL || import.meta.env.VITE_API_URL || "/api";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const formatNullable = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const formatNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : value.toLocaleString();

const formatPercent = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : `${value}%`;

const mapCompanyItem = (item: SupportProgramCompanyItem): CompanyRow => ({
  companyId: formatNullable(item.companyId),
  region: formatNullable(item.region),
  foundedAt: formatNullable(item.establishedYear),
  industry: formatNullable(item.industryName),
  products: formatNullable(item.mainProduct),
  sales: formatNumber(item.latestSalesAmount?.value),
  employees: formatNumber(item.latestEmployeeCount),
  ipCount: formatNumber(item.registeredPatentCount),
  ntisCount: formatNumber(item.ntisProjectCount),
  supportCount: formatNumber(item.supportCount),
  supportAmount: formatNumber(item.cumulativeSupportAmount?.value),
  debtRatio: formatPercent(item.debtRatio),
  salesGrowthRate: formatPercent(item.salesGrowthRate),
});

const responseFileName = (response: Response, fallbackFileName: string) => {
  const disposition = response.headers.get("content-disposition");
  const utf8FileName = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const asciiFileName = disposition?.match(/filename="?([^";]+)"?/i)?.[1];

  if (utf8FileName) {
    return decodeURIComponent(utf8FileName);
  }

  return asciiFileName || fallbackFileName;
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const requestJson = async <T,>(url: string, init?: RequestInit) => {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`API 요청에 실패했습니다. (${response.status})`);
  }

  return (await response.json()) as ApiDataResponse<T>;
};

const isInvalidUrlParamError = (error: unknown) =>
  error instanceof Error && /\((400|404)\)/.test(error.message);

const UploadIcon = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M12 19V2m0 0 5 5m-5-5-5 5M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const DownloadIcon = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M12 3v16m0 0 5-5m-5 5-5-5M4 17v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const FileIcon = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M14 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8m-6-6 6 6m-6-6v6h6M8 13h8M8 17h5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const uploadButtonClassName =
  "flex h-14 w-[280px] items-center justify-center gap-3 rounded-[7px] text-lg font-medium disabled:opacity-60";

const Sidebar = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}) => {
  return (
    <aside className="w-full shrink-0 rounded-[10px] bg-white px-4 py-4 sm:px-[30px] sm:py-[30px] lg:h-[145px] lg:w-[314px]">
      <div className="flex flex-row gap-[5px] lg:flex-col">
        {menuItems.map((item) => {
          const isActive = activeTab === item.key;

          return (
            <button
              aria-current={isActive ? "true" : undefined}
              className={`business-sidebar-tab h-10 flex-1 rounded-[5px] px-3 text-center text-sm font-medium sm:text-base lg:flex-none lg:text-left ${
                isActive ? "bg-blue-50 text-[#2b7fff]" : "text-[#666]"
              }`}
              key={item.key}
              onClick={() => onTabChange(item.key)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

const CompanyTable = ({
  companies,
  supportProgramCode,
  title,
}: {
  companies: CompanyRow[];
  supportProgramCode: string;
  title: string;
}) => {
  const navigate = useNavigate();
  const isSample = !supportProgramCode.trim();

  const handleCompanyClick = (companyId: string) => {
    if (isSample) {
      return;
    }

    navigate(`/?${new URLSearchParams({ companyId })}`);
  };

  const handleCompanyListExcelDownload = async () => {
    const trimmedCode = supportProgramCode.trim();

    if (!trimmedCode) {
      alert("사업을 먼저 선택해주세요.");
      return;
    }

    try {
      const response = await fetch(
        apiUrl(`/support-programs/${encodeURIComponent(trimmedCode)}/companies/excel`),
      );

      if (!response.ok) {
        throw new Error(`엑셀 파일 다운로드에 실패했습니다. (${response.status})`);
      }

      const blob = await response.blob();
      downloadBlob(blob, responseFileName(response, `support-program-companies-${trimmedCode}.xlsx`));
    } catch (error) {
      alert(error instanceof Error ? error.message : "엑셀 파일 다운로드에 실패했습니다.");
    }
  };

  return (
    <section className="min-w-0 flex-1 rounded-[10px] bg-white px-4 py-6 sm:px-[30px] sm:py-[36px]">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-[22px] font-medium leading-8 sm:text-2xl">{title}</h1>
        {isSample && (
          <span className="inline-flex h-8 min-w-[92px] items-center justify-center rounded-full bg-[#d10000] px-5 text-base font-bold text-white">
            SAMPLE
          </span>
        )}
      </div>

      <div className="mt-8 flex flex-col items-stretch gap-4 sm:mt-[48px] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <h2 className="text-lg font-medium">기업 목록</h2>
        <button
          className="business-action-button flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#107c41] px-4 text-base font-medium text-white"
          onClick={handleCompanyListExcelDownload}
          type="button"
        >
          <FileIcon className="h-5 w-5" />
          엑셀 파일로 내보내기
        </button>
      </div>

      <div className="business-table-scroll mt-7 overflow-x-auto pb-3">
        <table className="min-w-[1540px] border-collapse text-left text-base">
          <thead>
            <tr className="h-11 bg-white">
              <th className="sticky left-0 z-20 whitespace-nowrap bg-white px-4 font-normal">
                기업일련번호
              </th>
              <th className="whitespace-nowrap px-4 font-normal">지역</th>
              <th className="whitespace-nowrap px-4 font-normal">설립일자</th>
              <th className="whitespace-nowrap px-4 font-normal">업종</th>
              <th className="whitespace-nowrap px-4 font-normal">주요제품</th>
              <th className="whitespace-nowrap px-4 text-right font-normal">
                최근 매출(천원)
              </th>
              <th className="whitespace-nowrap px-4 text-right font-normal">종업원 수</th>
              <th className="whitespace-nowrap px-4 text-right font-normal">지적재산권</th>
              <th className="whitespace-nowrap px-4 text-right font-normal">
                NTIS 수행건수
              </th>
              <th className="whitespace-nowrap px-4 text-right font-normal">지원 횟수</th>
              <th className="whitespace-nowrap px-4 text-right font-normal">
                누적 지원금(천원)
              </th>
              <th className="whitespace-nowrap px-4 text-right font-normal">부채 비율</th>
              <th className="whitespace-nowrap px-4 text-right font-normal">매출 성장성</th>
              <th className="whitespace-nowrap px-4 text-center font-normal">상세</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr
                className={`business-table-row h-11 transition ${
                  isSample ? "cursor-default" : "cursor-pointer hover:bg-blue-50"
                } ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                key={`${company.companyId}-${index}`}
                onClick={() => handleCompanyClick(company.companyId)}
              >
                <td
                  className={`sticky left-0 z-10 whitespace-nowrap px-4 text-center ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  {company.companyId}
                </td>
                <td className="whitespace-nowrap px-4">{company.region}</td>
                <td className="whitespace-nowrap px-4">{company.foundedAt}</td>
                <td className="whitespace-nowrap px-4">{company.industry}</td>
                <td className="whitespace-nowrap px-4">{company.products}</td>
                <td className="whitespace-nowrap px-4 text-right">{company.sales}</td>
                <td className="whitespace-nowrap px-4 text-right">{company.employees}</td>
                <td className="whitespace-nowrap px-4 text-right">{company.ipCount}</td>
                <td className="whitespace-nowrap px-4 text-right">{company.ntisCount}</td>
                <td className="whitespace-nowrap px-4 text-right">{company.supportCount}</td>
                <td className="whitespace-nowrap px-4 text-right">{company.supportAmount}</td>
                <td className="whitespace-nowrap px-4 text-right">{company.debtRatio}</td>
                <td className="whitespace-nowrap px-4 text-right">{company.salesGrowthRate}</td>
                <td className="whitespace-nowrap px-4 text-center">
                  {!isSample && (
                    <span className="inline-flex h-7 items-center rounded-full bg-[#eaf3ff] px-3 text-sm font-medium text-[#2b7fff]">
                      보기
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const UploadPanel = () => {
  const announcementInputRef = useRef<HTMLInputElement | null>(null);
  const companyTemplateInputRef = useRef<HTMLInputElement | null>(null);
  const [announcementStatus, setAnnouncementStatus] = useState<UploadStatus>({
    type: "idle",
    message: "",
  });
  const [isAnnouncementAnalyzing, setIsAnnouncementAnalyzing] = useState(false);
  const [isAnnouncementSaving, setIsAnnouncementSaving] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState<SupportProgramSaveRequest | null>(
    null,
  );
  const [templateStatus, setTemplateStatus] = useState<UploadStatus>({
    type: "idle",
    message: "",
  });

  const handleAnnouncementFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    setIsAnnouncementAnalyzing(true);
    setAnnouncementStatus({ type: "loading", message: "" });

    try {
      const formData = new FormData();
      formData.append("announcementPdf", file);

      const analysisResponse = await requestJson<SupportProgramAnnouncementAnalysisResponse>(
        apiUrl("/support-programs/announcement-analysis"),
        {
          body: formData,
          method: "POST",
        },
      );
      const analysis = analysisResponse.data.analysis;

      if (!analysis.programYear || !analysis.budgetProgramName) {
        throw new Error("PDF 분석 결과에 필수 사업 정보가 없습니다.");
      }

      setAnnouncementDraft({
        code: "",
        programYear: analysis.programYear,
        budgetProgramName: analysis.budgetProgramName,
        programCategory: analysis.programCategory ?? "",
        supportType: analysis.supportType ?? "",
        period: {
          startDate: analysis.period?.startDate ?? "",
          endDate: analysis.period?.endDate ?? "",
        },
        departmentName: analysis.departmentName ?? "",
        localGovernmentName: analysis.localGovernmentName ?? "",
        programSummary: analysis.programSummary ?? "",
      });
      setAnnouncementStatus({
        type: "success",
        message: "",
      });
    } catch (error) {
      setAnnouncementStatus({
        type: "error",
        message: error instanceof Error ? error.message : "PDF 분석에 실패했습니다.",
      });
    } finally {
      setIsAnnouncementAnalyzing(false);
    }
  };

  const updateAnnouncementDraft = <Key extends keyof SupportProgramSaveRequest>(
    key: Key,
    value: SupportProgramSaveRequest[Key],
  ) => {
    setAnnouncementDraft((draft) => (draft ? { ...draft, [key]: value } : draft));
  };

  const updateAnnouncementPeriod = (key: keyof SupportProgramPeriod, value: string) => {
    setAnnouncementDraft((draft) =>
      draft
        ? {
            ...draft,
            period: {
              ...draft.period,
              [key]: value,
            },
          }
        : draft,
    );
  };

  const handleAnnouncementSave = async () => {
    if (!announcementDraft) {
      return;
    }

    if (
      !announcementDraft.code.trim() ||
      !announcementDraft.programYear ||
      !announcementDraft.budgetProgramName.trim()
    ) {
      alert("필수 항목을 확인해주세요.");
      return;
    }

    setIsAnnouncementSaving(true);

    try {
      const saveResponse = await requestJson<SupportProgramSaveResponse>(
        apiUrl("/support-programs"),
        {
          body: JSON.stringify({
            ...announcementDraft,
            programYear: Number(announcementDraft.programYear),
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );

      setAnnouncementDraft(null);
      setAnnouncementStatus({ type: "idle", message: "" });
      alert(`업로드 성공: ${saveResponse.data.supportProgramCode}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "지원사업 공고 등록에 실패했습니다.");
    } finally {
      setIsAnnouncementSaving(false);
    }
  };

  const handleCompanyTemplateDownload = async () => {
    setTemplateStatus({ type: "loading", message: "템플릿을 다운로드하는 중입니다." });

    try {
      const response = await fetch(apiUrl("/support-programs/company-template"));

      if (!response.ok) {
        throw new Error(`템플릿 다운로드에 실패했습니다. (${response.status})`);
      }

      const blob = await response.blob();
      downloadBlob(blob, responseFileName(response, "company-info-template.xlsx"));
      setTemplateStatus({ type: "success", message: "템플릿 다운로드를 시작했습니다." });
    } catch (error) {
      setTemplateStatus({
        type: "error",
        message: error instanceof Error ? error.message : "템플릿 다운로드에 실패했습니다.",
      });
    }
  };

  const handleCompanyTemplateFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    setTemplateStatus({ type: "loading", message: "엑셀 파일을 업로드하는 중입니다." });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await requestJson<CompanyTemplateImportResponse>(
        apiUrl("/support-programs/company-template/import"),
        {
          body: formData,
          method: "POST",
        },
      );
      const result = response.data;
      const errorMessage = result.errors.length > 0 ? ` 오류 ${result.errors.length}건` : "";

      setTemplateStatus({
        type: result.errors.length > 0 ? "error" : "success",
        message: `반영 ${result.importedRows}행, 생성 ${result.createdCompanies}개, 수정 ${result.updatedCompanies}개.${errorMessage}`,
      });
    } catch (error) {
      setTemplateStatus({
        type: "error",
        message: error instanceof Error ? error.message : "엑셀 파일 업로드에 실패했습니다.",
      });
    }
  };

  const statusClassName = (status: UploadStatus) => {
    if (status.type === "success") {
      return "text-[#107c41]";
    }

    if (status.type === "error") {
      return "text-red-600";
    }

    return "text-[#666]";
  };

  return (
    <section className="min-h-[428px] min-w-0 flex-1 rounded-[10px] bg-white px-4 py-7 sm:px-[30px] sm:py-[45px]">
      <div>
        <h1 className="text-[22px] font-medium">BTP 지원사업 공고 PDF 등록하기</h1>
        <input
          accept="application/pdf"
          className="hidden"
          onChange={handleAnnouncementFileChange}
          ref={announcementInputRef}
          type="file"
        />
        <button
          className={`business-action-button mt-7 bg-[#2b7fff] text-white ${uploadButtonClassName}`}
          disabled={announcementStatus.type === "loading"}
          onClick={() => announcementInputRef.current?.click()}
          type="button"
        >
          <UploadIcon className="h-5 w-5" />
          지원사업 공고 PDF 업로드
        </button>
        {announcementStatus.message && (
          <p className={`business-status-message mt-3 text-sm font-medium ${statusClassName(announcementStatus)}`}>
            {announcementStatus.message}
          </p>
        )}
      </div>

      <div className="mt-[64px]">
        <h2 className="text-[22px] font-medium">기업 목록 등록하기</h2>
        <input
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={handleCompanyTemplateFileChange}
          ref={companyTemplateInputRef}
          type="file"
        />
        <div className="mt-7 flex flex-wrap gap-5">
          <button
            className={`business-action-button border-2 border-[#107c41] bg-white text-[#107c41] ${uploadButtonClassName}`}
            disabled={templateStatus.type === "loading"}
            onClick={handleCompanyTemplateDownload}
            type="button"
          >
            <DownloadIcon className="h-5 w-5" />
            엑셀 템플릿 다운로드
          </button>
          <button
            className={`business-action-button bg-[#107c41] text-white ${uploadButtonClassName}`}
            disabled={templateStatus.type === "loading"}
            onClick={() => companyTemplateInputRef.current?.click()}
            type="button"
          >
            <UploadIcon className="h-5 w-5" />
            엑셀 파일 업로드
          </button>
        </div>
        {templateStatus.message && (
          <p className={`business-status-message mt-3 text-sm font-medium ${statusClassName(templateStatus)}`}>
            {templateStatus.message}
          </p>
        )}
      </div>

      {isAnnouncementAnalyzing && (
        <AnnouncementAnalysisLoadingModal />
      )}

      {announcementDraft && (
        <SupportProgramRegisterModal
          draft={announcementDraft}
          isSaving={isAnnouncementSaving}
          onCancel={() => setAnnouncementDraft(null)}
          onChange={updateAnnouncementDraft}
          onPeriodChange={updateAnnouncementPeriod}
          onSubmit={() => void handleAnnouncementSave()}
        />
      )}
    </section>
  );
};

const BusinessList = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("companies");
  const [companies, setCompanies] = useState<CompanyRow[]>(fallbackCompanies);
  const [supportProgramCode, setSupportProgramCode] = useState("");
  const [title, setTitle] = useState("샘플 지원사업 기업 목록");

  useEffect(() => {
    const handleCompaniesLoaded = (event: Event) => {
      const { companies: loadedCompanies, supportProgram } = (
        event as SupportProgramCompaniesLoadedEvent
      ).detail;

      setCompanies(loadedCompanies.map(mapCompanyItem));
      setSupportProgramCode(supportProgram.code);
      setTitle(`${supportProgram.programYear} ${supportProgram.budgetProgramName} — ${supportProgram.code}`);
      setActiveTab("companies");
    };

    window.addEventListener("support-program-companies-loaded", handleCompaniesLoaded);

    return () => {
      window.removeEventListener("support-program-companies-loaded", handleCompaniesLoaded);
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const programCode = searchParams.get("programCode")?.trim() ?? "";
    const programKeyword = searchParams.get("programKeyword")?.trim() ?? "";

    if (!programCode) {
      setCompanies(fallbackCompanies);
      setSupportProgramCode("");
      setTitle("샘플 지원사업 기업 목록");
      return;
    }

    if (programCode === supportProgramCode) {
      return;
    }

    let ignore = false;

    requestJson<{ items: SupportProgramCompanyItem[] }>(
      apiUrl(`/support-programs/${encodeURIComponent(programCode)}/companies`),
    )
      .then((response) => {
        if (ignore) {
          return;
        }

        setCompanies(response.data.items.map(mapCompanyItem));
        setSupportProgramCode(programCode);
        setTitle(programKeyword ? `${programKeyword} · ${programCode}` : `지원사업 ${programCode}`);
        setActiveTab("companies");
      })
      .catch((error: unknown) => {
        if (ignore) {
          return;
        }

        if (isInvalidUrlParamError(error)) {
          console.error("Failed to load support program companies from URL parameter.", error);
          alert("잘못된 지원사업 URL입니다. 기본 화면으로 이동합니다.");
          setCompanies(fallbackCompanies);
          setSupportProgramCode("");
          setTitle("샘플 지원사업 기업 목록");
          setActiveTab("companies");
          navigate("/business-list", { replace: true });
          return;
        }

        setCompanies([]);
        setSupportProgramCode(programCode);
        setTitle(error instanceof Error ? error.message : `지원사업 ${programCode}`);
        setActiveTab("companies");
      });

    return () => {
      ignore = true;
    };
  }, [search, supportProgramCode]);

  return (
    <main className="flex flex-col gap-6 px-4 py-8 lg:flex-row lg:px-6 lg:py-12">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "companies" ? (
        <CompanyTable companies={companies} supportProgramCode={supportProgramCode} title={title} />
      ) : (
        <UploadPanel />
      )}
    </main>
  );
};

export default BusinessList;
