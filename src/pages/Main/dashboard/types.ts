export type DashboardSectionId =
  | "company-info"
  | "scorecard"
  | "employment"
  | "income-statement"
  | "financial-status"
  | "ip-rights"
  | "rnd"
  | "analysis-metrics"
  | "ai-review"
  | "growth-scenario"
  | "duplicate-support"
  | "ai-report";

export type DashboardFilterableSectionId = Exclude<DashboardSectionId, "company-info">;

export type DashboardSectionConfig = {
  id: DashboardFilterableSectionId;
  label: string;
  visible: boolean;
};

export type DashboardCompanyProps = {
  companyId: string;
  isSample?: boolean;
};

export type AiReviewOpinionResponse = {
  display: boolean;
  budgetMismatchLine: string | null;
  employmentCarouselLine: string | null;
};
