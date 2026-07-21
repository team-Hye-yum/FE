import type { DashboardSectionConfig } from "../types";

export const dashboardSections = [
  { id: "scorecard", label: "기업 종합 스코어카드", visible: true },
  { id: "employment", label: "고용 정보", visible: true },
  { id: "income-statement", label: "손익계산", visible: true },
  { id: "financial-status", label: "재무상태", visible: true },
  { id: "ip-rights", label: "지적재산권", visible: true },
  { id: "rnd", label: "연구·개발 현황", visible: true },
  { id: "analysis-metrics", label: "기업 분석 지표", visible: true },
  { id: "ai-review", label: "AI 검토 의견", visible: true },
  { id: "growth-scenario", label: "기업 성장 시나리오", visible: true },
  { id: "duplicate-support", label: "중복지원 검토 필터", visible: true },
  { id: "ai-report", label: "AI 분석 리포트", visible: true },
] as const satisfies readonly DashboardSectionConfig[];
