import { useEffect, useState } from "react";

type AppAlertPayload = {
  message: string;
  title?: string;
};

const APP_ALERT_EVENT = "app-alert";

export const showAppAlert = (message: string, title = "알림") => {
  window.dispatchEvent(
    new CustomEvent<AppAlertPayload>(APP_ALERT_EVENT, {
      detail: { message, title },
    }),
  );
};

const AppAlertHost = () => {
  const [alertState, setAlertState] = useState<AppAlertPayload | null>(null);

  useEffect(() => {
    const handleAlert = (event: Event) => {
      const { detail } = event as CustomEvent<AppAlertPayload>;

      setAlertState({
        message: detail.message,
        title: detail.title || "알림",
      });
    };

    window.addEventListener(APP_ALERT_EVENT, handleAlert);

    return () => {
      window.removeEventListener(APP_ALERT_EVENT, handleAlert);
    };
  }, []);

  useEffect(() => {
    if (!alertState) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAlertState(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [alertState]);

  if (!alertState) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/35 px-4"
      role="dialog"
    >
      <div className="w-full max-w-[360px] rounded-[8px] border border-[#dce4ef] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.18)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-sm font-black text-[#2b7fff]">
            i
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-[#123b7a]">{alertState.title}</h2>
            <p className="mt-2 break-keep text-sm font-semibold leading-6 text-[#475569]">
              {alertState.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="h-10 min-w-[88px] rounded-[8px] bg-[#0b4d99] px-5 text-sm font-extrabold text-white"
            onClick={() => setAlertState(null)}
            type="button"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppAlertHost;
