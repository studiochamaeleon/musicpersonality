'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Language } from '@/types/i18n';
import ManualCopyField from '@/components/ui/ManualCopyField';

export default function HistorySaveNotice({ language, resultUrl }: { language: Language; resultUrl: string }) {
  const [showLink, setShowLink] = useState(false);
  const copy = language === 'ko'
    ? { title: '이번 결과를 이 브라우저에 저장하지 못했어요.', body: '검사 결과는 그대로 볼 수 있어요. 나중에도 다시 보려면 결과 링크를 따로 보관해 주세요.', action: '보관할 결과 링크 보기', label: '나의 결과 링크', select: '링크 전체 선택', hint: '선택한 링크를 직접 복사해 메모 등에 보관해 주세요. 링크에는 취향 점수가 포함되므로 원치 않는 상대에게 보내지 마세요.' }
    : language === 'ja'
      ? { title: '今回の結果をこのブラウザーに保存できませんでした。', body: '結果はそのまま見られます。あとで開くには、結果のリンクを別に保存してください。', action: '保存する結果リンクを見る', label: '私の結果リンク', select: 'リンクをすべて選択', hint: '選択したリンクを自分でコピーして、メモなどに保存してください。リンクには好みのスコアが含まれるため、見せたくない相手には送らないでください。' }
      : { title: 'This result could not be saved in this browser.', body: 'You can still view your result. Keep its link somewhere safe if you want to open it later.', action: 'Show my result link', label: 'My result link', select: 'Select the whole link', hint: 'Copy the selected link yourself and keep it in a note. It contains taste scores, so do not send it to someone you do not want to see them.' };
  return <aside data-testid="history-save-notice" className="border-b border-white/15 bg-[#07080a] px-5 py-5 text-white sm:px-8">
    <div className="mx-auto max-w-4xl">
      <div role="status" className="flex min-w-0 items-start gap-3">
        <AlertCircle size={19} className="mt-0.5 shrink-0 text-[#e9ddba]" aria-hidden="true" />
        <div className="min-w-0"><p className="text-sm font-semibold leading-6">{copy.title}</p><p className="mt-1 text-xs leading-5 text-white/70">{copy.body}</p></div>
      </div>
      <button type="button" onClick={() => setShowLink(value => !value)} aria-expanded={showLink} className="mt-3 inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold leading-5 hover:bg-white/10">{copy.action}</button>
      {showLink && <ManualCopyField value={resultUrl} label={copy.label} selectLabel={copy.select} hint={copy.hint} testId="unsaved-result-link" />}
    </div>
  </aside>;
}
