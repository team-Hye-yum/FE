import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showAppAlert } from "@/components/AppAlert";
import DashboardHeader from "./components/DashboardHeader";
import DashboardSection from "./components/DashboardSection";
import DashboardShell from "./components/DashboardShell";
import { dashboardSections } from "./constants/dashboardSections";
import { useDashboardChainPostData } from "./hooks/useDashboardApi";
import { useDashboardPanelConfig } from "./hooks/useDashboardPanelConfig";
import { useSectionScrollSpy } from "./hooks/useSectionScrollSpy";
import { useScrollToSection } from "./hooks/useScrollToSection";
import AiAnalysisReportSection from "./sections/AiAnalysisReportSection";
import AiReviewOpinionSection from "./sections/AiReviewOpinionSection";
import CompanyAnalysisMetricsSection from "./sections/CompanyAnalysisMetricsSection";
import CompanyInfoSection from "./sections/CompanyInfoSection";
import CompanyScorecardSection from "./sections/CompanyScorecardSection";
import DuplicateSupportReviewSection from "./sections/DuplicateSupportReviewSection";
import EmploymentInfoSection from "./sections/EmploymentInfoSection";
import FinancialStatusSection from "./sections/FinancialStatusSection";
import GrowthScenarioSection from "./sections/GrowthScenarioSection";
import IncomeStatementSection from "./sections/IncomeStatementSection";
import IntellectualPropertySection from "./sections/IntellectualPropertySection";
import ResearchDevelopmentSection from "./sections/ResearchDevelopmentSection";
import type { AiReviewOpinionResponse } from "./types";

const apiUrl = (path: string) => {
  const baseUrl = import.meta.env.API_URL || import.meta.env.VITE_API_URL || "/api";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const invalidUrlParamError = "invalid-url-param";

const sectionComponents = {
  scorecard: CompanyScorecardSection,
  employment: EmploymentInfoSection,
  "income-statement": IncomeStatementSection,
  "financial-status": FinancialStatusSection,
  "ip-rights": IntellectualPropertySection,
  rnd: ResearchDevelopmentSection,
  "analysis-metrics": CompanyAnalysisMetricsSection,
  "growth-scenario": GrowthScenarioSection,
  "duplicate-support": DuplicateSupportReviewSection,
  "ai-report": AiAnalysisReportSection,
} as const;

const CompanyDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invalidCompanyAlertedRef = useRef("");
  const { orderedSections, reorderSection, resetPanelConfig, toggleSectionVisibility } =
    useDashboardPanelConfig(dashboardSections);
  const scrollToSection = useScrollToSection();
  const searchedCompanyId = searchParams.get("companyId")?.trim() ?? "";
  const isSample = !searchedCompanyId;
  const companyId = searchedCompanyId || "SAMPLE-001";
  const requestCompanyId = isSample ? "" : companyId;
  const aiReviewState = useDashboardChainPostData<AiReviewOpinionResponse>(
    requestCompanyId,
    "/companies/{companyId}/ai-review/payload",
    "/review/opinions",
  );
  const shouldShowAiReviewSection =
    isSample ||
    aiReviewState.isLoading ||
    Boolean(aiReviewState.error) ||
    aiReviewState.data?.display !== false;
  const displayableSections = orderedSections.filter(
    (section) => section.id !== "ai-review" || shouldShowAiReviewSection,
  );
  const visibleDisplayableSections = displayableSections.filter((section) => section.visible);
  const { activeSectionId } = useSectionScrollSpy([
    "company-info",
    ...visibleDisplayableSections.map((section) => section.id),
  ]);

  useEffect(() => {
    if (!searchedCompanyId) {
      invalidCompanyAlertedRef.current = "";
      return;
    }

    const abortController = new AbortController();

    fetch(apiUrl(`/companies/${encodeURIComponent(searchedCompanyId)}/profile`), {
      signal: abortController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 400 || response.status === 404) {
            throw new Error(invalidUrlParamError);
          }

          throw new Error(`company-validation-failed-${response.status}`);
        }

        invalidCompanyAlertedRef.current = "";
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        console.error("Failed to validate company URL parameter.", error);

        if (!(error instanceof Error) || error.message !== invalidUrlParamError) {
          return;
        }

        if (invalidCompanyAlertedRef.current !== searchedCompanyId) {
          invalidCompanyAlertedRef.current = searchedCompanyId;
          showAppAlert("잘못된 기업 URL입니다. 기본 화면으로 이동합니다.");
        }

        navigate("/", { replace: true });
      });

    return () => {
      abortController.abort();
    };
  }, [navigate, searchedCompanyId]);

  useEffect(() => {
    const resizeTimers = [100, 350, 700].map((delay) =>
      window.setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, delay),
    );

    return () => {
      resizeTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isSample, visibleDisplayableSections.length]);

  return (
    <DashboardShell
      activeSectionId={activeSectionId}
      filterSections={displayableSections}
      navigationSections={visibleDisplayableSections}
      onReorderSection={reorderSection}
      onResetPanelConfig={resetPanelConfig}
      onSectionClick={scrollToSection}
      onToggleSectionVisibility={toggleSectionVisibility}
    >
      <DashboardHeader companyId={companyId} isSample={isSample} />
      <CompanyInfoSection companyId={companyId} isSample={isSample} />
      {visibleDisplayableSections.map((section) => {
        if (section.id === "ai-review") {
          return (
            <DashboardSection id={section.id} key={section.id} title={section.label}>
              <AiReviewOpinionSection
                data={aiReviewState.data}
                error={aiReviewState.error}
                isLoading={aiReviewState.isLoading}
                isSample={isSample}
              />
            </DashboardSection>
          );
        }

        const SectionContent = sectionComponents[section.id];

        return (
          <DashboardSection id={section.id} key={section.id} title={section.label}>
            <SectionContent companyId={requestCompanyId} isSample={isSample} />
          </DashboardSection>
        );
      })}
    </DashboardShell>
  );
};

export default CompanyDashboardPage;
