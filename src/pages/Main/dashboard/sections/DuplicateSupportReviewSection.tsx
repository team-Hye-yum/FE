import { useState } from "react";
import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type YearlySupportCountItem = {
  supportYear: number | null;
  supportType: string | null;
  supportCount: number;
};

type SupportHistoryLatestVsPastResponse = {
  btpSupportTimeline: {
    items: BtpSupportTimelineItem[];
  } | null;
  comparisons: ComparisonItem[];
  latestSupportTargets: SupportHistoryCompareItem[];
  summary: {
    btpSelectedSupportCount: number;
    latestSupportTargetCount: number;
  } | null;
  yearlySupportChart: {
    items: YearlySupportCountItem[];
  } | null;
};

type SupportHistoryPostSupportChangeResponse = {
  emptyMessage: string | null;
  observations: ChangeObservationItem[];
};

type CompanyActivitySupportTimelineResponse = {
  btpSupportEvents: PointEventItem[];
  emptyMessages: Array<{
    code: string;
    message: string;
  }>;
  ntisEvents: TimelineEventItem[];
  patentEvents: PointEventItem[];
  timelineRange: {
    endYear: number | null;
    startYear: number | null;
  } | null;
};

type BtpSupportTimelineItem = {
  budgetProgramName?: string | null;
  endDate?: string | null;
  selectedDate?: string | null;
  startDate?: string | null;
  supportAmount?: {
    value: number | null;
    unit: string;
  } | null;
  supportCategory?: string | null;
  supportDetail?: string | null;
  supportItem?: string | null;
  supportYear: number | null;
  supportType: string | null;
};

type PointEventItem = {
  count: number;
  eventDate: string | null;
  eventType: string;
  eventYear: number | null;
  label: string | null;
};

type ChangeObservationItem = {
  descriptionText: string | null;
  observationStatus: {
    code: string;
    label: string;
  } | null;
  observationYear: number | null;
  supportCount: number;
  supportEndYear: number | null;
  titleText: string | null;
  topChanges: TopChangeItem[];
};

type ComparisonItem = {
  comparisonId: string;
  latestSupport: SupportHistoryCompareItem | null;
  pastSupport: SupportHistoryCompareItem | null;
};

type SupportHistoryCompareItem = {
  budgetProgramName: string | null;
  endDate: string | null;
  selectionResult?: string | null;
  startDate: string | null;
  supportAmount: {
    value: number | null;
    unit: string;
  } | null;
  supportItem: string | null;
  supportType: string | null;
  supportYear: number | null;
};

type TopChangeItem = {
  afterValue: number | null;
  beforeValue: number | null;
  changeRate: number | null;
  changeRateUnit: string | null;
  changeValue: number | null;
  changeValueUnit: string | null;
  displayText: string | null;
  label: string | null;
  metric: string | null;
  valueUnit: string | null;
};

type TimelineEventItem = {
  count: number;
  endDate?: string | null;
  endYear?: number | null;
  eventDate?: string | null;
  eventType: string;
  eventYear?: number | null;
  label: string | null;
  startDate?: string | null;
  startYear?: number | null;
};

type ActivityTooltipState = {
  lines: string[];
  title: string;
  x: number;
  y: number;
} | null;

type ChartPoint = {
  business: number;
  other: number;
  package: number;
  technical: number;
  year: number;
  yearLabel: string;
};

const supportCategories = [
  { color: "#3b8ddf", dataKey: "technical", label: "기술지원" },
  { color: "#25a376", dataKey: "business", label: "사업화지원" },
  { color: "#dd5730", dataKey: "package", label: "패키지지원" },
  { color: "#b8b5ae", dataKey: "other", label: "기타" },
] as const;

const sampleSupportItems: YearlySupportCountItem[] = [
  { supportCount: 1, supportType: "기술지원", supportYear: 2019 },
  { supportCount: 1, supportType: "기술지원", supportYear: 2020 },
  { supportCount: 1, supportType: "기타", supportYear: 2020 },
  { supportCount: 1, supportType: "사업화지원", supportYear: 2021 },
  { supportCount: 1, supportType: "기타", supportYear: 2021 },
  { supportCount: 1, supportType: "기술지원", supportYear: 2022 },
  { supportCount: 1, supportType: "사업화지원", supportYear: 2022 },
  { supportCount: 1, supportType: "기타", supportYear: 2022 },
  { supportCount: 2, supportType: "패키지지원", supportYear: 2023 },
  { supportCount: 1, supportType: "기술지원", supportYear: 2024 },
  { supportCount: 1, supportType: "기타", supportYear: 2024 },
];

const sampleTimelineItems: BtpSupportTimelineItem[] = [
  {
    budgetProgramName: "부산글로벌스타기업육성사업",
    endDate: "20220731",
    selectedDate: "20211223",
    startDate: "20211223",
    supportAmount: { unit: "KRW_THOUSAND", value: 10377 },
    supportCategory: "전시회",
    supportType: "사업화지원",
    supportYear: 2021,
  },
  {
    budgetProgramName: "친환경미래에너지마케팅사업",
    endDate: "20221130",
    selectedDate: "20220518",
    startDate: "20220601",
    supportAmount: { unit: "KRW_THOUSAND", value: 13200 },
    supportCategory: "수출지원",
    supportType: "패키지지원",
    supportYear: 2022,
  },
  {
    budgetProgramName: "탄소중립 친환경미래에너지산업 지원사업",
    endDate: "20220331",
    selectedDate: "20220826",
    startDate: "20220901",
    supportAmount: { unit: "KRW_THOUSAND", value: 13400 },
    supportCategory: "전시회",
    supportType: "패키지지원",
    supportYear: 2022,
  },
  {
    budgetProgramName: "지역기업 성장사다리 지원사업",
    endDate: "20230331",
    selectedDate: "20220826",
    startDate: "20220901",
    supportAmount: { unit: "KRW_THOUSAND", value: 13400 },
    supportCategory: "전시회",
    supportType: "사업화지원",
    supportYear: 2022,
  },
  {
    budgetProgramName: "지역기업 성장사다리 지원사업",
    endDate: "20231103",
    selectedDate: "20230822",
    startDate: "20230822",
    supportAmount: { unit: "KRW_THOUSAND", value: 3850 },
    supportCategory: "수출지원",
    supportType: "패키지지원",
    supportYear: 2023,
  },
  {
    budgetProgramName: "탄소중립 친환경미래에너지산업 지원사업",
    endDate: "20231117",
    selectedDate: "20230919",
    startDate: "20230918",
    supportAmount: { unit: "KRW_THOUSAND", value: 20000 },
    supportCategory: "시제품제작",
    supportType: "패키지지원",
    supportYear: 2023,
  },
  {
    budgetProgramName: "저온고압에너지저장공급 사업화지원",
    endDate: "20240331",
    selectedDate: "20230615",
    startDate: "20230401",
    supportAmount: { unit: "KRW_THOUSAND", value: 4730 },
    supportCategory: "전시회",
    supportType: "사업화지원",
    supportYear: 2023,
  },
  {
    budgetProgramName: "지역기업성장사다리지원사업",
    endDate: "20241031",
    selectedDate: "20240524",
    startDate: "20240617",
    supportAmount: { unit: "KRW_THOUSAND", value: 20000 },
    supportCategory: "시제품제작",
    supportType: "패키지지원",
    supportYear: 2024,
  },
];

const sampleComparisons: ComparisonItem[] = [
  {
    comparisonId: "sample-package",
    latestSupport: {
      budgetProgramName: "지역기업성장사다리지원사업",
      endDate: "20261130",
      startDate: "20260701",
      supportAmount: { unit: "KRW_THOUSAND", value: 8000 },
      supportItem: "고액분리기 고정밀 고강성 여과망 개발을 위한 트라이바 시제품 제작",
      supportType: "패키지지원",
      supportYear: 2026,
    },
    pastSupport: {
      budgetProgramName: "지역기업성장사다리지원사업",
      endDate: "20241031",
      startDate: "20240601",
      supportAmount: { unit: "KRW_THOUSAND", value: 20000 },
      supportItem: "고액분리기 고정밀 고강성 여과망 개발을 위한 트라이바 시제품 제작",
      supportType: "패키지지원",
      supportYear: 2024,
    },
  },
  {
    comparisonId: "sample-technical",
    latestSupport: {
      budgetProgramName: "지역기업성장사다리지원사업",
      endDate: "20261130",
      startDate: "20260701",
      supportAmount: { unit: "KRW_THOUSAND", value: 8000 },
      supportItem: "고액분리기 고정밀 고강성 여과망 개발을 위한 트라이바 시제품 제작",
      supportType: "기술지원",
      supportYear: 2026,
    },
    pastSupport: {
      budgetProgramName: "지역기업성장사다리지원사업",
      endDate: "20241031",
      startDate: "20240601",
      supportAmount: { unit: "KRW_THOUSAND", value: 20000 },
      supportItem: "고액분리기 고정밀 고강성 여과망 개발을 위한 트라이바 시제품 제작",
      supportType: "기술지원",
      supportYear: 2024,
    },
  },
];

const sampleLatestSupportTargets = sampleComparisons
  .map((comparison) => comparison.latestSupport)
  .filter((item): item is SupportHistoryCompareItem => item !== null);

const samplePostSupportObservations: ChangeObservationItem[] = [
  {
    descriptionText: "매출 4.2억 -> 4.6억 · 종업원 8명 -> 9명 · 특허 0건 -> 1건",
    observationStatus: { code: "AVAILABLE", label: "관찰 가능" },
    observationYear: 2022,
    supportCount: 5,
    supportEndYear: 2021,
    titleText: "2021년 지원 5건 종료 (->2022)",
    topChanges: [
      {
        afterValue: 460000,
        beforeValue: 420000,
        changeRate: 9.5,
        changeRateUnit: "PERCENT",
        changeValue: 40000,
        changeValueUnit: "KRW_THOUSAND",
        displayText: "매출 4.2억 -> 4.6억",
        label: "매출",
        metric: "SALES_AMOUNT",
        valueUnit: "KRW_THOUSAND",
      },
      {
        afterValue: 9,
        beforeValue: 8,
        changeRate: 12.5,
        changeRateUnit: "PERCENT",
        changeValue: 1,
        changeValueUnit: "COUNT",
        displayText: "종업원 8명 -> 9명",
        label: "종업원",
        metric: "EMPLOYEE_COUNT",
        valueUnit: "COUNT",
      },
      {
        afterValue: 1,
        beforeValue: 0,
        changeRate: null,
        changeRateUnit: null,
        changeValue: 1,
        changeValueUnit: "COUNT",
        displayText: "특허 0건 -> 1건",
        label: "특허",
        metric: "REGISTERED_PATENT_COUNT",
        valueUnit: "COUNT",
      },
    ],
  },
  {
    descriptionText: "매출 5.8억 -> 6.3억 · 종업원 데이터 없음 -> 데이터 없음 · 특허 2건 -> 2건",
    observationStatus: { code: "AVAILABLE", label: "관찰 가능" },
    observationYear: 2024,
    supportCount: 6,
    supportEndYear: 2023,
    titleText: "2023년 지원 6건 종료 (->2024)",
    topChanges: [
      {
        afterValue: 630000,
        beforeValue: 580000,
        changeRate: 8.6,
        changeRateUnit: "PERCENT",
        changeValue: 50000,
        changeValueUnit: "KRW_THOUSAND",
        displayText: "매출 5.8억 -> 6.3억",
        label: "매출",
        metric: "SALES_AMOUNT",
        valueUnit: "KRW_THOUSAND",
      },
      {
        afterValue: null,
        beforeValue: null,
        changeRate: null,
        changeRateUnit: null,
        changeValue: null,
        changeValueUnit: null,
        displayText: "데이터 없음(결측)",
        label: "종업원",
        metric: "EMPLOYEE_COUNT",
        valueUnit: "COUNT",
      },
      {
        afterValue: 2,
        beforeValue: 2,
        changeRate: 0,
        changeRateUnit: "PERCENT",
        changeValue: 0,
        changeValueUnit: "COUNT",
        displayText: "특허 2건 -> 2건",
        label: "특허",
        metric: "REGISTERED_PATENT_COUNT",
        valueUnit: "COUNT",
      },
    ],
  },
  {
    descriptionText: "다음 데이터 갱신 후 확인 예정",
    observationStatus: { code: "PENDING", label: "아직 관찰 불가" },
    observationYear: 2025,
    supportCount: 2,
    supportEndYear: 2024,
    titleText: "2024년 지원 2건 종료 (->2025)",
    topChanges: [],
  },
];

const sampleActivityTimeline: CompanyActivitySupportTimelineResponse = {
  btpSupportEvents: [
    {
      count: 1,
      eventDate: "20220301",
      eventType: "BTP_SUPPORT",
      eventYear: 2022,
      label: "1건",
    },
    {
      count: 2,
      eventDate: "20240701",
      eventType: "BTP_SUPPORT",
      eventYear: 2024,
      label: "2건",
    },
  ],
  emptyMessages: [],
  ntisEvents: [
    {
      count: 1,
      endDate: "20210630",
      endYear: 2021,
      eventType: "NTIS_PROJECT_PERIOD",
      label: "과제 1건",
      startDate: "20210101",
      startYear: 2021,
    },
    {
      count: 1,
      endDate: "20240630",
      endYear: 2024,
      eventType: "NTIS_PROJECT_PERIOD",
      label: "과제 1건",
      startDate: "20230101",
      startYear: 2023,
    },
  ],
  patentEvents: [
    {
      count: 1,
      eventDate: "20200115",
      eventType: "PATENT_APPLICATION",
      eventYear: 2020,
      label: "1건",
    },
    {
      count: 1,
      eventDate: "20201020",
      eventType: "PATENT_REGISTERED",
      eventYear: 2020,
      label: "1건",
    },
    {
      count: 2,
      eventDate: "20220620",
      eventType: "PATENT_APPLICATION",
      eventYear: 2022,
      label: "2건",
    },
    {
      count: 1,
      eventDate: "20230410",
      eventType: "PATENT_REGISTERED",
      eventYear: 2023,
      label: "1건",
    },
    {
      count: 3,
      eventDate: "20240512",
      eventType: "PATENT_APPLICATION",
      eventYear: 2024,
      label: "3건",
    },
  ],
  timelineRange: {
    endYear: 2024,
    startYear: 2020,
  },
};

const emptyChartPoint = (year: number): ChartPoint => ({
  business: 0,
  other: 0,
  package: 0,
  technical: 0,
  year,
  yearLabel: String(year),
});

const supportCategoryKey = (supportType: string | null | undefined) => {
  if (supportType?.includes("기술")) {
    return "technical";
  }

  if (supportType?.includes("사업화")) {
    return "business";
  }

  if (supportType?.includes("패키지")) {
    return "package";
  }

  return "other";
};

const buildChartData = (items: YearlySupportCountItem[]) => {
  const years = items
    .map((item) => item.supportYear)
    .filter((year): year is number => year !== null && year !== undefined);
  const latestYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  const chartByYear = new Map<number, ChartPoint>();

  for (let year = latestYear - 4; year <= latestYear; year += 1) {
    chartByYear.set(year, emptyChartPoint(year));
  }

  items.forEach((item) => {
    if (item.supportYear === null || item.supportYear === undefined) {
      return;
    }

    const point = chartByYear.get(item.supportYear);

    if (!point) {
      return;
    }

    const key = supportCategoryKey(item.supportType);
    point[key] += item.supportCount;
  });

  return Array.from(chartByYear.values()).sort(
    (firstPoint, secondPoint) => firstPoint.year - secondPoint.year,
  );
};

const buildSupportItemsFromTimeline = (items: BtpSupportTimelineItem[]) =>
  items.map((item) => ({
    supportCount: 1,
    supportType: item.supportType,
    supportYear: item.supportYear,
  }));

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const normalizedValue = value.replaceAll("-", "");
  if (!/^\d{8}$/.test(normalizedValue)) {
    return value;
  }

  return `${normalizedValue.slice(0, 4)}-${normalizedValue.slice(4, 6)}-${normalizedValue.slice(6)}`;
};

const formatNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : value.toLocaleString();

const formatCount = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : `${value.toLocaleString()}건`;

const formatDateRange = (startDate: string | null | undefined, endDate: string | null | undefined) => {
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  if (formattedStartDate === "-" && formattedEndDate === "-") {
    return "-";
  }

  return `${formattedStartDate.replaceAll("-", ".")}~${formattedEndDate.replaceAll("-", ".")}.`;
};

const formatSupportAmount = (value: number | null | undefined) => {
  const formattedValue = formatNumber(value);
  return formattedValue === "-" ? "-" : `${formattedValue}천원`;
};

const truncateText = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const compactDate = (value: string | null | undefined) => {
  const formattedValue = formatDate(value);

  if (formattedValue === "-") {
    return "-";
  }

  return formattedValue.replaceAll("-", ".");
};

const compactDateRange = (
  startDate: string | null | undefined,
  endDate: string | null | undefined,
) => {
  const formattedStartDate = compactDate(startDate);
  const formattedEndDate = compactDate(endDate);

  if (formattedStartDate === "-" && formattedEndDate === "-") {
    return "기간 없음";
  }

  return `${formattedStartDate}~${formattedEndDate}`;
};

const formatChangeValue = (
  value: number | null | undefined,
  unit: string | null | undefined,
  metric: string | null | undefined,
  label: string | null | undefined,
) => {
  if (value === null || value === undefined) {
    return "데이터 없음(결측)";
  }

  if (unit === "KRW_THOUSAND") {
    return `${(value / 100000).toFixed(1)}억`;
  }

  if (unit === "PERCENT" || unit === "PERCENT_POINT") {
    return `${Number(value.toFixed(1)).toLocaleString()}%`;
  }

  if (unit === "COUNT") {
    if (metric?.includes("EMPLOYEE") || label?.includes("종업원") || label?.includes("고용")) {
      return `${value.toLocaleString()}명`;
    }

    return `${value.toLocaleString()}건`;
  }

  return value.toLocaleString();
};

const changeTitle = (item: ChangeObservationItem) => {
  if (item.supportEndYear && item.observationYear) {
    return `${item.supportEndYear}년 지원 ${item.supportCount.toLocaleString()}건 종료`;
  }

  return item.titleText?.replace(/\s*\(->\s*\d+\)/, "") || "-";
};

const changeObservationYearText = (item: ChangeObservationItem) =>
  item.observationYear ? `${item.observationYear}년` : "-";

const isChangeAvailable = (item: ChangeObservationItem) =>
  item.observationStatus?.code === "AVAILABLE" ||
  item.observationStatus?.code === "PARTIAL_AVAILABLE";

const aggregatePointEvents = (
  items: PointEventItem[],
  years: number[],
  eventType: string,
) => {
  const yearSet = new Set(years);
  const countsByYear = new Map<number, number>();

  items
    .filter((item) => item.eventType === eventType)
    .forEach((item) => {
      if (!item.eventYear || !yearSet.has(item.eventYear)) {
        return;
      }

      countsByYear.set(item.eventYear, (countsByYear.get(item.eventYear) ?? 0) + item.count);
    });

  return Array.from(countsByYear.entries())
    .map(([year, count]) => ({ count, label: `${count.toLocaleString()}건`, year }))
    .sort((firstItem, secondItem) => firstItem.year - secondItem.year);
};

const aggregateBtpEvents = (items: PointEventItem[], years: number[]) => {
  const yearSet = new Set(years);
  const countsByYear = new Map<number, number>();

  items.forEach((item) => {
    if (!item.eventYear || !yearSet.has(item.eventYear)) {
      return;
    }

    countsByYear.set(item.eventYear, (countsByYear.get(item.eventYear) ?? 0) + item.count);
  });

  return Array.from(countsByYear.entries())
    .map(([year, count]) => ({ count, label: `${count.toLocaleString()}건`, year }))
    .sort((firstItem, secondItem) => firstItem.year - secondItem.year);
};

const daysInYear = (year: number) => {
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const nextFirstDay = new Date(Date.UTC(year + 1, 0, 1));

  return (nextFirstDay.getTime() - firstDay.getTime()) / 86400000;
};

const timelineValueFromDate = (date: string | null | undefined, fallbackYear: number) => {
  if (!date) {
    return fallbackYear;
  }

  const normalizedDate = date.replaceAll("-", "");

  if (!/^\d{8}$/.test(normalizedDate)) {
    return fallbackYear;
  }

  const year = Number(normalizedDate.slice(0, 4));
  const month = Number(normalizedDate.slice(4, 6));
  const day = Number(normalizedDate.slice(6, 8));
  const currentDate = new Date(Date.UTC(year, month - 1, day));
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const elapsedDays = (currentDate.getTime() - firstDay.getTime()) / 86400000;

  return year + Math.max(0, elapsedDays) / daysInYear(year);
};

const visibleNtisPeriods = (items: TimelineEventItem[], years: number[]) => {
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const minTimelineValue = minYear;
  const maxTimelineValue = maxYear + 1;

  return items
    .map((item) => {
      if (item.eventType !== "NTIS_PROJECT_PERIOD") {
        return null;
      }

      const startYear = item.startYear ?? item.eventYear;
      const endYear = item.endYear ?? item.eventYear ?? startYear;
      const startDate = item.startDate;
      const endDate = item.endDate;

      if (!startYear || !endYear || !startDate || !endDate) {
        return null;
      }

      const startValue = timelineValueFromDate(startDate, startYear);
      const endValue = timelineValueFromDate(endDate, endYear);
      const clippedStartValue = Math.max(startValue, minTimelineValue);
      const clippedEndValue = Math.min(endValue, maxTimelineValue);
      const clippedStartYear = Math.max(startYear, minYear);
      const clippedEndYear = Math.min(endYear, maxYear);

      if (clippedStartValue > maxTimelineValue || clippedEndValue < minTimelineValue) {
        return null;
      }

      return {
        count: item.count,
        endDate,
        endValue: clippedEndValue,
        endYear: clippedEndYear,
        label: item.label || `과제 ${item.count.toLocaleString()}건`,
        startDate,
        startValue: clippedStartValue,
        startYear: clippedStartYear,
      };
    })
    .filter(
      (
        item,
      ): item is {
        count: number;
        endDate: string;
        endValue: number;
        endYear: number;
        label: string;
        startDate: string;
        startValue: number;
        startYear: number;
      } => item !== null,
    );
};

const combinePatentEvents = (
  applicationEvents: Array<{ count: number; label: string; year: number }>,
  registeredEvents: Array<{ count: number; label: string; year: number }>,
) => {
  const eventsByYear = new Map<
    number,
    { applicationCount: number; registeredCount: number; year: number }
  >();

  applicationEvents.forEach((item) => {
    const event = eventsByYear.get(item.year) ?? {
      applicationCount: 0,
      registeredCount: 0,
      year: item.year,
    };
    event.applicationCount += item.count;
    eventsByYear.set(item.year, event);
  });

  registeredEvents.forEach((item) => {
    const event = eventsByYear.get(item.year) ?? {
      applicationCount: 0,
      registeredCount: 0,
      year: item.year,
    };
    event.registeredCount += item.count;
    eventsByYear.set(item.year, event);
  });

  return Array.from(eventsByYear.values())
    .map((item) => {
      const labelParts = [];

      if (item.registeredCount > 0) {
        labelParts.push(`특허 ${item.registeredCount.toLocaleString()}건`);
      }

      if (item.applicationCount > 0) {
        labelParts.push(`출원 ${item.applicationCount.toLocaleString()}건`);
      }

      return {
        ...item,
        label: labelParts.length > 0 ? labelParts.join(", ") : "특허 0건",
      };
    })
    .sort((firstItem, secondItem) => firstItem.year - secondItem.year);
};

const btpTooltipLines = (items: BtpSupportTimelineItem[], year: number) => {
  const supportItems = items.filter((item) => item.supportYear === year);

  if (supportItems.length === 0) {
    return [`${year}년 부산TP 지원 이력`];
  }

  const visibleItems = supportItems.slice(0, 2).map((item) => {
    const name = truncateText(item.budgetProgramName || "사업명 없음", 22);
    const period = compactDateRange(item.startDate || item.selectedDate, item.endDate);

    return `${name} · ${period}`;
  });

  if (supportItems.length > visibleItems.length) {
    visibleItems.push(`외 ${supportItems.length - visibleItems.length}건`);
  }

  return visibleItems;
};

const ntisTooltipLines = (period: {
  endDate?: string | null;
  endYear: number;
  label: string;
  startDate?: string | null;
  startYear: number;
}) => [
  period.label,
  `${formatDate(period.startDate) || period.startYear} ~ ${
    formatDate(period.endDate) || period.endYear
  }`,
];

const patentTooltipLines = (item: {
  applicationCount: number;
  label: string;
  registeredCount: number;
  year: number;
}) => [`${item.year}년`, item.label];

const scaledSize = (count: number, min: number, max: number) => {
  const normalizedCount = Math.max(1, Math.min(count, 10));

  return min + ((normalizedCount - 1) / 9) * (max - min);
};

const supportCategoryText = (item: BtpSupportTimelineItem) =>
  item.supportCategory || item.supportDetail || item.supportItem || "-";

const latestSupportYear = (items: Array<{ supportYear: number | null }>) => {
  const years = items
    .map((item) => item.supportYear)
    .filter((year): year is number => year !== null && year !== undefined);

  return years.length > 0 ? Math.max(...years) : null;
};

const latestYearCount = (items: Array<{ supportYear: number | null }>, year: number | null) =>
  year === null ? null : items.filter((item) => item.supportYear === year).length;

const SummaryCards = ({
  latestCount,
  latestYear,
  selectedCount,
}: {
  latestCount: number | null;
  latestYear: number | null;
  selectedCount: number | null;
}) => (
  <div className="mb-8 grid grid-cols-2 gap-5">
    <article className="h-[124px] rounded-[10px] bg-[#f8f9fb] px-[30px] pt-[30px]">
      <h3 className="text-lg font-medium leading-[22px] text-[#555]">부산TP 선정 지원</h3>
      <p className="mt-[9px] text-[28px] font-medium leading-[34px] text-[#333]">
        {formatCount(selectedCount)}
      </p>
    </article>
    <article className="h-[124px] rounded-[10px] bg-[#f8f9fb] px-[30px] pt-[30px]">
      <h3 className="text-lg font-medium leading-[22px] text-[#555]">
        {latestYear ? `${latestYear}년 신청 현황` : "최신 신청 현황"}
      </h3>
      <p className="mt-[9px] text-[28px] font-medium leading-[34px] text-[#333]">
        {formatCount(latestCount)}
      </p>
    </article>
  </div>
);

const SupportTimelineTable = ({ items }: { items: BtpSupportTimelineItem[] }) => (
  <div className="mt-10">
    <h3 className="mb-5 text-xl font-medium text-[#333]">부산TP 지원 타임라인</h3>
    <div
      className="max-h-[440px] overflow-y-auto overflow-x-hidden rounded-[10px] border border-[#eee] bg-white"
      data-dashboard-print-expand
    >
      <table className="w-full table-fixed border-collapse text-left text-[15px] text-[#333]">
        <colgroup>
          <col className="w-[31%]" />
          <col className="w-[13%]" />
          <col className="w-[17%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr className="sticky top-0 z-10 h-10 bg-gray-50">
            <th className="whitespace-nowrap px-3 font-normal">사업명</th>
            <th className="whitespace-nowrap px-3 font-normal">사업유형</th>
            <th className="whitespace-nowrap px-3 font-normal">지원구분(주요지원)</th>
            <th className="whitespace-nowrap px-3 font-normal">시작일</th>
            <th className="whitespace-nowrap px-3 font-normal">종료일</th>
            <th className="whitespace-nowrap px-3 text-right font-normal">
              지원금(천원)
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr className="h-10 border-t border-[#eee]" key={`${item.budgetProgramName}-${index}`}>
              <td className="truncate px-3" title={item.budgetProgramName || "-"}>
                {item.budgetProgramName || "-"}
              </td>
              <td className="truncate px-3" title={item.supportType || "-"}>
                {item.supportType || "-"}
              </td>
              <td className="truncate px-3" title={supportCategoryText(item)}>
                {supportCategoryText(item)}
              </td>
              <td className="whitespace-nowrap px-3">{formatDate(item.startDate || item.selectedDate)}</td>
              <td className="whitespace-nowrap px-3">{formatDate(item.endDate)}</td>
              <td className="whitespace-nowrap px-3 text-right">
                {formatNumber(item.supportAmount?.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const badgeClassName = (supportType: string | null | undefined) => {
  if (supportType?.includes("패키지")) {
    return "bg-[#ffd6a7] text-[#ca3500]";
  }

  if (supportType?.includes("기술")) {
    return "bg-blue-100 text-[#155dfc]";
  }

  if (supportType?.includes("사업화")) {
    return "bg-[#d8f3e8] text-[#047857]";
  }

  return "bg-[#eee] text-[#555]";
};

const CompareColumn = ({
  item,
  title,
}: {
  item: SupportHistoryCompareItem | null;
  title: string;
}) => (
  <div className="min-w-0">
    <h4 className="mb-8 text-center text-base font-normal text-[#555]">{title}</h4>
    <dl className="grid grid-cols-[92px_minmax(0,1fr)] gap-x-5 gap-y-5 text-base">
      <dt className="text-[#555]">사업명</dt>
      <dd className="font-medium text-[#333]">{item?.budgetProgramName || "-"}</dd>

      <dt className="text-[#555]">사업유형</dt>
      <dd>
        <span
          className={`inline-flex h-[30px] items-center rounded-[15px] px-[15px] pb-1.5 pt-[5px] text-base font-medium ${badgeClassName(
            item?.supportType,
          )}`}
        >
          {item?.supportType || "-"}
        </span>
      </dd>

      <dt className="text-[#555]">지원품목</dt>
      <dd className="break-keep font-medium leading-6 text-[#333]">{item?.supportItem || "-"}</dd>

      <dt className="text-[#555]">지원기간</dt>
      <dd className="font-medium text-[#333]">{formatDateRange(item?.startDate, item?.endDate)}</dd>

      <dt className="text-[#555]">지원금</dt>
      <dd className="font-medium text-[#333]">{formatSupportAmount(item?.supportAmount?.value)}</dd>
    </dl>
  </div>
);

const SupportComparisonList = ({ comparisons }: { comparisons: ComparisonItem[] }) => {
  if (comparisons.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <h3 className="mb-5 text-xl font-medium text-[#333]">최신 지원 - 과거 지원 이력 비교</h3>
      <div className="space-y-7">
        {comparisons.map((comparison) => (
          <article
            className="grid grid-cols-2 gap-[60px] rounded-[10px] border border-[#eee] bg-white px-[30px] py-[30px]"
            data-dashboard-print-avoid
            key={comparison.comparisonId}
          >
            <CompareColumn item={comparison.latestSupport} title="현재 신청 [기업 제출]" />
            <CompareColumn item={comparison.pastSupport} title="과거 지원 [BTP 확정 이력]" />
          </article>
        ))}
      </div>
    </div>
  );
};

const ChangeMetricCard = ({ item }: { item: TopChangeItem }) => {
  const beforeText = formatChangeValue(
    item.beforeValue,
    item.valueUnit,
    item.metric,
    item.label,
  );
  const afterText = formatChangeValue(
    item.afterValue,
    item.valueUnit,
    item.metric,
    item.label,
  );
  const hasBeforeAndAfter =
    item.beforeValue !== null &&
    item.beforeValue !== undefined &&
    item.afterValue !== null &&
    item.afterValue !== undefined;

  return (
    <article className="h-[84px] rounded-[4px] bg-[#f8f9fb] px-[30px] py-[16px]">
      <h5 className="text-[15px] font-normal leading-[19px] text-[#777]">{item.label || "-"}</h5>
      <p className="mt-[9px] flex items-center gap-[20px] text-[23px] font-medium leading-[29px] text-[#333]">
        {hasBeforeAndAfter ? (
          <>
            <span className="whitespace-nowrap">{beforeText}</span>
            <span className="text-[24px] font-normal text-[#333]">→</span>
            <span className="whitespace-nowrap">{afterText}</span>
          </>
        ) : (
          <span className="text-[22px] font-normal text-[#aaa]">
            {item.displayText || "데이터 없음(결측)"}
          </span>
        )}
      </p>
    </article>
  );
};

const PostSupportChangeSection = ({
  observations,
}: {
  observations: ChangeObservationItem[];
}) => {
  if (observations.length === 0) {
    return null;
  }

  return (
    <div className="mt-[44px]">
      <h3 className="text-[20px] font-medium leading-[26px] text-[#333]">지원 이후 변화 확인</h3>
      <p className="mt-[10px] text-[16px] font-normal leading-[25px] text-[#999]">
        최근 지원이 종료된 3개 연도의 다음 해 데이터를 비교합니다. 같은 연도에 종료된 지원은 하나로 통합하여 주요 변화 항목 3개를 제공합니다.
      </p>
      <div className="mt-[22px] rounded-[10px] border border-[#e8e8e8] bg-white px-[30px] py-[27px]">
        {observations.map((item, index) => {
          const available = isChangeAvailable(item);

          return (
            <section
              className={
                index === 0
                  ? "pb-[30px]"
                  : "border-t border-[#eee] py-[30px] last:pb-0"
              }
              data-dashboard-print-avoid
              key={`${item.supportEndYear}-${item.observationYear}-${index}`}
            >
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-[18px] text-[20px] font-medium leading-[26px]">
                  <span className="text-[#333]">{changeTitle(item)}</span>
                  <span className="text-[22px] font-normal text-[#333]">→</span>
                  <span className="text-[#888]">{changeObservationYearText(item)}</span>
                </div>
                <span
                  className={`inline-flex h-[34px] min-w-[92px] items-center justify-center rounded-[17px] px-[18px] text-[16px] font-medium ${
                    available ? "bg-[#dcebff] text-[#287dff]" : "bg-[#eeeeee] text-[#666]"
                  }`}
                >
                  {available ? "확인 가능" : "제공 예정"}
                </span>
              </div>
              {available && item.topChanges.length > 0 ? (
                <div className="mt-[26px] grid grid-cols-3 gap-5">
                  {item.topChanges.slice(0, 3).map((change, changeIndex) => (
                    <ChangeMetricCard
                      item={change}
                      key={`${change.metric}-${change.label}-${changeIndex}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-[26px] text-[16px] font-normal leading-[25px] text-[#777]">
                  {item.descriptionText || "다음 데이터 갱신 후 확인 예정"}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

const ActivityLegendItem = ({
  children,
  marker,
}: {
  children: string;
  marker: "btp" | "ntis" | "patent-application" | "patent-registered";
}) => (
  <span className="inline-flex items-center gap-[10px] text-[16px] font-medium text-[#555]">
    {marker === "patent-registered" && (
      <span className="h-[14px] w-[14px] rounded-full bg-[#3b8ddf]" />
    )}
    {marker === "patent-application" && (
      <span className="h-[14px] w-[14px] rounded-full border-[3px] border-[#3b8ddf] bg-white" />
    )}
    {marker === "ntis" && <span className="h-[6px] w-[24px] rounded-full bg-[#3b8ddf]" />}
    {marker === "btp" && <span className="h-[14px] w-[14px] rounded-[3px] bg-[#7868d8]" />}
    {children}
  </span>
);

const ActivitySupportTimelineSection = ({
  data,
  supportTimelineItems,
  years,
}: {
  data: CompanyActivitySupportTimelineResponse | null | undefined;
  supportTimelineItems: BtpSupportTimelineItem[];
  years: number[];
}) => {
  const [tooltip, setTooltip] = useState<ActivityTooltipState>(null);

  if (!data || years.length === 0) {
    return null;
  }

  const patentRegisteredEvents = aggregatePointEvents(
    data.patentEvents,
    years,
    "PATENT_REGISTERED",
  );
  const patentApplicationEvents = aggregatePointEvents(
    data.patentEvents,
    years,
    "PATENT_APPLICATION",
  );
  const patentEvents = combinePatentEvents(patentApplicationEvents, patentRegisteredEvents);
  const btpEvents = aggregateBtpEvents(data.btpSupportEvents, years);
  const ntisPeriods = visibleNtisPeriods(data.ntisEvents, years);
  const hasAnyEvent =
    patentRegisteredEvents.length > 0 ||
    patentApplicationEvents.length > 0 ||
    btpEvents.length > 0 ||
    ntisPeriods.length > 0;

  if (!hasAnyEvent) {
    return null;
  }

  const viewBox = { height: 360, width: 920 };
  const axis = {
    bottom: 312,
    left: 122,
    right: 878,
    top: 70,
  };
  const plot = {
    left: axis.left + 58,
    right: axis.right - 58,
  };
  const yByLane = {
    btp: 252,
    ntis: 166,
    patent: 76,
  };
  const xByYear = (year: number) => {
    const firstYear = years[0];
    const lastYear = years[years.length - 1];
    const denominator = Math.max(lastYear - firstYear, 1);

    return plot.left + ((year - firstYear) / denominator) * (plot.right - plot.left);
  };
  const showTooltip = (x: number, y: number, title: string, lines: string[]) => {
    setTooltip({ lines, title, x, y });
  };

  return (
    <div className="mt-[42px]">
      <h3 className="text-[20px] font-medium leading-[26px] text-[#333]">
        기업 활동·지원 이력
      </h3>
      <div className="mt-[30px] flex flex-wrap items-center gap-x-[34px] gap-y-3 pl-[30px]">
        <ActivityLegendItem marker="patent-registered">특허 등록</ActivityLegendItem>
        <ActivityLegendItem marker="patent-application">특허 출원</ActivityLegendItem>
        <ActivityLegendItem marker="ntis">국가 R&D 수행기간</ActivityLegendItem>
        <ActivityLegendItem marker="btp">부산TP 지원</ActivityLegendItem>
      </div>
      <div className="relative mt-[18px]" onMouseLeave={() => setTooltip(null)}>
        <svg
          aria-label="기업 활동·지원 이력"
          className="h-auto w-full"
          role="img"
          viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        >
          <line
            stroke="#e5e5e5"
            strokeWidth="2"
            x1={axis.left}
            x2={axis.left}
            y1={axis.top - 44}
            y2={axis.bottom}
          />
          <line
            stroke="#d9d9d9"
            strokeWidth="2"
            x1={axis.left}
            x2={axis.right}
            y1={axis.bottom}
            y2={axis.bottom}
          />

          <text
            fill="#999"
            fontSize="18"
            fontWeight="500"
            textAnchor="end"
            x={axis.left - 22}
            y={yByLane.patent + 6}
          >
            특허
          </text>
          <text
            fill="#999"
            fontSize="18"
            fontWeight="500"
            textAnchor="end"
            x={axis.left - 22}
            y={yByLane.ntis + 6}
          >
            국가 R&D
          </text>
          <text
            fill="#999"
            fontSize="18"
            fontWeight="500"
            textAnchor="end"
            x={axis.left - 22}
            y={yByLane.btp + 6}
          >
            부산TP 지원
          </text>

          {years.map((year) => (
            <text
              fill="#999"
              fontSize="18"
              fontWeight="500"
              key={year}
              textAnchor="middle"
              x={xByYear(year)}
              y={axis.bottom + 36}
            >
              {year}
            </text>
          ))}

          {ntisPeriods.map((period, index) => {
            const startX = xByYear(period.startYear);
            const endX = xByYear(period.endYear);
            const labelX = startX + (endX - startX) / 2;
            const lineWidth = scaledSize(period.count, 5, 14);
            const dotRadius = scaledSize(period.count, 6, 13);

            return (
              <g
                className="cursor-pointer"
                key={`${period.startYear}-${period.endYear}-${index}`}
                onMouseEnter={() =>
                  showTooltip(labelX, yByLane.ntis - 48, "국가 R&D", ntisTooltipLines(period))
                }
              >
                <text
                  fill="#999"
                  fontSize="14"
                  fontWeight="500"
                  textAnchor="middle"
                  x={labelX}
                  y={yByLane.ntis - 36}
                >
                  {period.label}
                </text>
                <line
                  stroke="#3b8ddf"
                  strokeLinecap="round"
                  strokeOpacity="0"
                  strokeWidth={lineWidth + 16}
                  x1={startX}
                  x2={endX}
                  y1={yByLane.ntis}
                  y2={yByLane.ntis}
                />
                <line
                  stroke="#3b8ddf"
                  strokeLinecap="round"
                  strokeWidth={lineWidth}
                  x1={startX}
                  x2={endX}
                  y1={yByLane.ntis}
                  y2={yByLane.ntis}
                />
                <circle cx={startX} cy={yByLane.ntis} fill="#3b8ddf" r={dotRadius} />
                <circle cx={endX} cy={yByLane.ntis} fill="#3b8ddf" r={dotRadius} />
              </g>
            );
          })}

          {patentEvents.map((item) => {
            const totalCount = item.applicationCount + item.registeredCount;
            const outerRadius = scaledSize(totalCount, 12, 25);
            const innerRadius = scaledSize(item.registeredCount, 6, 17);

            return (
              <g
                className="cursor-pointer"
                key={`patent-${item.year}`}
                onMouseEnter={() =>
                  showTooltip(xByYear(item.year), yByLane.patent - 42, "특허", patentTooltipLines(item))
                }
              >
                <text
                  fill="#999"
                  fontSize="14"
                  fontWeight="500"
                  textAnchor="middle"
                  x={xByYear(item.year)}
                  y={yByLane.patent - 26}
                >
                  {item.label}
                </text>
                {item.applicationCount > 0 && (
                  <circle
                    cx={xByYear(item.year)}
                    cy={yByLane.patent}
                    fill="#dcefff"
                    r={outerRadius}
                    stroke="#3b8ddf"
                    strokeWidth="3"
                  />
                )}
                {item.registeredCount > 0 && (
                  <circle cx={xByYear(item.year)} cy={yByLane.patent} fill="#3b8ddf" r={innerRadius} />
                )}
                <circle cx={xByYear(item.year)} cy={yByLane.patent} fill="transparent" r={outerRadius + 9} />
              </g>
            );
          })}

          {btpEvents.map((item) => {
            const markerSize = scaledSize(item.count, 13, 32);

            return (
              <g
                className="cursor-pointer"
                key={`btp-${item.year}`}
                onMouseEnter={() =>
                  showTooltip(
                    xByYear(item.year),
                    yByLane.btp - 40,
                    "부산TP 지원",
                    btpTooltipLines(supportTimelineItems, item.year),
                  )
                }
              >
                <text
                  fill="#999"
                  fontSize="14"
                  fontWeight="500"
                  textAnchor="middle"
                  x={xByYear(item.year)}
                  y={yByLane.btp - 24}
                >
                  {item.label}
                </text>
                <rect
                  fill="#7868d8"
                  height={markerSize}
                  rx="2"
                  width={markerSize}
                  x={xByYear(item.year) - markerSize / 2}
                  y={yByLane.btp - markerSize / 2}
                />
                <rect
                  fill="transparent"
                  height={markerSize + 18}
                  width={markerSize + 18}
                  x={xByYear(item.year) - markerSize / 2 - 9}
                  y={yByLane.btp - markerSize / 2 - 9}
                />
              </g>
            );
          })}
        </svg>
        {tooltip && (
          <div
            className="pointer-events-none absolute z-20 w-[240px] rounded-[6px] border border-[#e5e5e5] bg-white px-3 py-2 text-[12px] leading-[17px] text-[#555] shadow-sm"
            style={{
              left: `${Math.min(82, Math.max(18, (tooltip.x / viewBox.width) * 100))}%`,
              top: `${(tooltip.y / viewBox.height) * 100}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="mb-1 font-medium text-[#333]">{tooltip.title}</p>
            {tooltip.lines.map((line, index) => (
              <p className="break-keep" key={`${line}-${index}`}>
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SupportTooltip = ({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ color?: string; name?: string; value?: number }>;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-[8px] border border-[#eee] bg-white px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-[#333]">{label}</p>
      {payload
        .filter((item) => item.value)
        .map((item) => (
          <p className="text-[#555]" key={item.name} style={{ color: item.color }}>
            {item.name}: {item.value?.toLocaleString()}건
          </p>
        ))}
    </div>
  );
};

const LegendContent = () => (
  <div className="mt-3 flex items-center gap-6 pl-1 text-lg font-medium text-[#555]">
    {supportCategories.map((category) => (
      <span className="inline-flex items-center gap-2" key={category.dataKey}>
        <span
          className="h-[14px] w-[14px] rounded-[3px]"
          style={{ backgroundColor: category.color }}
        />
        {category.label}
      </span>
    ))}
  </div>
);

const DuplicateSupportReviewSection = ({
  companyId,
  isSample = false,
}: DashboardCompanyProps) => {
  const { data, error, isLoading } = useDashboardGetData<SupportHistoryLatestVsPastResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/support-history/review/latest-vs-past",
  );
  const { data: postSupportChangeData } =
    useDashboardGetData<SupportHistoryPostSupportChangeResponse>(
      isSample ? "" : companyId,
      "/companies/{companyId}/support-history/review/post-support-changes",
    );
  const { data: activityTimelineData } =
    useDashboardGetData<CompanyActivitySupportTimelineResponse>(
      isSample ? "" : companyId,
      "/companies/{companyId}/activity-support-timeline",
    );
  const items = isSample
    ? sampleSupportItems
    : data?.btpSupportTimeline?.items
      ? buildSupportItemsFromTimeline(data.btpSupportTimeline.items)
      : data?.yearlySupportChart?.items ?? [];
  const timelineItems = isSample ? sampleTimelineItems : data?.btpSupportTimeline?.items ?? [];
  const comparisons = isSample ? sampleComparisons : data?.comparisons ?? [];
  const postSupportObservations = isSample
    ? samplePostSupportObservations
    : postSupportChangeData?.observations ?? [];
  const latestSupportTargets = isSample
    ? sampleLatestSupportTargets
    : data?.latestSupportTargets ?? [];
  const latestYear =
    latestSupportYear(latestSupportTargets) ?? latestSupportYear(timelineItems);
  const latestCount =
    (isSample ? latestSupportTargets.length : data?.summary?.latestSupportTargetCount) ??
    latestYearCount(timelineItems, latestYear);
  const selectedCount = isSample
    ? 12
    : data?.summary?.btpSelectedSupportCount ?? timelineItems.length;
  const chartData = buildChartData(items);
  const activityTimeline = isSample ? sampleActivityTimeline : activityTimelineData;
  const activityYears = chartData.map((item) => item.year);

  if (!isSample && error) {
    return (
      <div className="rounded-[10px] border border-[#eee] bg-white px-7 py-6 text-sm font-medium text-red-600">
        중복지원 검토 정보를 불러오지 못했습니다.
      </div>
    );
  }

  if (!isSample && isLoading && !data) {
    return (
      <div>
        <h3 className="mb-6 text-xl font-medium text-[#333]">부산TP 지원 현황 - 연도별 건수</h3>
        <div className="h-[400px] animate-pulse rounded-[10px] border border-[#eee] bg-white" />
      </div>
    );
  }

  return (
    <div>
      <SummaryCards
        latestCount={latestCount}
        latestYear={latestYear}
        selectedCount={selectedCount}
      />
      <div>
        <h3 className="mb-5 text-xl font-medium text-[#333]">부산TP 지원 현황 - 연도별 건수</h3>
        <div
          className="rounded-[10px] border border-[#eee] bg-white px-[34px] pb-5 pt-5"
          style={{ height: 336 }}
        >
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              barCategoryGap="16%"
              barGap={0}
              data={chartData}
              margin={{ bottom: 10, left: 0, right: 0, top: 8 }}
            >
              <CartesianGrid stroke="#eee" vertical={false} />
              <XAxis
                axisLine={{ stroke: "#ddd" }}
                dataKey="yearLabel"
                tick={{ fill: "#666", fontSize: 18, fontWeight: 500 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={{ stroke: "#ddd" }}
                domain={[0, "dataMax"]}
                tick={{ fill: "#666", fontSize: 18, fontWeight: 500 }}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<SupportTooltip />} />
              <Legend content={<LegendContent />} verticalAlign="bottom" />
              {supportCategories.map((category) => (
                <Bar
                  dataKey={category.dataKey}
                  isAnimationActive={false}
                  fill={category.color}
                  key={category.dataKey}
                  name={category.label}
                  stackId="support"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <SupportTimelineTable items={timelineItems} />
      <SupportComparisonList comparisons={comparisons} />
      <PostSupportChangeSection observations={postSupportObservations} />
      <ActivitySupportTimelineSection
        data={activityTimeline}
        supportTimelineItems={timelineItems}
        years={activityYears}
      />
    </div>
  );
};

export default DuplicateSupportReviewSection;
