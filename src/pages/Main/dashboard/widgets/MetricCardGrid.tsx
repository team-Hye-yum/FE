import type { ReactNode } from "react";

type MetricCardGridProps = {
  children: ReactNode;
};

const MetricCardGrid = ({ children }: MetricCardGridProps) => {
  return <div className="grid grid-cols-4 gap-4">{children}</div>;
};

export default MetricCardGrid;
