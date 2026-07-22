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

    let animationFrame = 0;

    const updateActiveSection = () => {
      const activationOffset = 128;
      const scrollBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (documentHeight - scrollBottom < 8) {
        setActiveSectionId(sections.at(-1)?.id as DashboardSectionId);
        return;
      }

      const currentSection =
        sections
          .map((section) => ({
            id: section.id as DashboardSectionId,
            top: section.getBoundingClientRect().top,
          }))
          .filter((section) => section.top <= activationOffset)
          .at(-1) ?? null;

      setActiveSectionId(currentSection?.id ?? (sections[0].id as DashboardSectionId));
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [sectionIds.join("|")]);

  return {
    activeSectionId,
  };
};
