import type { SupportProgramPeriod, SupportProgramSaveRequest } from "../types";

type SupportProgramRegisterModalProps = {
  draft: SupportProgramSaveRequest;
  isSaving: boolean;
  onCancel: () => void;
  onChange: <Key extends keyof SupportProgramSaveRequest>(
    key: Key,
    value: SupportProgramSaveRequest[Key],
  ) => void;
  onPeriodChange: (key: keyof SupportProgramPeriod, value: string) => void;
  onSubmit: () => void;
};

const inputClassName =
  "mt-2 h-10 w-full rounded-[5px] border border-[#eee] bg-white px-4 text-base text-[#333] outline-none focus:border-[#51a2ff]";
const labelClassName = "text-sm text-[#444]";
const requiredMark = <span className="text-[#e7000b]"> *</span>;

const compactDateToInputValue = (value: string | null) => {
  if (!value) {
    return "";
  }

  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }

  return value.slice(0, 10);
};

const inputValueToCompactDate = (value: string) => value.replaceAll("-", "");

const SupportProgramRegisterModal = ({
  draft,
  isSaving,
  onCancel,
  onChange,
  onPeriodChange,
  onSubmit,
}: SupportProgramRegisterModalProps) => {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[70px] z-40 overflow-y-auto bg-black/30 py-12">
      <div className="mx-auto w-[708px] rounded-[10px] bg-white px-[50px] py-[45px]">
        <h2 className="text-2xl font-medium text-[#333]">BTP 지원사업 공고 등록</h2>

        <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5">
          <label className={labelClassName}>
            지원사업 코드{requiredMark}
            <input
              className={inputClassName}
              onChange={(event) => onChange("code", event.target.value)}
              placeholder="직접 코드를 입력해주세요"
              required
              value={draft.code}
            />
          </label>
          <label className={labelClassName}>
            사업 연도{requiredMark}
            <input
              className={inputClassName}
              onChange={(event) =>
                onChange("programYear", event.target.value ? Number(event.target.value) : "")
              }
              required
              type="number"
              value={draft.programYear}
            />
          </label>
          <label className={`${labelClassName} col-span-2`}>
            지원사업명{requiredMark}
            <input
              className={inputClassName}
              onChange={(event) => onChange("budgetProgramName", event.target.value)}
              required
              value={draft.budgetProgramName}
            />
          </label>
          <label className={labelClassName}>
            사업구분
            <input
              className={inputClassName}
              onChange={(event) => onChange("programCategory", event.target.value)}
              value={draft.programCategory}
            />
          </label>
          <label className={labelClassName}>
            지원구분
            <input
              className={inputClassName}
              onChange={(event) => onChange("supportType", event.target.value)}
              value={draft.supportType}
            />
          </label>
          <label className={labelClassName}>
            사업 시작일
            <input
              className={inputClassName}
              onChange={(event) =>
                onPeriodChange("startDate", inputValueToCompactDate(event.target.value))
              }
              type="date"
              value={compactDateToInputValue(draft.period.startDate)}
            />
          </label>
          <label className={labelClassName}>
            사업 종료일
            <input
              className={inputClassName}
              onChange={(event) =>
                onPeriodChange("endDate", inputValueToCompactDate(event.target.value))
              }
              type="date"
              value={compactDateToInputValue(draft.period.endDate)}
            />
          </label>
          <label className={labelClassName}>
            부처명
            <input
              className={inputClassName}
              onChange={(event) => onChange("departmentName", event.target.value)}
              value={draft.departmentName}
            />
          </label>
          <label className={labelClassName}>
            지역
            <input
              className={inputClassName}
              onChange={(event) => onChange("localGovernmentName", event.target.value)}
              value={draft.localGovernmentName}
            />
          </label>
          <label className={`${labelClassName} col-span-2`}>
            사업 요약
            <textarea
              className="mt-2 h-[100px] w-full resize-none rounded-[5px] border border-[#eee] bg-white px-4 py-3 text-base text-[#333] outline-none focus:border-[#51a2ff]"
              onChange={(event) => onChange("programSummary", event.target.value)}
              value={draft.programSummary}
            />
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-2.5">
          <button
            className="flex h-10 w-20 items-center justify-center rounded-[20px] border border-[#2b7fff] bg-white text-base font-medium text-[#2b7fff]"
            disabled={isSaving}
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="flex h-10 w-20 items-center justify-center rounded-[20px] bg-[#2b7fff] text-base font-medium text-white disabled:opacity-60"
            disabled={isSaving}
            onClick={onSubmit}
            type="button"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportProgramRegisterModal;
