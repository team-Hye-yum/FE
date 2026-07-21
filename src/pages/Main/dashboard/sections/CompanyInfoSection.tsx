import type { DashboardCompanyProps } from "../types";
import { useDashboardGet } from "../hooks/useDashboardApi";

const CompanyInfoSection = ({ companyId }: DashboardCompanyProps) => {
  useDashboardGet(companyId, "/companies/{companyId}/profile");

  const displayCompanyId = companyId || "-";
  const leftItems = [
    { label: "기업 일련번호", value: displayCompanyId },
    { label: "지역", value: "부산" },
    { label: "기업 유형", value: "법인기업" },
    { label: "기업 규모", value: "소상공인" },
    { label: "기업 공개", value: "일반법인" },
    { label: "기업 형태", value: "주식회사" },
  ];
  const rightItems = [
    { label: "설립 일자", value: "2010년 02월 02일 (16년차)" },
    { label: "KSIC코드(11차)", value: "C29199" },
    { label: "업종명(11차)", value: "그 외 기타 일반목적용 기계 제조업" },
    { label: "주요제품", value: "고액분리기, 탈수기, 액상설비 외" },
  ];

  return (
    <section className="mb-10 rounded-[10px] border border-[#eee] bg-white px-[30px] py-7">
      <div className="grid grid-cols-2 gap-x-20 gap-y-4">
        {[leftItems, rightItems].map((items, groupIndex) => (
          <dl className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-5 gap-y-4" key={groupIndex}>
            {items.map((item) => (
              <div className="contents" key={item.label}>
                <dt className="text-sm text-[#666]">{item.label}</dt>
                <dd className="text-sm text-[#333]">{item.value}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </section>
  );
};

export default CompanyInfoSection;
