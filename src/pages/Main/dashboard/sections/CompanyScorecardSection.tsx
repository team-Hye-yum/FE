import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { DashboardCompanyProps, DashboardSectionId } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";

type DisplayMoneyValue = {
  displayText: string | null;
  value: number | null;
};

type DisplayNumericValue = {
  displayText: string | null;
  value: number | null;
};

type BadgeItem = {
  code: string | null;
  label: string | null;
};

type FinancialCard = {
  operatingMargin: DisplayNumericValue | null;
  salesAmount: DisplayMoneyValue | null;
  salesYear: number | null;
  salesYoYGrowthRate: DisplayNumericValue | null;
};

type EmploymentCard = {
  employeeCount: number | null;
  employeeYear: number | null;
  employeeYoYChange: number | null;
};

type CertificationsIpCard = {
  activeRegisteredPatentCount: number | null;
  certificationBadges: BadgeItem[];
};

type ResearchActivityCard = {
  busanAxDx: {
    badgeVisible: boolean;
    displayText: string | null;
    evidenceCount: number;
  } | null;
  ntisDisplayText: string | null;
  ntisLeadProjectCount: number | null;
};

type ScorecardSummaryResponse = {
  certificationsIp: CertificationsIpCard | null;
  employment: EmploymentCard | null;
  financial: FinancialCard | null;
  researchActivity: ResearchActivityCard | null;
};

type EvidenceItem = {
  displayText: string | null;
  matchedKeyword: string | null;
  originalText: string | null;
  selectionResult: string | null;
  sourceType: string | null;
  supportYear: number | null;
};

type EvidenceGroup = {
  evidenceType: string | null;
  items: EvidenceItem[];
  label: string | null;
};

type BusanAxDxEvidenceResponse = {
  badgeVisible: boolean;
  emptyMessage: string | null;
  evidenceCount: number;
  evidenceGroups: EvidenceGroup[];
};

const sampleSummary: ScorecardSummaryResponse = {
  certificationsIp: {
    activeRegisteredPatentCount: 27,
    certificationBadges: [
      { code: "INNOBIZ", label: "이노비즈" },
      { code: "MAINBIZ", label: "메인비즈" },
      { code: "VENTURE", label: "벤처기업" },
      { code: "VENTURE", label: "벤처기업" },
      { code: "VENTURE", label: "벤처기업" },
      { code: "VENTURE", label: "벤처기업" },
    ],
  },
  employment: {
    employeeCount: 9,
    employeeYear: 2024,
    employeeYoYChange: -1,
  },
  financial: {
    operatingMargin: {
      displayText: "영업이익률 7.4%",
      value: 7.4,
    },
    salesAmount: {
      displayText: "14.8억원",
      value: 1_480_000,
    },
    salesYear: 2024,
    salesYoYGrowthRate: {
      displayText: "전년 대비 -12.1%",
      value: -12.1,
    },
  },
  researchActivity: {
    busanAxDx: {
      badgeVisible: true,
      displayText: "관련 근거 2건",
      evidenceCount: 2,
    },
    ntisDisplayText: "NTIS 주관 과제 7건",
    ntisLeadProjectCount: 7,
  },
};

const sampleEvidence: BusanAxDxEvidenceResponse = {
  badgeVisible: true,
  emptyMessage: null,
  evidenceCount: 2,
  evidenceGroups: [
    {
      evidenceType: "EXECUTION_HISTORY",
      label: "실행 이력",
      items: [
        {
          displayText: "2024 지역기업성장사다리지원사업 선정",
          matchedKeyword: "디지털",
          originalText: "고액분리기 고정밀 고강성 여과망 개발",
          selectionResult: "선정",
          sourceType: "BTP 지원 이력",
          supportYear: 2024,
        },
      ],
    },
    {
      evidenceType: "RELATED_INDUSTRY_TECH",
      label: "연관 산업·기술",
      items: [
        {
          displayText: "주요 제품 및 과제명에서 자동화·디지털 전환 관련 키워드 확인",
          matchedKeyword: "자동화",
          originalText: "샘플 자동화 설비 및 데이터 기반 품질 관리",
          selectionResult: null,
          sourceType: "기업/NTIS 정보",
          supportYear: null,
        },
      ],
    },
  ],
};

const scrollToSection = (sectionId: DashboardSectionId) => {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const formatCount = (value: number | null | undefined, unit = "건") =>
  value === null || value === undefined ? `0${unit}` : `${value.toLocaleString()}${unit}`;

const trendColorClass = (value: number | null | undefined) => {
  if (value === null || value === undefined || value === 0) {
    return "text-[#666]";
  }

  return value > 0 ? "text-[#e60012]" : "text-[#2b7fff]";
};

const trendPrefix = (value: number | null | undefined) => {
  if (value === null || value === undefined || value === 0) {
    return "";
  }

  return value > 0 ? "▲ +" : "▼ ";
};

const formatEmployeeChange = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "전년 대비 데이터 없음";
  }

  if (value === 0) {
    return "전년 대비 변동 없음";
  }

  return `전년 대비 ${trendPrefix(value)}${Math.abs(value)}명`;
};

const formatSalesAmount = (value: number) => {
  const eokValue = value / 100000;
  const fixedValue = Number.isInteger(eokValue) ? eokValue.toFixed(0) : eokValue.toFixed(1);

  return `${fixedValue}억원`;
};

const AnimatedNumber = ({
  fallback,
  formatter,
  value,
}: {
  fallback: string;
  formatter: (value: number) => string;
  value: number | null | undefined;
}) => {
  const [displayValue, setDisplayValue] = useState(value ?? 0);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (value === null || value === undefined) {
      hasAnimatedRef.current = false;
      setDisplayValue(0);
      return undefined;
    }

    hasAnimatedRef.current = false;
    setDisplayValue(0);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isPrintMode = window.matchMedia("print").matches;

    if (prefersReducedMotion || isPrintMode) {
      hasAnimatedRef.current = true;
      setDisplayValue(value);
      return undefined;
    }

    const finishForPrint = () => {
      hasAnimatedRef.current = true;
      setDisplayValue(value);
    };

    window.addEventListener("beforeprint", finishForPrint);

    const startAnimation = () => {
      if (hasAnimatedRef.current) {
        return;
      }

      hasAnimatedRef.current = true;
      const duration = 780;
      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        setDisplayValue(value * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(tick);
          return;
        }

        setDisplayValue(value);
      };

      requestAnimationFrame(tick);
    };

    const element = elementRef.current;

    if (!element || !("IntersectionObserver" in window)) {
      startAnimation();
      return () => window.removeEventListener("beforeprint", finishForPrint);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          startAnimation();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      window.removeEventListener("beforeprint", finishForPrint);
    };
  }, [value]);

  if (value === null || value === undefined) {
    return <span>{fallback}</span>;
  }

  return <span ref={elementRef}>{formatter(displayValue)}</span>;
};

const ScorecardCard = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className="rounded-[10px] border border-[#8ec5ff] bg-white text-left transition hover:bg-[#f8fbff] focus:outline-none focus:ring-2 focus:ring-[#8ec5ff]"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      style={{ minHeight: 142, padding: "18px 22px" }}
      tabIndex={0}
    >
      {children}
    </article>
  );
};

const CardTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-base font-medium leading-[22px] text-[#555]">{children}</h3>
);

const CardValue = ({ children }: { children: ReactNode }) => (
  <p className="text-[24px] font-medium leading-[30px] text-[#333]" style={{ marginTop: 16 }}>
    {children}
  </p>
);

const Divider = () => <div className="h-px bg-[#eee]" style={{ margin: "12px 0" }} />;

const Badge = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      alignItems: "center",
      backgroundColor: "#dbeafe",
      borderRadius: 999,
      color: "#2b7fff",
      display: "inline-flex",
      fontSize: 13,
      fontWeight: 500,
      height: 30,
      justifyContent: "center",
      lineHeight: 1,
      minWidth: 92,
      padding: "0 16px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const EvidenceStatus = ({ count }: { count: number }) => {
  if (count <= 0) {
    return (
      <span className="inline-flex text-sm font-medium text-[#999]" style={{ marginTop: 12 }}>
        근거 없음
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#333] transition group-hover:text-[#2b7fff]"
      style={{ marginTop: 12 }}
    >
      {formatCount(count)} 조회
      <span aria-hidden="true" className="text-[18px] font-light leading-none text-[#999]">
        ›
      </span>
    </span>
  );
};

const EvidenceArea = ({
  count,
  onOpen,
}: {
  count: number;
  onOpen: () => void;
}) => {
  const isClickable = count > 0;
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (isClickable) {
      onOpen();
    }
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (isClickable && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      className={`group -mx-2 -mb-2 rounded-[8px] px-2 pb-2 pt-1 ${
        isClickable ? "cursor-pointer hover:bg-[#f8fbff]" : "cursor-default"
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <p className="text-sm font-medium text-[#666]">확인된 디지털 전환 관련 근거</p>
      <EvidenceStatus count={count} />
    </div>
  );
};

const EvidenceModal = ({
  evidence,
  onClose,
}: {
  evidence: BusanAxDxEvidenceResponse | null;
  onClose: () => void;
}) => (
  <div
    style={{
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.32)",
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      left: 0,
      padding: "40px 24px",
      position: "fixed",
      right: 0,
      top: 70,
      zIndex: 40,
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
        boxSizing: "border-box",
        maxHeight: "calc(100vh - 130px)",
        maxWidth: 620,
        overflow: "hidden",
        padding: 24,
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "flex-start",
          borderBottom: "1px solid #eee",
          display: "flex",
          gap: 16,
          justifyContent: "space-between",
          marginBottom: 18,
          paddingBottom: 16,
        }}
      >
        <div>
          <h3 className="text-xl font-medium leading-[26px] text-[#333]">
            디지털 전환 관련 근거
          </h3>
          <p className="mt-2 text-sm text-[#666]">
            총 {formatCount(evidence?.evidenceCount ?? 0)}의 근거를 확인했습니다.
          </p>
        </div>
        <button
          className="flex shrink-0 items-center justify-center rounded-full border border-[#ddd] leading-none text-[#555] hover:bg-gray-50"
          onClick={onClose}
          style={{ fontSize: 18, height: 34, width: 34 }}
          type="button"
        >
          ×
        </button>
      </div>

      <div style={{ maxHeight: "calc(100vh - 260px)", overflow: "auto", paddingRight: 2 }}>
        {evidence?.evidenceGroups.length ? (
          evidence.evidenceGroups.map((group, groupIndex) => (
            <section
              className="overflow-hidden rounded-[10px] border border-[#eee] bg-white"
              key={`${group.label}-${groupIndex}`}
              style={{ marginBottom: 12 }}
            >
              <h4 className="bg-[#f8f9fb] px-4 py-3 text-sm font-medium text-[#333]">
                {group.label || "근거"}
              </h4>
              <div className="divide-y divide-[#f1f1f1]">
                {group.items.map((item, itemIndex) => (
                  <article key={`${item.displayText}-${itemIndex}`} style={{ padding: "14px 16px" }}>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-[22px] items-center rounded-full bg-[#eef7ff] px-2.5 text-xs font-medium text-[#2b7fff]">
                        {item.sourceType || "출처 미상"}
                      </span>
                      <span className="text-xs font-medium text-[#999]">
                        {item.supportYear ? `${item.supportYear}년` : "연도 없음"}
                      </span>
                      {item.selectionResult && (
                        <span className="text-xs font-medium text-[#999]">{item.selectionResult}</span>
                      )}
                    </div>
                    <p className="text-sm leading-[21px] text-[#333]">
                      {item.displayText || item.originalText || "-"}
                    </p>
                    {item.originalText && item.originalText !== item.displayText && (
                      <p className="mt-1 text-xs leading-[18px] text-[#888]">{item.originalText}</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="rounded-[10px] border border-[#eee] px-5 py-10 text-center text-sm text-[#666]">
            {evidence?.emptyMessage || "확인된 디지털 전환 관련 근거가 없습니다."}
          </div>
        )}
      </div>
    </div>
  </div>
);

const CompanyScorecardSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const summaryState = useDashboardGetData<ScorecardSummaryResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/scorecard/summary",
  );
  const evidenceState = useDashboardGetData<BusanAxDxEvidenceResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/scorecard/busan-axdx-evidence",
  );

  const summary = isSample ? sampleSummary : summaryState.data;
  const evidence = isSample ? sampleEvidence : evidenceState.data;

  if (summaryState.error || evidenceState.error) {
    return (
      <div className="rounded-[10px] border border-[#eee] bg-white px-7 py-6 text-sm font-medium text-red-600">
        기업 종합 스코어카드 정보를 불러오지 못했습니다.
      </div>
    );
  }

  if (summaryState.isLoading && !summary) {
    return (
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
        {[0, 1, 2, 3].map((item) => (
          <div className="h-[142px] animate-pulse rounded-[10px] border border-[#d7ebff] bg-white" key={item} />
        ))}
      </div>
    );
  }

  const financial = summary?.financial;
  const employment = summary?.employment;
  const certificationsIp = summary?.certificationsIp;
  const researchActivity = summary?.researchActivity;
  const salesGrowthValue = financial?.salesYoYGrowthRate?.value;
  const employeeChange = employment?.employeeYoYChange;
  const evidenceCount = researchActivity?.busanAxDx?.evidenceCount ?? evidence?.evidenceCount ?? 0;

  return (
    <>
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
        <ScorecardCard onClick={() => scrollToSection("income-statement")}>
          <CardTitle>재무</CardTitle>
          <CardValue>
            <AnimatedNumber
              fallback={financial?.salesAmount?.displayText || "데이터 없음"}
              formatter={formatSalesAmount}
              value={financial?.salesAmount?.value}
            />
          </CardValue>
          <p className="mt-1.5 text-sm font-medium text-[#666]">
            {financial?.salesYear ? `${financial.salesYear}년 매출액 기준` : "매출액 기준"}
          </p>
          <Divider />
          <div className="flex flex-wrap text-sm font-medium text-[#666]">
            <span style={{ marginBottom: 6, marginRight: 24 }}>
              전년 대비{" "}
              <span className={trendColorClass(salesGrowthValue)}>
                {salesGrowthValue === null || salesGrowthValue === undefined
                  ? "데이터 없음"
                  : `${trendPrefix(salesGrowthValue)}${Math.abs(salesGrowthValue).toFixed(1)}%`}
              </span>
            </span>
            <span style={{ marginBottom: 6 }}>
              {financial?.operatingMargin?.displayText || "영업이익률 데이터 없음"}
            </span>
          </div>
        </ScorecardCard>

        <ScorecardCard onClick={() => scrollToSection("employment")}>
          <CardTitle>고용</CardTitle>
          <CardValue>
            <AnimatedNumber
              fallback="데이터 없음"
              formatter={(value) => `${Math.round(value).toLocaleString()}명`}
              value={employment?.employeeCount}
            />
          </CardValue>
          <p className="mt-1.5 text-sm font-medium text-[#666]">
            {employment?.employeeYear ? `${employment.employeeYear}년 종업원수 기준` : "종업원수 기준"}
          </p>
          <Divider />
          <div className="flex flex-wrap text-sm font-medium text-[#666]">
            <span className={trendColorClass(employeeChange)} style={{ marginBottom: 6, marginRight: 24 }}>
              {formatEmployeeChange(employeeChange)}
            </span>
          </div>
        </ScorecardCard>

        <ScorecardCard onClick={() => scrollToSection("ip-rights")}>
          <CardTitle>특허·인증</CardTitle>
          <CardValue>
            <AnimatedNumber
              fallback={formatCount(certificationsIp?.activeRegisteredPatentCount)}
              formatter={(value) => formatCount(Math.round(value))}
              value={certificationsIp?.activeRegisteredPatentCount}
            />
          </CardValue>
          <p className="mt-1.5 text-sm font-medium text-[#666]">유효 등록 특허 건수</p>
          <Divider />
          <div className="flex flex-wrap" style={{ columnGap: 12, rowGap: 10 }}>
            {certificationsIp?.certificationBadges.length ? (
              certificationsIp.certificationBadges.map((badge, index) => (
                <Badge key={`${badge.code}-${badge.label}-${index}`}>{badge.label || badge.code}</Badge>
              ))
            ) : (
              <span className="text-sm font-medium text-[#999]">표시할 인증 정보가 없습니다.</span>
            )}
          </div>
        </ScorecardCard>

        <ScorecardCard onClick={() => scrollToSection("rnd")}>
          <CardTitle>연구·활동</CardTitle>
          <CardValue>
            <AnimatedNumber
              fallback={formatCount(researchActivity?.ntisLeadProjectCount)}
              formatter={(value) => formatCount(Math.round(value))}
              value={researchActivity?.ntisLeadProjectCount}
            />
          </CardValue>
          <p className="mt-1.5 text-sm font-medium text-[#666]">
            NTIS(주관) 과제 수와 NTIS(위탁) 과제 수 합계
          </p>
          <Divider />
          <EvidenceArea count={evidenceCount} onOpen={() => setIsEvidenceModalOpen(true)} />
        </ScorecardCard>
      </div>

      {isEvidenceModalOpen && evidenceCount > 0 && (
        <EvidenceModal evidence={evidence} onClose={() => setIsEvidenceModalOpen(false)} />
      )}
    </>
  );
};

export default CompanyScorecardSection;
