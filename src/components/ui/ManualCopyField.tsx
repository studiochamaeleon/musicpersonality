'use client';

import { useId, useRef } from 'react';
import { Copy } from 'lucide-react';

interface ManualCopyFieldProps {
  value: string;
  label: string;
  selectLabel: string;
  hint: string;
  multiline?: boolean;
  testId?: string;
}

/** A permission-free recovery path; selecting text never sends or copies it. */
export default function ManualCopyField({ value, label, selectLabel, hint, multiline = false, testId }: ManualCopyFieldProps) {
  const id = useId();
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const selectAll = () => {
    const field = fieldRef.current;
    if (!field) return;
    // Safari may override selection on an input tap. Use a separate user action.
    field.focus({ preventScroll: true });
    field.select();
    field.setSelectionRange(0, field.value.length);
  };
  const fieldProps = {
    id,
    value,
    readOnly: true,
    spellCheck: false,
    'data-testid': testId,
    'aria-describedby': `${id}-hint`,
    className: 'mt-3 min-h-11 w-full min-w-0 rounded-xl border border-white/15 bg-black/20 px-3 py-3 text-base leading-6 text-white sm:text-sm',
  };
  return <div className="mt-4 rounded-2xl border border-white/15 bg-white/[.04] p-4">
    <label htmlFor={id} className="block text-xs font-semibold text-white/85">{label}</label>
    {multiline
      ? <textarea {...fieldProps} ref={field => { fieldRef.current = field; }} rows={8} className={`${fieldProps.className} max-h-72 resize-y`} />
      : <input {...fieldProps} ref={field => { fieldRef.current = field; }} type="text" autoCapitalize="off" />}
    <button type="button" aria-controls={id} onClick={selectAll} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold leading-5 hover:bg-white/10"><Copy size={16} className="shrink-0" />{selectLabel}</button>
    <p id={`${id}-hint`} className="mt-3 text-xs leading-5 text-white/65">{hint}</p>
  </div>;
}
