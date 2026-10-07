import type { Language } from '../types/i18n.ts';

export type FeedbackRating = '' | 'fits' | 'unsure' | 'misses';
export interface ResultFeedbackContext {
  kind: 'personal' | 'pair';
  genres: string[];
  versions: number[];
  tracks: string[];
}
export function feedbackCopy(language: Language, kind: ResultFeedbackContext['kind']) {
  return language === 'ko'
    ? { title: '결과가 어땠나요?', intro: '어긋난 부분을 알려주시면 질문과 추천을 다듬는 데 도움이 돼요.', categories: kind === 'personal' ? ['음악 장르', '음악 캐릭터 설명', '추천곡'] : ['점수 설명의 이해도', '공통점·차이점 설명', '함께 들을 추천곡'], ratings: { fits: '잘 맞아요', unsure: '애매해요', misses: '잘 안 맞아요' }, placeholder: '선택하세요', note: '구체적인 곡이나 헷갈린 질문이 있다면 적어주세요 (선택)', copy: '피드백 내용 복사', copied: '복사했어요. 원하시는 경로로 전달해 주세요.', failed: '복사하지 못했어요. 아래 내용을 직접 복사해 주세요.', privacy: '자동 전송하거나 저장하지 않아요. 이름·연락처 등 개인정보는 적지 말아주세요.', preview: '전달할 내용 미리보기', report: 'MUTI 검사 피드백', genre: '결과 장르', version: '결과 버전', track: '표시된 추천곡', comment: '추가 의견' }
    : language === 'ja'
      ? { title: '結果はどうでしたか？', intro: '合わなかった点がわかると、設問やおすすめを見直す手がかりになります。', categories: kind === 'personal' ? ['音楽ジャンル', '音楽キャラクターの説明', 'おすすめ曲'] : ['スコア説明のわかりやすさ', '共通点・違いの説明', '一緒に聴くおすすめ曲'], ratings: { fits: 'よく合っている', unsure: '判断しにくい', misses: 'あまり合っていない' }, placeholder: '選んでください', note: '具体的な曲や迷った設問があれば教えてください（任意）', copy: '感想をコピー', copied: 'コピーしました。好きな方法でお送りください。', failed: 'コピーできませんでした。下の内容を直接コピーしてください。', privacy: '自動送信や保存はしません。氏名・連絡先などの個人情報は書かないでください。', preview: '送る内容を確認', report: 'MUTIの感想', genre: '結果ジャンル', version: '結果バージョン', track: '表示されたおすすめ曲', comment: '自由コメント' }
      : { title: 'How did your result feel?', intro: 'Specific mismatches help us review the questions and recommendations.', categories: kind === 'personal' ? ['Music genre', 'Music character description', 'Recommended tracks'] : ['Clarity of the score explanation', 'Common ground and contrasts', 'Tracks to try together'], ratings: { fits: 'Fits well', unsure: 'Unsure', misses: 'Does not fit' }, placeholder: 'Choose an answer', note: 'Mention a specific track or a confusing question (optional)', copy: 'Copy feedback', copied: 'Copied. Send it through your preferred channel.', failed: 'Could not copy. Please copy the preview below manually.', privacy: 'Nothing is sent or saved automatically. Do not include names, contact details, or other personal information.', preview: 'Preview what you will send', report: 'MUTI feedback', genre: 'Result genres', version: 'Result versions', track: 'Displayed tracks', comment: 'Additional comments' };
}

export function formatResultFeedback(context: ResultFeedbackContext, ratings: FeedbackRating[], comment: string, language: Language) {
  const copy = feedbackCopy(language, context.kind);
  return [copy.report, `Language: ${language}`, `${copy.genre}: ${context.genres.join(' × ')}`, `${copy.version}: ${context.versions.join(' / ')}`,
    ...copy.categories.flatMap((label, index) => ratings[index] && ratings[index] in copy.ratings ? [`${label}: ${copy.ratings[ratings[index] as Exclude<FeedbackRating, ''>]}`] : []),
    `${copy.track}:\n${context.tracks.map(track => `- ${track}`).join('\n')}`,
    ...(comment.trim() ? [`${copy.comment}: ${comment.trim().slice(0, 500)}`] : []),
  ].join('\n');
}
