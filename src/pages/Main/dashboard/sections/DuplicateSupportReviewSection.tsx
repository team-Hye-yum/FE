import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type YearlySupportCountItem = {
  supportYear: number | null;
  supportType: string | null;
  supportCount: number;
};

type SupportHistoryLatestVsPastResponse = {
  btpSupportTimeline: {
    items: BtpSupportTimelineItem[];
  } | null;
  comparisons: ComparisonItem[];
  yearlySupportChart: {
    items: YearlySupportCountItem[];
  } | null;
};

type BtpSupportTimelineItem = {
  budgetProgramName?: string | null;
  endDate?: string | null;
  selectedDate?: string | null;
  startDate?: string | null;
  supportAmount?: {
    value: number | null;
    unit: string;
  } | null;
  supportCategory?: string | null;
  supportDetail?: string | null;
  supportItem?: string | null;
  supportYear: number | null;
  supportType: string | null;
};

type ComparisonItem = {
  comparisonId: string;
  latestSupport: SupportHistoryCompareItem | null;
  pastSupport: SupportHistoryCompareItem | null;
};

type SupportHistoryCompareItem = {
  budgetProgramName: string | null;
  endDate: string | null;
  selectionResult?: string | null;
  startDate: string | null;
  supportAmount: {
    value: number | null;
    unit: string;
  } | null;
  supportItem: string | null;
  supportType: string | null;
  supportYear: number | null;
};

type ChartPoint = {
  business: number;
  other: number;
  package: number;
  technical: number;
  year: number;
  yearLabel: string;
};

const supportCategories = [
  { color: "#3b8ddf", dataKey: "technical", label: "기술지원" },
  { color: "#25a376", dataKey: "business", label: "사업화지원" },
  { color: "#dd5730", dataKey: "package", label: "패키지지원" },
  { color: "#b8b5ae", dataKey: "other", label: "기타" },
] as const;

const sampleSupportItems: YearlySupportCountItem[] = [
  { supportCount: 1, supportType: "기술지원", supportYear: 2019 },
  { supportCount: 1, supportType: "기술지원", supportYear: 2020 },
  { supportCount: 1, supportType: "기타", supportYear: 2020 },
  { supportCount: 1, supportType: "사업화지원", supportYear: 2021 },
  { supportCount: 1, supportType: "기타", supportYear: 2021 },
  { supportCount: 1, supportType: "기술지원", supportYear: 2022 },
  { supportCount: 1, supportType: "사업화지원", supportYear: 2022 },
  { supportCount: 1, supportType: "기타", supportYear: 2022 },
  { supportCount: 2, supportType: "패키지지원", supportYear: 2023 },
  { supportCount: 1, supportType: "기술지원", supportYear: 2024 },
  { supportCount: 1, supportType: "기타", supportYear: 2024 },
];

const sampleTimelineItems: BtpSupportTimelineItem[] = [
  {
    budgetProgramName: "부산글로벌스타기업육성사업",
    endDate: "20220731",
    selectedDate: "20211223",
    startDate: "20211223",
    supportAmount: { unit: "KRW_THOUSAND", value: 10377 },
    supportCategory: "전시회",
    supportType: "사업화지원",
    supportYear: 2021,
  },
  {
    budgetProgramName: "친환경미래에너지마케팅사업",
    endDate: "20221130",
    selectedDate: "20220518",
    startDate: "20220601",
    supportAmount: { unit: "KRW_THOUSAND", value: 13200 },
    supportCategory: "수출지원",
    supportType: "패키지지원",
    supportYear: 2022,
  },
  {
    budgetProgramName: "탄소중립 친환경미래에너지산업 지원사업",
    endDate: "20220331",
    selectedDate: "20220826",
    startDate: "20220901",
    supportAmount: { unit: "KRW_THOUSAND", value: 13400 },
    supportCategory: "전시회",
    supportType: "패키지지원",
    supportYear: 2022,
  },
  {
    budgetProgramName: "지역기업 성장사다리 지원사업",
    endDate: "20230331",
    selectedDate: "20220826",
    startDate: "20220901",
    supportAmount: { unit: "KRW_THOUSAND", value: 13400 },
    supportCategory: "전시회",
    supportType: "사업화지원",
    supportYear: 2022,
  },
  {
    budgetProgramName: "지역기업 성장사다리 지원사업",
    endDate: "20231103",
    selectedDate: "20230822",
    startDate: "20230822",
    supportAmount: { unit: "KRW_THOUSAND", value: 3850 },
    supportCategory: "수출지원",
    supportType: "패키지지원",
    supportYear: 2023,
  },
  {
    budgetProgramName: "탄소중립 친환경미래에너지산업 지원사업",
    endDate: "20231117",
    selectedDate: "20230919",
    startDate: "20230918",
    supportAmount: { unit: "KRW_THOUSAND", value: 20000 },
    supportCategory: "시제품제작",
    supportType: "패키지지원",
    supportYear: 2023,
  },
  {
    budgetProgramName: "저온고압에너지저장공급 사업화지원",
    endDate: "20240331",
    selectedDate: "20230615",
    startDate: "20230401",
    supportAmount: { unit: "KRW_THOUSAND", value: 4730 },
    supportCategory: "전시회",
    supportType: "사업화지원",
    supportYear: 2023,
  },
  {
    budgetProgramName: "지역기업성장사다리지원사업",
    endDate: "20241031",
    selectedDate: "20240524",
    startDate: "20240617",
    supportAmount: { unit: "KRW_THOUSAND", value: 20000 },
    supportCategory: "시제품제작",
    supportType: "패키지지원",
    supportYear: 2024,
  },
];

const sampleComparisons: ComparisonItem[] = [
  {
    comparisonId: "sample-package",
    latestSupport: {
      budgetProgramName: "지역기업성장사다리지원사업",
      endDate: "20261130",
      startDate: "20260701",
      supportAmount: { unit: "KRW_THOUSAND", value: 8000 },
      supportItem: "고액분리기 고정밀 고강성 여과망 개발을 위한 트라이바 시제품 제작",
      supportType: "패키지지원",
      supportYear: 2026,
    },
    pastSupport: {
      budgetProgramName: "지역기업성장사다리지원사업",
      endDate: "20241031",
      startDate: "20240601",
      supportAmount: { unit: "KRW_THOUSAND", value: 20000 },
      supportItem: "고액분리기 고정밀 고강성 여과망 개발을 위한 트라이바 시제품 제작",
      supportType: "패키지지원",
      supportYear: 2024,
    },
  },
  {
    comparisonId: "sample-technical",
    latestSupport: {
      budgetProgramName: "지역기업성장사다리지원사업",
      endDate: "20261130",
      startDate: "20260701",
      supportAmount: { unit: "KRW_THOUSAND", value: 8000 },
      supportItem: "고액분리기 고정밀 고강성 여과망 개발을 위한 트라이바 시제품 제작",
      supportType: "기술지원",
      supportYear: 2026,
    },
    pastSupport: {
      budgetProgramName: "지역기업성장사다리지원사업",
      endDate: "20241031",
      startDate: "20240601",
      supportAmount: { unit: "KRW_THOUSAND", value: 20000 },
      supportItem: "고액분리기 고정밀 고강성 여과망 개발을 위한 트라이바 시제품 제작",
      supportType: "기술지원",
      supportYear: 2024,
    },
  },
];

const emptyChartPoint = (year: number): ChartPoint => ({
  business: 0,
  other: 0,
  package: 0,
  technical: 0,
  year,
  yearLabel: String(year),
});

const supportCategoryKey = (supportType: string | null | undefined) => {
  if (supportType?.includes("기술")) {
    return "technical";
  }

  if (supportType?.includes("사업화")) {
    return "business";
  }

  if (supportType?.includes("패키지")) {
    return "package";
  }

  return "other";
};

const buildChartData = (items: YearlySupportCountItem[]) => {
  const years = items
    .map((item) => item.supportYear)
    .filter((year): year is number => year !== null && year !== undefined);
  const latestYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  const chartByYear = new Map<number, ChartPoint>();

  for (let year = latestYear - 4; year <= latestYear; year += 1) {
    chartByYear.set(year, emptyChartPoint(year));
  }

  items.forEach((item) => {
    if (item.supportYear === null || item.supportYear === undefined) {
      return;
    }

    const point = chartByYear.get(item.supportYear);

    if (!point) {
      return;
    }

    const key = supportCategoryKey(item.supportType);
    point[key] += item.supportCount;
  });

  return Array.from(chartByYear.values()).sort(
    (firstPoint, secondPoint) => firstPoint.year - secondPoint.year,
  );
};

const buildSupportItemsFromTimeline = (items: BtpSupportTimelineItem[]) =>
  items.map((item) => ({
    supportCount: 1,
    supportType: item.supportType,
    supportYear: item.supportYear,
  }));

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

const formatNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : value.toLocaleString();

const formatDateRange = (startDate: string | null | undefined, endDate: string | null | undefined) => {
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  if (formattedStartDate === "-" && formattedEndDate === "-") {
    return "-";
  }

  return `${formattedStartDate.replaceAll("-", ".")}~${formattedEndDate.replaceAll("-", ".")}.`;
};

const formatSupportAmount = (value: number | null | undefined) => {
  const formattedValue = formatNumber(value);
  return formattedValue === "-" ? "-" : `${formattedValue}천원`;
};

const supportCategoryText = (item: BtpSupportTimelineItem) =>
  item.supportCategory || item.supportDetail || item.supportItem || "-";

const SupportTimelineTable = ({ items }: { items: BtpSupportTimelineItem[] }) => (
  <div className="mt-10">
    <h3 className="mb-5 text-xl font-medium text-[#333]">부산TP 지원 타임라인</h3>
    <div className="max-h-[440px] overflow-y-auto overflow-x-hidden rounded-[10px] border border-[#eee] bg-white">
      <table className="w-full table-fixed border-collapse text-left text-[15px] text-[#333]">
        <colgroup>
          <col className="w-[31%]" />
          <col className="w-[13%]" />
          <col className="w-[17%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr className="sticky top-0 z-10 h-10 bg-gray-50">
            <th className="whitespace-nowrap px-3 font-normal">사업명</th>
            <th className="whitespace-nowrap px-3 font-normal">사업유형</th>
            <th className="whitespace-nowrap px-3 font-normal">지원구분(주요지원)</th>
            <th className="whitespace-nowrap px-3 font-normal">시작일</th>
            <th className="whitespace-nowrap px-3 font-normal">종료일</th>
            <th className="whitespace-nowrap px-3 text-right font-normal">
              지원금(천원)
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr className="h-10 border-t border-[#eee]" key={`${item.budgetProgramName}-${index}`}>
              <td className="truncate px-3" title={item.budgetProgramName || "-"}>
                {item.budgetProgramName || "-"}
              </td>
              <td className="truncate px-3" title={item.supportType || "-"}>
                {item.supportType || "-"}
              </td>
              <td className="truncate px-3" title={supportCategoryText(item)}>
                {supportCategoryText(item)}
              </td>
              <td className="whitespace-nowrap px-3">{formatDate(item.startDate || item.selectedDate)}</td>
              <td className="whitespace-nowrap px-3">{formatDate(item.endDate)}</td>
              <td className="whitespace-nowrap px-3 text-right">
                {formatNumber(item.supportAmount?.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const badgeClassName = (supportType: string | null | undefined) => {
  if (supportType?.includes("패키지")) {
    return "bg-[#ffd6a7] text-[#ca3500]";
  }

  if (supportType?.includes("기술")) {
    return "bg-blue-100 text-[#155dfc]";
  }

  if (supportType?.includes("사업화")) {
    return "bg-[#d8f3e8] text-[#047857]";
  }

  return "bg-[#eee] text-[#555]";
};

const CompareColumn = ({
  item,
  title,
}: {
  item: SupportHistoryCompareItem | null;
  title: string;
}) => (
  <div className="min-w-0">
    <h4 className="mb-8 text-center text-base font-normal text-[#555]">{title}</h4>
    <dl className="grid grid-cols-[92px_minmax(0,1fr)] gap-x-5 gap-y-5 text-base">
      <dt className="text-[#555]">사업명</dt>
      <dd className="font-medium text-[#333]">{item?.budgetProgramName || "-"}</dd>

      <dt className="text-[#555]">사업유형</dt>
      <dd>
        <span
          className={`inline-flex h-[30px] items-center rounded-[15px] px-[15px] pb-1.5 pt-[5px] text-base font-medium ${badgeClassName(
            item?.supportType,
          )}`}
        >
          {item?.supportType || "-"}
        </span>
      </dd>

      <dt className="text-[#555]">지원품목</dt>
      <dd className="break-keep font-medium leading-6 text-[#333]">{item?.supportItem || "-"}</dd>

      <dt className="text-[#555]">지원기간</dt>
      <dd className="font-medium text-[#333]">{formatDateRange(item?.startDate, item?.endDate)}</dd>

      <dt className="text-[#555]">지원금</dt>
      <dd className="font-medium text-[#333]">{formatSupportAmount(item?.supportAmount?.value)}</dd>
    </dl>
  </div>
);

const SupportComparisonList = ({ comparisons }: { comparisons: ComparisonItem[] }) => {
  if (comparisons.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <h3 className="mb-5 text-xl font-medium text-[#333]">최신 지원 - 과거 지원 이력 비교</h3>
      <div className="space-y-7">
        {comparisons.map((comparison) => (
          <article
            className="grid grid-cols-2 gap-[60px] rounded-[10px] border border-[#eee] bg-white px-[30px] py-[30px]"
            key={comparison.comparisonId}
          >
            <CompareColumn item={comparison.latestSupport} title="현재 신청 [기업 제출]" />
            <CompareColumn item={comparison.pastSupport} title="과거 지원 [BTP 확정 이력]" />
          </article>
        ))}
      </div>
    </div>
  );
};

const SupportTooltip = ({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ color?: string; name?: string; value?: number }>;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-[8px] border border-[#eee] bg-white px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-[#333]">{label}</p>
      {payload
        .filter((item) => item.value)
        .map((item) => (
          <p className="text-[#555]" key={item.name} style={{ color: item.color }}>
            {item.name}: {item.value?.toLocaleString()}건
          </p>
        ))}
    </div>
  );
};

const LegendContent = () => (
  <div className="mt-3 flex items-center gap-6 pl-1 text-lg font-medium text-[#555]">
    {supportCategories.map((category) => (
      <span className="inline-flex items-center gap-2" key={category.dataKey}>
        <span
          className="h-[14px] w-[14px] rounded-[3px]"
          style={{ backgroundColor: category.color }}
        />
        {category.label}
      </span>
    ))}
  </div>
);

const DuplicateSupportReviewSection = ({
  companyId,
  isSample = false,
}: DashboardCompanyProps) => {
  const { data, error, isLoading } = useDashboardGetData<SupportHistoryLatestVsPastResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/support-history/review/latest-vs-past",
  );
  const items = isSample
    ? sampleSupportItems
    : data?.btpSupportTimeline?.items
      ? buildSupportItemsFromTimeline(data.btpSupportTimeline.items)
      : data?.yearlySupportChart?.items ?? [];
  const timelineItems = isSample ? sampleTimelineItems : data?.btpSupportTimeline?.items ?? [];
  const comparisons = isSample ? sampleComparisons : data?.comparisons ?? [];
  const chartData = buildChartData(items);

  if (!isSample && error) {
    return (
      <div className="rounded-[10px] border border-[#eee] bg-white px-7 py-6 text-sm font-medium text-red-600">
        중복지원 검토 정보를 불러오지 못했습니다.
      </div>
    );
  }

  if (!isSample && isLoading && !data) {
    return (
      <div>
        <h3 className="mb-6 text-xl font-medium text-[#333]">부산TP 지원 현황 - 연도별 건수</h3>
        <div className="h-[400px] animate-pulse rounded-[10px] border border-[#eee] bg-white" />
      </div>
    );
  }

  return (
    <div>
      <div>
        <h3 className="mb-5 text-xl font-medium text-[#333]">부산TP 지원 현황 - 연도별 건수</h3>
        <div
          className="rounded-[10px] border border-[#eee] bg-white px-[34px] pb-5 pt-5"
          style={{ height: 336 }}
        >
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={chartData} margin={{ bottom: 10, left: 0, right: 0, top: 8 }}>
              <CartesianGrid stroke="#eee" vertical={false} />
              <XAxis
                axisLine={{ stroke: "#ddd" }}
                dataKey="yearLabel"
                tick={{ fill: "#666", fontSize: 18, fontWeight: 500 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={{ stroke: "#ddd" }}
                domain={[0, "dataMax"]}
                tick={{ fill: "#666", fontSize: 18, fontWeight: 500 }}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<SupportTooltip />} />
              <Legend content={<LegendContent />} verticalAlign="bottom" />
              {supportCategories.map((category) => (
                <Bar
                  barSize={105}
                  dataKey={category.dataKey}
                  fill={category.color}
                  key={category.dataKey}
                  name={category.label}
                  stackId="support"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <SupportTimelineTable items={timelineItems} />
      <SupportComparisonList comparisons={comparisons} />
    </div>
  );
};

export default DuplicateSupportReviewSection;
