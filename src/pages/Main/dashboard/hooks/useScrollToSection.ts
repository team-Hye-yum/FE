import type { DashboardSectionId } from "../types";

export const useScrollToSection = () => {
  return (sectionId: DashboardSectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
};
