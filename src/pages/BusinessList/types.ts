export type SupportProgramPeriod = {
  startDate: string | null;
  endDate: string | null;
};

export type SupportProgramSaveRequest = {
  code: string;
  programYear: number | "";
  budgetProgramName: string;
  programCategory: string;
  supportType: string;
  period: SupportProgramPeriod;
  departmentName: string;
  localGovernmentName: string;
  programSummary: string;
};
