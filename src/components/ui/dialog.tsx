'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
/** Native dialog provides focus containment, Escape handling and focus return. */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    if (!open && ref.current?.open) ref.current?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby="dialog-title"
      className="dialog"
    >
      <div className="dialog__heading">
        <h2 id="dialog-title">{title}</h2>
        <Button variant="ghost" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
