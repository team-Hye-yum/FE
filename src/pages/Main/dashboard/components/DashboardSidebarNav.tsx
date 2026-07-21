import type { DashboardSectionConfig } from "../types";

type DashboardSidebarNavProps = {
  sections: DashboardSectionConfig[];
  onSectionClick: (sectionId: DashboardSectionConfig["id"]) => void;
};

const DashboardSidebarNav = ({ sections, onSectionClick }: DashboardSidebarNavProps) => {
  return (
    <aside className="sticky top-24 h-fit rounded-[10px] bg-white p-6">
      <nav className="flex flex-col gap-2">
        {sections.map((section) => (
          <button
            className="rounded-[5px] px-3 py-2 text-left text-sm text-[#555] hover:bg-gray-50"
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            type="button"
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebarNav;
