import { useEffect, useState } from "react";
import type { DashboardSectionConfig } from "../types";

const dashboardPanelStorageKey = "hyeyum-dashboard-panel-config";

const restoreSections = (sections: readonly DashboardSectionConfig[]) => {
  const defaultSections = [...sections];

  try {
    const savedValue = localStorage.getItem(dashboardPanelStorageKey);

    if (!savedValue) {
      return defaultSections;
    }

    const savedSections = JSON.parse(savedValue) as Partial<DashboardSectionConfig>[];
    const sectionById = new Map(defaultSections.map((section) => [section.id, section]));
    const restoredSections = savedSections.flatMap((savedSection) => {
      if (!savedSection.id || !sectionById.has(savedSection.id)) {
        return [];
      }

      const defaultSection = sectionById.get(savedSection.id)!;
      sectionById.delete(savedSection.id);

      return [
        {
          ...defaultSection,
          visible:
            typeof savedSection.visible === "boolean"
              ? savedSection.visible
              : defaultSection.visible,
        },
      ];
    });

    return [...restoredSections, ...sectionById.values()];
  } catch {
    return defaultSections;
  }
};

export const useDashboardPanelConfig = (sections: readonly DashboardSectionConfig[]) => {
  const [orderedSections, setOrderedSections] = useState<DashboardSectionConfig[]>(() =>
    restoreSections(sections),
  );

  useEffect(() => {
    localStorage.setItem(dashboardPanelStorageKey, JSON.stringify(orderedSections));
  }, [orderedSections]);

  const toggleSectionVisibility = (sectionId: DashboardSectionConfig["id"]) => {
    setOrderedSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId ? { ...section, visible: !section.visible } : section,
      ),
    );
  };

  const reorderSection = (
    draggedSectionId: DashboardSectionConfig["id"],
    targetSectionId: DashboardSectionConfig["id"],
  ) => {
    setOrderedSections((currentSections) => {
      const draggedIndex = currentSections.findIndex((section) => section.id === draggedSectionId);
      const targetIndex = currentSections.findIndex((section) => section.id === targetSectionId);

      if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) {
        return currentSections;
      }

      const nextSections = [...currentSections];
      const [draggedSection] = nextSections.splice(draggedIndex, 1);
      nextSections.splice(targetIndex, 0, draggedSection);

      return nextSections;
    });
  };

  return {
    orderedSections,
    reorderSection,
    toggleSectionVisibility,
  };
};
