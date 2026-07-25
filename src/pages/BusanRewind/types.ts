export type ApiDataResponse<T> = {
  data: T;
};

export type CountRatio = {
  count: number | null;
  ratio: number | null;
};

export type EmployeeSizeRatio = {
  label: string;
  ratio: number;
};

export type DistrictEmployeeGrowth = {
  districtName: string;
  growthRate: number | null;
  sggCode: string;
};

export type CurrentStatusData = {
  baseYear: number | null;
  corporation: CountRatio;
  districtEmployeeGrowths: DistrictEmployeeGrowth[];
  employeeCount: number | null;
  employeeGrowthRate: number | null;
  employeeSizeRatios: EmployeeSizeRatio[];
  individual: CountRatio;
  industryCode: string;
  industryName: string;
  previousYear: number | null;
};

export type CurrentSupportProgram = {
  dueDate: string | null;
  programId: number;
  status: string;
  summary: string;
  supportField: string;
  title: string;
};

export type CurrentSupportProgramsData = {
  industryCode: string;
  items: CurrentSupportProgram[];
};

export type GrowthPoint = {
  growthRate: number | null;
  year: number;
};

export type TrendBriefingData = {
  aiSummary: string;
  busanRelevance: {
    policyKeywords: string[];
    strategicIndustries: string[];
  };
  changeComparison: {
    demand: string;
    product: string;
    structure: string;
    technology: string;
  };
  domestic: {
    growthRate: number | null;
    issues: string[];
  };
  growthSeries: GrowthPoint[];
  industryCode: string;
  industryName: string;
  overseas: {
    issues: string[];
  };
  summarySource: "AI" | "RULE_BASED";
};

export type MatchedPeriod = {
  endYear: number;
  label: string;
  startYear: number;
} | null;

export type SimilarFlowPoint = {
  index: number;
  year: number;
};

export type PeriodHighlight = {
  changeRate: number | null;
  endYear: number;
  label: string;
  startYear: number;
};

export type SimilarFlowData = {
  flowType: string;
  industryCode: string;
  matchedPeriod: MatchedPeriod;
  periodHighlights: PeriodHighlight[];
  series: SimilarFlowPoint[];
  summary: string;
};

export type IndustryChange = {
  changeRate: number | null;
  label: string;
};

export type PastSupportProgram = {
  programId: number | null;
  purpose: string;
  supportAmountThousandKrw: number | null;
  supportContent: string;
  supportField: string;
  target: string;
  title: string;
  year: number;
};

export type SupportedCompanyChange = {
  activityChange: string | null;
  companyId: number;
  companyName: string;
  employeeAfter: number | null;
  employeeBefore: number | null;
  rndChange: string | null;
  salesAfterAmount: number | null;
  salesBeforeAmount: number | null;
  supportYear: number | null;
};

export type PastSupportReviewData = {
  industryChangeSummary: string;
  industryChanges: IndustryChange[];
  industryCode: string;
  matchedPeriod: MatchedPeriod;
  pastSupportPrograms: PastSupportProgram[];
  supportedCompanyChanges: SupportedCompanyChange[];
};

export type ChangedField = {
  from: string;
  to: string;
};

export type SupportComparisonData = {
  aiSummary: string;
  changedFields: ChangedField[];
  commonFields: string[];
  currentFields: string[];
  industryCode: string;
  newFields: string[];
  pastFields: string[];
  trendKeywords: string[];
};

export type BusanRewindData = {
  currentStatus: CurrentStatusData;
  currentSupportPrograms: CurrentSupportProgramsData;
  pastSupportReview: PastSupportReviewData;
  similarFlow: SimilarFlowData;
  supportComparison: SupportComparisonData;
  trendBriefing: TrendBriefingData;
};

export type BusanRewindApiKey = keyof BusanRewindData;
