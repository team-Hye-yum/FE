import SectionShell from "./SectionShell";
import type { SupportComparisonData } from "../types";

type SupportComparisonMapProps = {
  data: SupportComparisonData;
};

const SupportComparisonMap = ({ data }: SupportComparisonMapProps) => (
  <SectionShell dataSampleTour="busan-rewind-support-comparison" title="현재 지원 사업과 비교">
    <div className="relative min-h-[430px] overflow-hidden rounded-md border border-[#dfe8f5] bg-[#fbfdff] p-6">
      {data.referenceYear && (
        <div className="relative z-10 mb-4 inline-flex rounded-full border border-[#dbeafe] bg-white px-3 py-1.5 text-xs font-extrabold text-[#1d4ed8]">
          {data.referenceYear}년 과거 유사구간 기준
        </div>
      )}
      <div className="pointer-events-none absolute left-[25%] top-[32%] hidden h-px w-[20%] rotate-[12deg] bg-[#f59e0b] lg:block" />
      <div className="pointer-events-none absolute left-[25%] top-[56%] hidden h-px w-[20%] -rotate-[12deg] bg-[#a855f7] lg:block" />
      <div className="pointer-events-none absolute right-[25%] top-[32%] hidden h-px w-[20%] -rotate-[12deg] bg-[#2b7fff] lg:block" />
      <div className="pointer-events-none absolute right-[25%] top-[56%] hidden h-px w-[20%] rotate-[12deg] bg-[#22c55e] lg:block" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_260px_1fr]">
        <BranchPanel items={data.changedFields.map((item) => `${item.from} → ${item.to}`)} tone="orange" title="변경된 지원 분야" />
        <div className="grid place-items-center lg:row-span-2">
          <div className="flex h-52 w-52 flex-col items-center justify-center rounded-full border border-[#d8e3f1] bg-white px-6 text-center shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
            <HandshakeIcon />
            <span className="text-lg font-black text-[#143d78]">핵심 공통 분모</span>
            <span className="mt-2 text-xs font-bold leading-5 text-[#52647e]">
              현재와 과거 모두 지원하는 핵심 분야
            </span>
          </div>
        </div>
        <BranchPanel items={data.currentFields} tone="blue" title="현재 지원 사업" />
        <BranchPanel items={data.pastFields} tone="purple" title="과거 지원 사업" />
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

const HandshakeIcon = () => (
  <svg
    aria-hidden="true"
    className="mb-3 h-10 w-10 text-[#2563eb]"
    fill="none"
    viewBox="0 0 64 64"
  >
    <path
      d="M19.8 18.4 8.6 29.6l7.6 7.6 11.2-11.2"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="5"
    />
    <path
      d="m44.2 18.4 11.2 11.2-7.6 7.6-11.2-11.2"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="5"
    />
    <path
      d="M23.4 27.6 29 22h7.2l4.4 4.4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="5"
    />
    <path
      d="m21.8 34.2 13.5 13.5c2 2 5.2 2 7.2 0l6.3-6.3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="5"
    />
    <path
      d="m28.5 41 4.8 4.8m.8-9.6 5.8 5.8"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="4"
    />
  </svg>
);

export default SupportComparisonMap;
