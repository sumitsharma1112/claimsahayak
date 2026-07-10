"use client";

import { useEffect, useRef } from "react";

/**
 * Accessible confirm/cancel dialog built on the native `<dialog>` element:
 * `showModal()` gives us top-layer stacking, focus trapping, and Escape-to-
 * cancel for free, with no custom ARIA or focus-management code needed.
 * Presentation only — the title/body/labels are supplied by the caller.
 */
export function ConfirmDialog({
  open,
  titleId,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  readonly open: boolean;
  readonly titleId: string;
  readonly title: string;
  readonly body: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="rounded-card border border-ink-soft/20 bg-paper p-s5 shadow-card backdrop:bg-ink/40"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClose={onCancel}
    >
      <h2 id={titleId} className="m-0 font-display text-question font-semibold text-ink">
        {title}
      </h2>
      <p className="mb-0 mt-s3 text-ink-soft">{body}</p>
      <div className="mt-s5 flex gap-s3">
        <button type="button" className="cs-btn-secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="cs-btn-primary" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
