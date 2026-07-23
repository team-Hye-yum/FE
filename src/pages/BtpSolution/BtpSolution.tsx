import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type ApiDataResponse<T> = {
  data: T;
};

type IndustrySearchItem = {
  ksicCode: string;
  sectionCode: string;
  sectionName: string;
  divisionName: string;
  groupName: string;
  className: string;
  subclassName: string;
  displayName: string;
};

type CountPair = {
  establishmentCount: number | null;
  employeeCount: number | null;
};

type RatioPair = {
  corporationRatio: number | null;
  individualRatio: number | null;
};

type EmployeeSizeRatio = {
  name: string;
  busanRatio: number | null;
  btpRatio: number | null;
};

type IndustryOverview = {
  sectionCode: string;
  sectionName: string;
  busanBaseYear: number | null;
  btpBaseYear: number | null;
  industryScale: {
    busan: CountPair;
    btp: CountPair;
  };
  businessTypeRatio: {
    busan: RatioPair;
    btp: RatioPair;
  };
  employeeSizeRatio: EmployeeSizeRatio[];
};

type IndustrySelectedEvent = CustomEvent<{
  industry: IndustrySearchItem;
}>;

const BLUE = "#2f8fea";
const TEAL = "#62d4ca";
const BTP_BLUE = "#2478d7";
const BTP_PURPLE = "#aaa3ea";

const apiUrl = (path: string) => {
  const baseUrl = import.meta.env.API_URL || import.meta.env.VITE_API_URL || "/api";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const formatCount = (value: number | null) => {
  if (value === null) {
    return "-";
  }

  return value.toLocaleString("ko-KR");
};

const formatPercent = (value: number | null) => {
  if (value === null) {
    return "-";
  }

  return `${(value * 100).toFixed(1)}%`;
};

const percentValue = (value: number | null) => {
  if (value === null) {
    return 0;
  }

  return Math.max(0, Math.min(value * 100, 100));
};

const percentTick = (value: number) => `${Math.round(value)}%`;

const percentLabel = (value: unknown) => {
  if (typeof value !== "number") {
    return "";
  }

  return `${value.toFixed(1)}%`;
};

const getSectionCodeFromSearch = (search: string) => {
  const trimmedSearch = search.replace(/^\?/, "").trim();

  if (!trimmedSearch) {
    return "";
  }

  const searchParams = new URLSearchParams(search);
  const namedCode =
    searchParams.get("sectionCode") ??
    searchParams.get("industryCode") ??
    searchParams.get("code") ??
    "";

  if (namedCode.trim()) {
    return namedCode.trim().toUpperCase();
  }

  if (!trimmedSearch.includes("=") && !trimmedSearch.includes("&")) {
    return decodeURIComponent(trimmedSearch).trim().toUpperCase();
  }

  return "";
};

const BtpSolution = () => {
  const { search } = useLocation();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySearchItem | null>(null);
  const [overview, setOverview] = useState<IndustryOverview | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const loadOverview = (sectionCode: string) => {
    setOverview(null);
    setStatus("loading");
    setErrorMessage("");

    fetch(apiUrl(`/btp-solution/industries/${encodeURIComponent(sectionCode)}/overview`))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`산업 분석 정보를 불러오지 못했습니다. (${response.status})`);
        }

        return response.json() as Promise<ApiDataResponse<IndustryOverview>>;
      })
      .then((response) => {
        setOverview(response.data);
        setSelectedIndustry((currentIndustry) => ({
          className: currentIndustry?.className ?? "",
          displayName: currentIndustry?.displayName || response.data.sectionName,
          divisionName: currentIndustry?.divisionName ?? "",
          groupName: currentIndustry?.groupName ?? "",
          ksicCode: currentIndustry?.ksicCode || response.data.sectionCode,
          sectionCode: response.data.sectionCode,
          sectionName: response.data.sectionName,
          subclassName: currentIndustry?.subclassName ?? "",
        }));
        setStatus("idle");
      })
      .catch((error: unknown) => {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "산업 분석 정보를 불러오지 못했습니다.",
        );
      });
  };

  useEffect(() => {
    const handleIndustrySelected = (event: Event) => {
      const { industry } = (event as IndustrySelectedEvent).detail;

      setSelectedIndustry(industry);
      loadOverview(industry.sectionCode);
    };

    window.addEventListener("btp-solution-industry-selected", handleIndustrySelected);

    return () => {
      window.removeEventListener("btp-solution-industry-selected", handleIndustrySelected);
    };
  }, []);

  useEffect(() => {
    const sectionCode = getSectionCodeFromSearch(search);

    if (!sectionCode) {
      return;
    }

    setSelectedIndustry({
      className: "",
      displayName: sectionCode,
      divisionName: "",
      groupName: "",
      ksicCode: sectionCode,
      sectionCode,
      sectionName: sectionCode,
      subclassName: "",
    });
    loadOverview(sectionCode);
  }, [search]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {!selectedIndustry && (
        <section className="bg-white px-6 py-7 sm:px-8">
          <div className="flex min-h-[220px] items-center justify-center text-center">
            <p className="text-base font-medium text-[#777]">산업을 검색해서 선택해주세요.</p>
          </div>
        </section>
      )}

      {selectedIndustry && (
        <section>
          {status === "error" && (
            <p className="rounded-[6px] bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          )}

          {status === "loading" && (
            <div className="rounded-[8px] bg-white px-6 py-8 text-center text-sm font-semibold text-[#2b7fff]">
              불러오는 중
            </div>
          )}

          {overview && <IndustryStatus overview={overview} />}
        </section>
      )}
    </main>
  );
};

type IndustryStatusProps = {
  overview: IndustryOverview;
};

const IndustryStatus = ({ overview }: IndustryStatusProps) => {
  const busanRatio = overview.businessTypeRatio.busan;
  const btpRatio = overview.businessTypeRatio.btp;

  return (
    <div className="btp-industry-status">
      <style>
        {`
          .btp-industry-status .scale-grid {
            display: grid;
            grid-template-columns: 112px repeat(4, minmax(0, 1fr));
            min-width: 760px;
          }

          .btp-industry-status .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .btp-industry-status .donut-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .btp-industry-status .employee-grid {
            display: grid;
            grid-template-columns: 1fr 64px 88px;
            column-gap: 8px;
          }

          @media (max-width: 767px) {
            .btp-industry-status .status-card {
              padding: 16px 14px;
            }

            .btp-industry-status .section-title {
              font-size: 22px !important;
            }

            .btp-industry-status .scale-scroll {
              overflow-x: visible;
            }

            .btp-industry-status .scale-grid {
              min-width: 0;
              grid-template-columns: 1fr;
            }

            .btp-industry-status .scale-legend {
              flex-direction: row;
              justify-content: center;
              border-right: 0 !important;
              border-bottom: 1px solid #dce4ef;
            }

            .btp-industry-status .metric-column {
              border-left: 0 !important;
              border-top: 1px solid #dce4ef;
            }

            .btp-industry-status .detail-grid {
              grid-template-columns: 1fr;
            }

            .btp-industry-status .employee-panel {
              border-left: 0 !important;
              border-top: 1px solid #e1e8f2;
              padding-left: 0 !important;
              padding-top: 20px;
            }

            .btp-industry-status .donut-grid {
              grid-template-columns: 1fr;
            }

            .btp-industry-status .employee-grid {
              grid-template-columns: minmax(0, 1fr);
            }

            .btp-industry-status .employee-side-header,
            .btp-industry-status .employee-value-column {
              display: none;
            }
          }
        `}
      </style>
      <div
        className="status-card overflow-hidden rounded-lg bg-white px-4 py-4 shadow-sm"
        style={{ border: "1px solid #dce4ef" }}
      >
        <div className="mb-5 flex items-center gap-3" style={{ color: "#123b7a" }}>
          <span className="section-title font-extrabold leading-none" style={{ fontSize: 26 }}>
            1.
          </span>
          <h2 className="section-title font-extrabold leading-none" style={{ fontSize: 26 }}>
            산업 현황
          </h2>
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: "#c6d5ea" }}
          >
            i
          </span>
        </div>

        <h3 className="font-extrabold" style={{ color: "#123b7a", fontSize: 17 }}>
          산업 규모 비교
        </h3>

        <div className="scale-scroll mt-4 overflow-x-auto">
          <div
            className="scale-grid overflow-hidden rounded-md text-center"
            style={{
              border: "1px solid #dce4ef",
              color: "#123b7a",
            }}
          >
            <div
              className="scale-legend flex flex-col justify-center gap-4 bg-white px-3 py-4 text-left text-xs font-bold"
              style={{ borderRight: "1px solid #dce4ef" }}
            >
              <LegendItem color={TEAL} label="부산 전체" />
              <LegendItem color={BTP_BLUE} label="BTP 지원기업" />
            </div>
            <MetricColumn
              btp={overview.industryScale.btp.establishmentCount}
              busan={overview.industryScale.busan.establishmentCount}
              label="사업체 수"
              suffix="개"
            />
            <MetricColumn
              btp={overview.industryScale.btp.employeeCount}
              busan={overview.industryScale.busan.employeeCount}
              label="종사자 수"
              suffix="명"
            />
            <MetricColumn
              btp={btpRatio.corporationRatio}
              busan={busanRatio.corporationRatio}
              isRatio
              label="법인 비중"
            />
            <MetricColumn
              btp={btpRatio.individualRatio}
              busan={busanRatio.individualRatio}
              isRatio
              label="개인 비중"
            />
          </div>
        </div>

        <div
          className="detail-grid mt-5 pt-5"
          style={{ borderTop: "1px solid #e6edf6" }}
        >
          <div>
            <h3 className="font-extrabold" style={{ color: "#123b7a", fontSize: 17 }}>
              법인/개인 비중 비교
            </h3>
            <div className="donut-grid mt-5">
              <DonutPanel
                colors={[BLUE, TEAL]}
                ratio={busanRatio}
                title="부산 전체"
              />
              <DonutPanel
                colors={[BTP_BLUE, BTP_PURPLE]}
                ratio={btpRatio}
                title="BTP 지원기업"
              />
            </div>
            <div className="mt-4 flex justify-center gap-8 text-sm font-bold" style={{ color: "#3f4a5f" }}>
              <LegendItem color={BLUE} label="법인" />
              <LegendItem color={TEAL} label="개인" />
            </div>
          </div>

          <div className="employee-panel pl-5" style={{ borderLeft: "1px solid #e1e8f2" }}>
            <h3 className="font-extrabold" style={{ color: "#123b7a", fontSize: 17 }}>
              종사자 규모별 비중 비교
            </h3>
            <div className="mt-5">
              <EmployeeSizeChart items={overview.employeeSizeRatio} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type LegendItemProps = {
  color: string;
  label: string;
};

const LegendItem = ({ color, label }: LegendItemProps) => (
  <span className="inline-flex items-center gap-2 whitespace-nowrap">
    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    <span>{label}</span>
  </span>
);

type MetricColumnProps = {
  btp: number | null;
  busan: number | null;
  isRatio?: boolean;
  label: string;
  suffix?: string;
};

const MetricColumn = ({ btp, busan, isRatio = false, label, suffix = "" }: MetricColumnProps) => (
  <div className="metric-column px-3 py-4" style={{ borderLeft: "1px solid #dce4ef" }}>
    <p className="text-sm font-extrabold" style={{ color: "#334766" }}>
      {label}
    </p>
    <div className="mt-3 space-y-1.5">
      <MetricValue isRatio={isRatio} suffix={suffix} value={busan} />
      <MetricValue isRatio={isRatio} suffix={suffix} value={btp} />
    </div>
  </div>
);

type MetricValueProps = {
  isRatio: boolean;
  suffix: string;
  value: number | null;
};

const MetricValue = ({ isRatio, suffix, value }: MetricValueProps) => (
  <p
    className="whitespace-nowrap font-extrabold leading-tight"
    style={{ color: "#123b7a", fontSize: 22 }}
  >
    {isRatio ? formatPercent(value) : formatCount(value)}
    {!isRatio && value !== null && (
      <span className="ml-1 text-sm font-bold" style={{ color: "#24528d" }}>
        {suffix}
      </span>
    )}
  </p>
);

type DonutPanelProps = {
  colors: [string, string];
  ratio: RatioPair;
  title: string;
};

const DonutPanel = ({ colors, ratio, title }: DonutPanelProps) => {
  const corporation = percentValue(ratio.corporationRatio);
  const individual = percentValue(ratio.individualRatio);
  const hasData = corporation + individual > 0;
  const data = hasData
    ? [
        { name: "법인", value: corporation },
        { name: "개인", value: individual },
      ]
    : [{ name: "데이터 없음", value: 100 }];

  return (
    <div className="text-center">
      <p className="text-sm font-extrabold" style={{ color: "#334766" }}>
        {title}
      </p>
      <div
        className="relative mx-auto mt-4"
        style={{ height: 168, width: 168 }}
      >
        <PieChart height={168} width={168}>
          <Pie
            cx={84}
            cy={84}
            data={data}
            dataKey="value"
            endAngle={-270}
            innerRadius={52}
            isAnimationActive={false}
            outerRadius={78}
            paddingAngle={0}
            startAngle={90}
            stroke="#ffffff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell
                fill={hasData && entry.value > 0 ? colors[index] : "#e9eef6"}
                key={entry.name}
              />
            ))}
          </Pie>
        </PieChart>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg font-extrabold"
          style={{ color: "#123b7a" }}
        >
          {formatPercent(ratio.corporationRatio)}
        </div>
      </div>
    </div>
  );
};

type EmployeeSizeChartProps = {
  items: EmployeeSizeRatio[];
};

const EmployeeSizeChart = ({ items }: EmployeeSizeChartProps) => {
  const data = items.map((item) => ({
    btp: percentValue(item.btpRatio),
    busan: percentValue(item.busanRatio),
    name: item.name,
  }));

  return (
    <div>
      <div
        className="employee-grid mb-2 text-center text-sm font-extrabold"
        style={{ color: "#334766" }}
      >
        <div />
        <div className="employee-side-header whitespace-nowrap">부산 전체</div>
        <div className="employee-side-header whitespace-nowrap">BTP 지원기업</div>
      </div>
      <div className="employee-grid">
        <div style={{ height: 240 }}>
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              barGap={-12}
              barSize={10}
              data={data}
              layout="vertical"
              margin={{ bottom: 8, left: 0, right: 10, top: 4 }}
            >
              <CartesianGrid horizontal={false} stroke="#edf2f7" />
              <XAxis
                axisLine={{ stroke: "#dce4ef" }}
                domain={[0, 60]}
                tick={{ fill: "#7b8798", fontSize: 12, fontWeight: 700 }}
                tickFormatter={percentTick}
                ticks={[0, 20, 40, 60]}
                type="number"
              />
              <YAxis
                axisLine={false}
                dataKey="name"
                tick={{ fill: "#42506a", fontSize: 13, fontWeight: 700 }}
                tickLine={false}
                type="category"
                width={76}
              />
              <Bar dataKey="busan" fill={TEAL} radius={[0, 8, 8, 0]} />
              <Bar dataKey="btp" fill={BLUE} radius={[0, 8, 8, 0]}>
                <LabelList
                  dataKey="btp"
                  fill="#42506a"
                  fontSize={12}
                  fontWeight={700}
                  formatter={percentLabel}
                  position="right"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div
          className="employee-value-column flex flex-col justify-around pt-1 text-center text-sm font-bold"
          style={{ color: "#42506a", height: 204 }}
        >
          {items.map((item) => (
            <span key={`busan-${item.name}`}>{formatPercent(item.busanRatio)}</span>
          ))}
        </div>
        <div
          className="employee-value-column flex flex-col justify-around pt-1 text-center text-sm font-bold"
          style={{ color: "#42506a", height: 204 }}
        >
          {items.map((item) => (
            <span key={`btp-${item.name}`}>{formatPercent(item.btpRatio)}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BtpSolution;
