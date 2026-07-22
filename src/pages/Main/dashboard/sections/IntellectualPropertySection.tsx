import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";

type CertificationsIpSummaryResponse = {
  activeRegisteredPatentCount: number | null;
};

type PatentItem = {
  patentType: string | null;
  registrationStatus: string | null;
  isActive: boolean | null;
};

type PatentListResponse = {
  items: PatentItem[];
};

type IpMetric = {
  key: string;
  label: string;
  value: number;
};

const sampleIpMetrics: IpMetric[] = [
  { key: "patent", label: "특허권", value: 22 },
  { key: "design", label: "디자인권", value: 2 },
  { key: "trademark", label: "상표권", value: 3 },
  { key: "utility", label: "실용신안권", value: 0 },
];

const isRegisteredActivePatent = (item: PatentItem) =>
  item.isActive === true && item.registrationStatus?.includes("등록");

const countByPatentType = (items: PatentItem[], typeKeyword: string) =>
  items.filter(
    (item) => isRegisteredActivePatent(item) && item.patentType?.includes(typeKeyword),
  ).length;

const IpMetricCard = ({ metric }: { metric: IpMetric }) => (
  <article className="flex h-[124px] items-center justify-center rounded-[10px] border border-[#8ec5ff] bg-white text-center">
    <div className="flex flex-col items-center gap-2.5">
      <h3 className="text-lg font-medium leading-[22px] text-[#555]">{metric.label}</h3>
      <p className="text-[28px] font-medium leading-[34px] text-[#2b7fff]">
        {metric.value.toLocaleString()}건
      </p>
    </div>
  </article>
);

const LoadingCard = () => (
  <div className="h-[124px] animate-pulse rounded-[10px] border border-[#d7ebff] bg-white px-10 py-8">
    <div className="mx-auto h-5 w-20 rounded-full bg-[#eef7ff]" />
    <div className="mx-auto mt-4 h-8 w-14 rounded-full bg-[#eef7ff]" />
  </div>
);

const IntellectualPropertySection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const summaryState = useDashboardGetData<CertificationsIpSummaryResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/certifications-ip-summary",
  );
  const patentsState = useDashboardGetData<PatentListResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/patents",
  );

  const isLoading = summaryState.isLoading || patentsState.isLoading;
  const hasError = summaryState.error;
  const patentItems = patentsState.data?.items ?? [];
  const metrics: IpMetric[] = isSample
    ? sampleIpMetrics
    : [
        {
          key: "patent",
          label: "특허권",
          value:
            summaryState.data?.activeRegisteredPatentCount ??
            countByPatentType(patentItems, "특허"),
        },
        { key: "design", label: "디자인권", value: countByPatentType(patentItems, "디자인") },
        { key: "trademark", label: "상표권", value: countByPatentType(patentItems, "상표") },
        { key: "utility", label: "실용신안권", value: countByPatentType(patentItems, "실용") },
      ];

  if (hasError) {
    return (
      <div className="rounded-[10px] border border-[#eee] bg-white px-7 py-6 text-sm font-medium text-red-600">
        지적재산권 정보를 불러오지 못했습니다.
      </div>
    );
  }

  if (isLoading && patentItems.length === 0 && !summaryState.data) {
    return (
      <div className="grid grid-cols-4 gap-5">
        {sampleIpMetrics.map((metric) => (
          <LoadingCard key={metric.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-5">
      {metrics.map((metric) => (
        <IpMetricCard key={metric.key} metric={metric} />
      ))}
    </div>
  );
};

export default IntellectualPropertySection;
