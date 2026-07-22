import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";
import {
  Bar,
  CartesianGrid,
  BarChart,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartFrame from "../components/ChartFrame";

type EmploymentPoint = {
  year: number;
  employeeCount: number | null;
  nationalPensionSubscriberCount: number | null;
  nationalPensionJoinerCount: number | null;
  nationalPensionLeaverCount: number | null;
  nationalPensionAverageAnnualSalary: number | null;
  employeeYoYChange: number | null;
  employeeYoYGrowthRate: number | null;
};

type EmploymentsResponse = {
  series: EmploymentPoint[];
};

type ChartPoint = EmploymentPoint & {
  averageSalaryTenThousand: number | null;
  yearLabel: string;
};

const sampleEmploymentSeries: EmploymentPoint[] = [
  {
    employeeCount: 8,
    employeeYoYChange: null,
    employeeYoYGrowthRate: null,
    nationalPensionAverageAnnualSalary: 32_000_000,
    nationalPensionJoinerCount: 2,
    nationalPensionLeaverCount: 1,
    nationalPensionSubscriberCount: 7,
    year: 2020,
  },
  {
    employeeCount: 10,
    employeeYoYChange: 2,
    employeeYoYGrowthRate: 25,
    nationalPensionAverageAnnualSalary: 34_500_000,
    nationalPensionJoinerCount: 3,
    nationalPensionLeaverCount: 1,
    nationalPensionSubscriberCount: 9,
    year: 2021,
  },
  {
    employeeCount: 13,
    employeeYoYChange: 3,
    employeeYoYGrowthRate: 30,
    nationalPensionAverageAnnualSalary: 36_200_000,
    nationalPensionJoinerCount: 4,
    nationalPensionLeaverCount: 2,
    nationalPensionSubscriberCount: 11,
    year: 2022,
  },
  {
    employeeCount: 11,
    employeeYoYChange: -2,
    employeeYoYGrowthRate: -15.38,
    nationalPensionAverageAnnualSalary: 38_000_000,
    nationalPensionJoinerCount: 1,
    nationalPensionLeaverCount: 3,
    nationalPensionSubscriberCount: 10,
    year: 2023,
  },
  {
    employeeCount: 14,
    employeeYoYChange: 3,
    employeeYoYGrowthRate: 27.27,
    nationalPensionAverageAnnualSalary: 40_000_000,
    nationalPensionJoinerCount: 4,
    nationalPensionLeaverCount: 1,
    nationalPensionSubscriberCount: 12,
    year: 2024,
  },
];

const formatNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : value.toLocaleString();

const EmploymentTooltip = ({
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

const EmploymentInfoSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const { data, error, isLoading } = useDashboardGetData<EmploymentsResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/employments",
  );
  const series = (isSample ? sampleEmploymentSeries : data?.series ?? [])
    .slice()
    .sort((firstPoint, secondPoint) => firstPoint.year - secondPoint.year);
  const chartData: ChartPoint[] = series.map((point) => ({
    ...point,
    averageSalaryTenThousand:
      point.nationalPensionAverageAnnualSalary === null ||
      point.nationalPensionAverageAnnualSalary === undefined
        ? null
        : Math.round(point.nationalPensionAverageAnnualSalary / 10_000),
    yearLabel: String(point.year),
  }));

  if (error) {
    return (
      <div className="rounded-[10px] border border-[#eee] bg-white px-7 py-6 text-sm font-medium text-red-600">
        고용 정보를 불러오지 못했습니다.
      </div>
    );
  }

  if (isLoading && chartData.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-7">
        {[0, 1, 2].map((item) => (
          <div className="h-[180px] animate-pulse rounded-[10px] bg-[#f8fafc]" key={item} />
        ))}
      </div>
    );
  }

  if (chartData.length === 0) {
    return <p className="text-sm text-[#666]">표시할 고용 정보가 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-[1fr_1.05fr_1fr] items-end gap-7">
      <div className="min-w-0">
        <ChartFrame height={170}>
            <LineChart data={chartData} margin={{ bottom: 6, left: 0, right: 10, top: 8 }}>
              <CartesianGrid stroke="#eee" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="yearLabel"
                tick={{ fill: "#777", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tick={{ fill: "#999", fontSize: 12 }}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<EmploymentTooltip />} />
              <Line
                dataKey="employeeCount"
                isAnimationActive={false}
                dot={false}
                name="종업원수"
                stroke="#51a2ff"
                strokeWidth={3}
                type="monotone"
              />
              <Line
                dataKey="nationalPensionSubscriberCount"
                isAnimationActive={false}
                dot={false}
                name="국민연금 가입자수"
                stroke="#6ee7b7"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
        </ChartFrame>
        <div className="mt-2 flex justify-center gap-5 text-xs text-[#666]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#51a2ff]" />
            종업원수
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#6ee7b7]" />
            국민연금 가입자수
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <ChartFrame height={190}>
            <BarChart data={chartData} margin={{ bottom: 6, left: 0, right: 10, top: 8 }}>
              <CartesianGrid stroke="#eee" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="yearLabel"
                tick={{ fill: "#777", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tick={{ fill: "#999", fontSize: 12 }}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<EmploymentTooltip />} />
              <Bar
                barSize={18}
                dataKey="nationalPensionJoinerCount"
                isAnimationActive={false}
                fill="#51a2ff"
                name="국민연금 취업자수"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                barSize={18}
                dataKey="nationalPensionLeaverCount"
                isAnimationActive={false}
                fill="#9bd0ff"
                name="국민연금 퇴직자수"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
        </ChartFrame>
        <div className="mt-2 flex justify-center gap-5 text-xs text-[#666]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#51a2ff]" />
            국민연금 취업자수
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#9bd0ff]" />
            국민연금 퇴직자수
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <ChartFrame height={190}>
            <BarChart data={chartData} margin={{ bottom: 6, left: 0, right: 10, top: 8 }}>
              <CartesianGrid stroke="#eee" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="yearLabel"
                tick={{ fill: "#777", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tick={{ fill: "#999", fontSize: 12 }}
                tickFormatter={(value) => `${Number(value) / 1000}천`}
                tickLine={false}
                width={34}
              />
              <Tooltip content={<EmploymentTooltip />} />
              <Bar
                barSize={26}
                dataKey="averageSalaryTenThousand"
                isAnimationActive={false}
                fill="#ffc928"
                name="1인평균년간급여"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
        </ChartFrame>
        <div className="mt-2 flex justify-center text-xs text-[#666]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ffc928]" />
            1인평균년간급여
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmploymentInfoSection;
