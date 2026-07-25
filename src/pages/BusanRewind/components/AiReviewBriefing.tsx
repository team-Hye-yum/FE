import SectionShell from "./SectionShell";
import type { AiReviewBriefingData } from "../types";

type AiReviewBriefingProps = {
  data: AiReviewBriefingData;
};

const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

const renderLinkedText = (text: string) => {
  const parts: Array<string | { href: string; label: string }> = [];
  let lastIndex = 0;

  for (const match of text.matchAll(markdownLinkPattern)) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ href: match[2], label: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, index) =>
    typeof part === "string" ? (
      <span key={`${part}-${index}`}>{part}</span>
    ) : (
      <a
        className="font-extrabold text-[#1f67d2] underline decoration-[#9cc7ff] underline-offset-2"
        href={part.href}
        key={`${part.href}-${index}`}
        rel="noreferrer"
        target="_blank"
      >
        {part.label}
      </a>
    ),
  );
};

const AiReviewBriefing = ({ data }: AiReviewBriefingProps) => (
  <SectionShell dataSampleTour="busan-rewind-ai-review-briefing" title="AI 종합 검토 브리핑">
    <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
      <article className="rounded-md border border-[#cfe0f7] bg-white p-5">
        <h3 className="text-lg font-extrabold text-[#123b7a]">{data.title}</h3>
        <div className="mt-4 space-y-2.5 text-sm font-semibold leading-6 text-[#38506c]">
          {data.briefingLines.map((line, index) => (
            <p key={`${line}-${index}`}>{renderLinkedText(line)}</p>
          ))}
        </div>
      </article>

      <article className="rounded-md border border-[#dfe8f5] bg-[#fbfdff] p-5">
        <h3 className="text-lg font-extrabold text-[#123b7a]">산업 변화 근거 뉴스 (RSS)</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#dfe8f5] text-xs font-extrabold text-[#52647e]">
                <th className="whitespace-nowrap px-2 py-2">날짜</th>
                <th className="whitespace-nowrap px-2 py-2">산업 변화</th>
                <th className="px-2 py-2">관련 기사</th>
              </tr>
            </thead>
            <tbody>
              {data.evidenceNews.map((item, index) => (
                <tr className="border-b border-[#eef3fb] last:border-0" key={`${item.link}-${index}`}>
                  <td className="whitespace-nowrap px-2 py-3 font-semibold text-[#52647e]">{item.publishedAt}</td>
                  <td className="whitespace-nowrap px-2 py-3 font-bold text-[#1f67d2]">{item.industryChange}</td>
                  <td className="px-2 py-3">
                    <a className="font-semibold text-[#263b59] hover:text-[#1f67d2]" href={item.link} rel="noreferrer" target="_blank">
                      {item.title}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-md border border-[#bfe7ea] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#355167]">
          <b className="mr-2 text-[#168187]">AI 브리핑 연계</b>
          {data.newsSynthesis}
        </div>
      </article>
    </div>
  </SectionShell>
);

export default AiReviewBriefing;
