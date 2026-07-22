import { useState } from "react";
import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";

type ResearchOrganizationStatus = {
  exists: boolean | null;
  registeredDate: string | null;
};

type ResearchDevelopmentStatusResponse = {
  researcherCount: number | null;
  researchLab: ResearchOrganizationStatus | null;
  rndDepartment: ResearchOrganizationStatus | null;
};

type MoneyValue = {
  value: number | null;
  unit: string;
};

type ProductiveActivitiesSummaryResponse = {
  ntis: {
    leadProjectCount: number;
    collaborativeProjectCount: number;
    recentFiveYearGovernmentResearchFundTotal: MoneyValue | null;
    latestParticipationYear: number | null;
  };
};

type NtisLeadProjectItem = {
  annualResearchEndDate: string | null;
  annualResearchStartDate: string | null;
  governmentResearchFund: MoneyValue | null;
  ntisLeadProjectId: number;
  privateResearchFund: MoneyValue | null;
  projectName: string | null;
  referenceYear: number | null;
  regionName: string | null;
  scienceTechnologyCategoryName: string | null;
  supervisingMinistryName: string | null;
  totalResearchEndDate: string | null;
  totalResearchFund: MoneyValue | null;
  totalResearchStartDate: string | null;
};

type NtisLeadProjectListResponse = {
  items: NtisLeadProjectItem[];
};

type NtisCollaborativeProjectItem = {
  collaborationCountryName: string | null;
  collaborationParticipationTypeName: string | null;
  collaborativeResearchExpense: MoneyValue | null;
  collaborativeResearchIncome: MoneyValue | null;
  commissionedResearchFund: MoneyValue | null;
  hasCompanyCollaboration: boolean | null;
  hasForeignInstituteCollaboration: boolean | null;
  hasOtherCollaboration: boolean | null;
  hasPublicInstituteCollaboration: boolean | null;
  hasUniversityCollaboration: boolean | null;
  ntisCollaborativeProjectId: number;
  referenceYear: number | null;
  researchPerformerTypeName: string | null;
  researchTypeName: string | null;
};

type NtisCollaborativeProjectListResponse = {
  items: NtisCollaborativeProjectItem[];
};

type DetailModalState =
  | { kind: "collaborative-projects"; title: string }
  | { kind: "lead-projects"; title: string }
  | { kind: "simple"; rows: SimpleRow[]; title: string };

type SimpleRow = {
  label: string;
  value: string;
};

const formatCount = (value: number | null | undefined) =>
  value === null || value === undefined ? "-건" : `${value.toLocaleString()}건`;

const formatResearcherCount = (value: number | null | undefined) =>
  value === null || value === undefined ? "-명" : `${value.toLocaleString()}명`;

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const normalizedValue = value.replaceAll("-", "");
  if (!/^\d{8}$/.test(normalizedValue)) {
    return value;
  }

  return `${normalizedValue.slice(0, 4)}-${normalizedValue.slice(4, 6)}-${normalizedValue.slice(6)}`;
};

const formatMoney = (money: MoneyValue | null | undefined) => {
  const value = money?.value;

  if (value === null || value === undefined) {
    return "-";
  }

  if (money?.unit === "KRW") {
    const eok = value / 100_000_000;
    return `${Number.isInteger(eok) ? eok.toLocaleString() : eok.toFixed(1)}억`;
  }

  return value.toLocaleString();
};

const formatMoneyWithUnit = (money: MoneyValue | null | undefined) => {
  const value = money?.value;

  if (value === null || value === undefined) {
    return "-";
  }

  return `${value.toLocaleString()}${money?.unit === "KRW_THOUSAND" ? "천원" : "원"}`;
};

const formatOwnership = (exists: boolean | null | undefined) => {
  if (exists === true) {
    return "보유";
  }

  if (exists === false) {
    return "미보유";
  }

  return "-";
};

const SummaryCard = ({
  badge,
  className = "",
  label,
  onClick,
  value,
}: {
  badge: string;
  className?: string;
  label?: string;
  onClick: () => void;
  value: string;
}) => (
  <button
    className={`flex h-[182px] flex-col items-center rounded-[10px] border border-[#eee] bg-white px-5 pt-[30px] text-center transition hover:bg-[#f8fbff] focus:outline-none focus:ring-2 focus:ring-[#8ec5ff] ${className}`}
    onClick={onClick}
    type="button"
  >
    <span className="inline-flex h-[30px] max-w-full items-center justify-center whitespace-nowrap rounded-[15px] bg-[#51a2ff] px-[15px] pb-1.5 pt-[5px] text-base font-medium text-white">
      {badge}
    </span>
    <strong className="mt-5 text-[28px] font-medium leading-none text-[#333]">{value}</strong>
    {label && <span className="mt-6 text-base text-[#666]">{label}</span>}
  </button>
);

const DetailMetric = ({
  label,
  onClick,
  subLabel,
  value,
}: {
  label: string;
  onClick: () => void;
  subLabel: string;
  value: string;
}) => (
  <button
    className="flex min-h-[121px] flex-1 flex-col items-center justify-center px-6 text-center transition hover:bg-[#f8fbff] focus:outline-none focus:ring-2 focus:ring-[#8ec5ff]"
    onClick={onClick}
    type="button"
  >
    <h3 className="text-base font-medium text-[#444]">{label}</h3>
    <strong className="mt-5 text-[28px] font-medium leading-none text-[#333]">{value}</strong>
    <p className="mt-6 text-base text-[#666]">{subLabel}</p>
  </button>
);

const LoadingCard = () => (
  <div className="h-[182px] rounded-[10px] border border-[#eee] bg-white px-8 py-9">
    <div className="mx-auto h-[30px] w-28 animate-pulse rounded-[15px] bg-[#e4f3ff]" />
    <div className="mx-auto mt-7 h-7 w-20 animate-pulse rounded-full bg-[#f1f5f9]" />
    <div className="mx-auto mt-8 h-4 w-24 animate-pulse rounded-full bg-[#f1f5f9]" />
  </div>
);

const sampleResearchStatus: ResearchDevelopmentStatusResponse = {
  researcherCount: 3,
  researchLab: {
    exists: true,
    registeredDate: "20240101",
  },
  rndDepartment: {
    exists: true,
    registeredDate: "20240115",
  },
};

const sampleProductiveActivities: ProductiveActivitiesSummaryResponse = {
  ntis: {
    leadProjectCount: 2,
    collaborativeProjectCount: 1,
    recentFiveYearGovernmentResearchFundTotal: {
      value: 350_000_000,
      unit: "KRW",
    },
    latestParticipationYear: 2024,
  },
};

const sampleLeadProjects: NtisLeadProjectItem[] = [
  {
    annualResearchEndDate: "20241130",
    annualResearchStartDate: "20240201",
    governmentResearchFund: { unit: "KRW", value: 220_000_000 },
    ntisLeadProjectId: 1,
    privateResearchFund: { unit: "KRW", value: 40_000_000 },
    projectName: "샘플 고효율 에너지 저장장치 개발",
    referenceYear: 2024,
    regionName: "부산",
    scienceTechnologyCategoryName: "에너지/환경",
    supervisingMinistryName: "산업통상자원부",
    totalResearchEndDate: "20241130",
    totalResearchFund: { unit: "KRW", value: 260_000_000 },
    totalResearchStartDate: "20240201",
  },
  {
    annualResearchEndDate: "20231231",
    annualResearchStartDate: "20230301",
    governmentResearchFund: { unit: "KRW", value: 130_000_000 },
    ntisLeadProjectId: 2,
    privateResearchFund: { unit: "KRW", value: 20_000_000 },
    projectName: "샘플 제조 공정 자동화 기술 개발",
    referenceYear: 2023,
    regionName: "부산",
    scienceTechnologyCategoryName: "기계/제조",
    supervisingMinistryName: "중소벤처기업부",
    totalResearchEndDate: "20231231",
    totalResearchFund: { unit: "KRW", value: 150_000_000 },
    totalResearchStartDate: "20230301",
  },
];

const sampleCollaborativeProjects: NtisCollaborativeProjectItem[] = [
  {
    collaborationCountryName: "대한민국",
    collaborationParticipationTypeName: "공동연구",
    collaborativeResearchExpense: { unit: "KRW", value: 35_000_000 },
    collaborativeResearchIncome: { unit: "KRW", value: 12_000_000 },
    commissionedResearchFund: { unit: "KRW", value: 50_000_000 },
    hasCompanyCollaboration: true,
    hasForeignInstituteCollaboration: false,
    hasOtherCollaboration: false,
    hasPublicInstituteCollaboration: false,
    hasUniversityCollaboration: true,
    ntisCollaborativeProjectId: 1,
    referenceYear: 2024,
    researchPerformerTypeName: "기업",
    researchTypeName: "위탁",
  },
];

const SimpleTable = ({ rows }: { rows: SimpleRow[] }) => (
  <table className="w-full border-collapse text-left text-base text-[#333]">
    <tbody>
      {rows.map((row) => (
        <tr className="h-10 border-t border-[#eee]" key={row.label}>
          <th className="w-[180px] bg-gray-50 px-4 font-normal text-[#555]">{row.label}</th>
          <td className="px-4 font-medium">{row.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const LeadProjectsTable = ({ items }: { items: NtisLeadProjectItem[] }) => (
  <table className="w-full min-w-[1100px] border-collapse text-left text-[15px] text-[#333]">
    <thead>
      <tr className="sticky top-0 z-10 h-10 bg-gray-50">
        <th className="w-[90px] whitespace-nowrap px-3 font-normal">기준연도</th>
        <th className="w-[280px] whitespace-nowrap px-3 font-normal">과제명</th>
        <th className="w-[140px] whitespace-nowrap px-3 font-normal">부처</th>
        <th className="w-[120px] whitespace-nowrap px-3 font-normal">지역</th>
        <th className="w-[120px] whitespace-nowrap px-3 font-normal">시작일</th>
        <th className="w-[120px] whitespace-nowrap px-3 font-normal">종료일</th>
        <th className="w-[140px] whitespace-nowrap px-3 text-right font-normal">정부연구비</th>
        <th className="w-[140px] whitespace-nowrap px-3 text-right font-normal">총연구비</th>
      </tr>
    </thead>
    <tbody>
      {items.length === 0 ? (
        <tr className="h-20 border-t border-[#eee]">
          <td className="px-4 text-center text-[#666]" colSpan={8}>
            표시할 데이터가 없습니다.
          </td>
        </tr>
      ) : (
        items.map((item) => (
          <tr className="h-10 border-t border-[#eee]" key={item.ntisLeadProjectId}>
            <td className="whitespace-nowrap px-3">{item.referenceYear ?? "-"}</td>
            <td className="px-3">{item.projectName || "-"}</td>
            <td className="whitespace-nowrap px-3">{item.supervisingMinistryName || "-"}</td>
            <td className="whitespace-nowrap px-3">{item.regionName || "-"}</td>
            <td className="whitespace-nowrap px-3">{formatDate(item.totalResearchStartDate || item.annualResearchStartDate)}</td>
            <td className="whitespace-nowrap px-3">{formatDate(item.totalResearchEndDate || item.annualResearchEndDate)}</td>
            <td className="whitespace-nowrap px-3 text-right">{formatMoneyWithUnit(item.governmentResearchFund)}</td>
            <td className="whitespace-nowrap px-3 text-right">{formatMoneyWithUnit(item.totalResearchFund)}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

const CollaborativeProjectsTable = ({ items }: { items: NtisCollaborativeProjectItem[] }) => (
  <table className="w-full min-w-[980px] border-collapse text-left text-[15px] text-[#333]">
    <thead>
      <tr className="sticky top-0 z-10 h-10 bg-gray-50">
        <th className="w-[90px] whitespace-nowrap px-3 font-normal">기준연도</th>
        <th className="w-[130px] whitespace-nowrap px-3 font-normal">연구유형</th>
        <th className="w-[150px] whitespace-nowrap px-3 font-normal">참여유형</th>
        <th className="w-[130px] whitespace-nowrap px-3 font-normal">수행주체</th>
        <th className="w-[130px] whitespace-nowrap px-3 font-normal">협력국가</th>
        <th className="w-[150px] whitespace-nowrap px-3 text-right font-normal">위탁연구비</th>
        <th className="w-[150px] whitespace-nowrap px-3 text-right font-normal">공동연구비</th>
      </tr>
    </thead>
    <tbody>
      {items.length === 0 ? (
        <tr className="h-20 border-t border-[#eee]">
          <td className="px-4 text-center text-[#666]" colSpan={7}>
            표시할 데이터가 없습니다.
          </td>
        </tr>
      ) : (
        items.map((item) => (
          <tr className="h-10 border-t border-[#eee]" key={item.ntisCollaborativeProjectId}>
            <td className="whitespace-nowrap px-3">{item.referenceYear ?? "-"}</td>
            <td className="whitespace-nowrap px-3">{item.researchTypeName || "-"}</td>
            <td className="whitespace-nowrap px-3">{item.collaborationParticipationTypeName || "-"}</td>
            <td className="whitespace-nowrap px-3">{item.researchPerformerTypeName || "-"}</td>
            <td className="whitespace-nowrap px-3">{item.collaborationCountryName || "-"}</td>
            <td className="whitespace-nowrap px-3 text-right">{formatMoneyWithUnit(item.commissionedResearchFund)}</td>
            <td className="whitespace-nowrap px-3 text-right">{formatMoneyWithUnit(item.collaborativeResearchExpense)}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

const DetailModal = ({
  collaborativeProjects,
  leadProjects,
  modal,
  onClose,
}: {
  collaborativeProjects: NtisCollaborativeProjectItem[];
  leadProjects: NtisLeadProjectItem[];
  modal: DetailModalState;
  onClose: () => void;
}) => (
  <div className="fixed inset-x-0 bottom-0 top-[70px] z-40 flex items-center justify-center bg-black/30 px-6 py-10">
    <div className="w-full max-w-[1080px] rounded-[10px] bg-white p-[30px] shadow-xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-2xl font-medium text-[#333]">{modal.title}</h3>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd] text-2xl leading-none text-[#555] hover:bg-gray-50"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </div>
      <div className="max-h-[520px] overflow-auto rounded-[10px] border border-[#eee]">
        {modal.kind === "lead-projects" && <LeadProjectsTable items={leadProjects} />}
        {modal.kind === "collaborative-projects" && (
          <CollaborativeProjectsTable items={collaborativeProjects} />
        )}
        {modal.kind === "simple" && <SimpleTable rows={modal.rows} />}
      </div>
    </div>
  </div>
);

const ResearchDevelopmentSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const [modal, setModal] = useState<DetailModalState | null>(null);
  const statusState = useDashboardGetData<ResearchDevelopmentStatusResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/research-development/status",
  );
  const summaryState = useDashboardGetData<ProductiveActivitiesSummaryResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/productive-activities/summary",
  );
  const leadProjectsState = useDashboardGetData<NtisLeadProjectListResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/ntis/lead-projects",
  );
  const collaborativeProjectsState = useDashboardGetData<NtisCollaborativeProjectListResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/ntis/collaborative-projects",
  );

  const isLoading = statusState.isLoading || summaryState.isLoading;
  const hasError = statusState.error || summaryState.error;
  const status = isSample ? sampleResearchStatus : statusState.data;
  const summary = isSample ? sampleProductiveActivities : summaryState.data;
  const leadProjects = isSample ? sampleLeadProjects : leadProjectsState.data?.items ?? [];
  const collaborativeProjects = isSample
    ? sampleCollaborativeProjects
    : collaborativeProjectsState.data?.items ?? [];

  if (hasError) {
    return (
      <div className="rounded-[10px] border border-[#eee] bg-white px-7 py-6 text-sm font-medium text-red-600">
        연구·개발 현황을 불러오지 못했습니다.
      </div>
    );
  }

  if (isLoading && !status && !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-[0.9fr_0.9fr_1.35fr_0.9fr] gap-5">
          {[0, 1, 2, 3].map((item) => (
            <LoadingCard key={item} />
          ))}
        </div>
        <div className="h-[171px] rounded-[10px] border border-[#eee] bg-white px-8 py-8">
          <div className="grid h-full grid-cols-3 divide-x divide-[#eee]">
            {[0, 1, 2].map((item) => (
              <div className="flex flex-col items-center justify-center" key={item}>
                <div className="h-4 w-28 animate-pulse rounded-full bg-[#f1f5f9]" />
                <div className="mt-7 h-7 w-20 animate-pulse rounded-full bg-[#f1f5f9]" />
                <div className="mt-8 h-4 w-32 animate-pulse rounded-full bg-[#f1f5f9]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-[0.9fr_0.9fr_1.35fr_0.9fr] gap-5">
          <SummaryCard
            badge="NTIS(주관)"
            label="주관 과제 수"
            onClick={() => setModal({ kind: "lead-projects", title: "NTIS(주관) 상세" })}
            value={formatCount(summary?.ntis.leadProjectCount)}
          />
          <SummaryCard
            badge="NTIS(위탁)"
            label="위탁 과제 수"
            onClick={() =>
              setModal({ kind: "collaborative-projects", title: "NTIS(위탁) 상세" })
            }
            value={formatCount(summary?.ntis.collaborativeProjectCount)}
          />
          <SummaryCard
            badge="정부 투자 연구비 (최근 5개년)"
            className="px-4"
            label="합계"
            onClick={() =>
              setModal({
                kind: "simple",
                rows: [
                  {
                    label: "구분",
                    value: "정부 투자 연구비 (최근 5개년)",
                  },
                  {
                    label: "합계",
                    value: formatMoney(summary?.ntis.recentFiveYearGovernmentResearchFundTotal),
                  },
                  {
                    label: "주관 과제 수",
                    value: formatCount(summary?.ntis.leadProjectCount),
                  },
                  {
                    label: "위탁 과제 수",
                    value: formatCount(summary?.ntis.collaborativeProjectCount),
                  },
                ],
                title: "정부 투자 연구비 상세",
              })
            }
            value={formatMoney(summary?.ntis.recentFiveYearGovernmentResearchFundTotal)}
          />
          <SummaryCard
            badge="최근 참여 년도"
            onClick={() =>
              setModal({
                kind: "simple",
                rows: [
                  {
                    label: "최근 참여 년도",
                    value: summary?.ntis.latestParticipationYear
                      ? `${summary.ntis.latestParticipationYear}년`
                      : "-",
                  },
                  {
                    label: "주관 과제 수",
                    value: formatCount(summary?.ntis.leadProjectCount),
                  },
                  {
                    label: "위탁 과제 수",
                    value: formatCount(summary?.ntis.collaborativeProjectCount),
                  },
                ],
                title: "최근 참여 년도 상세",
              })
            }
            value={summary?.ntis.latestParticipationYear ? `${summary.ntis.latestParticipationYear}년` : "-"}
          />
        </div>

        <div className="rounded-[10px] border border-[#eee] bg-white px-8 py-6">
          <div className="grid grid-cols-3 divide-x divide-[#eee]">
            <DetailMetric
              label="연구원수"
              onClick={() =>
                setModal({
                  kind: "simple",
                  rows: [
                    { label: "항목", value: "연구원수" },
                    { label: "인원", value: formatResearcherCount(status?.researcherCount) },
                    { label: "기준", value: "최근 기준" },
                  ],
                  title: "연구원수 상세",
                })
              }
              subLabel="최근 기준"
              value={formatResearcherCount(status?.researcherCount)}
            />
            <DetailMetric
              label="기업부설연구소"
              onClick={() =>
                setModal({
                  kind: "simple",
                  rows: [
                    { label: "항목", value: "기업부설연구소" },
                    { label: "보유 여부", value: formatOwnership(status?.researchLab?.exists) },
                    {
                      label: "등록일",
                      value: formatDate(status?.researchLab?.registeredDate),
                    },
                  ],
                  title: "기업부설연구소 상세",
                })
              }
              subLabel={
                status?.researchLab?.exists
                  ? `등록일 ${formatDate(status.researchLab.registeredDate)}`
                  : "-"
              }
              value={formatOwnership(status?.researchLab?.exists)}
            />
            <DetailMetric
              label="연구개발전담부서"
              onClick={() =>
                setModal({
                  kind: "simple",
                  rows: [
                    { label: "항목", value: "연구개발전담부서" },
                    {
                      label: "보유 여부",
                      value: formatOwnership(status?.rndDepartment?.exists),
                    },
                    {
                      label: "등록일",
                      value: formatDate(status?.rndDepartment?.registeredDate),
                    },
                  ],
                  title: "연구개발전담부서 상세",
                })
              }
              subLabel={
                status?.rndDepartment?.exists
                  ? `등록일 ${formatDate(status.rndDepartment.registeredDate)}`
                  : "-"
              }
              value={formatOwnership(status?.rndDepartment?.exists)}
            />
          </div>
        </div>
      </div>
      {modal && (
        <DetailModal
          collaborativeProjects={collaborativeProjects}
          leadProjects={leadProjects}
          modal={modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
};

export default ResearchDevelopmentSection;
