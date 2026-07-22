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
  value,
}: {
  badge: string;
  className?: string;
  label?: string;
  value: string;
}) => (
  <article
    className={`flex h-[182px] flex-col items-center rounded-[10px] border border-[#eee] bg-white px-5 pt-[30px] text-center ${className}`}
  >
    <span className="inline-flex h-[30px] max-w-full items-center justify-center whitespace-nowrap rounded-[15px] bg-[#51a2ff] px-[15px] pb-1.5 pt-[5px] text-base font-medium text-white">
      {badge}
    </span>
    <strong className="mt-5 text-[28px] font-medium leading-none text-[#333]">{value}</strong>
    {label && <span className="mt-6 text-base text-[#666]">{label}</span>}
  </article>
);

const DetailMetric = ({
  label,
  subLabel,
  value,
}: {
  label: string;
  subLabel: string;
  value: string;
}) => (
  <article className="flex min-h-[121px] flex-1 flex-col items-center justify-center px-6 text-center">
    <h3 className="text-base font-medium text-[#444]">{label}</h3>
    <strong className="mt-5 text-[28px] font-medium leading-none text-[#333]">{value}</strong>
    <p className="mt-6 text-base text-[#666]">{subLabel}</p>
  </article>
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

const ResearchDevelopmentSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const statusState = useDashboardGetData<ResearchDevelopmentStatusResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/research-development/status",
  );
  const summaryState = useDashboardGetData<ProductiveActivitiesSummaryResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/productive-activities/summary",
  );

  const isLoading = statusState.isLoading || summaryState.isLoading;
  const hasError = statusState.error || summaryState.error;
  const status = isSample ? sampleResearchStatus : statusState.data;
  const summary = isSample ? sampleProductiveActivities : summaryState.data;

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
    <div className="space-y-6">
      <div className="grid grid-cols-[0.9fr_0.9fr_1.35fr_0.9fr] gap-5">
        <SummaryCard
          badge="NTIS(주관)"
          label="주관 과제 수"
          value={formatCount(summary?.ntis.leadProjectCount)}
        />
        <SummaryCard
          badge="NTIS(위탁)"
          label="위탁 과제 수"
          value={formatCount(summary?.ntis.collaborativeProjectCount)}
        />
        <SummaryCard
          badge="정부 투자 연구비 (최근 5개년)"
          className="px-4"
          label="합계"
          value={formatMoney(summary?.ntis.recentFiveYearGovernmentResearchFundTotal)}
        />
        <SummaryCard
          badge="최근 참여 년도"
          value={summary?.ntis.latestParticipationYear ? `${summary.ntis.latestParticipationYear}년` : "-"}
        />
      </div>

      <div className="rounded-[10px] border border-[#eee] bg-white px-8 py-6">
        <div className="grid grid-cols-3 divide-x divide-[#eee]">
          <DetailMetric
            label="연구원수"
            subLabel="최근 기준"
            value={formatResearcherCount(status?.researcherCount)}
          />
          <DetailMetric
            label="기업부설연구소"
            subLabel={
              status?.researchLab?.exists
                ? `등록일 ${formatDate(status.researchLab.registeredDate)}`
                : "-"
            }
            value={formatOwnership(status?.researchLab?.exists)}
          />
          <DetailMetric
            label="연구개발전담부서"
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
  );
};

export default ResearchDevelopmentSection;
