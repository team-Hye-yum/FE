import { motion } from "motion/react";

const AnnouncementAnalysisLoadingModal = () => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-x-0 bottom-0 top-[70px] z-40 flex items-center justify-center bg-black/30"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[10px] bg-white px-10 py-8 text-center shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#2b7fff]" />
        <p className="mt-4 text-base font-medium text-[#333]">공고 정보를 분석하고 있습니다.</p>
        <div className="mt-5 space-y-2">
          <div className="business-analysis-shimmer mx-auto h-2.5 w-48 rounded-full" />
          <div className="business-analysis-shimmer mx-auto h-2.5 w-36 rounded-full" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnnouncementAnalysisLoadingModal;
