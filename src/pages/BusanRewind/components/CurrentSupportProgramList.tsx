import { showAppAlert } from "@/components/AppAlert";
import type { CurrentSupportProgramsData } from "../types";

type CurrentSupportProgramListProps = {
  data: CurrentSupportProgramsData;
  industryName: string;
};

const formatCount = (value: number) => value.toLocaleString("ko-KR");

const formatDueDate = (date: string | null) => {
  if (!date) {
    return "일정 확인 필요";
  }

  return `~ ${date.replaceAll("-", ".")}`;
};

const compactSummary = (summary: string | undefined) => {
  if (!summary) {
    return "사업 요약 정보가 확인되지 않았습니다.";
  }

  const compacted = summary.replace(/\s+/g, " ").trim();
  return compacted.length > 130 ? `${compacted.slice(0, 130)}...` : compacted;
};

const statusBadgeClassName = (status: string) => {
  if (status.includes("접수중") || status.includes("상시")) {
    return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
  }

  if (status.includes("예정")) {
    return "border-[#fde68a] bg-[#fffbeb] text-[#b45309]";
  }

  if (status.includes("마감")) {
    return "border-[#fecaca] bg-[#fff7f7] text-[#b91c1c]";
  }

  return "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]";
};

const openAnnounceUrl = (announceUrl: string | null) => {
  if (!announceUrl) {
    showAppAlert("원문 링크가 없습니다.");
    return;
  }

  window.open(announceUrl, "_blank", "noopener,noreferrer");
};

const CurrentSupportProgramList = ({ data, industryName }: CurrentSupportProgramListProps) => (
  <div className="mt-4 rounded-md border border-[#dfe8f5] bg-white p-4">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-extrabold text-[#123b7a]">선택 산업 관련 지원공고</h3>
        <p className="mt-2 break-keep text-sm font-medium leading-6 text-[#64748b]">
          선택 산업({industryName})과 관련된 현재 BTP 지원사업 정보를 제공합니다.
        </p>
      </div>
      <span className="rounded-full border border-[#dbeafe] bg-[#f8fbff] px-3 py-1.5 text-xs font-extrabold text-[#1d4ed8]">
        {data.referenceYear ? `${data.referenceYear}년 기준 · ` : ""}{formatCount(data.items.length)}건
      </span>
    </div>

    {data.items.length === 0 ? (
      <div className="rounded-[8px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-5 text-center text-sm font-bold text-[#64748b]">
        표시할 관련 지원공고가 없습니다.
      </div>
    ) : (
      <div className="space-y-3">
        {data.items.map((item) => (
          <div
            className="rounded-[8px] border border-[#e5e7eb] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-[#bfdbfe] hover:bg-[#fbfdff] max-md:px-4"
            key={item.programId ?? `${item.referenceYear}-${item.title}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${statusBadgeClassName(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-1 text-xs font-extrabold text-[#15803d]">
                    {item.supportField || "분야 확인 필요"}
                  </span>
                  <span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-xs font-extrabold text-[#475569]">
                    {item.referenceYear ? `${item.referenceYear}년 기준` : formatDueDate(item.dueDate)}
                  </span>
                </div>
                <p className="break-keep text-[17px] font-extrabold leading-7 text-[#111827]">
                  {item.title}
                </p>
                <p className="mt-2 break-keep text-sm font-medium leading-6 text-[#475569]">
                  {compactSummary(item.summary)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  aria-label={`${item.title} 원문 보기`}
                  className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#d8dee8] bg-white px-3 text-sm font-extrabold text-[#334155] transition hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                  onClick={() => openAnnounceUrl(item.announceUrl)}
                  type="button"
                >
                  원문 ↗
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default CurrentSupportProgramList;
