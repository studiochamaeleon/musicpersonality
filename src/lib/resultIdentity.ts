import type { Language } from '@/types/i18n';

// A short description of the sound, not a claim about an individual track.
// Each phrase is written to fit "…을 사랑하는", "Drawn to …", and "…を愛する".
export const GENRE_SOUNDS: Record<string, Record<Language, string>> = {
  jazz_cool: { ko: '차분한 여백과 섬세한 화성의 음악', en: 'music with space and subtle harmonies', ja: '静かな余白と繊細な和声の音楽' },
  jazz_bebop: { ko: '빠른 즉흥과 대담한 리듬의 음악', en: 'music of quick improvisation and bold rhythms', ja: '素早い即興と大胆なリズムの音楽' },
  rock_alternative: { ko: '거친 질감과 새로운 시도의 음악', en: 'music with raw edges and unexpected turns', ja: '荒削りな質感と新しい試みの音楽' },
  rock_indie: { ko: '자유로운 표현과 개성 있는 기타의 음악', en: 'music with free expression and distinctive guitars', ja: '自由な表現と個性的なギターの音楽' },
  electronic_ambient: { ko: '소리의 여백과 넓은 풍경을 담은 음악', en: 'music built from space and expansive soundscapes', ja: '音の余白と広がる風景を感じる音楽' },
  electronic_house: { ko: '몸을 움직이게 하는 따뜻한 비트의 음악', en: 'music with warm beats that move you', ja: '体が動き出す温かなビートの音楽' },
  classical_baroque: { ko: '정교한 질서와 화려한 선율의 음악', en: 'music of intricate order and ornate melodies', ja: '精緻な秩序と華やかな旋律の音楽' },
  classical_minimalism: { ko: '섬세한 반복 속에서 평온을 찾는 음악', en: 'music that finds calm in subtle repetition', ja: '繊細な反復の中に静けさを見つける音楽' },
  pop_indie: { ko: '일상의 감정을 반짝이게 하는 음악', en: 'music that makes everyday feelings glow', ja: '日常の感情をきらめかせる音楽' },
  pop_dream: { ko: '꿈결처럼 흐르는 몽환적인 음악', en: 'music that drifts like a dream', ja: '夢のように漂う幻想的な音楽' },
  rock_classic: { ko: '시대를 넘어 울리는 기타와 멜로디의 음악', en: 'music with timeless guitars and melodies', ja: '時代を超えて響くギターとメロディーの音楽' },
  electronic_techno: { ko: '끝없이 몰입하게 하는 반복 비트의 음악', en: 'music driven by immersive, repeating beats', ja: '没入感を生む反復するビートの音楽' },
  jazz_fusion: { ko: '재즈와 다양한 소리가 만나는 음악', en: 'music where jazz meets unexpected sounds', ja: 'ジャズと多彩な音が出会う音楽' },
  classical_romantic: { ko: '감정의 폭을 넓히는 극적인 선율의 음악', en: 'music with sweeping, expressive melodies', ja: '感情を大きく揺らすドラマチックな旋律の音楽' },
  pop_kpop: { ko: '다채로운 에너지와 완성도 높은 퍼포먼스의 음악', en: 'music with vibrant energy and polished performances', ja: '多彩なエネルギーと磨かれたパフォーマンスの音楽' },
  jazz_smooth: { ko: '부드러운 그루브와 편안한 선율의 음악', en: 'music with smooth grooves and easy melodies', ja: 'なめらかなグルーヴと心地よい旋律の音楽' },
  rock_progressive: { ko: '예상 밖의 전개와 치밀한 구성의 음악', en: 'music with intricate structures and surprising turns', ja: '意外な展開と緻密な構成の音楽' },
  electronic_chillout: { ko: '느긋한 리듬으로 숨을 고르게 하는 음악', en: 'music that slows the pace and lets you breathe', ja: 'ゆるやかなリズムでひと息つける音楽' },
  pop_mainstream: { ko: '함께 따라 부르고 싶은 밝은 멜로디의 음악', en: 'music with bright melodies made to sing along', ja: '一緒に口ずさみたくなる明るいメロディーの音楽' },
  classical_contemporary: { ko: '익숙한 형식을 벗어나 질문을 던지는 음악', en: 'music that questions familiar forms', ja: '慣れた形式を越えて問いかける音楽' },
  hiphop_oldschool: { ko: '솔직한 이야기와 선명한 비트의 음악', en: 'music with honest stories and unmistakable beats', ja: '率直な物語とはっきりしたビートの音楽' },
  hiphop_trap: { ko: '무거운 저음과 날카로운 리듬의 음악', en: 'music with heavy bass and sharp rhythms', ja: '重い低音と鋭いリズムの音楽' },
  rnb_classic: { ko: '진심 어린 목소리와 따뜻한 그루브의 음악', en: 'music with heartfelt voices and warm grooves', ja: '心のこもった歌声と温かなグルーヴの音楽' },
  rnb_neosoul: { ko: '깊은 그루브와 내밀한 감정의 음악', en: 'music with deep grooves and intimate feeling', ja: '深いグルーヴと内面の感情が響く音楽' },
  world_latin: { ko: '춤추듯 살아 움직이는 리듬의 음악', en: 'music alive with dance and rhythm', ja: '踊るように躍動するリズムの音楽' },
  world_traditional: { ko: '오래된 이야기와 문화의 숨결을 담은 음악', en: 'music carrying stories and traditions across generations', ja: '受け継がれた物語と文化の息吹を感じる音楽' },
  rock_metal: { ko: '거센 에너지와 강렬한 연주의 음악', en: 'music with fierce energy and powerful playing', ja: '激しいエネルギーと力強い演奏の音楽' },
  rock_punk: { ko: '솔직한 외침과 멈추지 않는 속도의 음악', en: 'music with defiant shouts and unstoppable speed', ja: '率直な叫びと止まらない疾走感の音楽' },
  electronic_dnb: { ko: '빠른 브레이크비트와 정교한 리듬의 음악', en: 'music with fast breakbeats and intricate rhythms', ja: '速いブレイクビーツと緻密なリズムの音楽' },
  electronic_dubstep: { ko: '묵직한 베이스와 극적인 전환의 음악', en: 'music with heavy bass and dramatic drops', ja: '重いベースと劇的な展開の音楽' },
  pop_synthpop: { ko: '빛나는 신시사이저와 선명한 멜로디의 음악', en: 'music with glowing synths and vivid melodies', ja: 'きらめくシンセと鮮やかなメロディーの音楽' },
  pop_folk: { ko: '따뜻한 목소리와 소박한 이야기의 음악', en: 'music with warm voices and honest stories', ja: '温かな歌声と素朴な物語の音楽' },
};

export function getGenreSound(genreId: string, language: Language): string {
  return GENRE_SOUNDS[genreId]?.[language] ?? (language === 'ko' ? '새로운 감각을 깨우는 음악' : language === 'ja' ? '新しい感覚に出会える音楽' : 'music that opens a new world');
}

export function getResultIdentityCopy(language: Language) {
  if (language === 'ko') return { opening: '당신은', quoteOpen: '“', quoteClose: '”', ending: '입니다.', affinity: '을 사랑하는' };
  if (language === 'ja') return { opening: 'あなたは', quoteOpen: '「', quoteClose: '」', ending: 'です。', affinity: 'を愛する' };
  return { opening: 'Your sound is', quoteOpen: '“', quoteClose: '”', ending: '', affinity: 'Drawn to' };
}
