import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FinancialPositionPoint = {
  year: number;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalEquity: number | null;
  paidInCapital: number | null;
};

type FinancialPositionResponse = {
  series: FinancialPositionPoint[];
};

type IncomeStatementPoint = {
  year: number;
  researchAndDevelopmentExpense: number | null;
};

type IncomeStatementsResponse = {
  series: IncomeStatementPoint[];
};

type ChartPoint = FinancialPositionPoint & {
  yearLabel: string;
};

type RndChartPoint = IncomeStatementPoint & {
  yearLabel: string;
};

const sampleFinancialSeries: FinancialPositionPoint[] = [
  {
    paidInCapital: 100_000,
    totalAssets: 2_400_000,
    totalEquity: 900_000,
    totalLiabilities: 1_500_000,
    year: 2020,
  },
  {
    paidInCapital: 100_000,
    totalAssets: 2_620_000,
    totalEquity: 980_000,
    totalLiabilities: 1_640_000,
    year: 2021,
  },
  {
    paidInCapital: 100_000,
    totalAssets: 2_880_000,
    totalEquity: 1_060_000,
    totalLiabilities: 1_820_000,
    year: 2022,
  },
  {
    paidInCapital: 100_000,
    totalAssets: 3_120_000,
    totalEquity: 1_120_000,
    totalLiabilities: 2_000_000,
    year: 2023,
  },
  {
    paidInCapital: 100_000,
    totalAssets: 3_350_000,
    totalEquity: 1_220_000,
    totalLiabilities: 2_130_000,
    year: 2024,
  },
];

const sampleIncomeStatements: IncomeStatementPoint[] = [
  { researchAndDevelopmentExpense: 120_000, year: 2020 },
  { researchAndDevelopmentExpense: 240_000, year: 2021 },
  { researchAndDevelopmentExpense: 180_000, year: 2022 },
  { researchAndDevelopmentExpense: 70_000, year: 2023 },
  { researchAndDevelopmentExpense: 200_000, year: 2024 },
];

const formatNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : value.toLocaleString();

const formatKrwThousandAsEok = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const eok = value / 100_000;
  return `${Number.isInteger(eok) ? eok.toLocaleString() : eok.toFixed(1)}억 원`;
};

const formatPercent = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : `${value.toFixed(2)}%`;

const hasChanged = (values: Array<number | null>) => {
  const validValues = values.filter((value): value is number => value !== null);

  if (validValues.length <= 1) {
    return false;
  }

  return validValues.some((value) => value !== validValues[0]);
};

const FinancialTooltip = ({
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
      {payload.map((item) => (
        <p className="text-[#555]" key={item.name} style={{ color: item.color }}>
          {item.name}: {formatNumber(item.value)}
        </p>
      ))}
    </div>
  );
};

const FinancialStatusSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const { data, error, isLoading } = useDashboardGetData<FinancialPositionResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/financial-position",
  );
  const {
    data: incomeData,
    error: incomeError,
    isLoading: isIncomeLoading,
  } = useDashboardGetData<IncomeStatementsResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/income-statements",
  );
  const series = (isSample ? sampleFinancialSeries : data?.series ?? [])
    .slice()
    .sort((firstPoint, secondPoint) => firstPoint.year - secondPoint.year);
  const incomeSeries = (isSample ? sampleIncomeStatements : incomeData?.series ?? [])
    .slice()
    .sort((firstPoint, secondPoint) => firstPoint.year - secondPoint.year);
  const chartData: ChartPoint[] = series.map((point) => ({
    ...point,
    yearLabel: String(point.year),
  }));
  const rndChartData: RndChartPoint[] = incomeSeries.map((point) => ({
    ...point,
    yearLabel: String(point.year),
  }));
  const latestFinancialPoint = chartData.at(-1);
  const paidInCapitalRatio =
    latestFinancialPoint?.paidInCapital !== null &&
    latestFinancialPoint?.paidInCapital !== undefined &&
    latestFinancialPoint.totalEquity
      ? (latestFinancialPoint.paidInCapital * 100) / latestFinancialPoint.totalEquity
      : null;
  const paidInCapitalChanged = hasChanged(chartData.map((point) => point.paidInCapital));

  if (error || incomeError) {
    return (
      <div className="rounded-[10px] border border-[#eee] bg-white px-7 py-6 text-sm font-medium text-red-600">
        재무상태 정보를 불러오지 못했습니다.
      </div>
    );
  }

  if ((isLoading || isIncomeLoading) && chartData.length === 0) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-[525px_minmax(0,1fr)] gap-8">
          <div className="h-[192px] animate-pulse rounded-[10px] bg-[#f8f9fb]" />
          <div className="h-[220px] animate-pulse rounded-[10px] bg-[#f8f9fb]" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="h-[244px] animate-pulse rounded-[10px] bg-[#f8f9fb]" />
          <div className="h-[244px] animate-pulse rounded-[10px] bg-[#f8f9fb]" />
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return <p className="text-sm text-[#666]">표시할 재무상태 정보가 없습니다.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-[525px_minmax(0,1fr)] items-start gap-8">
        <div className="overflow-hidden rounded-[10px] border border-[#eee]">
        <table className="w-full table-fixed border-collapse text-center text-base text-[#333]">
          <thead>
            <tr className="h-8 bg-gray-50">
              <th className="w-[106px] border-b border-r border-[#eee] font-normal">구분</th>
              <th className="border-b border-r border-[#eee] font-normal">자산 총계</th>
              <th className="border-b border-r border-[#eee] font-normal">부채 총계</th>
              <th className="border-b border-r border-[#eee] font-normal">자본 총계</th>
              <th className="border-b border-[#eee] font-normal">납입자본금</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((point) => (
              <tr className="h-8" key={point.year}>
                <td className="border-r border-t border-[#eee]">{point.year}</td>
                <td className="border-r border-t border-[#eee]">
                  {formatNumber(point.totalAssets)}
                </td>
                <td className="border-r border-t border-[#eee]">
                  {formatNumber(point.totalLiabilities)}
                </td>
                <td className="border-r border-t border-[#eee]">
                  {formatNumber(point.totalEquity)}
                </td>
                <td className="border-t border-[#eee]">{formatNumber(point.paidInCapital)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div className="min-w-0">
          <div className="h-[220px]">
          <ResponsiveContainer height="100%" width="100%">
            <ComposedChart data={chartData} margin={{ bottom: 6, left: 0, right: 0, top: 8 }}>
              <CartesianGrid stroke="#eee" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="yearLabel"
                tick={{ fill: "#777", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={false}
                tickLine={false}
                width={0}
              />
              <Tooltip content={<FinancialTooltip />} />
              <Bar
                barSize={24}
                dataKey="totalLiabilities"
                isAnimationActive animationDuration={550} animationEasing="ease-out"
                fill="#51a2ff"
                name="부채 총계"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                barSize={24}
                dataKey="totalEquity"
                isAnimationActive animationDuration={550} animationEasing="ease-out"
                fill="#9bd0ff"
                name="자본 총계"
                radius={[4, 4, 0, 0]}
              />
              <Line
                dataKey="totalAssets"
                isAnimationActive animationDuration={550} animationEasing="ease-out"
                dot={false}
                name="자산 총계"
                stroke="#ffc928"
                strokeWidth={3}
                type="monotone"
              />
            </ComposedChart>
          </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-5 text-xs text-[#666]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#51a2ff]" />
            부채 총계
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#9bd0ff]" />
            자본 총계
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ffc928]" />
            자산 총계
          </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 items-start gap-5">
        <div className="relative h-[244px] rounded-[10px] border border-[#eee] bg-white px-[30px] py-[30px]">
          <p className="text-lg font-medium text-[#555]">납입자본금</p>
          <p className="mt-7 text-[28px] font-medium leading-none text-[#333]">
            {formatKrwThousandAsEok(latestFinancialPoint?.paidInCapital)}
          </p>
          <div className="mt-8 inline-flex h-[30px] items-center rounded-[15px] bg-[#bff0c8] px-[15px] pb-1.5 pt-[5px] text-base font-medium text-[#16803a]">
            자본총계 대비 {formatPercent(paidInCapitalRatio)}
          </div>
          <p className="absolute bottom-[30px] right-[30px] text-right text-base text-[#666]">
            {latestFinancialPoint?.year ?? "-"}년 기준 · 최근 5개년{" "}
            {paidInCapitalChanged ? "변동 있음" : "변동 없음"}
          </p>
        </div>

        <div className="min-w-0">
          <div className="h-[214px]">
            <ResponsiveContainer height="100%" width="100%">
              <ComposedChart data={rndChartData} margin={{ bottom: 6, left: 0, right: 0, top: 8 }}>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="yearLabel"
                  tick={{ fill: "#777", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={false}
                  tickLine={false}
                  width={0}
                />
                <Tooltip content={<FinancialTooltip />} />
                <Bar
                  barSize={50}
                  dataKey="researchAndDevelopmentExpense"
                  isAnimationActive animationDuration={550} animationEasing="ease-out"
                  fill="#ff8500"
                  name="연구개발비"
                  radius={[6, 6, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center text-base text-[#333]">연구개발비</div>
        </div>
      </div>
    </div>
  );
};

export default FinancialStatusSection;
