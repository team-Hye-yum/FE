import SectionShell from "./SectionShell";
import type { PastSupportReviewData } from "../types";
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type IndustrySupportExplorerProps = {
  data: PastSupportReviewData;
};

const formatChange = (value: number | null) => (value === null ? "-" : `${value > 0 ? "+" : ""}${value}%`);
const formatThousandKrw = (value: number | null) =>
  value === null ? "-" : `${Math.round(value / 100000).toLocaleString()}억원`;
const formatKrw = (value: number | null) =>
  value === null ? "-" : `${Math.round(value / 100000000).toLocaleString()}억원`;

const IndustrySupportExplorer = ({ data }: IndustrySupportExplorerProps) => (
  <SectionShell dataSampleTour="busan-rewind-past-support-review" title="당시 산업과 지원 사업 함께 살펴보기">
    {data.matchedPeriod && (
      <div className="mb-4 inline-flex rounded-full border border-[#dbeafe] bg-white px-3 py-1.5 text-xs font-extrabold text-[#1d4ed8]">
        {data.matchedPeriod.label} 기준
      </div>
    )}
    <div className="grid gap-4 lg:grid-cols-[1fr_1.05fr_1fr]">
      <div className="rounded-md border border-[#dfe8f5] p-4">
        <div className="mb-4 flex gap-2 text-sm font-bold">
          <button className="rounded-md bg-[#eaf3ff] px-3 py-2 text-[#1f67d2]" type="button">산업 변화율</button>
        </div>
        <div className="h-48 rounded-md bg-[#f7faff] p-3">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data.industryChanges} layout="vertical" margin={{ bottom: 4, left: 4, right: 24, top: 4 }}>
              <XAxis hide type="number" />
              <YAxis
                axisLine={false}
                dataKey="label"
                tick={{ fill: "#394b63", fontSize: 12, fontWeight: 800 }}
                tickLine={false}
                type="category"
                width={116}
              />
              <Tooltip formatter={(value) => [formatChange(value === null ? null : Number(value)), "변화율"]} />
              <Bar dataKey="changeRate" fill="#2b7fff" minPointSize={4} radius={[0, 8, 8, 0]}>
                <LabelList
                  dataKey="changeRate"
                  formatter={(value) => formatChange(typeof value === "number" ? value : null)}
                  position="right"
                  style={{ fill: "#394b63", fontSize: 12, fontWeight: 800 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 rounded-md bg-[#f7faff] p-3 text-sm font-semibold leading-6 text-[#44566e]">
          {data.industryChangeSummary}
        </p>
      </div>
      <div className="grid gap-3">
        {data.pastSupportPrograms.length === 0 && (
          <div className="rounded-md border border-[#dfe8f5] bg-[#f7faff] p-4 text-sm font-bold text-[#6b7c95]">
            해당 기간에 표시할 지원사업 데이터가 없습니다.
          </div>
        )}
        {data.pastSupportPrograms.map((program, index) => (
          <article className="rounded-md border border-[#cfe0f7] p-4" key={program.programId ?? `${program.year}-${program.title}-${index}`}>
            <h3 className="text-base font-extrabold text-[#123b7a]">[{program.year}] {program.title}</h3>
            <dl className="mt-3 grid gap-1.5 text-sm font-semibold leading-6 text-[#44566e]">
              <div>
                <dt className="font-extrabold text-[#263b59]">목적</dt>
                <dd className="line-clamp-2">{program.purpose}</dd>
              </div>
              <div><dt className="inline font-extrabold text-[#263b59]">분야</dt> <dd className="inline">{program.supportField}</dd></div>
              <div><dt className="inline font-extrabold text-[#263b59]">대상</dt> <dd className="inline">{program.target}</dd></div>
              <div><dt className="inline font-extrabold text-[#263b59]">규모</dt> <dd className="inline">{formatThousandKrw(program.supportAmountThousandKrw)}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <div className="grid gap-3">
        {data.supportedCompanyChanges.length === 0 && (
          <div className="rounded-md border border-[#dfe8f5] bg-[#f7faff] p-4 text-sm font-bold text-[#6b7c95]">
            표시할 지원기업 변화 데이터가 없습니다.
          </div>
        )}
        {data.supportedCompanyChanges.map((company) => (
          <article className="rounded-md border border-[#dfe8f5] p-4" key={company.companyId}>
            <h3 className="text-base font-extrabold text-[#123b7a]">
              기업 #{company.companyId} ({company.supportYear}년 지원)
            </h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#44566e]">
              종사자: {company.employeeBefore ?? "-"}명 → {company.employeeAfter ?? "-"}명
              <span className="ml-2 font-black text-[#ef3748]">
                {company.employeeBefore && company.employeeAfter
                  ? formatChange(Math.round(((company.employeeAfter - company.employeeBefore) / company.employeeBefore) * 1000) / 10)
                  : ""}
              </span>
              <br />
              매출: {formatKrw(company.salesBeforeAmount)} → {formatKrw(company.salesAfterAmount)}
              <br />
              활동 변화: {company.activityChange ?? "-"}
              <br />
              R&D 변화: {company.rndChange ?? "-"}
            </p>
          </article>
        ))}
      </div>
    </div>
  </SectionShell>
);

export default IndustrySupportExplorer;
