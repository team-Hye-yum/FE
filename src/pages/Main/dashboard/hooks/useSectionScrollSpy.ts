import { useEffect, useState } from "react";
import type { DashboardSectionId } from "../types";

export const useSectionScrollSpy = (sectionIds: DashboardSectionId[]) => {
  const [activeSectionId, setActiveSectionId] = useState<DashboardSectionId | null>(
    sectionIds[0] ?? null,
  );

  useEffect(() => {
    if (sectionIds.length === 0) {
      setActiveSectionId(null);
      return;
    }

    const sections = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    const visibleSections = new Map<DashboardSectionId, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id as DashboardSectionId;

          if (entry.isIntersecting) {
            visibleSections.set(sectionId, entry.intersectionRatio);
          } else {
            visibleSections.delete(sectionId);
          }
        });

        const nextActiveSectionId = Array.from(visibleSections.entries()).sort(
          ([firstSectionId, firstRatio], [secondSectionId, secondRatio]) => {
            if (secondRatio !== firstRatio) {
              return secondRatio - firstRatio;
            }

            return sectionIds.indexOf(firstSectionId) - sectionIds.indexOf(secondSectionId);
          },
        )[0]?.[0];

        if (nextActiveSectionId) {
          setActiveSectionId(nextActiveSectionId);
        }
      },
      {
        rootMargin: "-96px 0px -58% 0px",
        threshold: [0.1, 0.35, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));
    setActiveSectionId((currentActiveSectionId) =>
      currentActiveSectionId && sectionIds.includes(currentActiveSectionId)
        ? currentActiveSectionId
        : sectionIds[0],
    );

    return () => observer.disconnect();
  }, [sectionIds.join("|")]);

  return {
    activeSectionId,
  };
};
