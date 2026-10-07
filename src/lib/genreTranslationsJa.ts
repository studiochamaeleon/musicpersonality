import type { PersonalityAnalysisReport } from '@/types';

interface JapaneseGenreTranslation {
  name: string;
  typeTitle: string;
  description: string;
  characteristics: string[];
}

export const genreTranslationsJa: Record<string, JapaneseGenreTranslation> = {
  jazz_cool: { name: 'クール・ジャズ', typeTitle: '優雅な知性派', description: '抑えたテンポと繊細なハーモニーに近い回答傾向です。クール・ジャズの静かな余白を楽しんでみましょう。', characteristics: ['冷静', '洗練', '知的', '抑制的'] },
  jazz_bebop: { name: 'ビバップ', typeTitle: 'ひらめきの即興家', description: '速い即興と入り組んだフレーズに近い回答傾向です。ビバップの楽器の掛け合いを聴いてみましょう。', characteristics: ['複雑', '技巧的', '即興的', 'スピーディー'] },
  rock_alternative: { name: 'オルタナティブ・ロック', typeTitle: '独創的な反骨者', description: '決まった形に収まらないギターの音に近い回答傾向です。オルタナティブ・ロックの多様な表現を試せます。', characteristics: ['実験的', '独創的', '反骨的', '多彩'] },
  rock_indie: { name: 'インディー・ロック', typeTitle: '自由な表現者', description: '自由な録音や率直なバンドの音に近い回答傾向です。インディー・ロックから好きな質感を探してみましょう。', characteristics: ['自由', '創造的', '独立的', '感性的'] },
  electronic_ambient: { name: 'アンビエント', typeTitle: '静かな探検家', description: '音の余白とゆっくり変わる質感に近い回答傾向です。アンビエントの細かな変化に耳を傾けてみてください。', characteristics: ['瞑想的', '空間的', 'ミニマル', '雰囲気重視'] },
  electronic_house: { name: 'ハウス', typeTitle: '社交的なムードメーカー', description: '四つ打ちと身体が動くグルーヴに近い回答傾向です。ハウスの温かい曲から高揚感のある曲まで試せます。', characteristics: ['リズミカル', 'ダンサブル', '反復的', 'エネルギッシュ'] },
  classical_baroque: { name: 'バロック', typeTitle: '優雅な完璧主義者', description: '重なり合う旋律と整った構造に近い回答傾向です。バロックの装飾や楽器どうしの応答を楽しめます。', characteristics: ['精緻', '装飾的', '構造的', '荘厳'] },
  classical_minimalism: { name: 'ミニマリズム', typeTitle: '瞑想する完璧主義者', description: '反復の中の小さな変化に近い回答傾向です。ミニマリズムで少しずつ変わる音を追ってみましょう。', characteristics: ['シンプル', '反復的', '瞑想的', '漸進的'] },
  pop_indie: { name: 'インディー・ポップ', typeTitle: '感性豊かな夢想家', description: '親しみやすいメロディーと個性的な音色に近い回答傾向です。インディー・ポップで新しい一曲を探せます。', characteristics: ['メロディアス', '感性的', '創造的', 'あたたかい'] },
  pop_dream: { name: 'ドリーム・ポップ', typeTitle: '幻想的な夢想家', description: '浮遊感のある声とぼやけたギターに近い回答傾向です。ドリーム・ポップの音の奥行きを味わってみましょう。', characteristics: ['幻想的', '浮遊感', 'やわらかい', '夢のよう'] },
  rock_classic: { name: 'クラシック・ロック', typeTitle: '時代を超えるリーダー', description: '長く聴かれてきたギターのリフと力強い歌に近い回答傾向です。クラシック・ロックの演奏の違いも楽しめます。', characteristics: ['力強い', '王道', 'エネルギッシュ', 'ギター中心'] },
  electronic_techno: { name: 'テクノ', typeTitle: '未来志向の革新者', description: '反復するビートと変化する電子音に近い回答傾向です。テクノの集中できる曲から踊れる曲まで試せます。', characteristics: ['反復的', '強烈', '未来的', '没入感'] },
  jazz_fusion: { name: 'ジャズ・フュージョン', typeTitle: '境界を越える融合家', description: 'ジャズの即興にロックやファンクが交わる音に近い回答傾向です。ジャズ・フュージョンの楽器の掛け合いを追えます。', characteristics: ['融合的', '複雑', '電気的', 'ダイナミック'] },
  classical_romantic: { name: 'ロマン派クラシック', typeTitle: '情熱的なロマンチスト', description: '大きく揺れる旋律と豊かな表現に近い回答傾向です。ロマン派の同じ作品を異なる演奏で聴き比べてみましょう。', characteristics: ['感情的', 'ドラマチック', '表現的', '叙情的'] },
  pop_kpop: { name: 'K-POP', typeTitle: 'グローバルなトレンドセッター', description: '印象的なフックと多彩な音作りに近い回答傾向です。K-POPの中でも曲ごとのビートや声の違いを楽しめます。', characteristics: ['キャッチー', 'カラフル', 'パフォーマンス', 'グローバル'] },
  jazz_smooth: { name: 'スムーズ・ジャズ', typeTitle: '洗練されたコミュニケーター', description: 'なめらかな旋律と穏やかなグルーヴに近い回答傾向です。スムーズ・ジャズの楽器やテンポの違いを聴けます。', characteristics: ['なめらか', '親しみやすい', '心地よい', '都会的'] },
  rock_progressive: { name: 'プログレッシブ・ロック', typeTitle: '哲学する設計者', description: '長い展開と変化する拍子に近い回答傾向です。プログレッシブ・ロックを一曲通して聴くと構成が見えてきます。', characteristics: ['実験的', '複雑', '技巧的', '概念的'] },
  electronic_chillout: { name: 'チルアウト', typeTitle: 'ゆとりあるヒーラー', description: 'ゆるやかなテンポとやわらかい電子音に近い回答傾向です。チルアウトを休息や移動の時間に試せます。', characteristics: ['リラックス', 'ゆるやか', 'スロー', '雰囲気重視'] },
  pop_mainstream: { name: 'メインストリーム・ポップ', typeTitle: '親しみ上手なコミュニケーター', description: '覚えやすいメロディーと明快な構成に近い回答傾向です。メインストリーム・ポップの曲ごとの音作りも楽しめます。', characteristics: ['ポピュラー', 'キャッチー', '親しみやすい', '明るい'] },
  classical_contemporary: { name: '現代クラシック', typeTitle: '前衛的な思索家', description: '新しい奏法や予想外の響きに近い回答傾向です。現代クラシックの短い作品から音の実験を試せます。', characteristics: ['実験的', '現代的', '挑戦的', '革新的'] },
  hiphop_oldschool: { name: 'オールドスクール・ヒップホップ', typeTitle: '誠実なストーリーテラー', description: '言葉のリズムとサンプル中心のビートに近い回答傾向です。オールドスクール・ヒップホップの語り口を聴けます。', characteristics: ['率直', 'リズミカル', '社会的', 'プリミティブ'] },
  hiphop_trap: { name: 'トラップ・ヒップホップ', typeTitle: '旬をつくる革新者', description: '低い808ベースと細かいハイハットに近い回答傾向です。トラップの声やビートの質感を聴き比べてみましょう。', characteristics: ['強烈', '現代的', 'エッジー', 'ダイナミック'] },
  rnb_classic: { name: 'クラシックR&B', typeTitle: '深い感性のソウルメイト', description: 'ソウルフルな歌声と深いグルーヴに近い回答傾向です。クラシックR&Bの歌い方やリズムを楽しめます。', characteristics: ['感情的', 'ソウルフル', 'あたたかい', '誠実'] },
  rnb_neosoul: { name: 'ネオ・ソウル', typeTitle: '内面を旅する探究者', description: 'ソウルにジャズやヒップホップが混ざる音に近い回答傾向です。ネオ・ソウルのゆったりした曲から探せます。', characteristics: ['洗練', '深み', '実験的', '内省的'] },
  world_latin: { name: 'ラテン音楽', typeTitle: '情熱と生命力の化身', description: '多彩な打楽器と踊りたくなるリズムに近い回答傾向です。ラテン音楽を地域ごとの違いとともに探してみましょう。', characteristics: ['情熱的', 'リズミカル', 'ダンサブル', '躍動的'] },
  world_traditional: { name: '世界の伝統音楽', typeTitle: '知恵をつなぐ語り部', description: '土地ごとの楽器や受け継がれた旋律に近い回答傾向です。伝統音楽を地域や演奏の背景とともに聴けます。', characteristics: ['伝統的', '文化的', '瞑想的', '自然体'] },
  rock_metal: { name: 'メタル', typeTitle: '意志の強い戦士', description: '歪んだギターと強いドラムに近い回答傾向です。メタルの中にも速さや重さの異なる多くの入口があります。', characteristics: ['極めて強烈', '攻撃的', '技巧的', 'パワフル'] },
  rock_punk: { name: 'パンク・ロック', typeTitle: '自由な反逆者', description: '短く速い曲と率直な演奏に近い回答傾向です。パンク・ロックの時代や地域による違いを楽しめます。', characteristics: ['反抗的', '率直', '速い', 'シンプル'] },
  electronic_dnb: { name: 'ドラムンベース', typeTitle: 'リズムのマエストロ', description: '速いブレイクビーツと深いベースに近い回答傾向です。ドラムンベースの細かなリズムの変化を追えます。', characteristics: ['高速', '複雑', 'エネルギッシュ', 'テクニカル'] },
  electronic_dubstep: { name: 'ダブステップ', typeTitle: '未来を揺らす革新者', description: '低音の揺れと大きな音の切り替わりに近い回答傾向です。ダブステップの静かな曲と派手な曲を比べられます。', characteristics: ['強烈', '衝撃的', '未来的', 'ダイナミック'] },
  pop_synthpop: { name: 'シンセポップ', typeTitle: '洗練された未来主義者', description: 'シンセの音色と覚えやすいメロディーに近い回答傾向です。シンセポップの懐かしさと新しさを楽しめます。', characteristics: ['未来的', '洗練', 'メロディアス', 'シンセ中心'] },
  pop_folk: { name: 'フォーク・ポップ', typeTitle: 'あたたかな物語の語り手', description: 'アコースティックな音と歌詞が届くメロディーに近い回答傾向です。フォーク・ポップの幅広い曲を試せます.', characteristics: ['叙情的', 'アコースティック', '自然体', 'あたたかい'] },
  hiphop_jazzhop: { name: 'ジャズ・ヒップホップ', typeTitle: '静かなビートの探検家', description: 'ゆったりしたビートと重なり合う音に惹かれる好みです。ジャズの響きとヒップホップのリズムを行き来してみましょう。性格の診断ではなく、音楽の好みから生まれた気軽な読み物です。', characteristics: ['ジャズの響き', 'ゆるやかなビート', '温かな音', '繊細なリズム'] },
  electronic_melodic_dance: { name: 'メロディック・ダンス', typeTitle: '音の探検家', description: 'はっきりしたリズムと大きく広がるメロディーに惹かれる好みです。ポップの歌心と電子音楽の高揚感を一緒に楽しめます。性格の診断ではなく、音楽の好みから生まれた気軽な読み物です。', characteristics: ['大きなメロディー', '高まる展開', '明快なビート', '歌えるサビ'] },
};

const TRAIT_IMPACTS = [
  '曲を聴き比べるときの手がかりになります',
  '音の違いを友達と話すきっかけになります',
  '気分や場面に合う曲を探す助けになります',
  '関連する音楽へ探索を広げられます',
];

export function buildJapaneseAnalysis(genreId: string, original: PersonalityAnalysisReport): PersonalityAnalysisReport {
  const translation = genreTranslationsJa[genreId];
  if (!translation) return original;
  const scoredTraits = (original.coreTraits || []).map((trait, index) => {
    const characteristic = translation.characteristics[index % translation.characteristics.length];
    return {
      traitName: `${characteristic}を楽しむ感性`,
      score: trait.score,
      description: `${translation.name}の「${characteristic}」という音の特徴を楽しむためのヒントです`,
      impact: TRAIT_IMPACTS[index % TRAIT_IMPACTS.length],
    };
  });
  return {
    typeTitle: translation.typeTitle,
    description: translation.description,
    coreTraits: scoredTraits,
    lifestyleInsights: [
      `${translation.name}の「${translation.characteristics[0]}」という魅力を、自分のペースで楽しめます`,
      `「${translation.characteristics[1]}」という音の特徴を気分や場面に合わせて選べます`,
      `好みが違う友達とも${translation.name}を一曲ずつ交換して、感じ方を比べてみましょう`,
    ],
    strengths: [`「${translation.characteristics[0]}」という音から新しい曲を探せること`, `「${translation.characteristics[1]}」という表現を聴き比べられること`, '好きな曲を言葉やプレイリストで共有できること'],
    challenges: [`同じ${translation.name}でも曲ごとに音の特徴が違うこと`, 'このジャンルだけで好みの全体を説明することはできないこと', '気分によって好きな曲が変わることもあること'],
    relationshipCompatibility: `友達と${translation.name}の曲を一曲ずつ交換し、好きなところの違いを話してみましょう。音楽の好みから人間関係は予測できません。`,
    musicPreferences: [`${translation.name}らしい${translation.characteristics.slice(0, 2).join('・')}サウンド`, '気分を切り替えたいときに自然に没頭できる音楽', '聴くたびに新しい表情が見つかるアルバム'],
    recommendedActivities: [`${translation.name}の代表曲と新しく見つけた曲を聴き比べる`, `「${translation.characteristics[0]}」と「${translation.characteristics[1]}」が聴こえる場面を探す`, '友達と一曲ずつおすすめを交換する', '未体験の関連ジャンルを一つ試してみる'],
  };
}
