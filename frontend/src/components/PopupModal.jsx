import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function PopupModal({
  open,
  onClose,
  children,
  containerClassName = "",
  panelClassName = "",
  mobileSheet = true,
}) {
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const layoutClass = mobileSheet
    ? "absolute inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center lg:p-6"
    : "absolute inset-0 flex items-center justify-center p-4 sm:p-6";

  const defaultPanelClass = mobileSheet
    ? "w-full bg-white rounded-t-3xl lg:rounded-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] lg:pb-8 max-h-[86vh] overflow-y-auto shadow-2xl shadow-slate-900/20 animate-modal-sheet lg:animate-modal-pop"
    : "w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl shadow-slate-900/20 animate-modal-pop";

  return createPortal(
    <div
      className={`fixed inset-0 z-[80] ${containerClassName}`}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-modal-backdrop"
        onClick={onClose}
      />

      <div className={layoutClass}>
        <div className={`${defaultPanelClass} ${panelClassName}`.trim()}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
