import SectionShell from "./SectionShell";
import type { CurrentStatusData, CurrentSupportProgramsData } from "../types";
import BusanDistrictGrowthMap from "./BusanDistrictGrowthMap";
import CurrentSupportProgramList from "./CurrentSupportProgramList";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CurrentIndustryStatusProps = {
  data: CurrentStatusData;
  supportPrograms: CurrentSupportProgramsData;
};

const formatPercent = (value: number | null) => (value === null ? "-" : `${value > 0 ? "+" : ""}${value}%`);
const formatRatio = (value: number | null) => (value === null ? "-" : `${value}%`);
const formatCount = (value: number | null) => (value === null ? "-" : value.toLocaleString());
const corporationColors = ["#2563eb", "#8fc3ff"];

const CurrentIndustryStatus = ({ data, supportPrograms }: CurrentIndustryStatusProps) => (
  <SectionShell dataSampleTour="busan-rewind-current-status" title="현재 산업 현황">
    <div className="grid gap-4 lg:grid-cols-[0.82fr_1.12fr_1.6fr]">
      <div className="rounded-md border border-[#dfe8f5] p-4">
        <h3 className="text-base font-extrabold text-[#123b7a]">개인/법인 비중</h3>
        <div className="mt-6 flex items-center gap-5">
          <PieChart height={148} width={148}>
            <Pie
              cx={74}
              cy={74}
              data={[
                { name: "법인", value: data.corporation.ratio ?? 0 },
                { name: "개인", value: data.individual.ratio ?? 0 },
              ]}
              dataKey="value"
              innerRadius={42}
              isAnimationActive={false}
              outerRadius={66}
              stroke="#ffffff"
              strokeWidth={3}
            >
              {corporationColors.map((color) => (
                <Cell fill={color} key={color} />
              ))}
            </Pie>
          </PieChart>
          <div className="space-y-3 text-sm font-bold text-[#4a5a72]">
            <p>
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
              법인 {formatRatio(data.corporation.ratio)}
              <span className="block pl-5 text-xs text-[#7b8798]">({formatCount(data.corporation.count)})</span>
            </p>
            <p>
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#8fc3ff]" />
              개인 {formatRatio(data.individual.ratio)}
              <span className="block pl-5 text-xs text-[#7b8798]">({formatCount(data.individual.count)})</span>
            </p>
          </div>
        </div>
        <p className="mt-6 text-xs font-semibold text-[#8a98ad]">{data.baseYear}년 기준</p>
      </div>

      <div className="rounded-md border border-[#dfe8f5] p-4">
        <h3 className="text-base font-extrabold text-[#123b7a]">종사자 수 증감률 및 규모별 비중</h3>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-bold text-[#52647e]">종사자 수 증감률</p>
            <p className="mt-3 text-3xl font-black text-[#ef3748]">{formatPercent(data.employeeGrowthRate)}</p>
            <p className="mt-4 text-sm font-bold text-[#52647e]">종사자 수</p>
            <p className="mt-1 text-2xl font-black text-[#1d4f9f]">{formatCount(data.employeeCount)}</p>
          </div>
          <div className="h-44 min-w-0">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={data.employeeSizeRatios} layout="vertical" margin={{ bottom: 4, left: 0, right: 26, top: 4 }}>
                <XAxis hide domain={[0, 45]} type="number" />
                <YAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: "#44566e", fontSize: 12, fontWeight: 700 }}
                  tickLine={false}
                  type="category"
                  width={74}
                />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="ratio" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-[#dfe8f5] p-4">
        <h3 className="text-base font-extrabold text-[#123b7a]">부산시 종사자 증감률 비교</h3>
        <BusanDistrictGrowthMap items={data.districtEmployeeGrowths} />
      </div>
    </div>
    <CurrentSupportProgramList data={supportPrograms} industryName={data.industryName} />
  </SectionShell>
);

export default CurrentIndustryStatus;
