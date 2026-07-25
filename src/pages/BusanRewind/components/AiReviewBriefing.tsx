import SectionShell from "./SectionShell";
import type { AiReviewBriefingData } from "../types";

type AiReviewBriefingProps = {
  data: AiReviewBriefingData;
};

const inlineMarkdownPattern = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\))/g;

const isUsefulNewsLink = (href: string) => {
  const value = href.trim();
  return value !== "" && value !== "https://news.google.com/" && value !== "http://news.google.com/";
};

const renderInlineMarkdown = (text: string) => {
  const parts: Array<string | { href: string; label: string } | { strong: string }> = [];
  let lastIndex = 0;

  for (const match of text.matchAll(inlineMarkdownPattern)) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push({ strong: match[2] });
    } else if (match[3] && match[4]) {
      parts.push({ href: match[4], label: match[3] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, index) =>
    typeof part === "string" ? (
      <span key={`${part}-${index}`}>{part}</span>
    ) : "strong" in part ? (
      <strong className="font-extrabold text-[#17376b]" key={`${part.strong}-${index}`}>
        {part.strong}
      </strong>
    ) : !isUsefulNewsLink(part.href) ? (
      <span className="font-extrabold text-[#17376b]" key={`${part.label}-${index}`}>
        {part.label}
      </span>
    ) : (
      <a
        className="font-extrabold text-[#1f67d2] underline decoration-[#9cc7ff] decoration-2 underline-offset-2"
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

const markdownBlocks = (markdown: string, fallbackLines: string[]) => {
  const source = markdown.trim() || fallbackLines.join("\n\n");
  return source
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
};

const AiReviewBriefing = ({ data }: AiReviewBriefingProps) => {
  const blocks = markdownBlocks(data.briefingMarkdown, data.briefingLines);

  return (
    <SectionShell dataSampleTour="busan-rewind-ai-review-briefing" title="AI 종합 검토 브리핑">
      <div>
        <article className="rounded-md border border-[#d7e5f6] bg-white px-6 py-5 shadow-[0_10px_28px_rgba(27,65,116,0.07)]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf2f8] pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#102f63]">{data.title}</h3>
              <p className="mt-1 text-xs font-bold text-[#6b7d93]">{data.industryName} 산업 현황, 과거 사례, 지원사업, RSS 근거 종합</p>
            </div>
            <span className="rounded-full border border-[#d7e5f6] bg-[#f7faff] px-3 py-1 text-xs font-extrabold text-[#3568bb]">
              {data.source === "AI_RSS" ? "AI + RSS" : "RULE + RSS"}
            </span>
          </div>
          <div className="mt-5 space-y-4 text-[15px] font-semibold leading-8 text-[#30445f]">
            {blocks.map((block, index) => {
              const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
              const isList = lines.every((line) => line.startsWith("- ") || line.startsWith("* "));

              if (isList) {
                return (
                  <ul className="space-y-2 border-l-2 border-[#dce8f8] pl-4" key={`${block}-${index}`}>
                    {lines.map((line, lineIndex) => (
                      <li className="text-[#344a64]" key={`${line}-${lineIndex}`}>
                        {renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}
                      </li>
                    ))}
                  </ul>
                );
              }

              return <p key={`${block}-${index}`}>{renderInlineMarkdown(block)}</p>;
            })}
          </div>
        </article>
      </div>
    </SectionShell>
  );
};

export default AiReviewBriefing;
