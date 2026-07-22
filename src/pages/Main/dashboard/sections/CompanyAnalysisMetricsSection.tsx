import { useEffect, useMemo, useState } from "react";
import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";

type ComputedMetricItem = {
  code: string;
  label: string;
  value: number | null;
  unit: string;
};

type ComputedMetricsResponse = {
  metrics: ComputedMetricItem[];
};

const metricOrder = [
  "DEBT_RATIO",
  "COST_OF_SALES_RATIO",
  "SALES_GROWTH",
  "EMPLOYMENT_GROWTH",
  "GOVERNMENT_RD_DEPENDENCY",
  "SUPPORTED_COMPANY_SALES_CHANGE_RATE",
  "EMPLOYMENT_DIVERGENCE_INDEX",
  "EMPLOYMENT_TURNOVER_RATE",
] as const;

const sampleMetrics: ComputedMetricItem[] = [
  { code: "DEBT_RATIO", label: "부채 비율", unit: "PERCENT", value: 123.45 },
  { code: "COST_OF_SALES_RATIO", label: "매출 원가율", unit: "PERCENT", value: 54.32 },
  { code: "SALES_GROWTH", label: "매출 성장률", unit: "PERCENT", value: 12.34 },
  { code: "EMPLOYMENT_GROWTH", label: "고용 성장률", unit: "PERCENT", value: 8.76 },
  { code: "GOVERNMENT_RD_DEPENDENCY", label: "정부 R&D 의존도", unit: "PERCENT", value: 45.67 },
  {
    code: "SUPPORTED_COMPANY_SALES_CHANGE_RATE",
    label: "지원기업 매출 변화율",
    unit: "PERCENT",
    value: 6.54,
  },
  { code: "EMPLOYMENT_DIVERGENCE_INDEX", label: "고용 괴리 지수", unit: "PERCENT_POINT", value: 21.09 },
  { code: "EMPLOYMENT_TURNOVER_RATE", label: "고용 회전율", unit: "PERCENT", value: 3.21 },
];

const metricOrderIndex = new Map<string, number>(metricOrder.map((code, index) => [code, index]));

const formatMetricValue = (metric: ComputedMetricItem) => {
  if (metric.value === null || metric.value === undefined) {
    return "-%";
  }

  const value = Number.isInteger(metric.value) ? metric.value.toFixed(0) : metric.value.toFixed(2);

  if (metric.unit === "PERCENT" || metric.unit === "PERCENT_POINT") {
    return `${value}%`;
  }

  return value;
};

const AnimatedMetricValue = ({ metric }: { metric: ComputedMetricItem }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const decimalPlaces = useMemo(() => {
    if (metric.value === null || metric.value === undefined || Number.isInteger(metric.value)) {
      return 0;
    }

    return 2;
  }, [metric.value]);

  useEffect(() => {
    if (metric.value === null || metric.value === undefined) {
      return;
    }

    const animationDuration = 700;
    const startTime = performance.now();
    let animationFrame = 0;

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / animationDuration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;

      setDisplayValue(metric.value! * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [metric.value]);

  if (metric.value === null || metric.value === undefined) {
    return <>{formatMetricValue(metric)}</>;
  }

  const value = decimalPlaces === 0 ? displayValue.toFixed(0) : displayValue.toFixed(decimalPlaces);
  const suffix = metric.unit === "PERCENT" || metric.unit === "PERCENT_POINT" ? "%" : "";

  return (
    <>
      {value}
      {suffix}
    </>
  );
};

const sortMetrics = (metrics: ComputedMetricItem[]) =>
  metrics
    .slice()
    .sort(
      (firstMetric, secondMetric) =>
        (metricOrderIndex.get(firstMetric.code) ?? Number.MAX_SAFE_INTEGER) -
        (metricOrderIndex.get(secondMetric.code) ?? Number.MAX_SAFE_INTEGER),
    );

const MetricCard = ({ metric }: { metric: ComputedMetricItem }) => (
  <article className="h-[124px] rounded-[10px] border border-transparent bg-[#f8f9fb] px-[30px] pt-[30px] transition duration-200 hover:-translate-y-0.5 hover:border-[#cfe5ff] hover:bg-[#f8fbff] hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
    <h3 className="truncate whitespace-nowrap text-[17px] font-medium leading-[22px] text-[#555]">
      {metric.label}
    </h3>
    <p className="mt-[9px] text-[28px] font-medium leading-[34px] text-[#333]">
      <AnimatedMetricValue metric={metric} />
    </p>
  </article>
);

const CompanyAnalysisMetricsSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const { data, error, isLoading } = useDashboardGetData<ComputedMetricsResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/computed-metrics",
  );
  const metrics = sortMetrics(isSample ? sampleMetrics : data?.metrics ?? []);

  if (error) {
    return (
      <div className="rounded-[10px] bg-gray-50 px-7 py-6 text-sm font-medium text-red-600">
        기업 분석 지표를 불러오지 못했습니다.
      </div>
    );
  }

  if (isLoading && metrics.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-5">
        {metricOrder.map((code) => (
          <div className="dashboard-skeleton h-[124px] rounded-[10px]" key={code} />
        ))}
      </div>
    );
  }

  if (metrics.length === 0) {
    return <p className="text-sm text-[#666]">표시할 기업 분석 지표가 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-5">
      {metrics.map((metric) => (
        <MetricCard key={metric.code} metric={metric} />
      ))}
    </div>
  );
};

export default CompanyAnalysisMetricsSection;
