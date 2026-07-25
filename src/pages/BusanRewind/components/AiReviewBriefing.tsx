import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SectionShell from "./SectionShell";
import type { AiReviewBriefingData } from "../types";

type AiReviewBriefingProps = {
  data: AiReviewBriefingData;
};

const isUsefulNewsLink = (href: string) => {
  const value = href.trim();
  return value !== "" && value !== "https://news.google.com/" && value !== "http://news.google.com/";
};

const AiReviewBriefing = ({ data }: AiReviewBriefingProps) => {
  const markdown = data.briefingMarkdown.trim() || data.briefingLines.join("\n\n");

  return (
    <SectionShell dataSampleTour="busan-rewind-ai-review-briefing" title="AI 종합 검토 브리핑">
      <div>
        <article className="rounded-md border border-[#d7e5f6] bg-white px-6 py-5 shadow-[0_10px_28px_rgba(27,65,116,0.07)]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf2f8] pb-4">
            <div>
              <p className="text-sm font-bold text-[#6b7d93]">{data.industryName} 산업 현황, 과거 사례, 지원사업, RSS 근거 종합</p>
            </div>
            <span className="rounded-full border border-[#d7e5f6] bg-[#f7faff] px-3 py-1 text-xs font-extrabold text-[#3568bb]">
              {data.source === "AI_RSS" ? "AI + RSS" : "RULE + RSS"}
            </span>
          </div>
          <div className="mt-5 text-[15px] font-semibold leading-8 text-[#30445f]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ children, href }) =>
                  href && isUsefulNewsLink(href) ? (
                    <a
                      className="font-extrabold text-[#1f67d2] underline decoration-[#9cc7ff] decoration-2 underline-offset-2"
                      href={href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      ({children})
                    </a>
                  ) : (
                    <span className="font-extrabold text-[#17376b]">({children})</span>
                  ),
                blockquote: ({ children }) => (
                  <blockquote className="my-4 border-l-4 border-[#dce8f8] bg-[#f7faff] px-4 py-3 text-[#344a64]">{children}</blockquote>
                ),
                h1: ({ children }) => <h3 className="mb-3 mt-5 text-lg font-extrabold text-[#102f63]">{children}</h3>,
                h2: ({ children }) => <h4 className="mb-2 mt-5 text-base font-extrabold text-[#102f63]">{children}</h4>,
                h3: ({ children }) => <h5 className="mb-2 mt-4 text-sm font-extrabold text-[#102f63]">{children}</h5>,
                li: ({ children }) => <li className="pl-1 text-[#344a64]">{children}</li>,
                ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-5">{children}</ol>,
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-extrabold text-[#17376b]">{children}</strong>,
                ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-5">{children}</ul>,
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </SectionShell>
  );
};

export default AiReviewBriefing;
