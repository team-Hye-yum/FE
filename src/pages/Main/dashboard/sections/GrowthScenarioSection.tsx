import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";

type GrowthLineCode =
  | "COMPANY_ACTUAL"
  | "COMPANY_REFERENCE"
  | "INDUSTRY_ACTUAL"
  | "INDUSTRY_REFERENCE";

type GrowthPoint = {
  year: number;
  index: number | null;
};

type GrowthChartLine = {
  code: GrowthLineCode | string;
  points: GrowthPoint[];
};

type MetricsAtMarker = {
  researchAndDevelopmentExpense: number | null;
  operatingProfitMargin: number | null;
  employeeCount: number | null;
};

type SupportMarker = {
  supportHistoryId: number;
  programName: string | null;
  programType: string | null;
  supportAmount: number | null;
  supportAmountUnit: string | null;
  markerYear: number | null;
  markerMonth: number | null;
  metricsAtMarker: MetricsAtMarker | null;
};

type ObservedFlowDirection = {
  fromYear: number;
  toYear: number;
  direction: "UP" | "DOWN" | "FLAT" | "NO_DATA" | string;
};

type ObservedFlowRow = {
  code: string;
  directions: ObservedFlowDirection[];
};

type ObservedFlow = {
  periods: Array<{ fromYear: number; toYear: number }>;
  rows: ObservedFlowRow[];
};

type GrowthScenarioResponse = {
  companyId: number;
  chartLines: GrowthChartLine[];
  supportMarkers: SupportMarker[];
  observedFlow: ObservedFlow;
};

type ChartRow = {
  year: number;
  companyActual?: number | null;
  companyReference?: number | null;
  industryActual?: number | null;
  industryReference?: number | null;
  supportIndex?: number | null;
  supportCount?: number;
  supportMarkers?: SupportMarker[];
};

const sampleGrowthScenario: GrowthScenarioResponse = {
  companyId: 0,
  chartLines: [
    {
      code: "COMPANY_ACTUAL",
      points: [
        { year: 2021, index: 100 },
        { year: 2022, index: 95 },
        { year: 2023, index: 110 },
      ],
    },
    {
      code: "COMPANY_REFERENCE",
      points: [
        { year: 2023, index: 110 },
        { year: 2024, index: 108 },
        { year: 2025, index: 113 },
      ],
    },
    {
      code: "INDUSTRY_ACTUAL",
      points: [
        { year: 2021, index: 100 },
        { year: 2022, index: 114 },
        { year: 2023, index: 122 },
      ],
    },
    {
      code: "INDUSTRY_REFERENCE",
      points: [
        { year: 2023, index: 122 },
        { year: 2024, index: 123 },
        { year: 2025, index: 128 },
      ],
    },
  ],
  supportMarkers: [
    {
      supportHistoryId: 1,
      programName: "지역기업 성장사다리 지원사업",
      programType: "패키지지원",
      supportAmount: 25000,
      supportAmountUnit: "KRW_THOUSAND",
      markerYear: 2023,
      markerMonth: 9,
      metricsAtMarker: {
        researchAndDevelopmentExpense: 261763,
        operatingProfitMargin: 1.39,
        employeeCount: 9,
      },
    },
    {
      supportHistoryId: 2,
      programName: "탄소중립에너지저장공급 사업화지원",
      programType: "사업화지원",
      supportAmount: 12000,
      supportAmountUnit: "KRW_THOUSAND",
      markerYear: 2023,
      markerMonth: 10,
      metricsAtMarker: {
        researchAndDevelopmentExpense: 261763,
        operatingProfitMargin: 1.39,
        employeeCount: 9,
      },
    },
    {
      supportHistoryId: 3,
      programName: "지역기업 성장사다리 지원사업",
      programType: "기술지원",
      supportAmount: 8000,
      supportAmountUnit: "KRW_THOUSAND",
      markerYear: 2023,
      markerMonth: 11,
      metricsAtMarker: {
        researchAndDevelopmentExpense: 261763,
        operatingProfitMargin: 1.39,
        employeeCount: 9,
      },
    },
    {
      supportHistoryId: 4,
      programName: "2026년 스마트제조 고도화 신청",
      programType: "신청",
      supportAmount: null,
      supportAmountUnit: "KRW_THOUSAND",
      markerYear: 2024,
      markerMonth: 6,
      metricsAtMarker: {
        researchAndDevelopmentExpense: 278000,
        operatingProfitMargin: 2.2,
        employeeCount: 10,
      },
    },
    {
      supportHistoryId: 5,
      programName: "2026년 공정혁신 실증 신청",
      programType: "신청",
      supportAmount: null,
      supportAmountUnit: "KRW_THOUSAND",
      markerYear: 2024,
      markerMonth: 8,
      metricsAtMarker: {
        researchAndDevelopmentExpense: 278000,
        operatingProfitMargin: 2.2,
        employeeCount: 10,
      },
    },
  ],
  observedFlow: {
    periods: [
      { fromYear: 2021, toYear: 2022 },
      { fromYear: 2022, toYear: 2023 },
      { fromYear: 2023, toYear: 2024 },
    ],
    rows: [
      {
        code: "RND_EXPENSE",
        directions: [
          { fromYear: 2021, toYear: 2022, direction: "UP" },
          { fromYear: 2022, toYear: 2023, direction: "UP" },
          { fromYear: 2023, toYear: 2024, direction: "UP" },
        ],
      },
      {
        code: "OPERATING_PROFIT_MARGIN",
        directions: [
          { fromYear: 2021, toYear: 2022, direction: "DOWN" },
          { fromYear: 2022, toYear: 2023, direction: "UP" },
          { fromYear: 2023, toYear: 2024, direction: "UP" },
        ],
      },
      {
        code: "EMPLOYEE_COUNT",
        directions: [
          { fromYear: 2021, toYear: 2022, direction: "UP" },
          { fromYear: 2022, toYear: 2023, direction: "FLAT" },
          { fromYear: 2023, toYear: 2024, direction: "UP" },
        ],
      },
    ],
  },
};

type GrowthChartValueKey = "companyActual" | "companyReference" | "industryActual" | "industryReference";

const lineKeyByCode: Record<string, GrowthChartValueKey> = {
  COMPANY_ACTUAL: "companyActual",
  COMPANY_REFERENCE: "companyReference",
  INDUSTRY_ACTUAL: "industryActual",
  INDUSTRY_REFERENCE: "industryReference",
};

const flowLabels: Record<string, string> = {
  RND_EXPENSE: "연구개발비",
  OPERATING_PROFIT_MARGIN: "영업이익률",
  EMPLOYEE_COUNT: "종업원수",
};

const markerDot = (props: unknown) => {
  const { cx, cy } = props as { cx?: number; cy?: number };

  if (typeof cx !== "number" || typeof cy !== "number") {
    return <g />;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} fill="#ffb000" opacity="0.22" r="16" />
      <circle cx={cx} cy={cy} fill="#ffb000" r="7" stroke="#ffb000" strokeWidth="2" />
    </g>
  );
};

const getLineValue = (data: GrowthScenarioResponse, code: GrowthLineCode) =>
  data.chartLines.find((line) => line.code === code)?.points ?? [];

const buildChartRows = (data: GrowthScenarioResponse): ChartRow[] => {
  const rows = new Map<number, ChartRow>();

  data.chartLines.forEach((line) => {
    const key = lineKeyByCode[line.code];

    if (!key) {
      return;
    }

    line.points.forEach((point) => {
      if (!rows.has(point.year)) {
        rows.set(point.year, { year: point.year });
      }

      rows.get(point.year)![key] = point.index;
    });
  });

  const companyPoints = [...getLineValue(data, "COMPANY_ACTUAL"), ...getLineValue(data, "COMPANY_REFERENCE")];
  const companyIndexByYear = new Map(companyPoints.map((point) => [point.year, point.index]));
  const markersByYear = data.supportMarkers.reduce((map, marker) => {
    if (marker.markerYear === null) {
      return map;
    }

    map.set(marker.markerYear, [...(map.get(marker.markerYear) ?? []), marker]);
    return map;
  }, new Map<number, SupportMarker[]>());

  markersByYear.forEach((markers, year) => {
    if (!rows.has(year)) {
      rows.set(year, { year });
    }

    const row = rows.get(year)!;
    row.supportMarkers = markers;
    row.supportCount = markers.length;
    row.supportIndex =
      row.companyActual ??
      row.companyReference ??
      companyIndexByYear.get(year) ??
      null;
  });

  return [...rows.values()].sort((left, right) => left.year - right.year);
};

const formatNumber = (value: number | null | undefined, suffix = "") => {
  if (value === null || value === undefined) {
    return "-";
  }

  const formatted = Number.isInteger(value)
    ? value.toLocaleString("ko-KR")
    : value.toLocaleString("ko-KR", { maximumFractionDigits: 2 });

  return `${formatted}${suffix}`;
};

type GrowthTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ payload?: ChartRow }>;
};

const GrowthTooltip = ({ active, label, payload }: GrowthTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload as ChartRow | undefined;
  const markers = row?.supportMarkers ?? [];
  const firstMarker = markers[0];
  const metrics = firstMarker?.metricsAtMarker;

  return (
    <div className="min-w-[276px] rounded-[10px] border border-[#e7e7e7] bg-white px-[20px] py-[18px] text-sm shadow-[0_8px_24px_rgba(15,23,42,0.11)]">
      <p className="mb-[17px] text-[16px] font-medium leading-[20px] text-[#555]">{label}</p>
      <div className="space-y-[10px] border-b border-[#eceff3] pb-[17px]">
        <TooltipMetric color="#2563ff" label="해당 기업" value={row?.companyActual ?? row?.companyReference} />
        <TooltipMetric color="#88beff" label="업종 평균" value={row?.industryActual ?? row?.industryReference} />
      </div>

      {markers.length > 0 && (
        <div className="border-b border-[#eceff3] py-[17px]">
          <div className="flex items-center gap-2 font-semibold text-[#444]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffb000]" />
            BTP 지원사업 {markers.length}건
          </div>
          <ul className="mt-[13px] space-y-[9px] text-[13px] leading-5 text-[#555]">
            {markers.slice(0, 4).map((marker) => (
              <li key={marker.supportHistoryId}>· {marker.programName ?? "지원사업"}</li>
            ))}
          </ul>
        </div>
      )}

      {metrics && (
        <div className="pt-[16px]">
          <p className="mb-[13px] font-semibold text-[#444]">기업 지표</p>
          <TooltipValue label="연구개발비" value={formatNumber(metrics.researchAndDevelopmentExpense, "천원")} />
          <TooltipValue label="영업이익률" value={formatNumber(metrics.operatingProfitMargin, "%")} />
          <TooltipValue label="종업원수" value={formatNumber(metrics.employeeCount, "명")} />
        </div>
      )}
    </div>
  );
};

const TooltipMetric = ({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number | null | undefined;
}) => (
  <div className="flex items-center gap-[10px]">
    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-base font-semibold text-[#333]">{formatNumber(value)}</span>
    <span className="text-sm text-[#777]">{label}</span>
  </div>
);

const TooltipValue = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-8 py-[3px] text-[14px] leading-[18px]">
    <span className="text-[#666]">{label}</span>
    <span className="font-semibold text-[#444]">{value}</span>
  </div>
);

const DirectionIcon = ({ direction }: { direction: string }) => {
  if (direction === "UP") {
    return (
      <span className="flex h-9 w-9 items-center justify-center text-[32px] font-light leading-none text-[#ff5f66]">
        ↗
      </span>
    );
  }

  if (direction === "DOWN") {
    return (
      <span className="flex h-9 w-9 items-center justify-center text-[32px] font-light leading-none text-[#287bff]">
        ↘
      </span>
    );
  }

  if (direction === "FLAT") {
    return (
      <span className="flex h-9 w-9 items-center justify-center text-[26px] font-light leading-none text-[#8f8f8f]">
        ㅡ
      </span>
    );
  }

  return (
    <span className="flex h-9 w-9 items-center justify-center text-[24px] font-light leading-none text-[#bbb]">
      -
    </span>
  );
};

const GrowthChangeMatrix = ({ observedFlow }: { observedFlow: ObservedFlow }) => (
  <aside className="min-h-[363px] rounded-[10px] border border-[#ececec] bg-white px-4 py-6 sm:px-[26px] sm:py-[31px]">
    <h3 className="whitespace-nowrap text-[20px] font-medium leading-[24px] text-[#333]">성장 변화 지표</h3>
    <p className="mt-2 whitespace-nowrap text-[16px] font-normal leading-[20px] text-[#8a8a8a]">2021~2024년도 기준</p>

    <div className="mt-8 grid grid-cols-[76px_repeat(3,minmax(56px,1fr))] items-center text-center sm:mt-[50px] sm:grid-cols-[96px_repeat(3,minmax(82px,1fr))]">
      <div />
      {observedFlow.periods.map((period) => (
        <div className="pb-[10px] text-sm font-medium leading-[18px] text-[#666] sm:text-[16px] sm:leading-[20px]" key={`${period.fromYear}-${period.toYear}`}>
          {String(period.fromYear).slice(2)}-{String(period.toYear).slice(2)}
        </div>
      ))}

      {observedFlow.rows.map((row) => (
        <div className="contents" key={row.code}>
          <div className="whitespace-nowrap pr-2 text-left text-sm font-medium leading-[46px] text-[#555] sm:pr-[16px] sm:text-[16px] sm:leading-[50px]">
            {flowLabels[row.code] ?? row.code}
          </div>
          {observedFlow.periods.map((period) => {
            const direction =
              row.directions.find(
                (item) => item.fromYear === period.fromYear && item.toYear === period.toYear,
              )?.direction ?? "NO_DATA";

            return (
              <div
                className="-ml-px -mt-px grid h-[46px] place-items-center border border-[#ededed] bg-white first:rounded-l-[6px] last:rounded-r-[6px] sm:h-[50px]"
                key={`${row.code}-${period.fromYear}-${period.toYear}`}
              >
                <DirectionIcon direction={direction} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  </aside>
);

const GrowthScenarioSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(360);
  const { data, error, isLoading } = useDashboardGetData<GrowthScenarioResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/growth-scenario",
  );
  const scenario = isSample ? sampleGrowthScenario : data;
  const chartRows = scenario ? buildChartRows(scenario) : [];

  useEffect(() => {
    const container = chartContainerRef.current;

    if (!container) {
      return;
    }

    const updateWidth = () => {
      const nextWidth = Math.floor(container.getBoundingClientRect().width);

      setChartWidth(Math.max(280, nextWidth));
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    window.setTimeout(updateWidth, 0);
    window.setTimeout(updateWidth, 250);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-[10px] bg-gray-50 px-7 py-6 text-sm font-medium text-red-600">
        기업 성장 시나리오를 불러오지 못했습니다.
      </div>
    );
  }

  if (isLoading && !scenario) {
    return <div className="dashboard-skeleton h-[520px] rounded-[10px]" />;
  }

  if (!scenario) {
    return <p className="text-sm text-[#666]">표시할 기업 성장 시나리오가 없습니다.</p>;
  }

  return (
    <div>
      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_472px]">
        <div className="min-w-0">
          <div className="mb-[18px] pl-0 sm:pl-[38px]">
            <div className="flex min-w-0 flex-wrap items-center gap-x-[8px] gap-y-2 text-[10px] font-medium leading-[14px] text-[#666] 2xl:flex-nowrap 2xl:whitespace-nowrap">
            <LegendLine color="#2563ff" label="기업 실측 성장지수" />
            <LegendLine color="#2563ff" dashed label="기업 참고 성장지수" />
            <LegendLine color="#88beff" label="업종 평균 성장지수" />
            <LegendLine color="#88beff" dashed label="업종 참고 성장지수" />
            <div className="flex items-center gap-2">
              <span className="h-[10px] w-[10px] rounded-full bg-[#ffb000]" />
              <span>BTP 지원</span>
            </div>
            </div>
          </div>

          <div className="min-h-[250px] w-full min-w-0" ref={chartContainerRef}>
            {chartRows.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center rounded-[6px] bg-[#fafafa] text-sm font-medium text-[#777]">
                표시할 성장 시나리오 데이터가 없습니다.
              </div>
            ) : (
              <ComposedChart
                data={chartRows}
                height={250}
                margin={{ bottom: 4, left: 2, right: 14, top: 5 }}
                width={chartWidth}
              >
                  <CartesianGrid stroke="#eeeeee" strokeOpacity={0.82} vertical={false} />
                  <XAxis
                    axisLine={{ stroke: "#e5e7eb" }}
                    dataKey="year"
                    tick={{ fill: "#888", fontSize: 13, fontWeight: 400 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tick={{ fill: "#888", fontSize: 13, fontWeight: 400 }}
                    tickFormatter={(value) => Math.round(Number(value)).toString()}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip content={<GrowthTooltip />} cursor={{ stroke: "#e5e7eb" }} />
                  <ReferenceLine stroke="#eeeeee" x={2023} />
                  <Line
                    connectNulls
                    dataKey="companyActual"
                    dot={false}
                    isAnimationActive={false}
                    stroke="#2563ff"
                    strokeWidth={2}
                    type="linear"
                  />
                  <Line
                    connectNulls
                    dataKey="companyReference"
                    dot={false}
                    isAnimationActive={false}
                    stroke="#2563ff"
                    strokeDasharray="3 5"
                    strokeWidth={2}
                    type="linear"
                  />
                  <Line
                    connectNulls
                    dataKey="industryActual"
                    dot={false}
                    isAnimationActive={false}
                    stroke="#88beff"
                    strokeWidth={2}
                    type="linear"
                  />
                  <Line
                    connectNulls
                    dataKey="industryReference"
                    dot={false}
                    isAnimationActive={false}
                    stroke="#88beff"
                    strokeDasharray="3 5"
                    strokeWidth={2}
                    type="linear"
                  />
                  <Scatter dataKey="supportIndex" fill="#ffb000" isAnimationActive={false} shape={markerDot} />
              </ComposedChart>
            )}
          </div>

          <div className="mt-[14px] flex min-h-[62px] items-start gap-3 rounded-[5px] bg-[#eef5ff] px-[17px] py-[12px] text-[14px] font-normal leading-[22px] text-[#666]">
            <span className="mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2b7fff] text-[11px] font-bold text-white">
              i
            </span>
            <p>
              기업 참고 경로는 한국은행 업종 성장률을 기준으로 기업의 최근 성장 패턴을 반영하여
              산출한 참고 시나리오입니다. 실제 경영성과를 의미하거나 보장하지 않습니다.
            </p>
          </div>
        </div>

        <GrowthChangeMatrix observedFlow={scenario.observedFlow} />
      </div>
    </div>
  );
};

const LegendLine = ({
  color,
  dashed = false,
  label,
}: {
  color: string;
  dashed?: boolean;
  label: string;
}) => (
  <div className="flex items-center gap-2">
    <span
      className="h-px w-[24px] shrink-0"
      style={{
        backgroundImage: dashed ? `linear-gradient(to right, ${color} 50%, transparent 50%)` : undefined,
        backgroundSize: dashed ? "6px 1px" : undefined,
        backgroundColor: dashed ? undefined : color,
      }}
    />
    <span>{label}</span>
  </div>
);

export default GrowthScenarioSection;
