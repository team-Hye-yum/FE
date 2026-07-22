import { useSearchParams } from "react-router-dom";
import DashboardHeader from "./components/DashboardHeader";
import DashboardSection from "./components/DashboardSection";
import DashboardShell from "./components/DashboardShell";
import { dashboardSections } from "./constants/dashboardSections";
import { useDashboardPanelConfig } from "./hooks/useDashboardPanelConfig";
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

const sectionComponents = {
  scorecard: CompanyScorecardSection,
  employment: EmploymentInfoSection,
  "income-statement": IncomeStatementSection,
  "financial-status": FinancialStatusSection,
  "ip-rights": IntellectualPropertySection,
  rnd: ResearchDevelopmentSection,
  "analysis-metrics": CompanyAnalysisMetricsSection,
  "ai-review": AiReviewOpinionSection,
  "growth-scenario": GrowthScenarioSection,
  "duplicate-support": DuplicateSupportReviewSection,
  "ai-report": AiAnalysisReportSection,
} as const;

const CompanyDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const { orderedSections, reorderSection, resetPanelConfig, toggleSectionVisibility } =
    useDashboardPanelConfig(dashboardSections);
  const scrollToSection = useScrollToSection();
  const visibleSections = orderedSections.filter((section) => section.visible);
  const searchedCompanyId = searchParams.get("companyId")?.trim() ?? "";
  const isSample = !searchedCompanyId;
  const companyId = searchedCompanyId || "SAMPLE-001";
  const requestCompanyId = isSample ? "" : companyId;

  return (
    <DashboardShell
      filterSections={orderedSections}
      navigationSections={visibleSections}
      onReorderSection={reorderSection}
      onResetPanelConfig={resetPanelConfig}
      onSectionClick={scrollToSection}
      onToggleSectionVisibility={toggleSectionVisibility}
    >
      <DashboardHeader companyId={companyId} isSample={isSample} />
      <CompanyInfoSection companyId={companyId} isSample={isSample} />
      {visibleSections.map((section) => {
        const SectionContent = sectionComponents[section.id];

        if (section.id === "ai-review") {
          return <SectionContent companyId={requestCompanyId} isSample={isSample} key={section.id} />;
        }

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
