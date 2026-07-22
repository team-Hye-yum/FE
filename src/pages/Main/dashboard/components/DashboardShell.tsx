import type { ReactNode } from "react";
import type { DashboardSectionConfig } from "../types";
import DashboardFilterPanel from "./DashboardFilterPanel";
import DashboardSidebarNav from "./DashboardSidebarNav";

type DashboardShellProps = {
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
  children,
  filterSections,
  navigationSections,
  onReorderSection,
  onResetPanelConfig,
  onSectionClick,
  onToggleSectionVisibility,
}: DashboardShellProps) => {
  return (
    <main className="dashboard-shell grid grid-cols-[240px_minmax(0,1fr)_240px] gap-6 px-6 py-12">
      <div data-dashboard-print-exclude>
        <DashboardSidebarNav sections={navigationSections} onSectionClick={onSectionClick} />
      </div>
      <div className="min-w-0 rounded-[10px] bg-white px-[30px] py-10" data-dashboard-print-area>
        <div data-dashboard-print-content>{children}</div>
      </div>
      <div data-dashboard-print-exclude>
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
