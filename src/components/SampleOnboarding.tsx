import { useEffect, useMemo, useState } from "react";

type SampleOnboardingVariant = "company-dashboard" | "business-list" | "btp-solution" | "busan-rewind";

type OnboardingStep = {
  body: string;
  selector: string;
  title: string;
};

type SampleOnboardingProps = {
  variant: SampleOnboardingVariant;
};

type HighlightRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const tourContent: Record<SampleOnboardingVariant, { label: string; steps: OnboardingStep[] }> = {
  "company-dashboard": {
    label: "기업 분석 대시보드",
    steps: [
      {
        selector: '[data-sample-tour="company-dashboard-sample-badge"]',
        title: "샘플 데이터 표시",
        body: "SAMPLE 뱃지가 보이면 실제 기업 조회 결과가 아니라 기능 확인용 예시 데이터입니다. 실제 분석은 기업번호를 입력하면 같은 구조로 갱신됩니다.",
      },
      {
        selector: '[data-sample-tour="company-dashboard-company-info"]',
        title: "기업 기본정보",
        body: "가장 먼저 보는 영역입니다. 업종, 지역, 설립일, 주요 제품처럼 뒤쪽 분석의 기준이 되는 기본 프로필을 확인합니다.",
      },
      {
        selector: '[data-sample-tour="company-dashboard-sections"]',
        title: "분석 섹션 묶음",
        body: "재무, 고용, 지식재산, 연구개발, 중복지원 검토 등 세부 분석이 이어지는 영역입니다. 각 섹션은 보고서에 들어갈 수 있는 독립 분석 블록입니다.",
      },
      {
        selector: '[data-sample-tour="company-dashboard-print"]',
        title: "PDF 내보내기",
        body: "현재 화면에 구성된 분석 섹션을 기준으로 출력합니다. 필요한 섹션을 먼저 정리한 뒤 PDF로 저장하면 보고서 형태로 활용하기 좋습니다.",
      },
    ],
  },
  "business-list": {
    label: "지원사업 기업 목록",
    steps: [
      {
        selector: '[data-sample-tour="business-list-sample-badge"]',
        title: "샘플 목록 상태",
        body: "지원사업 코드를 아직 선택하지 않은 상태라 예시 기업 목록을 보여줍니다. 실제 코드가 들어오면 행 클릭과 엑셀 다운로드가 실제 데이터 기준으로 동작합니다.",
      },
      {
        selector: '[data-sample-tour="business-list-table"]',
        title: "기업 목록 표",
        body: "지원사업 참여 기업을 비교하는 핵심 표입니다. 기업번호는 고정되고, 매출·고용·특허·지원금 같은 컬럼을 가로로 훑으며 비교할 수 있습니다.",
      },
      {
        selector: '[data-sample-tour="business-list-sort"]',
        title: "컬럼 정렬",
        body: "각 컬럼 헤더를 누르면 오름차순과 내림차순으로 정렬됩니다. 지원금, 매출, 고용처럼 비교 기준을 빠르게 바꿀 때 사용합니다.",
      },
      {
        selector: '[data-sample-tour="business-list-excel"]',
        title: "엑셀 다운로드",
        body: "실제 지원사업 코드가 선택된 뒤 기업 목록을 엑셀로 내려받는 버튼입니다. 샘플 상태에서는 코드 선택이 먼저 필요합니다.",
      },
    ],
  },
  "btp-solution": {
    label: "BTP 산업-인프라 솔루션",
    steps: [
      {
        selector: '[data-sample-tour="btp-solution-sample-badge"]',
        title: "샘플 산업 분석",
        body: "현재 산업은 화면 흐름을 설명하기 위한 예시입니다. 산업 검색을 통해 실제 산업을 선택하면 이 위치의 데이터가 실제 분석 결과로 바뀝니다.",
      },
      {
        selector: '[data-sample-tour="btp-solution-industry-status"]',
        title: "산업 현황",
        body: "부산 전체와 BTP 지원기업을 비교해 사업체 수, 종사자 수, 기업 유형, 규모 분포를 확인합니다. 산업의 기본 체력을 보는 영역입니다.",
      },
      {
        selector: '[data-sample-tour="btp-solution-infra-hubs"]',
        title: "공동활용 장비 허브",
        body: "선택 산업과 연결될 수 있는 BTP 인프라 거점을 보여줍니다. 허브를 선택하면 관련 장비와 시설 정보를 함께 살펴볼 수 있습니다.",
      },
      {
        selector: '[data-sample-tour="btp-solution-evidence"]',
        title: "연결 근거 기업",
        body: "기능 키워드가 실제 기업 데이터에서 어떻게 발견됐는지 확인하는 표입니다. 검색어를 바꿔 연결 근거의 폭을 좁혀볼 수 있습니다.",
      },
      {
        selector: '[data-sample-tour="btp-solution-matrix"]',
        title: "산업별 위치 비교",
        body: "종사자 증가율과 장비 연계 비율을 기준으로 선택 산업의 위치를 보여줍니다. 지원 필요성과 인프라 연결 수준을 함께 판단하는 차트입니다.",
      },
      {
        selector: '[data-sample-tour="btp-solution-related-notices"]',
        title: "관련 지원공고",
        body: "선택 산업과 연결된 지원사업 공고를 묶어 보여줍니다. 공고를 펼치면 연관 장비까지 이어서 검토할 수 있습니다.",
      },
    ],
  },
  "busan-rewind": {
    label: "부산 리와인드",
    steps: [
      {
        selector: '[data-sample-tour="busan-rewind-sample-badge"]',
        title: "샘플 산업 분석",
        body: "현재 화면은 API 연결 구조를 확인하기 위한 예시 데이터입니다. 산업 검색을 통해 선택한 코드는 나중에 각 부산 리와인드 API의 industryCode로 전달됩니다.",
      },
      {
        selector: '[data-sample-tour="busan-rewind-current-status"]',
        title: "현재 산업 현황",
        body: "current-status API가 연결될 영역입니다. 개인·법인 비중, 종사자 수, 규모별 비중, 구·군별 증감률을 함께 보여줍니다.",
      },
      {
        selector: '[data-sample-tour="busan-rewind-trend-briefing"]',
        title: "산업 트렌드 브리핑",
        body: "trend-briefing API가 연결될 영역입니다. 국내외 이슈, 성장률 추이, 부산 연관성, 요약 문구를 표시합니다.",
      },
      {
        selector: '[data-sample-tour="busan-rewind-similar-flow"]',
        title: "과거 유사 산업 흐름",
        body: "similar-flow API가 연결될 영역입니다. 유사 기간, 흐름 유형, 지수 시계열과 구간별 변화율을 보여줍니다.",
      },
      {
        selector: '[data-sample-tour="busan-rewind-past-support-review"]',
        title: "당시 지원사업 검토",
        body: "past-support-review API가 연결될 영역입니다. 과거 산업 변화, 당시 지원사업, 지원기업 변화를 같은 시기 관찰값으로 살펴봅니다.",
      },
      {
        selector: '[data-sample-tour="busan-rewind-support-comparison"]',
        title: "현재 지원사업 비교",
        body: "support-comparison API가 연결될 영역입니다. 과거와 현재의 공통·변경·신규 지원 분야와 트렌드 키워드를 비교합니다.",
      },
    ],
  },
};

const PADDING = 10;
const CARD_WIDTH = 340;
const GAP = 16;

const getRect = (element: Element | null): HighlightRect | null => {
  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();

  return {
    height: Math.min(window.innerHeight - 24, Math.max(44, rect.height + PADDING * 2)),
    left: Math.max(8, rect.left - PADDING),
    top: Math.max(8, rect.top - PADDING),
    width: Math.min(window.innerWidth - 24, Math.max(44, rect.width + PADDING * 2)),
  };
};

const SampleOnboarding = ({ variant }: SampleOnboardingProps) => {
  const content = tourContent[variant];
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const step = content.steps[stepIndex];
  const isLastStep = stepIndex === content.steps.length - 1;

  const progressPercent = useMemo(
    () => ((stepIndex + 1) / content.steps.length) * 100,
    [content.steps.length, stepIndex],
  );

  const openOverlay = () => {
    setStepIndex(0);
    setIsOpen(true);
  };

  const closeOverlay = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const target = document.querySelector(step.selector);
    target?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

    const updateRect = () => {
      setHighlightRect(getRect(document.querySelector(step.selector)));
    };

    const timers = [0, 120, 320].map((delay) => window.setTimeout(updateRect, delay));
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, step.selector]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeOverlay();
      }

      if (event.key === "ArrowLeft") {
        setStepIndex((current) => Math.max(0, current - 1));
      }

      if (event.key === "ArrowRight") {
        setStepIndex((current) => Math.min(content.steps.length - 1, current + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [content.steps.length, isOpen]);

  const fallbackRect: HighlightRect = {
    height: 120,
    left: Math.max(16, window.innerWidth / 2 - 180),
    top: Math.max(80, window.innerHeight / 2 - 100),
    width: 360,
  };
  const rect = highlightRect ?? fallbackRect;
  const canPlaceRight = rect.left + rect.width + GAP + CARD_WIDTH < window.innerWidth - 16;
  const cardLeft = canPlaceRight
    ? rect.left + rect.width + GAP
    : Math.max(16, Math.min(rect.left - CARD_WIDTH - GAP, window.innerWidth - CARD_WIDTH - 16));
  const cardTop = Math.max(16, Math.min(rect.top, window.innerHeight - 360));

  return (
    <>
      <span className="inline-flex items-center gap-2" data-sample-tour={`${variant}-sample-badge`}>
        <span className="inline-flex h-8 min-w-[92px] items-center justify-center rounded-full bg-[#d10000] px-5 text-base font-bold text-white">
          SAMPLE
        </span>
        <button
          aria-label={`${content.label} 샘플 안내 열기`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#cbd5e1] bg-white text-sm font-extrabold text-[#334155] shadow-sm transition hover:border-[#2b7fff] hover:text-[#2b7fff] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]"
          data-dashboard-print-exclude
          onClick={openOverlay}
          title="샘플 화면 안내 보기"
          type="button"
        >
          ?
        </button>
      </span>

      {isOpen && (
        <div aria-label={`${content.label} 샘플 온보딩`} className="fixed inset-0 z-[1000]" role="dialog">
          <div
            className="pointer-events-none fixed rounded-[10px] border-2 border-[#2b7fff] bg-transparent shadow-[0_0_0_9999px_rgba(15,23,42,0.62),0_12px_32px_rgba(43,127,255,0.28)] transition-all"
            style={{
              height: rect.height,
              left: rect.left,
              top: rect.top,
              width: rect.width,
            }}
          />

          <div
            className="fixed w-[min(340px,calc(100vw-32px))] rounded-[8px] border border-[#dbeafe] bg-white shadow-2xl"
            style={{ left: cardLeft, top: cardTop }}
          >
            <div className="border-b border-[#e2e8f0] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-[#d10000]">
                    {content.label} · {stepIndex + 1}/{content.steps.length}
                  </p>
                  <h2 className="mt-2 text-lg font-extrabold leading-6 text-[#0f172a]">
                    {step.title}
                  </h2>
                </div>
                <button
                  aria-label="온보딩 닫기"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e2e8f0] text-lg leading-none text-[#64748b] hover:border-[#94a3b8] hover:text-[#0f172a]"
                  onClick={closeOverlay}
                  type="button"
                >
                  x
                </button>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e2e8f0]">
                <div
                  className="h-full rounded-full bg-[#2b7fff] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm font-medium leading-6 text-[#334155]">{step.body}</p>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#e2e8f0] bg-[#f8fafc] px-5 py-4">
              <button
                className="inline-flex h-9 items-center justify-center rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-sm font-bold text-[#475569] hover:border-[#94a3b8] hover:text-[#0f172a]"
                onClick={closeOverlay}
                type="button"
              >
                그만 보기
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-9 items-center justify-center rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-sm font-bold text-[#475569] disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={stepIndex === 0}
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                  type="button"
                >
                  이전
                </button>
                <button
                  className="inline-flex h-9 items-center justify-center rounded-[7px] bg-[#2b7fff] px-4 text-sm font-bold text-white hover:bg-[#1d6fe8]"
                  onClick={() => {
                    if (isLastStep) {
                      closeOverlay();
                      return;
                    }
                    setStepIndex((current) => Math.min(content.steps.length - 1, current + 1));
                  }}
                  type="button"
                >
                  {isLastStep ? "완료" : "다음"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SampleOnboarding;
