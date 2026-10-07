import type { Language } from '../types/i18n.ts';
import type { MusicTrait, PairCompatibility, TraitCompatibility } from './compatibility.ts';

// Editorial reading aids, not statistically validated cut-offs or predictions.
export const CLOSE_PAIR_GAP = 20;
export const SHARED_GENRE_MINIMUM = 60;

export function pairLabels(language: Language) {
  return language === 'ko' ? { host: '초대한 사람', guest: '응답한 사람' }
    : language === 'ja' ? { host: '招待した人', guest: '回答した人' }
      : { host: 'Inviter', guest: 'Respondent' };
}

const SOUND_WORDS: Record<Language, Record<MusicTrait, [string, string]>> = {
  ko: {
    mellow: ['차분함을 곡 선택의 중요한 기준으로 두지는 않는 쪽', '차분한 질감과 소리의 여백을 선호하는 쪽'],
    unpretentious: ['소박함과 친숙함만으로 곡을 고르지는 않는 쪽', '소박하고 편안하게 다가오는 음악을 선호하는 쪽'],
    sophisticated: ['복잡한 구성과 전개를 우선하지는 않는 쪽', '정교한 구성과 예상 밖의 전개를 즐기는 쪽'],
    intense: ['강한 자극보다 절제된 사운드에 가까운 쪽', '밀도 높은 소리와 강한 에너지에 가까운 쪽'],
    contemporary: ['현대적인 비트와 프로덕션을 우선하지는 않는 쪽', '현대적인 비트와 프로덕션을 즐기는 쪽'],
  },
  en: {
    mellow: ['not making calmness a main criterion', 'drawn to calm textures and space'],
    unpretentious: ['not prioritizing simplicity or familiarity', 'drawn to simple, easygoing sounds'],
    sophisticated: ['not prioritizing intricate arrangements', 'drawn to intricate structures and unexpected turns'],
    intense: ['closer to restrained sounds than strong stimulation', 'closer to dense sounds and strong energy'],
    contemporary: ['not prioritizing modern beats and production', 'drawn to modern beats and production'],
  },
  ja: {
    mellow: ['穏やかさを曲選びの最優先にはしない方向', '穏やかな質感や音の余白を好む方向'],
    unpretentious: ['素朴さや親しみやすさだけで曲を選ばない方向', '素朴で親しみやすい音を好む方向'],
    sophisticated: ['複雑な構成を最優先にはしない方向', '精緻な構成や意外な展開を楽しむ方向'],
    intense: ['強い刺激より控えめな音に近い方向', '密度の高い音や強いエネルギーに近い方向'],
    contemporary: ['現代的なビートや制作を最優先にはしない方向', '現代的なビートや制作を楽しむ方向'],
  },
};

export function describePairTrait(trait: TraitCompatibility, language: Language): string {
  const words = SOUND_WORDS[language][trait.key];
  if (trait.difference <= CLOSE_PAIR_GAP) {
    if (trait.host > 35 && trait.host < 65 && trait.guest > 35 && trait.guest < 65) return language === 'ko'
      ? '두 사람 모두 중간에 가까운 응답이에요. 특정 방향이 뚜렷하다기보다, 곡이나 듣는 상황에 따라 달라질 여지가 있어요.'
      : language === 'ja' ? '二人とも中間に近い回答です。方向が強く決まっているというより、曲や聴く場面で変わる余地があります。'
        : 'Both answers sit near the middle. A clear direction is not established; the track or listening setting may matter.';
    const bothLow = trait.host <= 35 && trait.guest <= 35;
    const bothHigh = trait.host >= 65 && trait.guest >= 65;
    if (!bothLow && !bothHigh) return language === 'ko'
      ? '두 점수는 가깝지만, 두 사람 모두 높거나 낮은 응답은 아니에요. 각자의 수치와 함께 읽어주세요.'
      : language === 'ja' ? 'スコアは近いですが、二人とも高め、または低めの回答ではありません。それぞれの数値も確認してみましょう。'
        : 'The scores are close, but they are not both high or both low. Read them alongside each person’s values.';
    const direction = words[bothHigh ? 1 : 0];
    return language === 'ko' ? `두 사람 모두 ${direction}으로 닮았어요.`
      : language === 'ja' ? `二人とも${direction}で似ています。`
        : `Both profiles are ${direction}.`;
  }
  const labels = pairLabels(language);
  const higher = trait.host > trait.guest ? labels.host : labels.guest;
  const lower = trait.host > trait.guest ? labels.guest : labels.host;
  return language === 'ko' ? `${higher}이 ${trait.label}을 더 선호한다고 답했어요. ${lower}의 낮은 점수는 반대 음악을 반드시 좋아한다는 뜻은 아닙니다.`
    : language === 'ja' ? `${higher}の方が${trait.label}を好むと回答しています。${lower}の低いスコアは、反対の音楽が必ず好きという意味ではありません。`
      : `${higher} reported a stronger preference for ${trait.label}. The lower score for ${lower} does not necessarily mean a preference for its opposite.`;
}

const LISTENING_ADVICE: Record<Language, Record<MusicTrait, string>> = {
  ko: {
    mellow: '차분한 곡과 소리가 풍성한 곡을 번갈아 들어보고, 편안하게 느껴지는 질감을 찾아보세요.',
    unpretentious: '익숙하고 편안한 곡부터 시작해, 조금 낯선 음색의 곡을 한 곡씩 교환해보세요.',
    sophisticated: '멜로디가 친숙하면서도 후반부 편곡이 달라지는 곡을 들어보고, 좋아한 구간을 이야기해보세요.',
    intense: '절제된 구간에서 시작해 에너지가 커지는 곡을 들어보세요. 어느 구간이 더 좋은지 서로 물어보세요.',
    contemporary: '서로 다른 시대의 곡에서 비슷한 리듬이나 음색을 찾아보세요. 발표 연도보다 소리 자체를 비교해보세요.',
  },
  en: {
    mellow: 'Alternate a calm track and a fuller-sounding one, then compare which textures feel comfortable.',
    unpretentious: 'Begin with something familiar and easygoing, then trade a track with an unfamiliar texture.',
    sophisticated: 'Try a familiar melody with an arrangement that changes later, and talk about the passage each of you enjoyed.',
    intense: 'Try a track that grows from restraint into energy, and ask each other which passage you preferred.',
    contemporary: 'Find similar rhythms or textures in tracks from different eras. Compare the sounds, not just release dates.',
  },
  ja: {
    mellow: '穏やかな曲と音の豊かな曲を交互に聴き、心地よい質感を比べてみましょう。',
    unpretentious: '親しみやすい曲から始めて、少しなじみのない音色の曲を一曲ずつ交換してみましょう。',
    sophisticated: '親しみやすい旋律に後半の編曲の変化がある曲を聴き、好きだった部分を話してみましょう。',
    intense: '控えめな始まりからエネルギーが増す曲を聴き、どの部分が好きか聞いてみましょう。',
    contemporary: '違う時代の曲から似たリズムや音色を探し、発表年より音そのものを比べてみましょう。',
  },
};

export function buildPairNarrative(pair: PairCompatibility, language: Language) {
  const closest = pair.traits.filter(trait => trait.difference === pair.strongest.difference);
  const contrasts = pair.traits.filter(trait => trait.difference === pair.biggestDifference.difference);
  const identical = pair.traits.every(trait => trait.difference === 0);
  const close = pair.traits.filter(trait => trait.difference <= CLOSE_PAIR_GAP);
  const compact = (items: TraitCompatibility[]) => items.map(trait => trait.label).join(' · ');
  const note = (trait: TraitCompatibility) => describePairTrait(trait, language);
  const ko = language === 'ko';
  const ja = language === 'ja';
  const sharedTitle = identical ? (ko ? '다섯 취향 모두 일치' : ja ? '五つの好みがすべて一致' : 'All five scores align')
    : close.length === 0 ? (ko ? '가까운 축은 아직 없어요' : ja ? '近い軸はまだありません' : 'No close axis yet')
      : compact(closest);
  const sharedText = identical
    ? (ko ? '다섯 점수는 같지만 실제로 좋아하는 곡까지 같다는 뜻은 아니에요. 서로의 한 곡을 교환해 확인해보세요.'
      : ja ? '五つのスコアが同じでも、好きな曲まで同じとは限りません。一曲ずつ交換してみましょう。'
        : 'Matching scores do not mean identical favorite tracks. Trade one song each to find out.')
    : close.length === 0
      ? (ko ? '모든 축에서 20점보다 큰 차이가 있어요. 공통 취향을 단정하기보다 서로 소개하는 음악에서 시작해보세요.'
        : ja ? 'すべての軸で20点を超える差があります。共通の好みを決めつけず、一曲ずつ紹介するところから始めましょう。'
          : 'Every axis differs by more than 20 points. Start by introducing music rather than assuming common ground.')
      : closest.length > 1
        ? (ko ? '여러 축이 같은 정도로 닮았어요. 아래 비교표에서 높은 쪽·낮은 쪽·중간 응답을 함께 확인해보세요.'
          : ja ? '複数の軸が同じ程度に似ています。比較表で高め・低め・中間の回答も確認してみましょう。'
            : 'Several axes are equally close. Check the rows below to see whether those answers are high, low, or near the middle.')
        : note(closest[0]);
  const contrastTitle = identical ? (ko ? '점수 차이가 없어요' : ja ? 'スコアに差はありません' : 'No score differences') : compact(contrasts);
  const contrastText = identical
    ? (ko ? '같은 점수라도 좋아하는 아티스트나 곡은 다를 수 있어요. 아래 소개곡을 들으며 각자의 취향을 이야기해보세요.'
      : ja ? '同じスコアでも、好きなアーティストや曲は違うことがあります。紹介曲を聴きながら、それぞれの好みを話してみましょう。'
        : 'Even with matching scores, favorite artists and tracks can differ. Use the introduction tracks below to talk about your tastes.')
    : contrasts.length > 1
    ? (ko ? '여러 축의 차이가 같은 크기예요. 하나만 다른 취향으로 단정하지 않고 각 축을 나란히 살펴보세요.'
      : ja ? '複数の軸の差が同じ大きさです。一つだけを違いと決めず、各軸を並べて見てみましょう。'
        : 'Several axes share the largest gap. Read them side by side rather than singling out one difference.')
    : note(contrasts[0]);
  const advice = identical
    ? (ko ? '각자 가장 좋아하는 곡 하나와 처음 듣는 곡 하나를 고르고, 먼저 귀에 들어온 소리를 이야기해보세요.'
      : ja ? '好きな曲と初めて聴く曲をそれぞれ選び、最初に耳に届いた音を話してみましょう。'
        : 'Pick a favorite and an unfamiliar track each, then talk about the sound that caught your ear first.')
    : contrasts.length > 1
      ? (ko ? '각자 한 곡씩 번갈아 소개하고, 목소리·리듬·음색 중 좋았던 부분을 하나씩 골라보세요.'
        : ja ? '一曲ずつ交互に紹介し、声・リズム・音色の好きだった部分を一つずつ選んでみましょう。'
          : 'Take turns introducing a track and pick one voice, rhythm, or texture each of you enjoyed.')
      : LISTENING_ADVICE[language][contrasts[0].key];
  return {
    identical, hasCommonGround: close.length > 0, closest, contrasts, sharedTitle, sharedText, contrastTitle, contrastText, advice,
    summary: `${sharedText} ${identical ? '' : contrastText === sharedText ? '' : contrasts.length === 1 ? contrastText : ''}`.trim(),
    shareLine: identical ? sharedTitle : close.length === 0 ? sharedTitle
      : (ko ? `가장 닮은 소리 · ${closest.slice(0, 2).map(trait => trait.label).join(' · ')}`
        : ja ? `似ている音 · ${closest.slice(0, 2).map(trait => trait.label).join(' · ')}`
          : `Closest sounds · ${closest.slice(0, 2).map(trait => trait.label).join(' · ')}`),
    traitNotes: Object.fromEntries(pair.traits.map(trait => [trait.key, note(trait)])) as Record<MusicTrait, string>,
  };
}

export function pairTrackReason(role: 'shared' | 'host' | 'guest', hostMatch: number, guestMatch: number, language: Language) {
  const shared = Math.min(hostMatch, guestMatch) >= SHARED_GENRE_MINIMUM;
  if (role === 'shared') return language === 'ko'
    ? shared ? '두 사람 각각의 장르 유사도를 비교해, 낮은 쪽도 비교적 가까운 장르의 입문곡을 골랐어요.' : '두 사람 모두에게 가까운 장르가 없어, 각자의 거리 중 큰 쪽을 줄이는 장르에서 발견곡을 골랐어요. 공통 취향이라는 뜻은 아니에요.'
    : language === 'ja'
      ? shared ? '二人それぞれの近さを比べ、低い方も比較的近いジャンルの入口の曲を選びました。' : '二人に近いジャンルがないため、遠い方の距離を抑えるジャンルから選びました。共通の好みという意味ではありません。'
      : shared ? 'We compared both profiles and chose an entry track from a genre with a relatively close weaker match.' : 'No genre is close to both profiles. This discovery reduces the larger of the two genre distances; it is not established common taste.';
  const person = pairLabels(language)[role];
  return language === 'ko' ? `${person}의 개인 추천 순위에서 고른 소개곡이에요. 다른 사람도 좋아할 것이라는 예측은 아니에요.`
    : language === 'ja' ? `${person}の個人おすすめ順から選んだ紹介曲です。もう一人も好きという予測ではありません。`
      : `An introduction picked from the personal genre ranking for ${person}. It does not predict the other listener will enjoy it.`;
}
