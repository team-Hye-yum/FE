const AnnouncementAnalysisLoadingModal = () => {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[70px] z-40 flex items-center justify-center bg-black/30">
      <div className="rounded-[10px] bg-white px-10 py-8 text-center shadow-lg">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#2b7fff]" />
        <p className="mt-4 text-base font-medium text-[#333]">공고 정보를 분석하고 있습니다.</p>
      </div>
    </div>
  );
};

export default AnnouncementAnalysisLoadingModal;
