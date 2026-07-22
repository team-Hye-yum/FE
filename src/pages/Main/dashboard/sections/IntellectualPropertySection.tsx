import { useState } from "react";
import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";

type CertificationsIpSummaryResponse = {
  activeRegisteredPatentCount: number | null;
};

type PatentItem = {
  applicationDate: string | null;
  companyRelationCode: string | null;
  patentId: number | null;
  patentType: string | null;
  registrationDate: string | null;
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

const createSamplePatentItems = (count: number, patentType: string, startId: number) =>
  Array.from({ length: count }, (_, index) => {
    const year = 2024 - (index % 5);
    const month = String((index % 9) + 1).padStart(2, "0");
    const day = String((index % 20) + 1).padStart(2, "0");

    return {
      applicationDate: `${year - 1}${month}${day}`,
      companyRelationCode: index % 4 === 0 ? "대표이사" : "본인",
      isActive: true,
      patentId: startId + index,
      patentType,
      registrationDate: `${year}${month}${day}`,
      registrationStatus: "등록",
    } satisfies PatentItem;
  });

const samplePatentItems: PatentItem[] = [
  ...createSamplePatentItems(22, "특허권", 1001),
  ...createSamplePatentItems(2, "디자인권", 2001),
  ...createSamplePatentItems(3, "상표권", 3001),
];

const typeKeywordByMetricKey = {
  design: "디자인",
  patent: "특허",
  trademark: "상표",
  utility: "실용",
} as const;

const isRegisteredActivePatent = (item: PatentItem) =>
  item.isActive === true && item.registrationStatus?.includes("등록");

const countByPatentType = (items: PatentItem[], typeKeyword: string) =>
  items.filter(
    (item) => isRegisteredActivePatent(item) && item.patentType?.includes(typeKeyword),
  ).length;

const patentItemsByMetric = (items: PatentItem[], metricKey: string) => {
  const typeKeyword = typeKeywordByMetricKey[metricKey as keyof typeof typeKeywordByMetricKey];

  if (!typeKeyword) {
    return [];
  }

  return items.filter(
    (item) => isRegisteredActivePatent(item) && item.patentType?.includes(typeKeyword),
  );
};

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

const IpMetricCard = ({
  metric,
  onClick,
}: {
  metric: IpMetric;
  onClick: () => void;
}) => (
  <button
    className="flex h-[124px] items-center justify-center rounded-[10px] border border-[#8ec5ff] bg-white text-center transition hover:bg-[#f8fbff] focus:outline-none focus:ring-2 focus:ring-[#8ec5ff]"
    onClick={onClick}
    type="button"
  >
    <div className="flex flex-col items-center gap-2.5">
      <h3 className="text-lg font-medium leading-[22px] text-[#555]">{metric.label}</h3>
      <p className="text-[28px] font-medium leading-[34px] text-[#2b7fff]">
        {metric.value.toLocaleString()}건
      </p>
    </div>
  </button>
);

const LoadingCard = () => (
  <div className="h-[124px] animate-pulse rounded-[10px] border border-[#d7ebff] bg-white px-10 py-8">
    <div className="mx-auto h-5 w-20 rounded-full bg-[#eef7ff]" />
    <div className="mx-auto mt-4 h-8 w-14 rounded-full bg-[#eef7ff]" />
  </div>
);

const IpDetailModal = ({
  items,
  metric,
  onClose,
}: {
  items: PatentItem[];
  metric: IpMetric;
  onClose: () => void;
}) => (
  <div className="fixed inset-x-0 bottom-0 top-[70px] z-40 flex items-center justify-center bg-black/30 px-6 py-10">
    <div className="w-full max-w-[980px] rounded-[10px] bg-white p-[30px] shadow-xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-medium text-[#333]">{metric.label} 상세</h3>
          <p className="mt-2 text-base text-[#666]">등록·활성 기준 {items.length.toLocaleString()}건</p>
        </div>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd] text-2xl leading-none text-[#555] hover:bg-gray-50"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </div>

      <div className="max-h-[520px] overflow-auto rounded-[10px] border border-[#eee]">
        <table className="w-full min-w-[760px] border-collapse text-left text-base text-[#333]">
          <thead>
            <tr className="sticky top-0 z-10 h-10 bg-gray-50">
              <th className="whitespace-nowrap px-4 font-normal">권리구분</th>
              <th className="whitespace-nowrap px-4 font-normal">등록상태</th>
              <th className="whitespace-nowrap px-4 font-normal">출원일</th>
              <th className="whitespace-nowrap px-4 font-normal">등록일</th>
              <th className="whitespace-nowrap px-4 font-normal">기업 관계</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr className="h-20 border-t border-[#eee]">
                <td className="px-4 text-center text-[#666]" colSpan={5}>
                  표시할 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr className="h-10 border-t border-[#eee]" key={`${item.patentId}-${index}`}>
                  <td className="whitespace-nowrap px-4">{item.patentType || "-"}</td>
                  <td className="whitespace-nowrap px-4">{item.registrationStatus || "-"}</td>
                  <td className="whitespace-nowrap px-4">{formatDate(item.applicationDate)}</td>
                  <td className="whitespace-nowrap px-4">{formatDate(item.registrationDate)}</td>
                  <td className="whitespace-nowrap px-4">{item.companyRelationCode || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const IntellectualPropertySection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const [selectedMetric, setSelectedMetric] = useState<IpMetric | null>(null);
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
  const patentItems = isSample ? samplePatentItems : patentsState.data?.items ?? [];
  const metrics: IpMetric[] = isSample
    ? sampleIpMetrics
    : [
        {
          key: "patent",
          label: "특허권",
          value:
            patentItems.length > 0
              ? countByPatentType(patentItems, "특허")
              : (summaryState.data?.activeRegisteredPatentCount ?? 0),
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
    <>
      <div className="grid grid-cols-4 gap-5">
        {metrics.map((metric) => (
          <IpMetricCard
            key={metric.key}
            metric={metric}
            onClick={() => setSelectedMetric(metric)}
          />
        ))}
      </div>
      {selectedMetric && (
        <IpDetailModal
          items={patentItemsByMetric(patentItems, selectedMetric.key)}
          metric={selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </>
  );
};

export default IntellectualPropertySection;
