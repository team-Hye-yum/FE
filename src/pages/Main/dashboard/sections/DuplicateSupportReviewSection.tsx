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
  yearlySupportChart: {
    items: YearlySupportCountItem[];
  } | null;
};

type BtpSupportTimelineItem = {
  supportYear: number | null;
  supportType: string | null;
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
  );
};

export default DuplicateSupportReviewSection;
