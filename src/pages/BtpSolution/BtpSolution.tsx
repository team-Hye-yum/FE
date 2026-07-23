import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showAppAlert } from "@/components/AppAlert";
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
  divisionCode: string;
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
  divisionCode: string;
  divisionName: string;
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
  divisionCode: string;
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
  divisionCode: string;
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
    getLevel: () => number;
    setBounds: (bounds: unknown) => void;
    setLevel: (level: number, options?: { anchor?: unknown }) => void;
  };
  Marker: new (options: { image?: unknown; map?: unknown; position: unknown; title?: string }) => unknown;
  MarkerClusterer: new (options: {
    averageCenter?: boolean;
    disableClickZoom?: boolean;
    gridSize?: number;
    map: unknown;
    minLevel?: number;
    styles?: Array<Record<string, string>>;
  }) => {
    addMarkers: (markers: unknown[]) => void;
  };
  MarkerImage: new (src: string, size: unknown, options?: { offset?: unknown }) => unknown;
  Point: new (x: number, y: number) => unknown;
  Size: new (width: number, height: number) => unknown;
  event: {
    addListener: (target: unknown, type: string, handler: (event?: unknown) => void) => void;
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
const SAMPLE_DIVISION_CODE = "29";
const SAMPLE_INDUSTRY: IndustrySearchItem = {
  className: "",
  displayName: "SAMPLE 기타 기계 및 장비 제조업",
  divisionCode: SAMPLE_DIVISION_CODE,
  divisionName: "기타 기계 및 장비 제조업",
  groupName: "",
  ksicCode: `C${SAMPLE_DIVISION_CODE}`,
  sectionCode: "C",
  sectionName: "제조업",
  subclassName: "",
};

const SAMPLE_OVERVIEW: IndustryOverview = {
  divisionCode: SAMPLE_DIVISION_CODE,
  divisionName: "기타 기계 및 장비 제조업",
  busanBaseYear: 2024,
  btpBaseYear: 2024,
  industryScale: {
    busan: {
      establishmentCount: 12684,
      employeeCount: 74210,
    },
    btp: {
      establishmentCount: 9,
      employeeCount: 259,
    },
  },
  businessTypeRatio: {
    busan: {
      corporationRatio: 0.282,
      individualRatio: 0.718,
    },
    btp: {
      corporationRatio: 1,
      individualRatio: 0,
    },
  },
  employeeSizeRatio: [
    { name: "1~4인", busanRatio: 0.624, btpRatio: 0 },
    { name: "5~9인", busanRatio: 0.166, btpRatio: 0.25 },
    { name: "10~49인", busanRatio: 0.178, btpRatio: 0.5 },
    { name: "50~299인", busanRatio: 0.03, btpRatio: 0.25 },
    { name: "300인 이상", busanRatio: 0.002, btpRatio: 0 },
  ],
};

const SAMPLE_INFRA_HUBS: InfraHub[] = [
  {
    hubId: -101,
    hubName: "지사단지",
    hubKind: "거점",
    centerName: "스마트제조 지원센터",
    summary: "정밀 가공, 환경 시험, 신뢰성 검증 장비를 함께 배치한 샘플 거점입니다.",
    address: "부산광역시 강서구 과학산단로 샘플",
    districtName: "강서구",
    tel: "051-000-0000",
    latitude: 35.1502,
    longitude: 128.8308,
    imageUrl: null,
    spaceUrl: null,
    directionsUrl: null,
    equipmentCount: 43,
    topEquipmentCategories: [
      { name: "환경시험", count: 18 },
      { name: "전자파시험(EMC)", count: 12 },
      { name: "진동/소음시험", count: 8 },
    ],
    sampleEquipments: [
      { equipmentId: -1001, equipmentName: "온습도 시험기", categoryLarge: "환경시험", locationName: "지사단지" },
      { equipmentId: -1002, equipmentName: "전자파 내성시험기", categoryLarge: "전자파시험(EMC)", locationName: "지사단지" },
      { equipmentId: -1003, equipmentName: "진동시험기", categoryLarge: "진동/소음시험", locationName: "지사단지" },
    ],
    facilities: [
      {
        facilityId: -1001,
        siteName: "샘플 지사단지",
        buildingNo: "A",
        buildingName: "공동활용 시험동",
        grossFloorArea: "4,200㎡",
        floors: "지상 3층",
        purpose: "시험·검증",
      },
    ],
  },
  {
    hubId: -102,
    hubName: "엄궁단지",
    hubKind: "거점",
    centerName: "기계부품 실증센터",
    summary: "부품 성능 평가와 재료 분석을 연결하는 샘플 거점입니다.",
    address: "부산광역시 사상구 낙동대로 샘플",
    districtName: "사상구",
    tel: "051-000-0001",
    latitude: 35.1262,
    longitude: 128.9714,
    imageUrl: null,
    spaceUrl: null,
    directionsUrl: null,
    equipmentCount: 27,
    topEquipmentCategories: [
      { name: "재료시험", count: 10 },
      { name: "정밀측정", count: 9 },
      { name: "성능평가", count: 8 },
    ],
    sampleEquipments: [
      { equipmentId: -1004, equipmentName: "만능재료시험기", categoryLarge: "재료시험", locationName: "엄궁단지" },
      { equipmentId: -1005, equipmentName: "3차원 측정기", categoryLarge: "정밀측정", locationName: "엄궁단지" },
    ],
    facilities: [],
  },
  {
    hubId: -103,
    hubName: "미음단지",
    hubKind: "거점",
    centerName: "첨단장비 공동활용실",
    summary: "시제품 제작과 공정 검증을 지원하는 샘플 거점입니다.",
    address: "부산광역시 강서구 미음산단로 샘플",
    districtName: "강서구",
    tel: "051-000-0002",
    latitude: 35.1037,
    longitude: 128.8786,
    imageUrl: null,
    spaceUrl: null,
    directionsUrl: null,
    equipmentCount: 18,
    topEquipmentCategories: [
      { name: "시제품제작", count: 7 },
      { name: "공정검증", count: 6 },
      { name: "정밀가공", count: 5 },
    ],
    sampleEquipments: [
      { equipmentId: -1006, equipmentName: "CNC 머시닝센터", categoryLarge: "정밀가공", locationName: "미음단지" },
      { equipmentId: -1007, equipmentName: "레이저 가공기", categoryLarge: "시제품제작", locationName: "미음단지" },
    ],
    facilities: [],
  },
];

const SAMPLE_CONNECTION_ITEMS: ConnectionEvidenceCompany[] = [
  {
    companyId: -201,
    companyName: "샘플정밀기계(주)",
    mainProducts: ["자동화 이송장치", "정밀 감속기"],
    connectedFunctions: ["환경시험", "진동/소음시험"],
    connectedEquipments: [
      { equipmentId: -1001, equipmentName: "온습도 시험기", categoryLarge: "환경시험", hubId: -101, hubName: "지사단지" },
      { equipmentId: -1003, equipmentName: "진동시험기", categoryLarge: "진동/소음시험", hubId: -101, hubName: "지사단지" },
    ],
    evidenceText: "주요제품의 구동부 내구성과 사용 환경 검증이 필요해 환경·진동 시험 장비와 연결됩니다.",
  },
  {
    companyId: -202,
    companyName: "부산스마트부품",
    mainProducts: ["센서 하우징", "제어 모듈"],
    connectedFunctions: ["전자파시험(EMC)", "정밀측정"],
    connectedEquipments: [
      { equipmentId: -1002, equipmentName: "전자파 내성시험기", categoryLarge: "전자파시험(EMC)", hubId: -101, hubName: "지사단지" },
      { equipmentId: -1005, equipmentName: "3차원 측정기", categoryLarge: "정밀측정", hubId: -102, hubName: "엄궁단지" },
    ],
    evidenceText: "제어 모듈은 전자파 내성 확인이 필요하고, 하우징은 치수 정밀도 검증 근거가 있습니다.",
  },
  {
    companyId: -203,
    companyName: "동남제조솔루션",
    mainProducts: ["시제품 지그", "가공 부품"],
    connectedFunctions: ["시제품제작", "정밀가공"],
    connectedEquipments: [
      { equipmentId: -1006, equipmentName: "CNC 머시닝센터", categoryLarge: "정밀가공", hubId: -103, hubName: "미음단지" },
      { equipmentId: -1007, equipmentName: "레이저 가공기", categoryLarge: "시제품제작", hubId: -103, hubName: "미음단지" },
    ],
    evidenceText: "시제품 제작과 소량 가공 수요가 있어 미음단지의 제작·가공 장비와 연결됩니다.",
  },
];

let kakaoMapSdkPromise: Promise<void> | null = null;

const apiUrl = (path: string) => {
  const baseUrl = import.meta.env.API_URL || import.meta.env.VITE_API_URL || "/api";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const isInvalidUrlParamError = (error: unknown) =>
  error instanceof Error && /\((400|404)\)/.test(error.message);

const getKakaoMapKey = () =>
  import.meta.env.VITE_KAKAO_MAP_APP_KEY ||
  import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY ||
  import.meta.env.VITE_KAKAO_MAP_KEY ||
  "";

const loadKakaoMapSdk = () => {
  if (window.kakao?.maps.MarkerClusterer) {
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
      window.kakao?.maps.load(() => {
        if (window.kakao?.maps.MarkerClusterer) {
          resolve();
          return;
        }

        reject(new Error("카카오맵 클러스터러를 불러오지 못했습니다. 페이지를 새로고침해주세요."));
      });
    };

    if (existingScript) {
      if (window.kakao?.maps) {
        handleLoad();
        return;
      }

      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("카카오맵을 불러오지 못했습니다.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_MAP_SDK_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=clusterer`;
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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const hubMarkerImageUrl = (hub: InfraHub, selected: boolean) => {
  const fill = selected ? "#f59e0b" : hub.equipmentCount >= 40 ? "#064595" : hub.equipmentCount >= 10 ? "#167ad8" : "#f59e0b";
  const textColor = "#ffffff";
  const label = formatCount(hub.equipmentCount);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="58" viewBox="0 0 50 58">
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#133970" flood-opacity="0.28"/>
      </filter>
      <path d="M25 55c-2.8-5.8-17-14.3-17-31C8 14.6 15.6 7 25 7s17 7.6 17 17c0 16.7-14.2 25.2-17 31Z" fill="${fill}" filter="url(#shadow)"/>
      <circle cx="25" cy="24" r="18" fill="${fill}" stroke="#ffffff" stroke-width="3"/>
      <text x="25" y="29" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="13" font-weight="900" fill="${textColor}">${escapeHtml(label)}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const selectRepresentativeHubId = (hubs: InfraHub[]) => {
  const sortedHubs = [...hubs].sort((left, right) => right.equipmentCount - left.equipmentCount);
  return sortedHubs[0]?.hubId ?? null;
};

const sampleConnectionEvidence = (keyword: string, page: number, size: number): ConnectionEvidenceResponse => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredItems = normalizedKeyword
    ? SAMPLE_CONNECTION_ITEMS.filter((item) =>
        [
          item.companyName,
          item.evidenceText ?? "",
          ...item.mainProducts,
          ...item.connectedFunctions,
          ...item.connectedEquipments.map((equipment) => equipment.equipmentName),
          ...item.connectedEquipments.map((equipment) => equipment.hubName),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword),
      )
    : SAMPLE_CONNECTION_ITEMS;
  const safeSize = Math.max(1, size);
  const totalPages = Math.ceil(filteredItems.length / safeSize);
  const safePage = totalPages === 0 ? 0 : Math.min(Math.max(0, page), totalPages - 1);
  const pageItems = filteredItems.slice(safePage * safeSize, safePage * safeSize + safeSize);

  return {
    divisionCode: SAMPLE_DIVISION_CODE,
    summary: {
      companyCount: filteredItems.length,
      equipmentCount: new Set(filteredItems.flatMap((item) => item.connectedEquipments.map((equipment) => equipment.equipmentId))).size,
      hubCount: new Set(filteredItems.flatMap((item) => item.connectedEquipments.map((equipment) => equipment.hubId))).size,
    },
    items: pageItems,
    page: safePage,
    size: safeSize,
    totalElements: filteredItems.length,
    totalPages,
  };
};

const getDivisionCodeFromSearch = (search: string) => {
  const trimmedSearch = search.replace(/^\?/, "").trim();

  if (!trimmedSearch) {
    return "";
  }

  const searchParams = new URLSearchParams(search);
  const namedCode =
    searchParams.get("divisionCode") ??
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

const getSearchParam = (search: string, key: string) =>
  new URLSearchParams(search).get(key)?.trim() ?? "";

const getPositiveIntegerSearchParam = (search: string, key: string, fallback: number) => {
  const value = Number(new URLSearchParams(search).get(key));

  return Number.isInteger(value) && value > 0 ? value : fallback;
};

const getNonNegativeIntegerSearchParam = (search: string, key: string, fallback: number) => {
  const value = Number(new URLSearchParams(search).get(key));

  return Number.isInteger(value) && value >= 0 ? value : fallback;
};

const BtpSolution = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const divisionCodeFromUrl = getDivisionCodeFromSearch(search);
  const companyKeywordFromUrl = getSearchParam(search, "companyKeyword");
  const companyPageFromUrl = getNonNegativeIntegerSearchParam(search, "page", 0);
  const companySizeFromUrl = getPositiveIntegerSearchParam(search, "size", 10);
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
  const [isSampleIndustry, setIsSampleIndustry] = useState(false);
  const invalidIndustryAlertedRef = useRef("");

  const loadOverview = (divisionCode: string) => {
    setOverview(null);
    setStatus("loading");
    setErrorMessage("");

    fetch(apiUrl(`/btp-solution/industries/${encodeURIComponent(divisionCode)}/overview`))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`산업 분석 정보를 불러오지 못했습니다. (${response.status})`);
        }

        return response.json() as Promise<ApiDataResponse<IndustryOverview>>;
      })
      .then((response) => {
        setOverview(response.data);
        invalidIndustryAlertedRef.current = "";
        setSelectedIndustry((currentIndustry) => {
          const isCodeOnlyLabel = currentIndustry?.displayName === response.data.divisionCode;

          return {
            className: currentIndustry?.className ?? "",
            displayName:
              currentIndustry?.displayName && !isCodeOnlyLabel
                ? currentIndustry.displayName
                : response.data.divisionName,
            divisionName: currentIndustry?.divisionName || response.data.divisionName,
            divisionCode: response.data.divisionCode,
            groupName: currentIndustry?.groupName ?? "",
            ksicCode: currentIndustry?.ksicCode || response.data.divisionCode,
            sectionCode: currentIndustry?.sectionCode ?? "",
            sectionName: currentIndustry?.sectionName ?? "",
            subclassName: currentIndustry?.subclassName ?? "",
          };
        });
        setStatus("idle");
      })
      .catch((error: unknown) => {
        console.error("Failed to load BTP solution overview from URL parameter.", error);
        if (isInvalidUrlParamError(error)) {
          if (invalidIndustryAlertedRef.current !== divisionCode) {
            invalidIndustryAlertedRef.current = divisionCode;
            showAppAlert("잘못된 BTP 솔루션 URL입니다. 기본 화면으로 이동합니다.");
          }

          navigate("/btp-solution", { replace: true });
          return;
        }

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
  };

  const loadInfraHubs = (divisionCode: string) => {
    setInfraHubs([]);
    setInfraStatus("loading");
    setInfraErrorMessage("");
    setSelectedHubId(null);

    fetch(apiUrl(`/btp-solution/industries/${encodeURIComponent(divisionCode)}/infra-hubs`))
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
      setIsSampleIndustry(false);
      resetConnectionEvidence();
      loadOverview(industry.divisionCode);
      loadInfraHubs(industry.divisionCode);
    };

    window.addEventListener("btp-solution-industry-selected", handleIndustrySelected);

    return () => {
      window.removeEventListener("btp-solution-industry-selected", handleIndustrySelected);
    };
  }, []);

  useEffect(() => {
    if (!divisionCodeFromUrl) {
      invalidIndustryAlertedRef.current = "";
      setSelectedIndustry(SAMPLE_INDUSTRY);
      setIsSampleIndustry(true);
      resetConnectionEvidence();
      setOverview(SAMPLE_OVERVIEW);
      setStatus("idle");
      setErrorMessage("");
      setInfraHubs(SAMPLE_INFRA_HUBS);
      setInfraStatus("idle");
      setInfraErrorMessage("");
      setSelectedHubId(selectRepresentativeHubId(SAMPLE_INFRA_HUBS));
      return;
    }

    setSelectedIndustry({
      className: "",
      displayName: divisionCodeFromUrl,
      divisionCode: divisionCodeFromUrl,
      divisionName: "",
      groupName: "",
      ksicCode: divisionCodeFromUrl,
      sectionCode: "",
      sectionName: "",
      subclassName: "",
    });
    setIsSampleIndustry(false);
    resetConnectionEvidence();
    loadOverview(divisionCodeFromUrl);
    loadInfraHubs(divisionCodeFromUrl);
  }, [divisionCodeFromUrl]);

  useEffect(() => {
    setConnectionEvidenceSearchText(companyKeywordFromUrl);
    setConnectionEvidenceKeyword(companyKeywordFromUrl);
    setConnectionEvidencePage(companyPageFromUrl);
    setConnectionEvidenceSize(companySizeFromUrl);
  }, [companyKeywordFromUrl, companyPageFromUrl, companySizeFromUrl]);

  const updateConnectionEvidenceSearchParams = (
    nextValues: Partial<{ companyKeyword: string; page: number; size: number }>,
  ) => {
    const searchParams = new URLSearchParams(search);
    const nextKeyword =
      nextValues.companyKeyword ?? searchParams.get("companyKeyword")?.trim() ?? "";
    const nextPage = nextValues.page ?? getNonNegativeIntegerSearchParam(search, "page", 0);
    const nextSize = nextValues.size ?? getPositiveIntegerSearchParam(search, "size", 10);

    if (nextKeyword) {
      searchParams.set("companyKeyword", nextKeyword);
    } else {
      searchParams.delete("companyKeyword");
    }

    if (nextPage > 0) {
      searchParams.set("page", String(nextPage));
    } else {
      searchParams.delete("page");
    }

    if (nextSize !== 10) {
      searchParams.set("size", String(nextSize));
    } else {
      searchParams.delete("size");
    }

    navigate({ pathname: "/btp-solution", search: searchParams.toString() }, { replace: true });
  };

  useEffect(() => {
    if (!divisionCodeFromUrl) {
      setConnectionEvidence(sampleConnectionEvidence(
        connectionEvidenceKeyword,
        connectionEvidencePage,
        connectionEvidenceSize,
      ));
      setConnectionEvidenceStatus("idle");
      setConnectionEvidenceErrorMessage("");
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
        `/btp-solution/industries/${encodeURIComponent(divisionCodeFromUrl)}/connection-evidence/companies?${params.toString()}`,
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
    divisionCodeFromUrl,
    connectionEvidenceKeyword,
    connectionEvidencePage,
    connectionEvidenceSize,
  ]);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-2 py-6 sm:px-3 lg:px-4">
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

          {overview && <IndustryStatus isSample={isSampleIndustry} overview={overview} />}

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
              isSample={isSampleIndustry}
              keyword={connectionEvidenceSearchText}
              onKeywordChange={setConnectionEvidenceSearchText}
              onPageChange={(page) => updateConnectionEvidenceSearchParams({ page })}
              onSearch={() => {
                updateConnectionEvidenceSearchParams({
                  companyKeyword: connectionEvidenceSearchText.trim(),
                  page: 0,
                });
              }}
              onSizeChange={(size) => {
                updateConnectionEvidenceSearchParams({ page: 0, size });
              }}
              response={connectionEvidence}
              sectionName={overview?.divisionName ?? selectedIndustry.divisionName}
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

const SampleBadge = () => (
  <span className="inline-flex h-8 min-w-[92px] items-center justify-center rounded-full bg-[#d10000] px-5 text-base font-bold text-white">
    SAMPLE
  </span>
);

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
            align-items: stretch;
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
        className="overflow-hidden rounded-lg bg-white px-6 py-6 shadow-sm"
        style={{ border: "1px solid #dce4ef" }}
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
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

          <div className="grid min-w-[360px] grid-cols-2 divide-x divide-[#e2eaf4] text-center max-sm:min-w-0 max-sm:w-full">
            <InfraSummaryMetric
              description="선택 산업에서 연결 근거가 확인된 장비 수"
              label="연결 장비 수"
              value={totalEquipmentCount}
            />
            <InfraSummaryMetric
              description="현재 선택한 거점의 확인 장비 수"
              label="선택 거점 장비"
              value={selectedHub?.equipmentCount ?? 0}
            />
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
              <MapLegend />
            </div>

            {selectedHub && <InfraHubDetail hub={selectedHub} />}
          </div>
        )}
      </div>
    </div>
  );
};

type InfraSummaryMetricProps = {
  description: string;
  label: string;
  value: number;
};

const InfoDot = () => (
  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#dbe8f8] text-[11px] font-black text-[#24528d]">
    i
  </span>
);

const InfraSummaryMetric = ({ description, label, value }: InfraSummaryMetricProps) => (
  <div className="px-6 max-sm:px-3">
    <p className="inline-flex items-center gap-1 text-sm font-extrabold text-[#334766]">
      {label}
      <InfoDot />
    </p>
    <p className="mt-2 text-4xl font-black leading-none text-[#0b4d99]">
      {formatCount(value)}
      <span className="ml-1 text-xl font-black text-[#123b7a]">개</span>
    </p>
    <p className="mt-2 break-keep text-xs font-bold leading-5 text-[#64748b]">{description}</p>
  </div>
);

const MapLegend = () => (
  <div className="mt-5 flex flex-wrap justify-center gap-10 text-sm font-bold text-[#44566e]">
    <span className="inline-flex items-center gap-2">
      <span className="h-3.5 w-3.5 rounded-full bg-[#064595]" />
      40개 이상
    </span>
    <span className="inline-flex items-center gap-2">
      <span className="h-3.5 w-3.5 rounded-full bg-[#167ad8]" />
      10 ~ 39개
    </span>
    <span className="inline-flex items-center gap-2">
      <span className="h-3.5 w-3.5 rounded-full bg-[#f59e0b]" />
      1 ~ 9개
    </span>
  </div>
);

const LocationIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
    <path
      d="M12 21s7-5.6 7-12A7 7 0 1 0 5 9c0 6.4 7 12 7 12Z"
      fill="currentColor"
      opacity="0.95"
    />
    <circle cx="12" cy="9" fill="white" r="2.4" />
  </svg>
);

const PhoneIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
    <path
      d="M7.5 3.8c.5-.2 1.1 0 1.4.5l1.7 3c.3.5.2 1.1-.2 1.5l-1.2 1.1c.9 1.8 2.3 3.2 4.1 4.1l1.1-1.2c.4-.4 1-.5 1.5-.2l3 1.7c.5.3.7.9.5 1.4l-1.2 3.2c-.2.5-.6.8-1.1.8C10 19.7 4.3 14 4.3 6.9c0-.5.3-1 .8-1.1l2.4-2Z"
      fill="currentColor"
    />
  </svg>
);

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
        const markers = hubsWithCoordinates.map((hub) => {
          const position = new maps.LatLng(hub.latitude ?? 0, hub.longitude ?? 0);
          bounds.extend(position);

          const marker = new maps.Marker({
            image: new maps.MarkerImage(hubMarkerImageUrl(hub, hub.hubId === selectedHubId), new maps.Size(50, 58), {
              offset: new maps.Point(25, 55),
            }),
            position,
            title: `${hub.hubName} ${formatCount(hub.equipmentCount)}개`,
          });
          maps.event.addListener(marker, "click", () => onSelectHub(hub.hubId));

          return marker;
        });

        const clusterer = new maps.MarkerClusterer({
          averageCenter: true,
          disableClickZoom: true,
          gridSize: 72,
          map,
          minLevel: 7,
          styles: [
            {
              background: "rgba(6, 69, 149, 0.92)",
              border: "3px solid #ffffff",
              borderRadius: "999px",
              boxShadow: "0 10px 22px rgba(19, 57, 112, 0.28)",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "900",
              height: "54px",
              lineHeight: "49px",
              textAlign: "center",
              width: "54px",
            },
          ],
        });

        clusterer.addMarkers(markers);
        maps.event.addListener(clusterer, "clusterclick", (cluster) => {
          const targetCluster = cluster as { getCenter?: () => unknown };
          map.setLevel(Math.max(map.getLevel() - 2, 1), {
            anchor: targetCluster.getCenter?.(),
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

const InfraHubDetail = ({ hub }: InfraHubDetailProps) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const categoryItems = showAllCategories ? hub.topEquipmentCategories : hub.topEquipmentCategories.slice(0, 3);

  return (
    <aside className="rounded-[8px] border border-[#dce4ef] bg-[#fbfdff] p-6">
    <div>
      <p className="mb-3 inline-flex rounded-[6px] border border-[#d9e4f1] bg-white px-2.5 py-1 text-xs font-extrabold text-[#517094]">
        {hub.hubKind}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-3xl font-black leading-tight text-[#123b7a]">{hub.hubName}</h3>
        <span className="rounded-[6px] border border-[#c9ddf4] bg-[#eef6ff] px-3 py-1.5 text-base font-black text-[#0b4d99]">
          확인 장비 {formatCount(hub.equipmentCount)}개
        </span>
      </div>
      {hub.centerName && <p className="mt-2 text-lg font-bold text-[#64748b]">{hub.centerName}</p>}
    </div>

    {hub.summary && <p className="mt-4 text-base font-semibold leading-7 text-[#43546d]">{hub.summary}</p>}

    {(hub.address || hub.tel) && (
      <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-[8px] border border-[#dce4ef] bg-white max-md:grid-cols-1">
        {hub.address && (
          <div className="flex items-center gap-4 border-r border-[#e2eaf4] px-5 py-4 max-md:border-r-0 max-md:border-b">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-[#0b4d99]">
              <LocationIcon />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-extrabold text-[#64748b]">주소</dt>
              <dd className="mt-1 break-keep text-base font-bold leading-6 text-[#334766]">{hub.address}</dd>
            </div>
          </div>
        )}
        {hub.tel && (
          <div className="flex items-center gap-4 px-5 py-4">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-[#0b4d99]">
              <PhoneIcon />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-extrabold text-[#64748b]">전화번호</dt>
              <dd className="mt-1 break-keep text-base font-bold leading-6 text-[#334766]">{hub.tel}</dd>
            </div>
          </div>
        )}
      </dl>
    )}

    {hub.topEquipmentCategories.length > 0 && (
      <div className="mt-7 border-t border-[#e2eaf4] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="inline-flex items-center gap-2 text-xl font-black text-[#123b7a]">
            주요 연결 장비 분류
            <span className="text-sm font-bold text-[#64748b]">(연결 장비 수 기준)</span>
            <InfoDot />
          </h4>
          {hub.topEquipmentCategories.length > 3 && (
            <button
              className="rounded-[8px] border border-[#d7e2f0] bg-[#f4f8fd] px-4 py-2 text-sm font-extrabold text-[#123b7a]"
              onClick={() => setShowAllCategories((current) => !current)}
              type="button"
            >
              {showAllCategories ? "접기" : "전체보기 >"}
            </button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
          {categoryItems.map((category) => (
            <div
              className="flex items-center justify-between rounded-[8px] border border-[#d9e4f1] bg-white px-4 py-3 text-base font-extrabold text-[#284563]"
              key={`${hub.hubId}-${category.name}`}
            >
              <span>{category.name}</span>
              <span className="text-xl font-black text-[#0b4d99]">{formatCount(category.count)}개</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {hub.sampleEquipments.length > 0 && (
      <div className="mt-7">
        <h4 className="inline-flex items-center gap-2 text-xl font-black text-[#123b7a]">
          연결 장비 예시
          <InfoDot />
        </h4>
        <div className="mt-4 overflow-hidden rounded-[8px] border border-[#dce4ef] bg-white">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead className="bg-[#f7faff] text-[#64748b]">
              <tr>
                <th className="w-[54%] px-4 py-3 font-extrabold">장비명</th>
                <th className="px-4 py-3 text-right font-extrabold">주요 활용 기능</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2eaf4] text-[#334766]">
              {hub.sampleEquipments.slice(0, 3).map((equipment) => (
                <tr key={equipment.equipmentId}>
                  <td className="px-4 py-3 font-bold">
                    <span>{equipment.equipmentName}</span>
                    <span className="ml-2 rounded-[5px] bg-[#eef6ff] px-2 py-1 text-xs font-black text-[#0b4d99]">
                      확인
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#44566e]">
                    {equipment.categoryLarge || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
    </aside>
  );
};

type ConnectionEvidenceCompaniesProps = {
  errorMessage: string;
  isSample: boolean;
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
  isSample,
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
          <span className="rounded-[6px] bg-[#f4f8fd] px-3 py-2 text-[#123b7a]">확인 기업</span>
        </div>

        {response && (
          <div className="summary-strip mb-4 grid grid-cols-3 overflow-hidden rounded-[8px] border border-[#dce4ef]">
            <EvidenceSummaryMetric label="확인 기업" unit="건" value={response.summary.companyCount} />
            <EvidenceSummaryMetric label="확인 장비" unit="개" value={response.summary.equipmentCount} />
            <EvidenceSummaryMetric label="확인 거점" unit="개" value={response.summary.hubCount} />
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
                      <ConnectionEvidenceRow isSample={isSample} item={item} key={item.companyId} />
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
  unit: string;
  value: number;
};

const EvidenceSummaryMetric = ({ label, unit, value }: EvidenceSummaryMetricProps) => (
  <div className="border-r border-[#dce4ef] px-5 py-4 last:border-r-0">
    <p className="text-sm font-extrabold text-[#64748b]">{label}</p>
    <p className="mt-1 text-2xl font-black text-[#123b7a]">
      {formatCount(value)}
      <span className="ml-1 text-sm font-bold text-[#24528d]">{unit}</span>
    </p>
  </div>
);

type ConnectionEvidenceRowProps = {
  isSample: boolean;
  item: ConnectionEvidenceCompany;
};

const ConnectionEvidenceRow = ({ isSample, item }: ConnectionEvidenceRowProps) => (
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
      {isSample ? (
        <button
          className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-[8px] border border-[#d7e2f0] px-4 text-sm font-black text-[#8aa0ba] opacity-70"
          disabled
          type="button"
        >
          보기
        </button>
      ) : (
        <a
          className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#d7e2f0] px-4 text-sm font-black text-[#123b7a]"
          href={`/?companyId=${encodeURIComponent(String(item.companyId))}`}
        >
          보기
        </a>
      )}
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
  isSample: boolean;
  overview: IndustryOverview;
};

const IndustryStatus = ({ isSample, overview }: IndustryStatusProps) => {
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
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3" style={{ color: "#123b7a" }}>
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
          {isSample && <SampleBadge />}
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
