import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

type AppLayoutProps = {
  children: ReactNode;
};

type SearchStatus = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

type ApiDataResponse<T> = {
  data: T;
};

type SupportProgramSearchItem = {
  code: string;
  programYear: number;
  budgetProgramName: string;
};

type SupportProgramSearchResponse = {
  items: SupportProgramSearchItem[];
};

type IndustrySearchItem = {
  ksicCode: string;
  sectionCode: string;
  sectionName: string;
  divisionCode: string;
  divisionName: string;
  groupCode: string;
  groupName: string;
  classCode: string;
  className: string;
  subclassCode: string;
  subclassName: string;
  displayName: string;
};

type IndustrySearchResponse = {
  items: IndustrySearchItem[];
};

type SupportProgramCompanyListResponse = {
  items: unknown[];
};

type CompanyExistenceResponse = {
  companyId: number;
  exists: boolean;
};

const navItems = [
  { label: "기업 조회", to: "/" },
  { label: "사업별 목록화", to: "/business-list" },
  { label: "BTP 솔루션", to: "/btp-solution" },
];

const apiUrl = (path: string) => {
  const baseUrl = import.meta.env.API_URL || import.meta.env.VITE_API_URL || "/api";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [supportProgramResults, setSupportProgramResults] = useState<SupportProgramSearchItem[]>(
    [],
  );
  const [industryResults, setIndustryResults] = useState<IndustrySearchItem[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>({ type: "idle", message: "" });
  const [isCompanySearchChecking, setIsCompanySearchChecking] = useState(false);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const selectedSupportProgramLabelRef = useRef("");
  const selectedIndustryLabelRef = useRef("");
  const canSearchSupportPrograms = pathname === "/business-list";
  const canSearchIndustries = pathname === "/btp-solution";
  const searchPlaceholder =
    pathname === "/" ? "기업 일련번호" : canSearchIndustries ? "산업명" : "사업명";
  const shouldShowSupportProgramResults =
    canSearchSupportPrograms &&
    searchKeyword.trim().length > 0 &&
    (supportProgramResults.length > 0 || searchStatus.type === "error");
  const shouldShowIndustryResults =
    canSearchIndustries &&
    searchKeyword.trim().length > 0 &&
    (industryResults.length > 0 || searchStatus.type === "error");
  const shouldShowSearchResults = shouldShowSupportProgramResults || shouldShowIndustryResults;
  const visibleResultCount = canSearchIndustries
    ? industryResults.length
    : supportProgramResults.length;

  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const companyId = searchParams.get("companyId");
    const programKeyword = searchParams.get("programKeyword");
    const industryKeyword = searchParams.get("industryKeyword");

    const nextSearchKeyword =
      pathname === "/" && companyId
        ? companyId
        : pathname === "/business-list" && programKeyword
          ? programKeyword
          : pathname === "/btp-solution" && industryKeyword
            ? industryKeyword
            : "";

    selectedSupportProgramLabelRef.current =
      pathname === "/business-list" ? nextSearchKeyword : "";
    selectedIndustryLabelRef.current = pathname === "/btp-solution" ? nextSearchKeyword : "";
    setSearchKeyword(nextSearchKeyword);
    setSupportProgramResults([]);
    setIndustryResults([]);
    setActiveResultIndex(-1);
    setSearchStatus({ type: "idle", message: "" });
    searchAbortControllerRef.current?.abort();
  }, [pathname, search]);

  useEffect(() => {
    const trimmedKeyword = searchKeyword.trim();

    if (!canSearchSupportPrograms) {
      return undefined;
    }

    if (trimmedKeyword.length === 0) {
      searchAbortControllerRef.current?.abort();
      setSupportProgramResults([]);
      setIndustryResults([]);
      setActiveResultIndex(-1);
      setSearchStatus({ type: "idle", message: "" });
      return undefined;
    }

    if (selectedSupportProgramLabelRef.current === trimmedKeyword) {
      return undefined;
    }

    const searchUrl = apiUrl("/support-programs/search");
    const abortController = new AbortController();

    searchAbortControllerRef.current?.abort();
    searchAbortControllerRef.current = abortController;
    setSearchStatus({ type: "loading", message: "" });

    fetch(`${searchUrl}?${new URLSearchParams({ keyword: trimmedKeyword })}`, {
      signal: abortController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`검색 요청에 실패했습니다. (${response.status})`);
        }

        return response.json() as Promise<ApiDataResponse<SupportProgramSearchResponse>>;
      })
      .then((response) => {
        setSupportProgramResults(response.data.items);
        setActiveResultIndex(response.data.items.length > 0 ? 0 : -1);
        setSearchStatus({
          type: response.data.items.length > 0 ? "success" : "error",
          message: response.data.items.length > 0 ? "" : "검색 결과가 없습니다.",
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSupportProgramResults([]);
        setActiveResultIndex(-1);
        setSearchStatus({
          type: "error",
          message: error instanceof Error ? error.message : "검색 요청에 실패했습니다.",
        });
        console.error("Failed to search support programs.", error);
      });

    return () => {
      searchAbortControllerRef.current?.abort();
    };
  }, [canSearchSupportPrograms, searchKeyword]);

  useEffect(() => {
    const trimmedKeyword = searchKeyword.trim();

    if (!canSearchIndustries) {
      return undefined;
    }

    if (trimmedKeyword.length === 0) {
      searchAbortControllerRef.current?.abort();
      setIndustryResults([]);
      setActiveResultIndex(-1);
      setSearchStatus({ type: "idle", message: "" });
      return undefined;
    }

    if (selectedIndustryLabelRef.current === trimmedKeyword) {
      return undefined;
    }

    const searchUrl = apiUrl("/btp-solution/industries/search");
    const abortController = new AbortController();

    searchAbortControllerRef.current?.abort();
    searchAbortControllerRef.current = abortController;
    setSearchStatus({ type: "loading", message: "" });

    fetch(`${searchUrl}?${new URLSearchParams({ keyword: trimmedKeyword })}`, {
      signal: abortController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`산업 검색 요청에 실패했습니다. (${response.status})`);
        }

        return response.json() as Promise<ApiDataResponse<IndustrySearchResponse>>;
      })
      .then((response) => {
        setIndustryResults(response.data.items);
        setActiveResultIndex(response.data.items.length > 0 ? 0 : -1);
        setSearchStatus({
          type: response.data.items.length > 0 ? "success" : "error",
          message: response.data.items.length > 0 ? "" : "검색 결과가 없습니다.",
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setIndustryResults([]);
        setActiveResultIndex(-1);
        setSearchStatus({
          type: "error",
          message: error instanceof Error ? error.message : "산업 검색 요청에 실패했습니다.",
        });
        console.error("Failed to search BTP solution industries.", error);
      });

    return () => {
      searchAbortControllerRef.current?.abort();
    };
  }, [canSearchIndustries, searchKeyword]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectedSupportProgramLabelRef.current = "";
    selectedIndustryLabelRef.current = "";
    setSearchKeyword(event.currentTarget.value);
  };

  const submitCompanySearch = async () => {
    const nextSearchParams = new URLSearchParams(search);
    const trimmedKeyword = searchKeyword.trim();

    if (isCompanySearchChecking) {
      return;
    }

    if (!trimmedKeyword) {
      setSearchStatus({ type: "idle", message: "" });
      nextSearchParams.delete("companyId");
      navigate({ pathname: "/", search: nextSearchParams.toString() }, { replace: true });
      return;
    }

    if (!/^\d+$/.test(trimmedKeyword)) {
      setSearchStatus({
        type: "error",
        message: "기업 일련번호는 숫자만 입력해 주세요. 예: 888",
      });
      return;
    }

    setIsCompanySearchChecking(true);
    setSearchStatus({ type: "loading", message: "기업 일련번호를 확인하는 중입니다." });

    try {
      const response = await fetch(
        apiUrl(`/companies/${encodeURIComponent(trimmedKeyword)}/existence`),
      );

      if (!response.ok) {
        throw new Error(`기업 일련번호 확인에 실패했습니다. (${response.status})`);
      }

      const result = (await response.json()) as ApiDataResponse<CompanyExistenceResponse>;

      if (!result.data.exists) {
        alert("해당 기업 일련번호를 찾을 수 없습니다. 다른 번호를 입력해 주세요.");
        setSearchStatus({ type: "idle", message: "" });
        return;
      }
    } catch (error) {
      setSearchStatus({
        type: "error",
        message: error instanceof Error ? error.message : "기업 일련번호 확인에 실패했습니다.",
      });
      return;
    } finally {
      setIsCompanySearchChecking(false);
    }

    setSearchStatus({ type: "idle", message: "" });
    nextSearchParams.set("companyId", trimmedKeyword);
    navigate({ pathname: "/", search: nextSearchParams.toString() }, { replace: true });
  };

  const handleSupportProgramSelect = async (item: SupportProgramSearchItem) => {
    const label = `${item.programYear} ${item.budgetProgramName}`;
    const nextSearchParams = new URLSearchParams(search);

    selectedSupportProgramLabelRef.current = label;
    setSearchKeyword(label);
    setSupportProgramResults([]);
    setIndustryResults([]);
    setActiveResultIndex(-1);
    setSearchStatus({ type: "idle", message: "" });
    searchAbortControllerRef.current?.abort();
    nextSearchParams.set("programCode", item.code);
    nextSearchParams.set("programKeyword", label);
    navigate({ pathname: "/business-list", search: nextSearchParams.toString() });

    try {
      const response = await fetch(apiUrl(`/support-programs/${item.code}/companies`));

      if (!response.ok) {
        throw new Error(`기업 목록 요청에 실패했습니다. (${response.status})`);
      }

      const result = (await response.json()) as ApiDataResponse<SupportProgramCompanyListResponse>;

      window.dispatchEvent(
        new CustomEvent("support-program-companies-loaded", {
          detail: {
            companies: result.data.items,
            supportProgram: item,
          },
        }),
      );
    } catch (error) {
      setSearchStatus({
        type: "error",
        message: error instanceof Error ? error.message : "기업 목록 요청에 실패했습니다.",
      });
    }
  };

  const handleIndustrySelect = (item: IndustrySearchItem) => {
    const label = item.divisionName || item.displayName || item.divisionCode;
    const nextSearchParams = new URLSearchParams(search);

    selectedIndustryLabelRef.current = label;
    setSearchKeyword(label);
    setIndustryResults([]);
    setSupportProgramResults([]);
    setActiveResultIndex(-1);
    setSearchStatus({ type: "idle", message: "" });
    searchAbortControllerRef.current?.abort();
    nextSearchParams.set("divisionCode", item.divisionCode);
    nextSearchParams.set("industryKeyword", label);
    nextSearchParams.delete("sectionCode");
    nextSearchParams.delete("industryCode");
    nextSearchParams.delete("code");
    nextSearchParams.delete("companyKeyword");
    nextSearchParams.delete("page");
    nextSearchParams.delete("size");
    navigate({ pathname: "/btp-solution", search: nextSearchParams.toString() });
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (pathname === "/" && event.key === "Enter") {
      event.preventDefault();
      void submitCompanySearch();
      return;
    }

    if (!shouldShowSearchResults || visibleResultCount === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveResultIndex((currentIndex) =>
        currentIndex >= visibleResultCount - 1 ? 0 : currentIndex + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveResultIndex((currentIndex) =>
        currentIndex <= 0 ? visibleResultCount - 1 : currentIndex - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeResultIndex >= 0) {
      event.preventDefault();
      if (canSearchIndustries) {
        handleIndustrySelect(industryResults[activeResultIndex]);
        return;
      }

      void handleSupportProgramSelect(supportProgramResults[activeResultIndex]);
    }
  };

  const searchStatusClassName = searchStatus.type === "error" ? "text-red-600" : "text-[#666]";

  return (
    <div className="min-h-screen bg-[#f2f4f8] text-[#333]">
      <header className="relative z-40 h-[70px] bg-white" data-dashboard-print-exclude>
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 lg:gap-8 lg:px-6">
          <NavLink className="shrink-0" to="/">
            <img alt="Data On" className="h-8 w-[108px] sm:h-9 sm:w-[123px]" src="/logo.svg" />
          </NavLink>

          <div className="relative min-w-0 flex-1 lg:w-[464px] lg:flex-none">
            <label className="flex h-11 w-full min-w-0 items-center gap-3 rounded-[35px] border-2 border-[#51a2ff] bg-white px-4 sm:h-12 sm:gap-5 sm:px-5">
              <svg
                aria-hidden="true"
                className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="m22.3 23.7-6-6a10 10 0 1 1 1.4-1.4l6 6a1 1 0 0 1-1.4 1.4ZM10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
                  fill="#51A2FF"
                />
              </svg>
              <input
                className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-[#333] outline-none placeholder:text-[#999] sm:text-lg"
                disabled={pathname === "/" && isCompanySearchChecking}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                type="search"
                value={searchKeyword}
              />
            </label>
            {(searchStatus.type === "error" || searchStatus.type === "loading") &&
              searchStatus.message &&
              !shouldShowSearchResults && (
                <p
                  className={`absolute left-5 top-[52px] text-xs font-medium ${searchStatusClassName}`}
                >
                  {searchStatus.message}
                </p>
              )}
          </div>

          <nav className="hidden shrink-0 items-center gap-6 text-lg text-[#333] md:flex">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  isActive ? "font-semibold text-[#2b7fff]" : "font-normal"
                }
                end={item.to === "/"}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {shouldShowSearchResults && (
        <div
          className="fixed inset-x-0 top-[70px] z-30"
          data-dashboard-print-exclude
          onMouseDown={() => {
            setSupportProgramResults([]);
            setIndustryResults([]);
            setActiveResultIndex(-1);
            setSearchStatus({ type: "idle", message: "" });
          }}
        >
          <div
            className="mx-auto mt-2.5 max-h-[420px] w-[min(640px,calc(100vw-48px))] overflow-y-auto rounded-[8px] border border-[#e5e7eb] bg-white p-2 shadow-[0_14px_32px_rgba(15,23,42,0.12)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {searchStatus.type === "error" && visibleResultCount === 0 && (
              <p className="px-3 py-2 text-sm font-medium text-red-600">
                {searchStatus.message}
              </p>
            )}
            <div className="space-y-1">
              {canSearchIndustries
                ? industryResults.map((item, index) => (
                    <button
                      className={`flex w-full items-center justify-between gap-4 rounded-[6px] px-3 py-2.5 text-left transition ${
                        activeResultIndex === index ? "bg-[#f1f7ff]" : "bg-white hover:bg-[#f8fafc]"
                      }`}
                      key={`${item.ksicCode}-${item.sectionCode}-${index}`}
                      onClick={() => handleIndustrySelect(item)}
                      onMouseEnter={() => setActiveResultIndex(index)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold text-[#222]">
                          {item.divisionName || item.displayName}
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-medium text-[#777]">
                          {item.sectionName}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-[#2b7fff]">
                        {item.divisionCode}
                      </span>
                    </button>
                  ))
                : supportProgramResults.map((item, index) => (
                    <button
                      className={`flex w-full items-center justify-between gap-4 rounded-[6px] px-3 py-2.5 text-left transition ${
                        activeResultIndex === index ? "bg-[#f1f7ff]" : "bg-white hover:bg-[#f8fafc]"
                      }`}
                      key={`${item.code}-${item.programYear}-${index}`}
                      onClick={() => void handleSupportProgramSelect(item)}
                      onMouseEnter={() => setActiveResultIndex(index)}
                      type="button"
                    >
                      <span className="min-w-0 truncate text-[15px] font-semibold text-[#222]">
                        {item.programYear} {item.budgetProgramName}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-[#2b7fff]">
                        {item.code}
                      </span>
                    </button>
                  ))}
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default AppLayout;
