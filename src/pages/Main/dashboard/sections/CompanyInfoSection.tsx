import type { DashboardCompanyProps } from "../types";
import { useDashboardGetData } from "../hooks/useDashboardApi";

type CompanyProfileResponse = {
  companyId: number | null;
  region: string | null;
  businessEntityType: string | null;
  companyForm: string | null;
  listingMarket: string | null;
  establishedDate: string | null;
  companyAge: number | null;
  ksicCode11th: string | null;
  industryName11th: string | null;
  mainProduct: string | null;
};

const formatNullable = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const normalizedValue = value.replaceAll("-", "");
  if (!/^\d{8}$/.test(normalizedValue)) {
    return value;
  }

  return `${normalizedValue.slice(0, 4)}년 ${normalizedValue.slice(4, 6)}월 ${normalizedValue.slice(6)}일`;
};

const formatEstablishedDate = (profile: CompanyProfileResponse | null) => {
  if (!profile) {
    return "-";
  }

  const dateText = formatDate(profile.establishedDate);
  const ageText =
    profile.companyAge === null || profile.companyAge === undefined
      ? ""
      : ` (${profile.companyAge}년차)`;

  return `${dateText}${dateText === "-" ? "" : ageText}`;
};

const CompanyInfoSection = ({ companyId, isSample = false }: DashboardCompanyProps) => {
  const { data, error, isLoading } = useDashboardGetData<CompanyProfileResponse>(
    isSample ? "" : companyId,
    "/companies/{companyId}/profile",
  );

  const leftItems = [
    { label: "지역", value: isSample ? "샘플 지역" : formatNullable(data?.region) },
    {
      label: "기업 유형",
      value: isSample ? "샘플 유형" : formatNullable(data?.businessEntityType),
    },
    { label: "기업 규모", value: isSample ? "샘플 규모" : "-" },
    { label: "기업 공개", value: isSample ? "샘플 공개구분" : formatNullable(data?.listingMarket) },
    { label: "기업 형태", value: isSample ? "샘플 형태" : formatNullable(data?.companyForm) },
  ];
  const rightItems = [
    { label: "설립 일자", value: isSample ? "샘플 설립일 (예시)" : formatEstablishedDate(data) },
    { label: "KSIC코드(11차)", value: isSample ? "SAMPLE-KSIC" : formatNullable(data?.ksicCode11th) },
    { label: "업종명(11차)", value: isSample ? "샘플 업종" : formatNullable(data?.industryName11th) },
    {
      label: "주요제품",
      value: isSample ? "샘플 제품 A, 샘플 제품 B" : formatNullable(data?.mainProduct),
    },
  ];

  if (error) {
    return (
      <section className="mb-10 min-h-[209px] rounded-[10px] border border-[#eee] bg-white px-[30px] py-[30px] text-sm font-medium text-red-600">
        기업 정보를 불러오지 못했습니다.
      </section>
    );
  }

  return (
    <section className="mb-10 min-h-[209px] rounded-[10px] border border-[#eee] bg-white px-[30px] py-[30px]">
      <div className="flex justify-between">
        {[leftItems, rightItems].map((items, groupIndex) => (
          <dl
            className={`grid w-[306px] gap-x-[30px] gap-y-4 ${
              groupIndex === 0 ? "grid-cols-[77px_minmax(0,1fr)]" : "grid-cols-[89px_minmax(0,1fr)]"
            }`}
            key={groupIndex}
          >
            {items.map((item) => (
              <div className="contents" key={item.label}>
                <dt className="text-sm leading-5 text-[#666]">{item.label}</dt>
                <dd className="text-sm leading-5 text-[#333]">
                  {isLoading && !data && !isSample ? "불러오는 중" : item.value}
                </dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </section>
  );
};

export default CompanyInfoSection;
