import type { DashboardSectionConfig, DashboardSectionId } from "../types";

type DashboardSidebarNavProps = {
  activeSectionId: DashboardSectionId | null;
  sections: DashboardSectionConfig[];
  onSectionClick: (sectionId: DashboardSectionConfig["id"]) => void;
};

const DashboardSidebarNav = ({
  activeSectionId,
  sections,
  onSectionClick,
}: DashboardSidebarNavProps) => {
  return (
    <aside className="sticky top-24 h-fit rounded-[10px] bg-white p-6">
      <nav className="flex flex-col gap-2">
        {sections.map((section) => {
          const isActive = activeSectionId === section.id;

          return (
            <button
              aria-current={isActive ? "true" : undefined}
              className={`group relative rounded-[6px] px-3 py-2 text-left text-sm font-medium transition duration-150 ${
                isActive ? "bg-[#eef6ff] text-[#1f6fd6]" : "text-[#555] hover:bg-gray-50"
              }`}
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              type="button"
            >
              <span
                className={`absolute bottom-2 left-0 top-2 w-[3px] rounded-full transition ${
                  isActive ? "bg-[#2b7fff] opacity-100" : "bg-transparent opacity-0"
                }`}
              />
              <span className="block truncate">{section.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default DashboardSidebarNav;
