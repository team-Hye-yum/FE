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
  onSectionClick: (sectionId: DashboardSectionConfig["id"]) => void;
  onToggleSectionVisibility: (sectionId: DashboardSectionConfig["id"]) => void;
};

const DashboardShell = ({
  children,
  filterSections,
  navigationSections,
  onReorderSection,
  onSectionClick,
  onToggleSectionVisibility,
}: DashboardShellProps) => {
  return (
    <main className="grid grid-cols-[240px_minmax(0,1fr)_240px] gap-6 px-6 py-12">
      <DashboardSidebarNav sections={navigationSections} onSectionClick={onSectionClick} />
      <div className="min-w-0 rounded-[10px] bg-white px-[30px] py-10">{children}</div>
      <DashboardFilterPanel
        onReorderSection={onReorderSection}
        sections={filterSections}
        onToggleSectionVisibility={onToggleSectionVisibility}
      />
    </main>
  );
};

export default DashboardShell;
