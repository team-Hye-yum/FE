import type { ReactNode } from "react";
import type { DashboardSectionId } from "../types";

type DashboardSectionProps = {
  children: ReactNode;
  id: DashboardSectionId;
  title: string;
};

const DashboardSection = ({ children, id, title }: DashboardSectionProps) => {
  if (!children) {
    return null;
  }

  return (
    <section className="mb-10 scroll-mt-24" id={id}>
      <h2 className="mb-5 text-2xl font-medium text-[#333]">{title}</h2>
      {children}
    </section>
  );
};

export default DashboardSection;
