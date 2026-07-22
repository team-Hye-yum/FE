import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";

type CompanyProfileHeaderResponse = {
  companyId: number | null;
};

const createPrintChartImages = () => {
  const replacements: Array<{ display: string; image: HTMLImageElement; target: HTMLElement }> = [];
  const imageReadyPromises: Promise<unknown>[] = [];
  const serializer = new XMLSerializer();

  document.querySelectorAll<HTMLElement>(".recharts-responsive-container").forEach((container) => {
    const wrapper = container.querySelector<HTMLElement>(".recharts-wrapper");

    if (!wrapper) {
      return;
    }

    const svg = wrapper.querySelector<SVGSVGElement>("svg.recharts-surface");

    if (!svg) {
      return;
    }

    const { height: renderedHeight, width: renderedWidth } = container.getBoundingClientRect();
    const width = container.offsetWidth || renderedWidth;
    const height = container.offsetHeight || renderedHeight;

    if (height <= 0 || width <= 0) {
      return;
    }

    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
    const svgWidth = svg.viewBox.baseVal?.width || svg.width.baseVal.value || width;
    const svgHeight = svg.viewBox.baseVal?.height || svg.height.baseVal.value || height;

    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));
    clonedSvg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    const image = document.createElement("img");
    image.alt = "";
    image.className = "dashboard-print-chart-image";
    image.style.display = "block";
    image.style.height = `${height}px`;
    image.style.objectFit = "contain";
    image.style.pointerEvents = "none";
    image.style.visibility = "visible";
    image.style.width = `${width}px`;
    image.style.maxWidth = "100%";

    replacements.push({ display: container.style.display, image, target: container });
    container.parentElement?.insertBefore(image, container);
    container.style.display = "none";
    imageReadyPromises.push(
      new Promise<void>((resolve) => {
        const sourceImage = new Image();
        sourceImage.onload = () => {
          const canvas = document.createElement("canvas");
          const pixelRatio = window.devicePixelRatio || 1;
          canvas.width = Math.ceil(width * pixelRatio);
          canvas.height = Math.ceil(height * pixelRatio);

          const context = canvas.getContext("2d");
          if (!context) {
            resolve();
            return;
          }

          context.scale(pixelRatio, pixelRatio);
          context.drawImage(sourceImage, 0, 0, width, height);
          image.src = canvas.toDataURL("image/png");
          void (image.decode?.().catch(() => undefined) ?? Promise.resolve()).then(() => {
            resolve();
          });
        };
        sourceImage.onerror = () => {
          resolve();
        };
        sourceImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          serializer.serializeToString(clonedSvg),
        )}`;
      }),
    );
  });

  return {
    cleanup: () => {
      replacements.forEach(({ display, image, target }) => {
        target.style.display = display;
        image.remove();
      });
    },
    ready: Promise.all(imageReadyPromises),
  };
};

const waitForFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const waitForDashboardIdle = async (printArea: Element | null) => {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const isLoading =
      printArea?.textContent?.includes("불러오는 중") ||
      Boolean(printArea?.querySelector(".animate-pulse"));

    if (!isLoading) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }
};

const prepareDashboardSectionsForPrint = async () => {
  const originalScrollX = window.scrollX;
  const originalScrollY = window.scrollY;
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("[data-dashboard-print-content] > section"),
  );

  for (const section of sections) {
    section.scrollIntoView({ block: "center" });
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    await waitForFrame();
  }

  window.scrollTo(originalScrollX, originalScrollY);
  window.dispatchEvent(new Event("resize"));
  await waitForFrame();
};

const DashboardHeader = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const { data } = useDashboardGetData<CompanyProfileHeaderResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/profile",
  );
  const displayCompanyId = data?.companyId ?? (companyId || "-");

  const handlePdfExport = async () => {
    const printArea = document.querySelector("[data-dashboard-print-area]");
    const root = document.documentElement;

    await waitForDashboardIdle(printArea);
    await prepareDashboardSectionsForPrint();

    root.classList.add("dashboard-printing");
    window.dispatchEvent(new Event("resize"));
    await waitForFrame();
    await waitForFrame();
    await new Promise((resolve) => setTimeout(resolve, 150));
    window.dispatchEvent(new Event("resize"));
    await waitForFrame();

    const chartImages = createPrintChartImages();
    await chartImages.ready;

    const cleanupPrintMode = () => {
      chartImages.cleanup();
      root.classList.remove("dashboard-printing");
    };

    window.addEventListener("afterprint", cleanupPrintMode, { once: true });
    window.print();
  };

  return (
    <header className="mb-10 flex items-start justify-between gap-4">
      <h1 className="text-3xl font-medium text-[#333]">기업 일련번호 {displayCompanyId}</h1>
      <div className="flex items-center gap-3">
        {isSample && (
          <span className="inline-flex h-8 min-w-[92px] items-center justify-center rounded-full bg-[#d10000] px-5 text-base font-bold text-white">
            SAMPLE
          </span>
        )}
        <button
          className="inline-flex h-9 items-center gap-1.5 rounded-[7px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-[#777] hover:border-[#51a2ff] hover:text-[#2b7fff]"
          data-dashboard-print-exclude
          onClick={handlePdfExport}
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 16V4m0 0 4 4m-4-4-4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          PDF 내보내기
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
