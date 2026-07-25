import { motion } from "motion/react";

type DimLoadingOverlayProps = {
  message: string;
};

const DimLoadingOverlay = ({ message }: DimLoadingOverlayProps) => (
  <motion.div
    animate={{ opacity: 1 }}
    className="absolute inset-0 z-30 flex items-center justify-center rounded-md bg-white/70 backdrop-blur-[1px]"
    initial={{ opacity: 0 }}
    transition={{ duration: 0.16, ease: "easeOut" }}
  >
    <div className="flex flex-col items-center gap-3 rounded-[10px] bg-white px-8 py-6 shadow-lg">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-[#2b7fff]" />
      <p className="text-sm font-bold text-[#333]">{message}</p>
    </div>
  </motion.div>
);

export default DimLoadingOverlay;
