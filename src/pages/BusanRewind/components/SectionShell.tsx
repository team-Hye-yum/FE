import type { ReactNode } from "react";

type SectionShellProps = {
  children: ReactNode;
  dataSampleTour?: string;
  title: string;
};

const SectionShell = ({ children, dataSampleTour, title }: SectionShellProps) => (
  <section
    className="overflow-hidden rounded-lg border border-[#dce6f4] bg-white shadow-sm"
    data-sample-tour={dataSampleTour}
  >
    <div className="flex items-center justify-between border-b border-[#e6edf7] px-5 py-3">
      <h2 className="text-[19px] font-extrabold text-[#143d78]">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

export default SectionShell;
