import type { DashboardSectionId } from "../types";

export const useSectionScrollSpy = () => {
  const activeSectionId: DashboardSectionId | null = null;

  return {
    activeSectionId,
  };
};
