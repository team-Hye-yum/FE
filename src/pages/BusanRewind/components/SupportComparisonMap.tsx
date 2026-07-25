import SectionShell from "./SectionShell";
import type { SupportComparisonData } from "../types";

type SupportComparisonMapProps = {
  data: SupportComparisonData;
};

const SupportComparisonMap = ({ data }: SupportComparisonMapProps) => (
  <SectionShell dataSampleTour="busan-rewind-support-comparison" title="현재 지원 사업과 비교">
    <div className="relative min-h-[430px] overflow-hidden rounded-md border border-[#dfe8f5] bg-[#fbfdff] p-6">
      <div className="pointer-events-none absolute left-[20%] top-[28%] hidden h-px w-[25%] rotate-[14deg] bg-[#f59e0b] lg:block" />
      <div className="pointer-events-none absolute left-[20%] top-[61%] hidden h-px w-[25%] -rotate-[14deg] bg-[#a855f7] lg:block" />
      <div className="pointer-events-none absolute right-[20%] top-[28%] hidden h-px w-[25%] -rotate-[14deg] bg-[#2b7fff] lg:block" />
      <div className="pointer-events-none absolute right-[20%] top-[61%] hidden h-px w-[25%] rotate-[14deg] bg-[#22c55e] lg:block" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_220px_1fr]">
        <BranchPanel items={data.changedFields.map((item) => `${item.from} → ${item.to}`)} tone="orange" title="변경된 지원 분야" />
        <div className="grid place-items-center">
          <div className="flex h-44 w-44 flex-col items-center justify-center rounded-full border border-[#d8e3f1] bg-white px-5 text-center shadow-sm">
            <span className="text-lg font-black text-[#143d78]">핵심 공통 분모</span>
            <span className="mt-2 text-xs font-bold leading-5 text-[#52647e]">
              {data.commonFields.slice(0, 2).join(" · ")}
            </span>
          </div>
        </div>
        <BranchPanel items={data.currentFields} tone="blue" title="현재 지원 사업" />
        <BranchPanel items={data.pastFields} tone="purple" title="과거 지원 사업" />
        <div />
        <BranchPanel items={data.newFields} tone="green" title="새롭게 추가된 지원 분야" />
      </div>
      <div className="relative z-10 mt-6 rounded-md border border-[#bfe7ea] bg-white px-4 py-3 text-sm font-semibold text-[#355167]">
        <span className="mr-3 font-extrabold text-[#168187]">현재 산업 트렌드와의 연관 키워드</span>
        {data.trendKeywords.map((keyword) => (
          <span className="mr-2 inline-flex rounded-full border border-[#bfe7ea] px-3 py-1 text-xs font-bold text-[#168187]" key={keyword}>
            {keyword}
          </span>
        ))}
      </div>
      <div className="relative z-10 mt-4 rounded-md border border-[#cfe0f7] bg-[#f6faff] px-4 py-3 text-sm font-semibold leading-6 text-[#38506c]">
        <b className="text-[#1f67d2]">AI 요약</b> {data.aiSummary}
      </div>
    </div>
  </SectionShell>
);

const toneClassName = {
  blue: "border-[#9dc4ff] text-[#1f67d2]",
  green: "border-[#9eddb0] text-[#248543]",
  orange: "border-[#f7cfa7] text-[#c66a1b]",
  purple: "border-[#d8c5f4] text-[#7551b5]",
};

const BranchPanel = ({ items, title, tone }: { items: string[]; title: string; tone: keyof typeof toneClassName }) => (
  <div className={`rounded-md border bg-white p-4 ${toneClassName[tone]}`}>
    <h3 className="text-base font-extrabold">{title}</h3>
    <div className="mt-4 grid gap-2 text-sm font-semibold text-[#44566e]">
      {items.map((item) => (
        <span className="rounded bg-[#f7faff] px-3 py-2" key={item}>
          {item}
        </span>
      ))}
    </div>
  </div>
);

export default SupportComparisonMap;
