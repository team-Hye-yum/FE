import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type IncomeStatementPoint = {
  year: number;
  salesAmount: number | null;
  costOfSales: number | null;
  operatingProfitLoss: number | null;
  netIncomeLoss: number | null;
  operatingProfitMargin: number | null;
};

type IncomeStatementsResponse = {
  series: IncomeStatementPoint[];
};

type ChartPoint = IncomeStatementPoint & {
  yearLabel: string;
};

const sampleIncomeStatements: IncomeStatementPoint[] = [
  {
    costOfSales: 1_200_000,
    netIncomeLoss: 120_000,
    operatingProfitLoss: 180_000,
    operatingProfitMargin: 8.2,
    salesAmount: 2_100_000,
    year: 2020,
  },
  {
    costOfSales: 1_360_000,
    netIncomeLoss: 160_000,
    operatingProfitLoss: 220_000,
    operatingProfitMargin: 9.1,
    salesAmount: 2_420_000,
    year: 2021,
  },
  {
    costOfSales: 1_650_000,
    netIncomeLoss: 210_000,
    operatingProfitLoss: 310_000,
    operatingProfitMargin: 10.4,
    salesAmount: 2_980_000,
    year: 2022,
  },
  {
    costOfSales: 1_410_000,
    netIncomeLoss: 80_000,
    operatingProfitLoss: 130_000,
    operatingProfitMargin: 5.7,
    salesAmount: 2_280_000,
    year: 2023,
  },
  {
    costOfSales: 1_540_000,
    netIncomeLoss: 150_000,
    operatingProfitLoss: 240_000,
    operatingProfitMargin: 8.8,
    salesAmount: 2_720_000,
    year: 2024,
  },
];

const formatNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : value.toLocaleString();

const formatPercent = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : `${value.toFixed(2)}%`;

const IncomeTooltip = ({
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
          {item.name}:{" "}
          {item.name === "영업이익률" ? formatPercent(item.value) : formatNumber(item.value)}
        </p>
      ))}
    </div>
  );
};

const IncomeStatementSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const { data, error, isLoading } = useDashboardGetData<IncomeStatementsResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/income-statements",
  );
  const series = (isSample ? sampleIncomeStatements : data?.series ?? [])
    .slice()
    .sort((firstPoint, secondPoint) => firstPoint.year - secondPoint.year);
  const chartData: ChartPoint[] = series.map((point) => ({
    ...point,
    yearLabel: String(point.year),
  }));

  if (error) {
    return (
      <div className="rounded-[10px] border border-[#eee] bg-white px-7 py-6 text-sm font-medium text-red-600">
        손익계산 정보를 불러오지 못했습니다.
      </div>
    );
  }

  if (isLoading && chartData.length === 0) {
    return (
      <div className="grid grid-cols-[397px_minmax(0,1fr)] gap-8">
        <div className="h-[192px] animate-pulse rounded-[10px] bg-[#f8f9fb]" />
        <div className="h-[220px] animate-pulse rounded-[10px] bg-[#f8f9fb]" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return <p className="text-sm text-[#666]">표시할 손익계산 정보가 없습니다.</p>;
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-[397px_minmax(0,1fr)] items-start gap-8">
        <div className="overflow-hidden rounded-[10px] border border-[#eee]">
          <table className="w-full table-fixed border-collapse text-center text-base text-[#333]">
            <thead>
              <tr className="h-8 bg-gray-50">
                <th className="w-[106px] border-b border-r border-[#eee] font-normal">구분</th>
                <th className="border-b border-r border-[#eee] font-normal">매출액</th>
                <th className="border-b border-[#eee] font-normal">매출 원가</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((point) => (
                <tr className="h-8" key={point.year}>
                  <td className="border-r border-t border-[#eee]">{point.year}</td>
                  <td className="border-r border-t border-[#eee]">
                    {formatNumber(point.salesAmount)}
                  </td>
                  <td className="border-t border-[#eee]">{formatNumber(point.costOfSales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="min-w-0">
          <div className="h-[220px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={chartData} margin={{ bottom: 6, left: 0, right: 14, top: 8 }}>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="yearLabel"
                  tick={{ fill: "#777", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickLine={false}
                  width={42}
                />
                <Tooltip content={<IncomeTooltip />} />
                <Bar
                  barSize={24}
                  dataKey="salesAmount"
                  fill="#51a2ff"
                  name="매출액"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  barSize={24}
                  dataKey="costOfSales"
                  fill="#9bd0ff"
                  name="매출 원가"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-5 text-xs text-[#666]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#51a2ff]" />
              매출액
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#9bd0ff]" />
              매출 원가
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[525px_minmax(0,1fr)] items-start gap-8">
        <div className="overflow-hidden rounded-[10px] border border-[#eee]">
          <table className="w-full table-fixed border-collapse text-center text-base text-[#333]">
            <thead>
              <tr className="h-8 bg-gray-50">
                <th className="w-[106px] border-b border-r border-[#eee] font-normal">구분</th>
                <th className="border-b border-r border-[#eee] font-normal">영업이익손실</th>
                <th className="border-b border-r border-[#eee] font-normal">당기순이익손실</th>
                <th className="border-b border-[#eee] font-normal">영업이익률</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((point) => (
                <tr className="h-8" key={point.year}>
                  <td className="border-r border-t border-[#eee]">{point.year}</td>
                  <td className="border-r border-t border-[#eee]">
                    {formatNumber(point.operatingProfitLoss)}
                  </td>
                  <td className="border-r border-t border-[#eee]">
                    {formatNumber(point.netIncomeLoss)}
                  </td>
                  <td className="border-t border-[#eee]">
                    {formatPercent(point.operatingProfitMargin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="min-w-0">
          <div className="h-[220px]">
            <ResponsiveContainer height="100%" width="100%">
              <ComposedChart data={chartData} margin={{ bottom: 6, left: 0, right: 14, top: 8 }}>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="yearLabel"
                  tick={{ fill: "#777", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  domain={["auto", "auto"]}
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickLine={false}
                  width={42}
                  yAxisId="amount"
                />
                <YAxis
                  axisLine={false}
                  domain={["dataMin - 5", "dataMax + 5"]}
                  orientation="right"
                  tick={{ fill: "#51d8c5", fontSize: 12 }}
                  tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                  tickLine={false}
                  width={38}
                  yAxisId="margin"
                />
                <Tooltip content={<IncomeTooltip />} />
                <Bar
                  barSize={24}
                  dataKey="operatingProfitLoss"
                  fill="#b69cff"
                  name="영업이익손실"
                  radius={[4, 4, 0, 0]}
                  yAxisId="amount"
                />
                <Bar
                  barSize={24}
                  dataKey="netIncomeLoss"
                  fill="#d5c4ff"
                  name="당기순이익손실"
                  radius={[4, 4, 0, 0]}
                  yAxisId="amount"
                />
                <Line
                  dataKey="operatingProfitMargin"
                  dot={false}
                  name="영업이익률"
                  stroke="#51d8c5"
                  strokeWidth={3}
                  type="monotone"
                  yAxisId="margin"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-5 text-xs text-[#666]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#b69cff]" />
              영업이익손실
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#d5c4ff]" />
              당기순이익손실
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#51d8c5]" />
              영업이익률
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatementSection;
