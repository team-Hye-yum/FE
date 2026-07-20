import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

type AppLayoutProps = {
  children: ReactNode;
};

type SearchStatus = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

const navItems = [
  { label: "기업 조회", to: "/" },
  { label: "사업별 목록화", to: "/business-list" },
  { label: "BTP 솔루션", to: "/btp-solution" },
];

const apiUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || "/api";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchStatus, setSearchStatus] = useState<SearchStatus>({ type: "idle", message: "" });
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const canSearchSupportPrograms = pathname === "/business-list";
  const searchPlaceholder = pathname === "/" ? "기업 일련번호" : "사업명";

  useEffect(() => {
    setSearchKeyword("");
    setSearchStatus({ type: "idle", message: "" });
    searchAbortControllerRef.current?.abort();
  }, [pathname]);

  useEffect(() => {
    const trimmedKeyword = searchKeyword.trim();

    if (!canSearchSupportPrograms || trimmedKeyword.length === 0) {
      searchAbortControllerRef.current?.abort();
      setSearchStatus({ type: "idle", message: "" });
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const searchUrl = apiUrl("/support-programs/search");
      const abortController = new AbortController();

      searchAbortControllerRef.current?.abort();
      searchAbortControllerRef.current = abortController;
      setSearchStatus({ type: "loading", message: "검색 중입니다." });

      fetch(`${searchUrl}?${new URLSearchParams({ keyword: trimmedKeyword })}`, {
        signal: abortController.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`검색 요청에 실패했습니다. (${response.status})`);
          }

          setSearchStatus({ type: "success", message: "검색 요청을 완료했습니다." });
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          setSearchStatus({
            type: "error",
            message: error instanceof Error ? error.message : "검색 요청에 실패했습니다.",
          });
          console.error("Failed to search support programs.", error);
        });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      searchAbortControllerRef.current?.abort();
    };
  }, [canSearchSupportPrograms, searchKeyword]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.currentTarget.value);
  };

  const searchStatusClassName =
    searchStatus.type === "error" ? "text-red-600" : "text-[#666]";

  return (
    <div className="min-h-screen bg-[#f2f4f8] text-[#333]">
      <header className="h-[70px] bg-white">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-8 px-6">
          <NavLink className="shrink-0" to="/">
            <img alt="Data On" className="h-9 w-[123px]" src="/logo.svg" />
          </NavLink>

          <div className="relative w-[464px] max-w-full">
            <label className="flex h-12 items-center gap-5 rounded-[35px] border-2 border-[#51a2ff] bg-white px-5">
              <svg
                aria-hidden="true"
                className="h-6 w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="m22.3 23.7-6-6a10 10 0 1 1 1.4-1.4l6 6a1 1 0 0 1-1.4 1.4ZM10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
                  fill="#51A2FF"
                />
              </svg>
              <input
                className="h-full min-w-0 flex-1 bg-transparent text-lg font-medium text-[#333] outline-none placeholder:text-[#999]"
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                type="search"
                value={searchKeyword}
              />
            </label>
            {searchStatus.message && (
              <p className={`absolute left-5 top-[52px] text-xs font-medium ${searchStatusClassName}`}>
                {searchStatus.message}
              </p>
            )}
          </div>

          <nav className="flex shrink-0 items-center gap-6 text-lg text-[#333]">
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
      {children}
    </div>
  );
};

export default AppLayout;
