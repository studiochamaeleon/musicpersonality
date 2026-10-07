'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { feedbackCopy, formatResultFeedback, type FeedbackRating, type ResultFeedbackContext } from '@/lib/resultFeedback';
import ManualCopyField from '@/components/ui/ManualCopyField';

export default function ResultFeedback({ context }: { context: ResultFeedbackContext }) {
  const { language } = useLanguage();
  const id = useId();
  const [ratings, setRatings] = useState<FeedbackRating[]>(['', '', '']);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [manualCopy, setManualCopy] = useState(false);
  const [copying, setCopying] = useState(false);
  const copyingRef = useRef(false);
  const feedbackRevision = useRef(0);
  const previewRef = useRef<HTMLDetailsElement>(null);
  const copy = feedbackCopy(language, context.kind);
  const report = formatResultFeedback(context, ratings, comment, language);
  const hasFeedback = ratings.some(Boolean) || comment.trim().length > 0;
  useEffect(() => {
    // A track or language can also change the report while a copy is pending.
    feedbackRevision.current += 1;
  }, [report]);
  const copyingLabel = language === 'ko' ? '복사 중…' : language === 'ja' ? 'コピー中…' : 'Copying…';
  const clearCopyStatus = () => {
    feedbackRevision.current += 1;
    setStatus('');
  };
  const recoveryCopy = language === 'ko'
    ? { label: '직접 복사할 피드백', select: '피드백 전체 선택', hint: '전체 선택 버튼을 누른 뒤 기기의 복사 메뉴를 이용해 주세요. 선택만으로 저장하거나 전송하지 않아요.', failed: '복사하지 못했어요. 펼쳐진 미리보기에서 전체 선택한 뒤 직접 복사해 주세요.' }
    : language === 'ja'
      ? { label: '手動コピー用の感想', select: '感想をすべて選択', hint: '全選択ボタンを押してから、端末のコピー機能を使ってください。選択だけでは保存や送信はしません。', failed: 'コピーできませんでした。開いたプレビューで全選択してコピーしてください。' }
      : { label: 'Feedback for manual copying', select: 'Select all feedback', hint: 'Use the select button, then your device’s Copy option. Selecting text never saves or sends it.', failed: 'Could not copy. Select the whole report in the opened preview and copy it manually.' };
  const copyFeedback = async () => {
    if (copyingRef.current || !hasFeedback) return;
    copyingRef.current = true;
    setCopying(true);
    const revision = feedbackRevision.current;
    setStatus('');
    try {
      await navigator.clipboard.writeText(report);
      if (revision === feedbackRevision.current) {
        setManualCopy(false);
        setStatus(copy.copied);
      }
    }
    catch {
      if (revision === feedbackRevision.current) {
        setManualCopy(true);
        if (previewRef.current) previewRef.current.open = true;
        setStatus(recoveryCopy.failed);
      }
    } finally {
      copyingRef.current = false;
      setCopying(false);
    }
  };
  return <details data-testid="result-feedback" className="ui-panel group mx-auto mt-10 max-w-xl p-5 text-left sm:p-6">
    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-sm font-semibold text-white/85"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5"><MessageCircle size={17} /></span><span className="flex-1">{copy.title}</span><ChevronDown aria-hidden="true" size={17} className="shrink-0 text-white/60 transition-transform group-open:rotate-180" /></summary>
    <p className="mt-3 text-sm leading-6 text-white/65">{copy.intro}</p>
    <div className="mt-5 space-y-5">{copy.categories.map((label, index) => <div key={index}><label htmlFor={`${id}-${index}`} className="mb-2 block text-xs font-semibold text-white/80">{label}</label><select id={`${id}-${index}`} value={ratings[index]} onChange={event => { setRatings(current => current.map((rating, position) => position === index ? event.target.value as FeedbackRating : rating)); clearCopyStatus(); }} className="min-h-12 w-full rounded-xl border border-white/20 bg-[#16181e] px-3 text-base text-white sm:text-sm"><option value="">{copy.placeholder}</option>{Object.entries(copy.ratings).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></div>)}</div>
    <label htmlFor={`${id}-comment`} className="mb-2 mt-5 block text-xs leading-5 text-white/75">{copy.note}</label>
    <textarea id={`${id}-comment`} maxLength={500} value={comment} onChange={event => { setComment(event.target.value); clearCopyStatus(); }} rows={3} className="w-full resize-y rounded-xl border border-white/20 bg-[#16181e] p-3 text-base leading-6 text-white sm:text-sm" />
    <p className="mt-2 text-xs leading-5 text-white/55">{copy.privacy}</p>
    <details ref={previewRef} data-testid="feedback-preview-panel" className="mt-4"><summary className="cursor-pointer py-2 text-xs text-white/70">{copy.preview}</summary>{manualCopy ? <ManualCopyField value={report} label={recoveryCopy.label} selectLabel={recoveryCopy.select} hint={recoveryCopy.hint} multiline testId="feedback-manual-report" /> : <pre data-testid="feedback-preview" className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-6 text-white/65">{report}</pre>}</details>
    <button type="button" onClick={() => void copyFeedback()} disabled={!hasFeedback || copying} aria-busy={copying} className="secondary-action mt-4 !min-h-11 !w-full">{copying ? copyingLabel : copy.copy}</button>
    <p role="status" aria-live="polite" className="mt-3 min-h-6 text-xs leading-5 text-white/75">{status}</p>
  </details>;
}
