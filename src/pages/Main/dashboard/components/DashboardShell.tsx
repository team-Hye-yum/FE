import type { ReactNode } from "react";
import type { DashboardSectionConfig } from "../types";
import DashboardFilterPanel from "./DashboardFilterPanel";
import DashboardSidebarNav from "./DashboardSidebarNav";

type DashboardShellProps = {
  activeSectionId: DashboardSectionConfig["id"] | "company-info" | null;
  children: ReactNode;
  filterSections: DashboardSectionConfig[];
  navigationSections: DashboardSectionConfig[];
  onReorderSection: (
    draggedSectionId: DashboardSectionConfig["id"],
    targetSectionId: DashboardSectionConfig["id"],
  ) => void;
  onResetPanelConfig: () => void;
  onSectionClick: (sectionId: DashboardSectionConfig["id"]) => void;
  onToggleSectionVisibility: (sectionId: DashboardSectionConfig["id"]) => void;
};

const DashboardShell = ({
  activeSectionId,
  children,
  filterSections,
  navigationSections,
  onReorderSection,
  onResetPanelConfig,
  onSectionClick,
  onToggleSectionVisibility,
}: DashboardShellProps) => {
  return (
    <main className="dashboard-shell grid grid-cols-1 gap-6 px-4 py-8 lg:px-6 lg:py-12 xl:grid-cols-[240px_minmax(0,1fr)_240px]">
      <div className="hidden xl:block" data-dashboard-print-exclude>
        <DashboardSidebarNav
          activeSectionId={activeSectionId}
          sections={navigationSections}
          onSectionClick={onSectionClick}
        />
      </div>
      <div className="min-w-0 rounded-[10px] bg-white px-4 py-8 sm:px-[30px] sm:py-10" data-dashboard-print-area>
        <div className="mb-6 space-y-3 xl:hidden" data-dashboard-print-exclude>
          <div className="hidden overflow-x-auto pb-1 sm:block">
            <div className="flex min-w-max gap-2">
              {navigationSections.map((section) => (
                <button
                  className={`h-9 rounded-full px-4 text-sm font-medium ${
                    activeSectionId === section.id
                      ? "bg-[#2b7fff] text-white"
                      : "border border-[#d7e7ff] bg-white text-[#2b7fff]"
                  }`}
                  key={section.id}
                  onClick={() => onSectionClick(section.id)}
                  type="button"
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {filterSections.map((section) => (
                <button
                  className={`h-8 rounded-full px-3 text-xs font-medium ${
                    section.visible
                      ? "bg-[#eef6ff] text-[#2b7fff]"
                      : "border border-[#ddd] text-[#888]"
                  }`}
                  key={section.id}
                  onClick={() => onToggleSectionVisibility(section.id)}
                  type="button"
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div data-dashboard-print-content>{children}</div>
      </div>
      <div className="hidden xl:block" data-dashboard-print-exclude>
        <DashboardFilterPanel
          onReorderSection={onReorderSection}
          onResetPanelConfig={onResetPanelConfig}
          sections={filterSections}
          onToggleSectionVisibility={onToggleSectionVisibility}
        />
      </div>
    </main>
  );
};

export default DashboardShell;
