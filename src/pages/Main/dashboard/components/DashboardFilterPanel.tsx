import { useState } from "react";
import type { DashboardSectionConfig } from "../types";

type DashboardFilterPanelProps = {
  onReorderSection: (
    draggedSectionId: DashboardSectionConfig["id"],
    targetSectionId: DashboardSectionConfig["id"],
  ) => void;
  onResetPanelConfig: () => void;
  sections: DashboardSectionConfig[];
  onToggleSectionVisibility: (sectionId: DashboardSectionConfig["id"]) => void;
};

const DashboardFilterPanel = ({
  onReorderSection,
  onResetPanelConfig,
  sections,
  onToggleSectionVisibility,
}: DashboardFilterPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draggedSectionId, setDraggedSectionId] =
    useState<DashboardSectionConfig["id"] | null>(null);
  const [dragOverSectionId, setDragOverSectionId] =
    useState<DashboardSectionConfig["id"] | null>(null);

  const handleDragEnd = () => {
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  return (
    <aside className="sticky top-24 h-fit rounded-[10px] bg-white p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-medium text-[#333]">대시보드 필터링</h2>
        <div className="flex items-center gap-1.5">
          {isEditing && (
            <button
              aria-label="대시보드 필터 설정 초기화"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[#eee] text-[#666] hover:border-red-200 hover:text-red-500"
              onClick={() => {
                handleDragEnd();
                onResetPanelConfig();
              }}
              type="button"
            >
              <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <path
                  d="M4 12a8 8 0 1 0 2.34-5.66M4 4v5h5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          )}
          <button
            aria-label="대시보드 필터 순서 편집"
            aria-pressed={isEditing}
            className={`flex h-7 w-7 items-center justify-center rounded-full border ${
              isEditing ? "border-[#51a2ff] text-[#51a2ff]" : "border-[#eee] text-[#666]"
            }`}
            onClick={() => {
              handleDragEnd();
              setIsEditing((currentValue) => !currentValue);
            }}
            type="button"
          >
            <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <path
                d="M4 20h4L19 9l-4-4L4 16v4Zm12.5-12.5 1-1a1.4 1.4 0 0 0 0-2l-1-1a1.4 1.4 0 0 0-2 0l-1 1 3 3Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {sections.map((section) => (
          <div
            className={`flex items-center gap-1.5 rounded-[18px] transition ${
              dragOverSectionId === section.id ? "bg-blue-50" : ""
            } ${draggedSectionId === section.id ? "opacity-50" : ""}`}
            draggable={isEditing}
            key={section.id}
            onDragEnd={handleDragEnd}
            onDragOver={(event) => {
              if (!isEditing || draggedSectionId === section.id) {
                return;
              }

              event.preventDefault();
              setDragOverSectionId(section.id);
            }}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", section.id);
              setDraggedSectionId(section.id);
            }}
            onDrop={(event) => {
              event.preventDefault();

              const droppedSectionId =
                (event.dataTransfer.getData("text/plain") as DashboardSectionConfig["id"]) ||
                draggedSectionId;

              if (droppedSectionId && droppedSectionId !== section.id) {
                onReorderSection(droppedSectionId, section.id);
              }

              handleDragEnd();
            }}
          >
            {isEditing && (
              <span
                aria-hidden="true"
                className="flex h-6 w-4 cursor-grab items-center justify-center text-[#aaa]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16">
                  <path
                    d="M5 3h.01M11 3h.01M5 8h.01M11 8h.01M5 13h.01M11 13h.01"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            )}
            <button
              className={`w-fit rounded-[15px] px-[15px] py-1.5 text-sm font-medium ${
                section.visible ? "bg-[#51a2ff] text-white" : "border border-[#ddd] text-[#888]"
              }`}
              onClick={() => onToggleSectionVisibility(section.id)}
              type="button"
            >
              {section.label}
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default DashboardFilterPanel;
