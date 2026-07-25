import SectionShell from "./SectionShell";
import type { TrendBriefingData } from "../types";

type IndustryTrendBriefingProps = {
  data: TrendBriefingData;
};

const formatGrowth = (value: number | null) => (value === null ? "-" : `${value > 0 ? "+" : ""}${value}%`);

const IndustryTrendBriefing = ({ data }: IndustryTrendBriefingProps) => (
  <SectionShell dataSampleTour="busan-rewind-trend-briefing" title="산업 트렌드 브리핑">
    <div className="grid gap-4 lg:grid-cols-2">
      <TrendPanel data={data} />
      <div className="rounded-md border border-[#dfe8f5] p-4">
        <h3 className="text-base font-extrabold text-[#123b7a]">과거 대비 변화 & 부산 연관성</h3>
        <ul className="mt-4 space-y-2 text-sm font-semibold leading-6 text-[#394b63]">
          <li>{data.changeComparison.product}</li>
          <li>{data.changeComparison.technology}</li>
          <li>{data.changeComparison.demand}</li>
          <li>{data.changeComparison.structure}</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          {data.busanRelevance.policyKeywords.map((chip) => (
            <span className="rounded-full border border-[#cfe0f7] px-3 py-1 text-xs font-bold text-[#1f67d2]" key={chip}>
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-4 rounded-md border border-[#cfe0f7] bg-[#f6faff] px-4 py-3 text-sm font-semibold leading-6 text-[#38506c]">
      <b className="text-[#1f67d2]">AI 요약</b> {data.aiSummary}
    </div>
  </SectionShell>
);

const TrendPanel = ({ data }: { data: TrendBriefingData }) => (
  <div className="rounded-md border border-[#dfe8f5] p-4">
    <div className="flex items-start justify-between">
      <h3 className="text-base font-extrabold text-[#123b7a]">국내·해외 산업 동향</h3>
      <span className="text-xl font-black text-[#ef3748]">{formatGrowth(data.domestic.growthRate)}</span>
    </div>
    <h4 className="mt-5 text-sm font-extrabold text-[#334766]">국내 산업 동향</h4>
    <ul className="mt-2 space-y-2 text-sm font-semibold leading-6 text-[#394b63]">
      {data.domestic.issues.map((issue) => (
        <li key={issue}>• {issue}</li>
      ))}
    </ul>
    <h4 className="mt-5 text-sm font-extrabold text-[#334766]">해외 산업 동향</h4>
    <ul className="mt-2 space-y-2 text-sm font-semibold leading-6 text-[#394b63]">
      {data.overseas.issues.map((issue) => (
        <li key={issue}>{issue}</li>
      ))}
    </ul>
  </div>
);

export default IndustryTrendBriefing;
