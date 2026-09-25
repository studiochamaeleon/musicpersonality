import type { PersonalityAnalysisReport } from '@/types';

interface JapaneseGenreTranslation {
  name: string;
  typeTitle: string;
  description: string;
  characteristics: string[];
}

export const genreTranslationsJa: Record<string, JapaneseGenreTranslation> = {
  jazz_cool: { name: 'クール・ジャズ', typeTitle: '優雅な知性派', description: '落ち着いた表現の奥に、深い思考と好奇心を持つタイプ。繊細なニュアンスや洗練されたハーモニーに、自分らしい心地よさを感じます。', characteristics: ['冷静', '洗練', '知的', '抑制的'] },
  jazz_bebop: { name: 'ビバップ', typeTitle: 'ひらめきの即興家', description: '複雑なアイデアを素早く捉え、その場で形にできるタイプ。高度な技術と自由な即興が交差する音に、知的な刺激を感じます。', characteristics: ['複雑', '技巧的', '即興的', 'スピーディー'] },
  rock_alternative: { name: 'オルタナティブ・ロック', typeTitle: '独創的な反骨者', description: '多数派に合わせるより、自分だけの道を選ぶタイプ。実験的なサウンドと反骨精神に、独立心と批判的な視点が映ります。', characteristics: ['実験的', '独創的', '反骨的', '多彩'] },
  rock_indie: { name: 'インディー・ロック', typeTitle: '自由な表現者', description: '独立した感性と創造性を大切にするタイプ。流行よりも本物らしさを選び、自由な表現に心を動かされます。', characteristics: ['自由', '創造的', '独立的', '感性的'] },
  electronic_ambient: { name: 'アンビエント', typeTitle: '静かな探検家', description: '内面の静けさと広い想像力をあわせ持つタイプ。音の余白や繊細な質感から、自分だけの風景を見つけます。', characteristics: ['瞑想的', '空間的', 'ミニマル', '雰囲気重視'] },
  electronic_house: { name: 'ハウス', typeTitle: '社交的なムードメーカー', description: '人をつなぎ、前向きなエネルギーを広げるタイプ。まっすぐなビートとダンスフロアの一体感がよく似合います。', characteristics: ['リズミカル', 'ダンサブル', '反復的', 'エネルギッシュ'] },
  classical_baroque: { name: 'バロック', typeTitle: '優雅な完璧主義者', description: '秩序と美しさを愛し、細部まで丁寧に仕上げるタイプ。精緻な構造と装飾の中に、完成度の高い美を見つけます。', characteristics: ['精緻', '装飾的', '構造的', '荘厳'] },
  classical_minimalism: { name: 'ミニマリズム', typeTitle: '瞑想する完璧主義者', description: '複雑な世界の中から、シンプルな美しさを見つけるタイプ。反復と少しずつ変化する音に深く集中できます。', characteristics: ['シンプル', '反復的', '瞑想的', '漸進的'] },
  pop_indie: { name: 'インディー・ポップ', typeTitle: '感性豊かな夢想家', description: 'あたたかな心と豊かな感受性を持つタイプ。甘いメロディーや素直な歌詞から、日常の小さな美しさを見つけます。', characteristics: ['メロディアス', '感性的', '創造的', 'あたたかい'] },
  pop_dream: { name: 'ドリーム・ポップ', typeTitle: '幻想的な夢想家', description: '現実と夢の境界を行き来しながら、想像の世界を育てるタイプ。浮遊感のある音と繊細な空気に惹かれます。', characteristics: ['幻想的', '浮遊感', 'やわらかい', '夢のよう'] },
  rock_classic: { name: 'クラシック・ロック', typeTitle: '時代を超えるリーダー', description: '長く愛される価値と信念を大切にするタイプ。力強いギターと普遍的なメロディーが、粘り強さと存在感を引き出します。', characteristics: ['力強い', '王道', 'エネルギッシュ', 'ギター中心'] },
  electronic_techno: { name: 'テクノ', typeTitle: '未来志向の革新者', description: '変化する時代のリズムを敏感に捉えるタイプ。反復するビートに没頭しながら、未来への発想を広げます。', characteristics: ['反復的', '強烈', '未来的', '没入感'] },
  jazz_fusion: { name: 'ジャズ・フュージョン', typeTitle: '境界を越える融合家', description: '異なる世界をつなぎ、新しい可能性をつくるタイプ。多様なジャンルと電気的なエネルギーの交差を楽しめます。', characteristics: ['融合的', '複雑', '電気的', 'ダイナミック'] },
  classical_romantic: { name: 'ロマン派クラシック', typeTitle: '情熱的なロマンチスト', description: '深い感情と豊かな想像力で世界を見るタイプ。ドラマチックな旋律と自由な表現に、自分の気持ちを重ねます。', characteristics: ['感情的', 'ドラマチック', '表現的', '叙情的'] },
  pop_kpop: { name: 'K-POP', typeTitle: 'グローバルなトレンドセッター', description: '新しい流行や文化を柔軟に受け入れるタイプ。完成度の高いパフォーマンスと多彩な魅力に刺激を受けます。', characteristics: ['キャッチー', 'カラフル', 'パフォーマンス', 'グローバル'] },
  jazz_smooth: { name: 'スムーズ・ジャズ', typeTitle: '洗練されたコミュニケーター', description: '複雑なものを心地よく伝えるバランス感覚のあるタイプ。なめらかな旋律が、周囲を安心させる魅力と重なります。', characteristics: ['なめらか', '親しみやすい', '心地よい', '都会的'] },
  rock_progressive: { name: 'プログレッシブ・ロック', typeTitle: '哲学する設計者', description: '複雑な構造の中に調和を組み立てるタイプ。緻密な展開とコンセプトの深さに、知的な美しさを感じます。', characteristics: ['実験的', '複雑', '技巧的', '概念的'] },
  electronic_chillout: { name: 'チルアウト', typeTitle: 'ゆとりあるヒーラー', description: '忙しい日常の中で、本当の休息を知っているタイプ。ゆるやかなテンポと穏やかな空気で、自分と周囲を整えます。', characteristics: ['リラックス', 'ゆるやか', 'スロー', '雰囲気重視'] },
  pop_mainstream: { name: 'メインストリーム・ポップ', typeTitle: '親しみ上手なコミュニケーター', description: '人と自然に共感し、場を明るくできるタイプ。親しみやすいメロディーと普遍的な魅力がよく似合います。', characteristics: ['ポピュラー', 'キャッチー', '親しみやすい', '明るい'] },
  classical_contemporary: { name: '現代クラシック', typeTitle: '前衛的な思索家', description: '既存の考えを越えて、新しい可能性を探るタイプ。挑戦的な構造と実験的な音に、未来への問いを感じます。', characteristics: ['実験的', '現代的', '挑戦的', '革新的'] },
  hiphop_oldschool: { name: 'オールドスクール・ヒップホップ', typeTitle: '誠実なストーリーテラー', description: '真実から目をそらさず、率直に言葉を届けるタイプ。素朴なビートと社会への視線に、強い共感を覚えます。', characteristics: ['率直', 'リズミカル', '社会的', 'プリミティブ'] },
  hiphop_trap: { name: 'トラップ・ヒップホップ', typeTitle: '旬をつくる革新者', description: '時代の流れを先取りし、新しい表現を楽しむタイプ。重いビートと先鋭的なサウンドが、前向きな推進力になります。', characteristics: ['強烈', '現代的', 'エッジー', 'ダイナミック'] },
  rnb_classic: { name: 'クラシックR&B', typeTitle: '深い感性のソウルメイト', description: '本物の感情と人のぬくもりを大切にするタイプ。豊かな歌声と率直なメッセージに、強い共感を寄せます。', characteristics: ['感情的', 'ソウルフル', 'あたたかい', '誠実'] },
  rnb_neosoul: { name: 'ネオ・ソウル', typeTitle: '内面を旅する探究者', description: '深い内面性と現代的な感覚を両立するタイプ。洗練された実験性とソウルの温度に、自分らしいバランスを感じます。', characteristics: ['洗練', '深み', '実験的', '内省的'] },
  world_latin: { name: 'ラテン音楽', typeTitle: '情熱と生命力の化身', description: '人生への情熱と自然なエネルギーに満ちたタイプ。躍動するリズムと祝祭感で、人をひとつにする魅力があります。', characteristics: ['情熱的', 'リズミカル', 'ダンサブル', '躍動的'] },
  world_traditional: { name: '世界の伝統音楽', typeTitle: '知恵をつなぐ語り部', description: '長い時間をかけて受け継がれた知恵や文化を大切にするタイプ。素朴な音に、人間らしい深さを感じます。', characteristics: ['伝統的', '文化的', '瞑想的', '自然体'] },
  rock_metal: { name: 'メタル', typeTitle: '意志の強い戦士', description: '内面に強さと折れない意志を持つタイプ。極めて激しい音の中で、挑戦を乗り越える力をチャージします。', characteristics: ['極めて強烈', '攻撃的', '技巧的', 'パワフル'] },
  rock_punk: { name: 'パンク・ロック', typeTitle: '自由な反逆者', description: '型にはまらず、率直さと本物らしさを最優先するタイプ。まっすぐなエネルギーが、独立心と勇気を映します。', characteristics: ['反抗的', '率直', '速い', 'シンプル'] },
  electronic_dnb: { name: 'ドラムンベース', typeTitle: 'リズムのマエストロ', description: '複雑なパターンを楽しめる、分析的で創造的なタイプ。高速のブレイクビーツが集中力と多層的な思考を刺激します。', characteristics: ['高速', '複雑', 'エネルギッシュ', 'テクニカル'] },
  electronic_dubstep: { name: 'ダブステップ', typeTitle: '未来を揺らす革新者', description: '限界を越えて、新しいインパクトを生み出すタイプ。重いベースドロップと未来的な音に、破壊と創造の快感を感じます。', characteristics: ['強烈', '衝撃的', '未来的', 'ダイナミック'] },
  pop_synthpop: { name: 'シンセポップ', typeTitle: '洗練された未来主義者', description: '過去へのノスタルジーと未来への視線を調和させるタイプ。人間的なメロディーと電子音のバランスに惹かれます。', characteristics: ['未来的', '洗練', 'メロディアス', 'シンセ中心'] },
  pop_folk: { name: 'フォーク・ポップ', typeTitle: 'あたたかな物語の語り手', description: '率直な感情と人間らしい物語で、誰かと深くつながるタイプ。自然な歌声とアコースティックな旋律がよく似合います。', characteristics: ['叙情的', 'アコースティック', '自然体', 'あたたかい'] },
};

const TRAIT_IMPACTS = [
  'その感度は、自分らしい選択をするときの軸になります',
  '他の人が見逃しやすい魅力に気づき、言葉やプレイリストで共有できます',
  '気分を切り替えたり、集中したい場面で力を発揮します',
  '新しい音楽や文化へ踏み出すきっかけをつくります',
];

export function buildJapaneseAnalysis(genreId: string, original: PersonalityAnalysisReport): PersonalityAnalysisReport {
  const translation = genreTranslationsJa[genreId];
  if (!translation) return original;
  const scoredTraits = (original.coreTraits || []).map((trait, index) => {
    const characteristic = translation.characteristics[index % translation.characteristics.length];
    return {
      traitName: `${characteristic}な感性`,
      score: trait.score,
      description: `${translation.name}の${characteristic}な表現に自然に惹かれ、そのニュアンスを丁寧に感じ取れます`,
      impact: TRAIT_IMPACTS[index % TRAIT_IMPACTS.length],
    };
  });
  return {
    typeTitle: translation.typeTitle,
    description: translation.description,
    coreTraits: scoredTraits,
    lifestyleInsights: [
      `${translation.name}の${translation.characteristics[0]}な空気に合う、自分のペースを大切にします`,
      `${translation.characteristics[1]}な音を気分や場面に合わせて選び、日常のリズムを整えます`,
      `${translation.name}の魅力を共有できる相手とは、音楽をきっかけに深くつながります`,
    ],
    strengths: [`${translation.characteristics[0]}な魅力を見逃さないこと`, `${translation.characteristics[1]}な表現から気持ちや発想を引き出せること`, '自分の感覚を信じて音楽を選べること'],
    challenges: [`${translation.characteristics[0]}な音へのこだわりが強くなりすぎること`, '気分に合う音楽へ没頭しすぎて、周囲との温度差が生まれること', 'いつもの好みから一歩出るまでに時間がかかること'],
    relationshipCompatibility: `${translation.name}の魅力を尊重しながら、互いのプレイリストを自然に交換できる相手と心地よい関係を築けます。`,
    musicPreferences: [`${translation.name}らしい${translation.characteristics.slice(0, 2).join('・')}サウンド`, '気分を切り替えたいときに自然に没頭できる音楽', '聴くたびに新しい表情が見つかるアルバム'],
    recommendedActivities: ['お気に入りのアルバムを最初から最後まで聴く', '小さなライブや音楽イベントへ出かける', '友達と一曲ずつおすすめを交換する', '未体験の関連ジャンルを一つ試してみる'],
  };
}
