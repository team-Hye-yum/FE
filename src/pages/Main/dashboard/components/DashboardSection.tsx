import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { DashboardSectionId } from "../types";

type DashboardSectionProps = {
  children: ReactNode;
  headerAction?: ReactNode;
  id: DashboardSectionId;
  title: string;
};

const DashboardSection = ({ children, headerAction, id, title }: DashboardSectionProps) => {
  if (!children) {
    return null;
  }

  return (
    <motion.section
      className="mb-10 scroll-mt-24"
      id={id}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      viewport={{ margin: "-80px", once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 className="text-2xl font-medium text-[#333]">{title}</h2>
        {headerAction}
      </div>
      {children}
    </motion.section>
  );
};

export default DashboardSection;
