import SectionShell from "./SectionShell";
import type { SimilarFlowData } from "../types";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SimilarIndustryExplorerProps = {
  data: SimilarFlowData;
};

const formatChange = (value: number | null) => (value === null ? "-" : `${value > 0 ? "+" : ""}${value}%`);

const SimilarIndustryExplorer = ({ data }: SimilarIndustryExplorerProps) => (
  <SectionShell dataSampleTour="busan-rewind-similar-flow" title="과거 유사 산업 흐름 탐색">
    <div className="grid gap-4 lg:grid-cols-[1.7fr_0.9fr]">
      <div className="rounded-md border border-[#dfe8f5] p-4">
        <h3 className="text-base font-extrabold text-[#123b7a]">유사 산업 흐름 요약</h3>
        <div className="mt-5 rounded-md bg-white p-2">
          <div className="h-64">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={data.series} margin={{ bottom: 8, left: -18, right: 18, top: 12 }}>
                {data.periodHighlights.map((item, index) => (
                  <ReferenceArea
                    fill={["#fff1f2", "#f0fdf4", "#eff6ff"][index % 3]}
                    ifOverflow="extendDomain"
                    key={`${item.label}-${item.startYear}-${item.endYear}`}
                    strokeOpacity={0}
                    x1={item.startYear}
                    x2={item.endYear}
                  />
                ))}
                <CartesianGrid stroke="#edf2f8" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "#66758c", fontSize: 12, fontWeight: 700 }} tickLine={false} />
                <YAxis domain={[70, 150]} tick={{ fill: "#66758c", fontSize: 12, fontWeight: 700 }} tickLine={false} />
                <Tooltip />
                <Line
                  activeDot={{ fill: "#1f67d2", r: 5 }}
                  dataKey="index"
                  dot={{ fill: "#1f67d2", r: 4 }}
                  isAnimationActive={false}
                  stroke="#1f67d2"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {data.periodHighlights.map((item) => (
              <div className="rounded bg-white/80 px-3 py-2 text-center" key={`${item.label}-${item.startYear}-${item.endYear}`}>
                <p className="text-sm font-extrabold text-[#123b7a]">{item.label}</p>
                <p className="mt-1 text-xs font-bold text-[#6b7c95]">
                  {item.startYear}~{item.endYear}
                </p>
                <p className={(item.changeRate ?? 0) < 0 ? "mt-2 text-lg font-black text-[#2864c9]" : "mt-2 text-lg font-black text-[#ef3748]"}>
                  {formatChange(item.changeRate)}
                </p>
              </div>
            ))}
          </div>
          {data.series.length === 0 && (
            <p className="mt-3 text-center text-sm font-bold text-[#7b8798]">표시할 과거 유사 흐름 데이터가 없습니다.</p>
          )}
        </div>
      </div>
      <div className="rounded-md border border-[#dfe8f5] p-4">
        <h3 className="text-base font-extrabold text-[#123b7a]">라우팅 유형 분석</h3>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {["안정적 상승", "최근 급상승", "상승세 둔화"].map((item) => (
            <button
              className={`rounded-md border px-3 py-2 text-sm font-bold ${
                item === data.flowType ? "border-[#2b7fff] bg-[#eaf3ff] text-[#1f67d2]" : "border-[#d7e4f5] text-[#38506c]"
              }`}
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-md bg-[#f7faff] p-4 text-sm font-semibold leading-6 text-[#44566e]">
          {data.summary}
        </div>
      </div>
    </div>
  </SectionShell>
);

export default SimilarIndustryExplorer;
