import { useEffect, useMemo, useRef, useState } from "react";
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

type InfraHubFacility = {
  facilityId: number;
  siteName: string | null;
  buildingNo: string | null;
  buildingName: string;
  grossFloorArea: string | null;
  floors: string | null;
  purpose: string | null;
};

type InfraHubCategoryCount = {
  name: string;
  count: number;
};

type InfraHubSampleEquipment = {
  equipmentId: number;
  equipmentName: string;
  categoryLarge: string | null;
  locationName: string | null;
};

type InfraHub = {
  hubId: number;
  hubName: string;
  hubKind: string;
  centerName: string | null;
  summary: string | null;
  address: string | null;
  districtName: string | null;
  tel: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  spaceUrl: string | null;
  directionsUrl: string | null;
  equipmentCount: number;
  topEquipmentCategories: InfraHubCategoryCount[];
  sampleEquipments: InfraHubSampleEquipment[];
  facilities: InfraHubFacility[];
};

type InfraHubResponse = {
  sectionCode: string;
  hubs: InfraHub[];
};

type ConnectionEvidenceEquipment = {
  equipmentId: number;
  equipmentName: string;
  categoryLarge: string | null;
  hubId: number;
  hubName: string;
};

type ConnectionEvidenceCompany = {
  companyId: number;
  companyName: string;
  mainProducts: string[];
  connectedFunctions: string[];
  connectedEquipments: ConnectionEvidenceEquipment[];
  evidenceText: string | null;
};

type ConnectionEvidenceResponse = {
  sectionCode: string;
  summary: {
    companyCount: number;
    equipmentCount: number;
    hubCount: number;
  };
  items: ConnectionEvidenceCompany[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type IndustrySelectedEvent = CustomEvent<{
  industry: IndustrySearchItem;
}>;

type KakaoMapsApi = {
  LatLng: new (latitude: number, longitude: number) => unknown;
  LatLngBounds: new () => {
    extend: (latlng: unknown) => void;
  };
  Map: new (
    container: HTMLElement,
    options: { center: unknown; level: number },
  ) => {
    setBounds: (bounds: unknown) => void;
  };
  Marker: new (options: { map: unknown; position: unknown }) => unknown;
  CustomOverlay: new (options: {
    content: HTMLElement | string;
    map: unknown;
    position: unknown;
    xAnchor: number;
    yAnchor: number;
  }) => unknown;
  event: {
    addListener: (target: unknown, type: string, handler: () => void) => void;
  };
  load: (handler: () => void) => void;
};

declare global {
  interface Window {
    kakao?: {
      maps: KakaoMapsApi;
    };
  }
}

const BLUE = "#2f8fea";
const TEAL = "#62d4ca";
const BTP_BLUE = "#2478d7";
const BTP_PURPLE = "#aaa3ea";
const KAKAO_MAP_SDK_ID = "kakao-map-sdk";

let kakaoMapSdkPromise: Promise<void> | null = null;

const apiUrl = (path: string) => {
  const baseUrl = import.meta.env.API_URL || import.meta.env.VITE_API_URL || "/api";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const getKakaoMapKey = () =>
  import.meta.env.VITE_KAKAO_MAP_APP_KEY ||
  import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY ||
  import.meta.env.VITE_KAKAO_MAP_KEY ||
  "";

const loadKakaoMapSdk = () => {
  if (window.kakao?.maps) {
    return Promise.resolve();
  }

  if (kakaoMapSdkPromise) {
    return kakaoMapSdkPromise;
  }

  const appKey = getKakaoMapKey();

  if (!appKey) {
    return Promise.reject(new Error("카카오맵 JavaScript 키가 설정되지 않았습니다."));
  }

  kakaoMapSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(KAKAO_MAP_SDK_ID) as HTMLScriptElement | null;

    const handleLoad = () => {
      window.kakao?.maps.load(resolve);
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("카카오맵을 불러오지 못했습니다.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_MAP_SDK_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("카카오맵을 불러오지 못했습니다.")), {
      once: true,
    });
    document.head.appendChild(script);
  });

  return kakaoMapSdkPromise;
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

const getHubMarkerClass = (equipmentCount: number) => {
  if (equipmentCount >= 30) {
    return "hub-marker hub-marker-strong";
  }

  if (equipmentCount >= 10) {
    return "hub-marker hub-marker-medium";
  }

  return "hub-marker hub-marker-light";
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const selectRepresentativeHubId = (hubs: InfraHub[]) => {
  const sortedHubs = [...hubs].sort((left, right) => right.equipmentCount - left.equipmentCount);
  return sortedHubs[0]?.hubId ?? null;
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
  const [infraHubs, setInfraHubs] = useState<InfraHub[]>([]);
  const [infraStatus, setInfraStatus] = useState<"idle" | "loading" | "error">("idle");
  const [infraErrorMessage, setInfraErrorMessage] = useState("");
  const [selectedHubId, setSelectedHubId] = useState<number | null>(null);
  const [connectionEvidence, setConnectionEvidence] = useState<ConnectionEvidenceResponse | null>(null);
  const [connectionEvidenceStatus, setConnectionEvidenceStatus] = useState<"idle" | "loading" | "error">("idle");
  const [connectionEvidenceErrorMessage, setConnectionEvidenceErrorMessage] = useState("");
  const [connectionEvidenceSearchText, setConnectionEvidenceSearchText] = useState("");
  const [connectionEvidenceKeyword, setConnectionEvidenceKeyword] = useState("");
  const [connectionEvidencePage, setConnectionEvidencePage] = useState(0);
  const [connectionEvidenceSize, setConnectionEvidenceSize] = useState(10);

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

  const resetConnectionEvidence = () => {
    setConnectionEvidence(null);
    setConnectionEvidenceStatus("idle");
    setConnectionEvidenceErrorMessage("");
    setConnectionEvidenceSearchText("");
    setConnectionEvidenceKeyword("");
    setConnectionEvidencePage(0);
    setConnectionEvidenceSize(10);
  };

  const loadInfraHubs = (sectionCode: string) => {
    setInfraHubs([]);
    setInfraStatus("loading");
    setInfraErrorMessage("");
    setSelectedHubId(null);

    fetch(apiUrl(`/btp-solution/industries/${encodeURIComponent(sectionCode)}/infra-hubs`))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`공동활용 인프라 정보를 불러오지 못했습니다. (${response.status})`);
        }

        return response.json() as Promise<ApiDataResponse<InfraHubResponse>>;
      })
      .then((response) => {
        setInfraHubs(response.data.hubs);
        setSelectedHubId(selectRepresentativeHubId(response.data.hubs));
        setInfraStatus("idle");
      })
      .catch((error: unknown) => {
        setInfraStatus("error");
        setInfraErrorMessage(
          error instanceof Error ? error.message : "공동활용 인프라 정보를 불러오지 못했습니다.",
        );
      });
  };

  useEffect(() => {
    const handleIndustrySelected = (event: Event) => {
      const { industry } = (event as IndustrySelectedEvent).detail;

      setSelectedIndustry(industry);
      resetConnectionEvidence();
      loadOverview(industry.sectionCode);
      loadInfraHubs(industry.sectionCode);
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
    resetConnectionEvidence();
    loadOverview(sectionCode);
    loadInfraHubs(sectionCode);
  }, [search]);

  useEffect(() => {
    const sectionCode = selectedIndustry?.sectionCode;

    if (!sectionCode) {
      return;
    }

    setConnectionEvidenceStatus("loading");
    setConnectionEvidenceErrorMessage("");

    const params = new URLSearchParams({
      keyword: connectionEvidenceKeyword,
      page: String(connectionEvidencePage),
      size: String(connectionEvidenceSize),
    });

    fetch(
      apiUrl(
        `/btp-solution/industries/${encodeURIComponent(sectionCode)}/connection-evidence/companies?${params.toString()}`,
      ),
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`연결 근거 정보를 불러오지 못했습니다. (${response.status})`);
        }

        return response.json() as Promise<ApiDataResponse<ConnectionEvidenceResponse>>;
      })
      .then((response) => {
        setConnectionEvidence(response.data);
        setConnectionEvidenceStatus("idle");
      })
      .catch((error: unknown) => {
        setConnectionEvidenceStatus("error");
        setConnectionEvidenceErrorMessage(
          error instanceof Error ? error.message : "연결 근거 정보를 불러오지 못했습니다.",
        );
      });
  }, [
    selectedIndustry?.sectionCode,
    connectionEvidenceKeyword,
    connectionEvidencePage,
    connectionEvidenceSize,
  ]);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-2 py-6 sm:px-3 lg:px-4">
      {!selectedIndustry && (
        <section className="bg-white px-6 py-7 sm:px-8">
          <div className="flex min-h-[220px] items-center justify-center text-center">
            <p className="text-base font-medium text-[#777]">산업을 검색해서 선택해주세요.</p>
          </div>
        </section>
      )}

      {selectedIndustry && (
        <section className="space-y-6">
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

          {(infraStatus !== "idle" || infraHubs.length > 0) && (
            <InfraHubExplorer
              errorMessage={infraErrorMessage}
              hubs={infraHubs}
              onSelectHub={setSelectedHubId}
              selectedHubId={selectedHubId}
              status={infraStatus}
            />
          )}

          {(connectionEvidenceStatus !== "idle" || connectionEvidence) && (
            <ConnectionEvidenceCompanies
              errorMessage={connectionEvidenceErrorMessage}
              keyword={connectionEvidenceSearchText}
              onKeywordChange={setConnectionEvidenceSearchText}
              onPageChange={setConnectionEvidencePage}
              onSearch={() => {
                setConnectionEvidencePage(0);
                setConnectionEvidenceKeyword(connectionEvidenceSearchText.trim());
              }}
              onSizeChange={(size) => {
                setConnectionEvidencePage(0);
                setConnectionEvidenceSize(size);
              }}
              response={connectionEvidence}
              sectionName={overview?.sectionName ?? selectedIndustry.sectionName}
              status={connectionEvidenceStatus}
            />
          )}
        </section>
      )}
    </main>
  );
};

type InfraHubExplorerProps = {
  errorMessage: string;
  hubs: InfraHub[];
  onSelectHub: (hubId: number) => void;
  selectedHubId: number | null;
  status: "idle" | "loading" | "error";
};

const InfraHubExplorer = ({
  errorMessage,
  hubs,
  onSelectHub,
  selectedHubId,
  status,
}: InfraHubExplorerProps) => {
  const selectedHub = hubs.find((hub) => hub.hubId === selectedHubId) ?? hubs[0] ?? null;
  const totalEquipmentCount = hubs.reduce((sum, hub) => sum + hub.equipmentCount, 0);

  return (
    <div className="btp-infra-explorer">
      <style>
        {`
          .btp-infra-explorer .infra-layout {
            display: grid;
            grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
            gap: 18px;
          }

          .btp-infra-explorer .hub-map {
            height: 520px;
            min-height: 520px;
          }

          .btp-infra-explorer .hub-marker {
            border: 2px solid #ffffff;
            border-radius: 999px;
            box-shadow: 0 8px 18px rgba(19, 57, 112, 0.28);
            color: #ffffff;
            font-size: 13px;
            font-weight: 900;
            height: 42px;
            line-height: 38px;
            text-align: center;
            width: 42px;
          }

          .btp-infra-explorer .hub-marker-strong {
            background: #064595;
          }

          .btp-infra-explorer .hub-marker-medium {
            background: #167ad8;
          }

          .btp-infra-explorer .hub-marker-light {
            background: #8dbbea;
            color: #103560;
          }

          .btp-infra-explorer .hub-label {
            background: #ffffff;
            border: 1px solid #d9e4f1;
            border-radius: 6px;
            box-shadow: 0 8px 18px rgba(19, 57, 112, 0.14);
            color: #143f76;
            font-size: 12px;
            font-weight: 900;
            padding: 6px 9px;
            white-space: nowrap;
          }

          @media (max-width: 900px) {
            .btp-infra-explorer .infra-layout {
              grid-template-columns: 1fr;
            }

            .btp-infra-explorer .hub-map {
              height: 420px;
              min-height: 420px;
            }
          }
        `}
      </style>

      <div
        className="overflow-hidden rounded-lg bg-white px-4 py-4 shadow-sm"
        style={{ border: "1px solid #dce4ef" }}
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3" style={{ color: "#123b7a" }}>
            <span className="font-extrabold leading-none" style={{ fontSize: 26 }}>
              2.
            </span>
            <div>
              <h2 className="font-extrabold leading-none" style={{ fontSize: 26 }}>
                공동활용 인프라 연결 탐색
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#64748b]">
                선택한 산업 범위 안에서 장비 위치와 가까운 BTP 거점을 연결합니다.
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-extrabold text-[#64748b]">매핑 장비 수</p>
            <p className="text-3xl font-black text-[#123b7a]">
              {formatCount(totalEquipmentCount)}
              <span className="ml-1 text-sm font-bold text-[#24528d]">건</span>
            </p>
          </div>
        </div>

        {status === "loading" && (
          <div className="rounded-[8px] bg-[#f4f8fd] px-6 py-8 text-center text-sm font-semibold text-[#2b7fff]">
            인프라 정보를 불러오는 중
          </div>
        )}

        {status === "error" && (
          <p className="rounded-[6px] bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        {status === "idle" && hubs.length > 0 && (
          <div className="infra-layout">
            <div>
              <KakaoHubMap hubs={hubs} onSelectHub={onSelectHub} selectedHubId={selectedHub?.hubId ?? null} />
            </div>

            {selectedHub && <InfraHubDetail hub={selectedHub} />}
          </div>
        )}
      </div>
    </div>
  );
};

type KakaoHubMapProps = {
  hubs: InfraHub[];
  onSelectHub: (hubId: number) => void;
  selectedHubId: number | null;
};

const KakaoHubMap = ({ hubs, onSelectHub, selectedHubId }: KakaoHubMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapErrorMessage, setMapErrorMessage] = useState("");
  const hubsWithCoordinates = useMemo(
    () => hubs.filter((hub) => hub.latitude !== null && hub.longitude !== null),
    [hubs],
  );

  useEffect(() => {
    let isMounted = true;
    const container = mapRef.current;

    if (!container || hubsWithCoordinates.length === 0) {
      return;
    }

    loadKakaoMapSdk()
      .then(() => {
        if (!isMounted || !window.kakao?.maps) {
          return;
        }

        const maps = window.kakao.maps;
        const selectedHub =
          hubsWithCoordinates.find((hub) => hub.hubId === selectedHubId) ?? hubsWithCoordinates[0];
        const center = new maps.LatLng(selectedHub.latitude ?? 35.1796, selectedHub.longitude ?? 129.0756);
        const map = new maps.Map(container, { center, level: 9 });
        const bounds = new maps.LatLngBounds();

        hubsWithCoordinates.forEach((hub) => {
          const position = new maps.LatLng(hub.latitude ?? 0, hub.longitude ?? 0);
          bounds.extend(position);

          const marker = new maps.Marker({ map, position });
          maps.event.addListener(marker, "click", () => onSelectHub(hub.hubId));

          const label = document.createElement("div");
          label.addEventListener("click", () => onSelectHub(hub.hubId));
          label.innerHTML = `
            <button class="${getHubMarkerClass(hub.equipmentCount)}" type="button">
              ${formatCount(hub.equipmentCount)}
            </button>
            <div class="hub-label">${escapeHtml(hub.hubName)}</div>
          `;

          new maps.CustomOverlay({
            content: label,
            map,
            position,
            xAnchor: 0.5,
            yAnchor: 1.05,
          });
        });

        map.setBounds(bounds);
        setMapErrorMessage("");
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setMapErrorMessage(
          error instanceof Error ? error.message : "카카오맵을 불러오지 못했습니다.",
        );
      });

    return () => {
      isMounted = false;
      container.replaceChildren();
    };
  }, [hubsWithCoordinates, onSelectHub, selectedHubId]);

  if (hubsWithCoordinates.length === 0) {
    return (
      <div className="hub-map flex items-center justify-center rounded-[8px] bg-[#eef5fb] text-sm font-bold text-[#4b6380]">
        표시할 좌표가 없습니다.
      </div>
    );
  }

  if (mapErrorMessage) {
    return (
      <div className="hub-map flex items-center justify-center rounded-[8px] bg-[#eef5fb] px-5 text-center text-sm font-bold text-[#4b6380]">
        {mapErrorMessage}
      </div>
    );
  }

  return <div className="hub-map overflow-hidden rounded-[8px] bg-[#eef5fb]" ref={mapRef} />;
};

type InfraHubDetailProps = {
  hub: InfraHub;
};

const InfraHubDetail = ({ hub }: InfraHubDetailProps) => (
  <aside className="rounded-[8px] border border-[#dce4ef] bg-[#fbfdff] p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="mb-2 inline-flex rounded-[6px] border border-[#d9e4f1] bg-white px-2 py-1 text-xs font-extrabold text-[#517094]">
          {hub.hubKind}
        </p>
        <h3 className="text-2xl font-black leading-tight text-[#123b7a]">{hub.hubName}</h3>
        {hub.centerName && <p className="mt-1 text-sm font-bold text-[#64748b]">{hub.centerName}</p>}
      </div>
      <div className="text-right">
        <p className="text-xs font-extrabold text-[#64748b]">보유 장비</p>
        <p className="text-3xl font-black text-[#123b7a]">
          {formatCount(hub.equipmentCount)}
          <span className="ml-1 text-sm font-bold text-[#24528d]">건</span>
        </p>
      </div>
    </div>

    {hub.summary && <p className="mt-4 text-sm font-semibold leading-6 text-[#43546d]">{hub.summary}</p>}

    <dl className="mt-5 space-y-3 text-sm">
      {hub.address && (
        <div>
          <dt className="font-extrabold text-[#123b7a]">주소</dt>
          <dd className="mt-1 font-semibold text-[#44566e]">{hub.address}</dd>
        </div>
      )}
      {hub.tel && (
        <div>
          <dt className="font-extrabold text-[#123b7a]">문의</dt>
          <dd className="mt-1 font-semibold text-[#44566e]">{hub.tel}</dd>
        </div>
      )}
    </dl>

    {hub.topEquipmentCategories.length > 0 && (
      <div className="mt-6 border-t border-[#e2eaf4] pt-5">
        <h4 className="font-extrabold text-[#123b7a]">주요 연결 장비 분류</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {hub.topEquipmentCategories.map((category) => (
            <span
              className="rounded-[6px] border border-[#d9e4f1] bg-white px-3 py-2 text-sm font-extrabold text-[#284563]"
              key={`${hub.hubId}-${category.name}`}
            >
              {category.name} ({formatCount(category.count)}건)
            </span>
          ))}
        </div>
      </div>
    )}

    {hub.sampleEquipments.length > 0 && (
      <div className="mt-6 border-t border-[#e2eaf4] pt-5">
        <h4 className="font-extrabold text-[#123b7a]">관련 장비 예시</h4>
        <ul className="mt-3 divide-y divide-[#e2eaf4] text-sm font-semibold text-[#44566e]">
          {hub.sampleEquipments.map((equipment) => (
            <li className="flex items-center justify-between gap-4 py-2" key={equipment.equipmentId}>
              <span>{equipment.equipmentName}</span>
              {equipment.categoryLarge && (
                <span className="shrink-0 text-xs font-bold text-[#6b7f99]">{equipment.categoryLarge}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}

    {hub.facilities.length > 0 && (
      <div className="mt-6 border-t border-[#e2eaf4] pt-5">
        <h4 className="font-extrabold text-[#123b7a]">거점 시설</h4>
        <ul className="mt-3 space-y-2 text-sm font-semibold text-[#44566e]">
          {hub.facilities.slice(0, 4).map((facility) => (
            <li className="rounded-[6px] bg-white px-3 py-2" key={facility.facilityId}>
              {facility.buildingName}
              {facility.purpose && <span className="ml-2 text-xs font-bold text-[#6b7f99]">{facility.purpose}</span>}
            </li>
          ))}
        </ul>
      </div>
    )}
  </aside>
);

type ConnectionEvidenceCompaniesProps = {
  errorMessage: string;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  onPageChange: (page: number) => void;
  onSearch: () => void;
  onSizeChange: (size: number) => void;
  response: ConnectionEvidenceResponse | null;
  sectionName: string;
  status: "idle" | "loading" | "error";
};

const ConnectionEvidenceCompanies = ({
  errorMessage,
  keyword,
  onKeywordChange,
  onPageChange,
  onSearch,
  onSizeChange,
  response,
  sectionName,
  status,
}: ConnectionEvidenceCompaniesProps) => {
  const page = response?.page ?? 0;
  const size = response?.size ?? 10;
  const totalPages = response?.totalPages ?? 0;
  const pages = paginationPages(page, totalPages);

  return (
    <div className="btp-connection-evidence">
      <style>
        {`
          .btp-connection-evidence .evidence-table {
            min-width: 1120px;
          }

          .btp-connection-evidence .evidence-table th,
          .btp-connection-evidence .evidence-table td {
            border-right: 1px solid #e2eaf4;
          }

          .btp-connection-evidence .evidence-table th:last-child,
          .btp-connection-evidence .evidence-table td:last-child {
            border-right: 0;
          }

          @media (max-width: 900px) {
            .btp-connection-evidence .summary-strip {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div
        className="overflow-hidden rounded-lg bg-white px-4 py-4 shadow-sm"
        style={{ border: "1px solid #dce4ef" }}
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3" style={{ color: "#123b7a" }}>
            <span className="font-extrabold leading-none" style={{ fontSize: 26 }}>
              3.
            </span>
            <div>
              <h2 className="font-extrabold leading-none" style={{ fontSize: 26 }}>
                연결 근거 확인
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#64748b]">
                탐색한 연결은 데이터 기반 근거를 가지며, 기업별 연결 장비와 거점을 함께 제공합니다.
              </p>
            </div>
          </div>

          <form
            className="flex w-full max-w-md overflow-hidden rounded-[8px] border border-[#d7e2f0] bg-white"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch();
            }}
          >
            <input
              className="min-w-0 flex-1 px-4 py-3 text-sm font-semibold text-[#284563] outline-none"
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="기업명 검색"
              value={keyword}
            />
            <button
              className="border-l border-[#d7e2f0] px-5 text-sm font-extrabold text-[#123b7a]"
              type="submit"
            >
              검색
            </button>
          </form>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-extrabold text-[#517094]">
          <span>현재 탐색 경로</span>
          <span className="rounded-[6px] bg-[#f4f8fd] px-3 py-2 text-[#123b7a]">{sectionName}</span>
          <span className="text-[#9aa9ba]">&gt;</span>
          <span className="rounded-[6px] bg-[#f4f8fd] px-3 py-2 text-[#123b7a]">관련 기업</span>
        </div>

        {response && (
          <div className="summary-strip mb-4 grid grid-cols-3 overflow-hidden rounded-[8px] border border-[#dce4ef]">
            <EvidenceSummaryMetric label="관련 기업" value={response.summary.companyCount} />
            <EvidenceSummaryMetric label="관련 장비" value={response.summary.equipmentCount} />
            <EvidenceSummaryMetric label="관련 거점" value={response.summary.hubCount} />
          </div>
        )}

        {status === "loading" && (
          <div className="rounded-[8px] bg-[#f4f8fd] px-6 py-8 text-center text-sm font-semibold text-[#2b7fff]">
            연결 근거를 불러오는 중
          </div>
        )}

        {status === "error" && (
          <p className="rounded-[6px] bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        {status === "idle" && response && (
          <>
            {response.items.length === 0 ? (
              <div className="rounded-[8px] bg-[#f4f8fd] px-6 py-8 text-center text-sm font-semibold text-[#64748b]">
                조건에 맞는 연결 근거가 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[8px] border border-[#dce4ef]">
                <table className="evidence-table w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#f7faff] text-sm font-black text-[#123b7a]">
                      <th className="w-[160px] px-4 py-4">기업명</th>
                      <th className="w-[260px] px-4 py-4">주요제품 / 지원품목</th>
                      <th className="w-[190px] px-4 py-4">연결 기능</th>
                      <th className="w-[280px] px-4 py-4">연결 장비 (설치 거점)</th>
                      <th className="px-4 py-4">연결 근거</th>
                      <th className="w-[100px] px-4 py-4 text-center">상세</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2eaf4] text-sm text-[#334766]">
                    {response.items.map((item) => (
                      <ConnectionEvidenceRow item={item} key={item.companyId} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-bold text-[#64748b]">
                총 {formatCount(response.totalElements)}건
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="h-10 w-10 rounded-[8px] border border-[#d7e2f0] text-lg font-black text-[#123b7a] disabled:opacity-35"
                  disabled={page <= 0}
                  onClick={() => onPageChange(page - 1)}
                  type="button"
                >
                  &lt;
                </button>
                {pages.map((pageNumber) => (
                  <button
                    className={`h-10 min-w-10 rounded-[8px] border px-3 text-sm font-black ${
                      pageNumber === page
                        ? "border-[#0b4d99] bg-[#0b4d99] text-white"
                        : "border-[#d7e2f0] bg-white text-[#123b7a]"
                    }`}
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    type="button"
                  >
                    {pageNumber + 1}
                  </button>
                ))}
                <button
                  className="h-10 w-10 rounded-[8px] border border-[#d7e2f0] text-lg font-black text-[#123b7a] disabled:opacity-35"
                  disabled={totalPages === 0 || page >= totalPages - 1}
                  onClick={() => onPageChange(page + 1)}
                  type="button"
                >
                  &gt;
                </button>
              </div>

              <select
                className="h-10 rounded-[8px] border border-[#d7e2f0] bg-white px-3 text-sm font-extrabold text-[#123b7a]"
                onChange={(event) => onSizeChange(Number(event.target.value))}
                value={size}
              >
                <option value={10}>10개씩 보기</option>
                <option value={20}>20개씩 보기</option>
                <option value={50}>50개씩 보기</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

type EvidenceSummaryMetricProps = {
  label: string;
  value: number;
};

const EvidenceSummaryMetric = ({ label, value }: EvidenceSummaryMetricProps) => (
  <div className="border-r border-[#dce4ef] px-5 py-4 last:border-r-0">
    <p className="text-sm font-extrabold text-[#64748b]">{label}</p>
    <p className="mt-1 text-2xl font-black text-[#123b7a]">
      {formatCount(value)}
      <span className="ml-1 text-sm font-bold text-[#24528d]">건</span>
    </p>
  </div>
);

type ConnectionEvidenceRowProps = {
  item: ConnectionEvidenceCompany;
};

const ConnectionEvidenceRow = ({ item }: ConnectionEvidenceRowProps) => (
  <tr className="align-top">
    <td className="px-4 py-5 font-black text-[#123b7a]">{item.companyName}</td>
    <td className="px-4 py-5">
      <TextStack items={item.mainProducts} />
    </td>
    <td className="px-4 py-5">
      <TextStack items={item.connectedFunctions} />
    </td>
    <td className="px-4 py-5">
      <ul className="space-y-2">
        {item.connectedEquipments.map((equipment) => (
          <li key={`${item.companyId}-${equipment.equipmentId}`}>
            <span className="font-extrabold text-[#284563]">{equipment.equipmentName}</span>
            <span className="ml-1 font-bold text-[#64748b]">({equipment.hubName})</span>
          </li>
        ))}
      </ul>
    </td>
    <td className="px-4 py-5 font-semibold leading-6 text-[#44566e]">{item.evidenceText ?? "-"}</td>
    <td className="px-4 py-5 text-center">
      <a
        className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#d7e2f0] px-4 text-sm font-black text-[#123b7a]"
        href={`/?companyId=${encodeURIComponent(String(item.companyId))}`}
      >
        보기
      </a>
    </td>
  </tr>
);

type TextStackProps = {
  items: string[];
};

const TextStack = ({ items }: TextStackProps) => {
  if (items.length === 0) {
    return <span className="font-semibold text-[#9aa9ba]">-</span>;
  }

  return (
    <ul className="space-y-2 font-semibold leading-6 text-[#44566e]">
      {items.slice(0, 4).map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
};

const paginationPages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 0) {
    return [];
  }

  const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
  const end = Math.min(totalPages, start + 5);
  return Array.from({ length: end - start }, (_, index) => start + index);
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
