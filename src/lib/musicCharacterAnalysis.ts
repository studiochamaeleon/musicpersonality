import type { PersonalityAnalysisReport } from '../types/index.ts';
import type { Language } from '../types/i18n.ts';

// Tone, rhythm, arrangement, and a listening scene. These are editorial listening
// prompts; the survey measures music preferences, not personality or relationships.
type ListeningNotes = [string, string, string, string];
export const musicCharacterNotes: Record<string, Record<Language, ListeningNotes>> = {
  jazz_cool: {
    ko: ['부드러운 관악기와 절제된 연주가 여백을 남겨요.', '서두르지 않는 스윙에서 작은 악센트를 찾아보세요.', '악기들이 번갈아 이야기를 건네는 순간이 매력이에요.', '저녁에 조명을 낮추고 악기 하나의 소리를 따라가 보세요.'],
    en: ['Soft horns and restrained playing leave space around each phrase.', 'Notice the small accents inside an unhurried swing.', 'The charm is in instruments taking turns to tell the story.', 'Turn the lights down in the evening and follow one instrument.'],
    ja: ['柔らかな管楽器と控えめな演奏が音の余白を作ります。', 'ゆったりしたスウィングの小さなアクセントを探してみましょう。', '楽器が交代で語りかける瞬間に魅力があります。', '夜に照明を落とし、一つの楽器を追って聴いてみましょう。'],
  },
  jazz_bebop: {
    ko: ['짧게 꺾이는 관악기 프레이즈가 선명하게 튀어나와요.', '빠른 리듬 속에서 예상 밖의 악센트를 발견할 수 있어요.', '같은 테마를 즉흥 연주가 어떻게 바꾸는지 들어보세요.', '한 곡에 집중해 솔로 연주가 시작되는 지점을 찾아보세요.'],
    en: ['Sharp horn phrases dart in unexpected directions.', 'Fast rhythms reveal accents that catch you off guard.', 'Listen for how an improvised solo reshapes the theme.', 'Give one track your full attention and notice where each solo begins.'],
    ja: ['短く曲がる管楽器のフレーズが鮮やかに飛び出します。', '速いリズムの中で意外なアクセントに出会えます。', '即興が同じテーマをどう変えるか聴いてみましょう。', '一曲に集中して、ソロが始まる場所を探してみましょう。'],
  },
  rock_alternative: {
    ko: ['거친 기타와 낯선 음색이 곡마다 다른 표정을 만들어요.', '고르게 흐르다가 갑자기 치고 나오는 리듬을 즐길 수 있어요.', '조용한 구간과 크게 터지는 구간의 대비를 들어보세요.', '기분을 바꾸고 싶은 산책길에 한 곡을 끝까지 들어보세요.'],
    en: ['Rough guitars and unusual textures give each track its own face.', 'Enjoy rhythms that settle in and then suddenly push forward.', 'Listen to the contrast between quiet passages and big eruptions.', 'Try a full track on a walk when you want a change of mood.'],
    ja: ['粗いギターと独特な音色が曲ごとの表情を作ります。', '落ち着いた流れから急に前へ出るリズムを楽しめます。', '静かな部分と大きく弾ける部分を比べてみましょう。', '気分を変えたい散歩の途中で一曲を最後まで聴いてみましょう。'],
  },
  rock_indie: {
    ko: ['다듬지 않은 기타와 목소리의 질감이 가까이 느껴져요.', '작은 밴드의 호흡과 리듬이 맞물리는 지점을 들어보세요.', '익숙한 노래 형식에 개인적인 아이디어가 끼어들어요.', '이동 중 떠오른 장면과 어울리는 가사 한 줄을 골라보세요.'],
    en: ['Unpolished guitars and voices can feel close and personal.', 'Notice where a small band locks into a shared pulse.', 'Personal ideas slip into otherwise familiar song structures.', 'On a journey, pick a lyric that fits a scene outside the window.'],
    ja: ['磨きすぎないギターや声が身近に感じられます。', 'バンドの呼吸とリズムが重なる場所を聴いてみましょう。', 'なじみの曲の形に個性的なアイデアが入り込みます。', '移動中、窓の外の景色に合う歌詞を一つ選んでみましょう。'],
  },
  electronic_ambient: {
    ko: ['길게 이어지는 음과 잔향이 공간의 느낌을 만들어요.', '분명한 박자보다 천천히 움직이는 소리의 흐름을 따라가요.', '크게 달라지지 않는 듯한 음색 속에도 작은 변화가 있어요.', '잠깐 쉬는 시간에 화면을 내려놓고 소리의 끝을 들어보세요.'],
    en: ['Sustained tones and reverberation create a sense of space.', 'Follow slowly moving sound rather than a pronounced beat.', 'Small changes hide inside textures that seem almost still.', 'During a short break, put the screen down and listen to each sound fade.'],
    ja: ['長く続く音と残響が空間の感覚を作ります。', 'はっきりした拍より、ゆっくり動く音を追ってみましょう。', '静止しているような音色にも小さな変化があります。', '休憩中に画面を置き、音が消えるところまで聴いてみましょう。'],
  },
  electronic_house: {
    ko: ['베이스와 밝은 건반, 보컬의 조합이 온도를 바꿔요.', '일정한 킥 위에서 몸이 따라가는 그루브를 느껴보세요.', '반복되는 루프에 소리가 하나씩 더해지는 재미가 있어요.', '집안일이나 가벼운 움직임에 맞는 한 곡을 틀어보세요.'],
    en: ['Bass, bright keys, and vocals change the warmth of a track.', 'Feel the groove moving around a steady kick drum.', 'Enjoy sounds arriving one by one over a repeating loop.', 'Try a track while doing chores or moving around the room.'],
    ja: ['ベース、明るい鍵盤、声の組み合わせが曲の温度を変えます。', '一定のキックの周りで動くグルーヴを感じてみましょう。', 'ループに音が一つずつ加わる楽しさがあります。', '家事や軽い運動に合う一曲を流してみましょう。'],
  },
  classical_baroque: {
    ko: ['선명한 현과 건반의 소리가 장식적인 선율을 그려요.', '일정한 흐름 안에서 선율들이 서로 응답해요.', '여러 멜로디가 겹쳐도 각각의 길을 따라갈 수 있어요.', '집중해서 듣는 시간에 가장 낮은 선율부터 따라가 보세요.'],
    en: ['Clear strings and keys trace ornamented melodic lines.', 'Melodies answer one another within a steady flow.', 'Overlapping melodies offer separate paths to follow.', 'In a focused listening session, start by following the lowest line.'],
    ja: ['明瞭な弦や鍵盤が装飾的な旋律を描きます。', '一定の流れの中で旋律が互いに応答します。', '重なるメロディーを一本ずつ追うことができます。', '集中して聴く時間に、最も低い旋律を追ってみましょう。'],
  },
  classical_minimalism: {
    ko: ['적은 재료로 만든 맑은 음이 오래 머물러요.', '반복되는 패턴에서 조금씩 어긋나는 박자를 찾아보세요.', '같은 듯 다른 소리가 쌓이며 풍경이 서서히 바뀌어요.', '한 가지 일에 몰두하기 전 반복되는 선율을 잠시 따라가 보세요.'],
    en: ['Clear sounds made from a few materials linger in the ear.', 'Find the small shifts inside repeating rhythmic patterns.', 'Similar sounds accumulate until the landscape slowly changes.', 'Before settling into a task, follow a repeating melody for a moment.'],
    ja: ['少ない素材で作られた澄んだ音が耳に残ります。', '反復するパターンの中の小さなずれを探してみましょう。', '似た音が重なり、景色がゆっくり変わります。', '作業を始める前に、繰り返す旋律を少し追ってみましょう。'],
  },
  pop_indie: {
    ko: ['친근한 목소리에 독특한 악기 소리가 작은 색을 더해요.', '가볍게 고개를 움직이게 하는 리듬을 만날 수 있어요.', '귀에 남는 멜로디 사이로 예상 밖의 편곡이 들어와요.', '일상 사진 한 장에 어울리는 노래를 골라보세요.'],
    en: ['A familiar voice gains color from distinctive instrumental sounds.', 'A light pulse can invite a small nod of the head.', 'Unexpected arrangements appear between memorable melodies.', 'Choose a song to go with a photo from your day.'],
    ja: ['親しみやすい声に個性的な楽器が小さな色を足します。', '軽くうなずきたくなるリズムに出会えます。', '覚えやすい旋律の間に意外なアレンジが入ります。', '日常の写真一枚に合う曲を選んでみましょう。'],
  },
  pop_dream: {
    ko: ['겹친 목소리와 번지는 기타가 흐릿한 윤곽을 만들어요.', '앞서 나가기보다 떠 있는 듯한 리듬을 즐길 수 있어요.', '가사의 뜻과 별개로 목소리 자체를 하나의 악기처럼 들어보세요.', '늦은 오후 창밖을 보며 가장 오래 남는 음색을 찾아보세요.'],
    en: ['Layered voices and hazy guitars soften the edges of a song.', 'The rhythm can feel suspended rather than pushing forward.', 'Listen to the voice as an instrument as well as a source of words.', 'Look out of the window late in the afternoon and notice which texture lingers.'],
    ja: ['重なる声とにじむギターが曲の輪郭を柔らかくします。', '前進するより浮かぶようなリズムを楽しめます。', '歌詞だけでなく、声を楽器として聴いてみましょう。', '夕方に窓の外を見ながら、耳に残る音色を探してみましょう。'],
  },
  rock_classic: {
    ko: ['기타 리프와 힘 있는 목소리가 곡의 중심을 잡아요.', '드럼과 베이스가 함께 밀어주는 박자를 즐길 수 있어요.', '기억나는 후렴과 기타 솔로의 연결을 들어보세요.', '오래된 라이브 영상과 음반 버전을 한 곡씩 비교해보세요.'],
    en: ['Guitar riffs and strong vocals give a song its center.', 'Enjoy drums and bass pushing the pulse together.', 'Listen to how a memorable chorus leads into a guitar solo.', 'Compare a live performance with the recorded version of one song.'],
    ja: ['ギターのリフと力強い声が曲の中心になります。', 'ドラムとベースが一緒に押し出す拍を楽しめます。', '印象的なサビからギターソロへのつながりを聴いてみましょう。', '一曲のライブ映像と録音版を聴き比べてみましょう。'],
  },
  electronic_techno: {
    ko: ['전자음의 작은 변형이 곡의 질감을 계속 바꿔요.', '단단한 반복 비트 속에서 긴장과 이완을 느껴보세요.', '큰 후렴 없이도 소리의 출입이 흐름을 만들 수 있어요.', '한 곡에서 새 소리가 들어오는 순간마다 주의를 기울여보세요.'],
    en: ['Small changes in electronic sounds keep reshaping the texture.', 'Feel tension and release inside a firm repeating beat.', 'Sounds entering and leaving can shape a track without a big chorus.', 'Notice each moment when a new sound enters a track.'],
    ja: ['電子音の小さな変化が質感を作り替えます。', '繰り返すビートの中の緊張と解放を感じてみましょう。', '大きなサビがなくても音の出入りが流れを作ります。', '新しい音が入る瞬間に注目して一曲を聴いてみましょう。'],
  },
  jazz_fusion: {
    ko: ['전기 악기의 질감과 재즈의 연주가 함께 펼쳐져요.', '팽팽한 합주에서 리듬이 바뀌는 지점을 찾아보세요.', '솔로와 밴드 전체의 연주가 서로 밀고 당겨요.', '한 곡의 베이스와 드럼을 먼저 듣고 멜로디를 다시 들어보세요.'],
    en: ['Electric textures meet the expressive playing of jazz.', 'Find the rhythmic changes inside a tightly coordinated band.', 'Solos and ensemble passages push and pull against each other.', 'Follow bass and drums first, then return to the melody.'],
    ja: ['電気楽器の質感とジャズの演奏が一緒に広がります。', '緊密な合奏の中でリズムが変わる場所を探してみましょう。', 'ソロとバンド全体の演奏が押したり引いたりします。', 'ベースとドラムを先に聴き、次に旋律を聴いてみましょう。'],
  },
  classical_romantic: {
    ko: ['풍성한 악기 소리가 선율의 감정을 크게 펼쳐요.', '빨라졌다 느려지는 호흡이 음악의 표정을 바꿔요.', '작게 시작한 선율이 큰 절정으로 이어지는 길을 들어보세요.', '같은 작품의 다른 연주를 비교하며 마음에 드는 호흡을 찾아보세요.'],
    en: ['Full instrumental colors let a melody expand its emotional range.', 'Changes of pace alter the expression of a phrase.', 'Follow a small opening melody on its way to a large climax.', 'Compare two performances of the same work and find the pacing you prefer.'],
    ja: ['豊かな楽器の響きが旋律の感情を広げます。', '速くなったり遅くなったりする呼吸が表情を変えます。', '小さな旋律が大きな頂点へ進む道を聴いてみましょう。', '同じ作品の異なる演奏から好きな呼吸を探してみましょう。'],
  },
  pop_kpop: {
    ko: ['목소리와 여러 전자음이 곡마다 다른 색을 만들어요.', '잘게 바뀌는 비트와 춤을 떠올리게 하는 박자가 만나요.', '후렴 전후의 전환과 짧게 남는 훅을 찾아보세요.', '영상으로 먼저 본 곡을 소리만으로 다시 들어보세요.'],
    en: ['Voices and varied electronic sounds give each song a different palette.', 'Shifting beats meet a pulse that can suggest movement.', 'Notice transitions around the chorus and hooks that stay with you.', 'Listen without the video to a song you first encountered on screen.'],
    ja: ['声と多様な電子音が曲ごとの色を作ります。', '細かく変わるビートと踊りを感じる拍が出会います。', 'サビ前後の切り替わりと耳に残るフックを探してみましょう。', '映像で知った曲を、音だけでもう一度聴いてみましょう。'],
  },
  jazz_smooth: {
    ko: ['매끈한 관악기와 건반 소리가 편안한 결을 만들어요.', '고르게 흐르는 그루브가 멜로디를 받쳐줘요.', '복잡한 전개보다 오래 남는 선율에 귀를 기울여보세요.', '하루를 마무리하며 마음에 드는 멜로디를 한 번 흥얼거려보세요.'],
    en: ['Smooth horns and keys create an easy texture.', 'An even groove supports the melody.', 'Listen for a lasting melodic line rather than a complicated turn.', 'At the end of the day, try humming a melody that stayed with you.'],
    ja: ['なめらかな管楽器と鍵盤が心地よい質感を作ります。', '安定したグルーヴが旋律を支えます。', '複雑な展開より耳に残るメロディーに注目してみましょう。', '一日の終わりに気に入った旋律を口ずさんでみましょう。'],
  },
  rock_progressive: {
    ko: ['여러 악기와 효과음이 긴 이야기의 장면을 만들어요.', '박자가 바뀌거나 예상 밖으로 끊기는 순간을 찾아보세요.', '긴 곡 속에서 반복되는 테마가 어떻게 변하는지 즐길 수 있어요.', '한 곡을 작은 장면들로 나눠 나만의 제목을 붙여보세요.'],
    en: ['Instruments and effects create scenes within a longer story.', 'Notice meters changing or phrases breaking unexpectedly.', 'Enjoy a recurring theme taking new forms across a long track.', 'Divide one song into scenes and give each a title of your own.'],
    ja: ['楽器や効果音が長い物語の場面を作ります。', '拍子の変化や意外に途切れるフレーズを探してみましょう。', '長い曲の中でテーマが姿を変える楽しさがあります。', '一曲を小さな場面に分け、自分なりの題を付けてみましょう。'],
  },
  electronic_chillout: {
    ko: ['부드러운 전자음과 잔향이 느슨한 공간을 만들어요.', '느긋한 비트가 너무 앞서지 않고 곡을 이끌어요.', '짧은 멜로디와 반복이 자연스럽게 이어져요.', '쉬는 시간에 조용한 곡과 비트가 있는 곡을 번갈아 들어보세요.'],
    en: ['Soft electronic textures and echoes create a relaxed space.', 'An easy beat leads without crowding the rest of the track.', 'Short melodies and repetitions flow naturally into one another.', 'During a break, alternate a quiet track with one that has a beat.'],
    ja: ['柔らかな電子音と残響がゆったりした空間を作ります。', 'のんびりしたビートが前に出すぎず曲を導きます。', '短い旋律と反復が自然につながります。', '休憩中に静かな曲とビートのある曲を交互に聴いてみましょう。'],
  },
  pop_mainstream: {
    ko: ['앞에 놓인 보컬과 또렷한 악기 소리가 쉽게 귀에 들어와요.', '리듬이 노래의 흐름을 명확하게 잡아줘요.', '한 번 듣고도 떠오르는 후렴과 훅을 즐길 수 있어요.', '친구와 각자 기억나는 후렴 한 곡씩을 골라 들어보세요.'],
    en: ['Upfront vocals and clear instrumental sounds are easy to pick out.', 'The rhythm gives the song a clear direction.', 'Enjoy choruses and hooks you can recall after one listen.', 'Ask a friend to choose a memorable chorus and trade one of your own.'],
    ja: ['前に出る声と明瞭な楽器の音が耳に入りやすくなっています。', 'リズムが曲の流れをはっきり支えます。', '一度聴いても思い出せるサビやフックを楽しめます。', '友達と覚えているサビの曲を一つずつ選んで聴いてみましょう。'],
  },
  classical_contemporary: {
    ko: ['익숙한 악기도 낯선 방법으로 새로운 소리를 낼 수 있어요.', '분명한 박자와 자유로운 시간 흐름이 곡마다 달라요.', '예상 밖의 침묵과 소리 조합을 하나의 장면으로 들어보세요.', '짧은 작품 하나에서 처음 들어본 소리를 적어보세요.'],
    en: ['Familiar instruments can produce unfamiliar sounds through new approaches.', 'Some works use a clear pulse; others let time move freely.', 'Hear unexpected silences and combinations as part of the scene.', 'Choose a short work and note a sound you have not heard before.'],
    ja: ['なじみの楽器も新しい奏法で意外な音を出せます。', '明確な拍と自由な時間の流れが作品ごとに異なります。', '意外な静けさや音の組み合わせを一つの場面として聴いてみましょう。', '短い作品から初めて聴いた音を書き留めてみましょう。'],
  },
  hiphop_oldschool: {
    ko: ['샘플의 질감과 랩의 목소리가 곡의 이야기를 만들어요.', '반복 비트 위에 말의 리듬이 다르게 얹혀요.', '같은 루프라도 가사의 흐름이 분위기를 바꿀 수 있어요.', '랩과 드럼이 만나는 순간을 찾아 한 구절을 따라 들어보세요.'],
    en: ['Sample textures and the rapper’s voice carry the story.', 'The rhythm of words moves differently over a repeating beat.', 'Even one loop can change mood as the verses unfold.', 'Follow one verse and notice where the rap meets the drums.'],
    ja: ['サンプルの質感とラップの声が物語を作ります。', '反復するビートに言葉のリズムが重なります。', '同じループでも歌詞の流れで雰囲気が変わります。', '一つのヴァースでラップとドラムが重なる瞬間を探してみましょう。'],
  },
  hiphop_trap: {
    ko: ['낮은 베이스와 가공된 목소리가 굵은 질감을 만들어요.', '잘게 쪼개지는 하이햇과 느리게 느껴지는 박자가 함께 있어요.', '짧은 훅과 비트의 공간을 번갈아 들어보세요.', '청취 볼륨을 편안하게 맞추고 저음과 목소리의 균형을 느껴보세요.'],
    en: ['Low bass and processed voices create a weighty texture.', 'Fast hi-hats sit alongside a pulse that can feel slow.', 'Listen in turn to the short hook and the spaces in the beat.', 'At a comfortable volume, notice the balance between bass and voice.'],
    ja: ['低いベースと加工された声が太い質感を作ります。', '細かなハイハットとゆっくり感じる拍が共存します。', '短いフックとビートの余白を交互に聴いてみましょう。', '心地よい音量で低音と声のバランスを感じてみましょう。'],
  },
  rnb_classic: {
    ko: ['목소리의 떨림과 부드러운 화음이 곡의 온기를 만들어요.', '베이스와 드럼이 노래 사이에서 깊게 움직여요.', '멜로디를 늘이거나 짧게 놓는 보컬의 표현을 들어보세요.', '가사 한 줄과 그 줄을 부르는 목소리의 차이를 느껴보세요.'],
    en: ['Vocal inflections and soft harmonies give a song warmth.', 'Bass and drums move deeply around the singing.', 'Notice how the singer stretches or releases a melodic phrase.', 'Compare a line of lyrics with the feeling of the voice singing it.'],
    ja: ['声の揺れと柔らかな和音が曲の温かさを作ります。', 'ベースとドラムが歌の間で深く動きます。', '旋律を伸ばしたり短く置いたりする歌い方を聴いてみましょう。', '歌詞の一行と、それを歌う声の感じを比べてみましょう。'],
  },
  rnb_neosoul: {
    ko: ['따뜻한 건반과 가까운 목소리에 여러 장르의 결이 섞여요.', '박자에 딱 맞기보다 살짝 기대는 듯한 그루브가 매력이에요.', '보컬, 화음, 비트 중 어떤 층이 먼저 들리는지 찾아보세요.', '편안한 저녁에 베이스의 움직임을 따라 한 곡을 들어보세요.'],
    en: ['Warm keys and intimate voices blend textures from different genres.', 'A groove leaning around the beat can be part of the appeal.', 'Notice whether voice, harmony, or beat catches your ear first.', 'On an easy evening, follow the bass through one track.'],
    ja: ['温かな鍵盤と近く感じる声に複数のジャンルの質感が混ざります。', '拍に少し寄りかかるようなグルーヴに魅力があります。', '声、和音、ビートのどれが先に耳に届くか探してみましょう。', '落ち着いた夜にベースの動きを追って一曲を聴いてみましょう。'],
  },
  world_latin: {
    ko: ['다양한 타악기와 밝은 악기 소리가 서로 다른 색을 만들어요.', '겹치는 리듬을 따라가며 몸이 반응하는 부분을 찾아보세요.', '노래와 악기들이 주고받는 흐름을 즐길 수 있어요.', '서로 다른 지역의 곡을 한 곡씩 골라 리듬의 차이를 들어보세요.'],
    en: ['Varied percussion and bright instruments bring different colors.', 'Follow layered rhythms and find the part that makes you move.', 'Enjoy the exchanges between the singer and the instruments.', 'Choose tracks from different regions and compare their rhythms.'],
    ja: ['多様な打楽器と明るい楽器が異なる色を作ります。', '重なるリズムから体が反応する部分を探してみましょう。', '歌と楽器がやり取りする流れを楽しめます。', '異なる地域の曲を一つずつ選び、リズムを比べてみましょう。'],
  },
  world_traditional: {
    ko: ['지역마다 다른 악기와 목소리의 결을 만날 수 있어요.', '낯선 박자와 반복이 그 음악만의 호흡을 만들어요.', '곡의 소리와 함께 연주되는 자리의 이야기도 찾아보세요.', '한 곡을 고르고 악기나 연주 배경을 짧게 찾아본 뒤 다시 들어보세요.'],
    en: ['Meet instruments and vocal textures that differ from place to place.', 'Unfamiliar pulses and repetitions create a distinct breathing space.', 'Explore the setting in which a piece is performed as well as its sound.', 'Learn a little about an instrument or performance setting, then listen again.'],
    ja: ['土地ごとに異なる楽器や声の質感に出会えます。', 'なじみのない拍と反復が独特な呼吸を作ります。', '音だけでなく、演奏される場の背景も探してみましょう。', '楽器や演奏の背景を少し調べてから、同じ曲を聴いてみましょう。'],
  },
  rock_metal: {
    ko: ['왜곡된 기타와 강한 목소리가 밀도 높은 소리를 만들어요.', '빠른 연주와 무겁게 눌리는 박자 모두를 만날 수 있어요.', '기타 리프의 반복과 갑자기 바뀌는 전개를 들어보세요.', '서로 다른 하위 장르의 곡을 한 곡씩 골라 무게감과 속도를 비교해보세요.'],
    en: ['Distorted guitars and forceful voices create a dense sound.', 'You can meet both fast playing and a heavy, deliberate pulse.', 'Listen for repeating riffs and sudden changes in direction.', 'Compare the weight and speed of tracks from different metal styles.'],
    ja: ['歪んだギターと力強い声が密度の高い音を作ります。', '速い演奏と重く刻む拍の両方に出会えます。', 'リフの反復と急に変わる展開を聴いてみましょう。', '異なるサブジャンルの曲で重さと速さを比べてみましょう。'],
  },
  rock_punk: {
    ko: ['거친 기타와 꾸미지 않은 목소리가 바로 귀에 닿아요.', '앞으로 달려가는 박자와 짧은 악센트가 힘을 더해요.', '짧은 곡 안에서 메시지와 후렴이 빠르게 만나요.', '짧은 곡 두 곡을 연이어 듣고 가장 남는 한 줄을 골라보세요.'],
    en: ['Rough guitars and unadorned voices reach the ear directly.', 'A forward-driving pulse and short accents add force.', 'A short song brings its message and chorus together quickly.', 'Play two short tracks in a row and choose the line that stays with you.'],
    ja: ['粗いギターと飾らない声が直接耳に届きます。', '前へ進む拍と短いアクセントが力を加えます。', '短い曲の中でメッセージとサビがすぐに出会います。', '短い曲を二つ続けて聴き、耳に残る一行を選んでみましょう。'],
  },
  electronic_dnb: {
    ko: ['깊은 베이스와 잘게 끊기는 드럼이 선명하게 대비돼요.', '빠른 비트 사이로 더 느린 흐름도 함께 느낄 수 있어요.', '리듬이 분해되었다 다시 모이는 순간을 찾아보세요.', '드럼을 따라 듣고, 두 번째에는 베이스만 따라 들어보세요.'],
    en: ['Deep bass contrasts with sharply chopped drums.', 'A slower movement can sit underneath the rapid beat.', 'Find the moments when a rhythm breaks apart and comes back together.', 'Follow the drums once, then listen again following only the bass.'],
    ja: ['深いベースと細かく切れるドラムが対照を作ります。', '速いビートの下にゆっくりした流れも感じられます。', 'リズムがほどけて再び集まる瞬間を探してみましょう。', '一度はドラム、二度目はベースだけを追ってみましょう。'],
  },
  electronic_dubstep: {
    ko: ['움직이는 저음과 공간감 있는 전자음이 대비돼요.', '비어 있는 듯한 박자 사이로 묵직한 소리가 들어와요.', '쌓아 올린 긴장 뒤에 소리가 바뀌는 순간을 들어보세요.', '절제된 곡과 화려한 곡을 비교하며 좋아하는 저음의 결을 찾아보세요.'],
    en: ['Moving bass contrasts with spacious electronic textures.', 'Weighty sounds enter the gaps of a sparse-feeling pulse.', 'Listen to how the sound changes after tension builds.', 'Compare a restrained track with a vivid one to find the bass texture you prefer.'],
    ja: ['動く低音と空間的な電子音が対照を作ります。', '余白のある拍の間に重い音が入ります。', '緊張が積み重なった後の音の変化を聴いてみましょう。', '控えめな曲と華やかな曲で好きな低音の質感を探してみましょう。'],
  },
  pop_synthpop: {
    ko: ['반짝이는 신시사이저와 목소리가 선명한 색을 만들어요.', '규칙적인 전자 비트가 노래를 가볍게 끌고 가요.', '익숙한 후렴과 새로운 음색의 조합을 즐길 수 있어요.', '시대가 다른 두 곡을 비교해 비슷한 신스 소리를 찾아보세요.'],
    en: ['Bright synthesizers and voices create a clear palette.', 'A regular electronic beat carries the song along.', 'Enjoy the pairing of a familiar chorus with a new texture.', 'Compare tracks from different eras and look for a similar synth sound.'],
    ja: ['きらめくシンセと声が鮮やかな色を作ります。', '規則的な電子ビートが軽く曲を運びます。', 'なじみのサビと新しい音色の組み合わせを楽しめます。', '異なる時代の二曲から似たシンセの音を探してみましょう。'],
  },
  pop_folk: {
    ko: ['어쿠스틱 악기와 가까운 목소리가 작은 이야기를 건네요.', '가볍게 튕기는 줄과 자연스러운 호흡이 박자를 만들어요.', '간결한 멜로디가 가사의 이야기를 따라가요.', '산책 후 기억나는 장면과 맞는 가사 한 줄을 골라보세요.'],
    en: ['Acoustic instruments and a close voice tell a small story.', 'Plucked strings and natural phrasing shape the pulse.', 'A simple melody follows the story in the words.', 'After a walk, choose a lyric that fits a scene you remember.'],
    ja: ['アコースティック楽器と近く感じる声が小さな物語を語ります。', '弦を弾く音と自然な呼吸が拍を作ります。', '簡潔な旋律が歌詞の物語を追います。', '散歩の後、覚えている景色に合う歌詞を選んでみましょう。'],
  },
  hiphop_jazzhop: {
    ko: ['재즈의 화음과 샘플의 따뜻한 질감이 비트 위에 앉아요.', '느긋한 드럼과 작은 리듬 변화가 함께 움직여요.', '반복 속에서 피아노나 목소리의 짧은 조각이 새롭게 들려요.', '익숙한 길을 걸으며 같은 루프에서 달라지는 소리를 찾아보세요.'],
    en: ['Jazz harmonies and warm sample textures settle over a beat.', 'Relaxed drums move alongside small rhythmic changes.', 'Piano or vocal fragments gain new meaning inside a loop.', 'On a familiar walk, find the sounds that change within a repeating loop.'],
    ja: ['ジャズの和音と温かなサンプルがビートに重なります。', 'ゆったりしたドラムと小さなリズムの変化が動きます。', 'ループの中で短いピアノや声の断片が新しく聴こえます。', 'いつもの道を歩きながら、反復の中の変化を探してみましょう。'],
  },
  electronic_melodic_dance: {
    ko: ['넓게 퍼지는 신스와 노래할 수 있는 선율이 만나요.', '명확한 비트가 차곡차곡 고조되는 흐름을 이끌어요.', '작게 시작한 멜로디가 크게 펼쳐지는 순간을 즐길 수 있어요.', '기분을 끌어올리고 싶은 순간에 가장 기억나는 멜로디를 골라보세요.'],
    en: ['Wide synth textures meet a melody you can sing.', 'A clear beat guides a gradually rising flow.', 'Enjoy the moment when a small melody opens out into a large sound.', 'When you want a lift, choose the melody you remember most clearly.'],
    ja: ['広がるシンセと歌える旋律が出会います。', '明快なビートが少しずつ高まる流れを導きます。', '小さな旋律が大きく広がる瞬間を楽しめます。', '気分を上げたいとき、最も覚えている旋律を選んでみましょう。'],
  },
};

export function buildMusicCharacterAnalysis(id: string, original: PersonalityAnalysisReport, language: Language, characteristics: string[]): PersonalityAnalysisReport {
  const notes = musicCharacterNotes[id]?.[language];
  if (!notes) return original;
  const [tone, rhythm, form, scene] = notes;
  const text = language === 'ko' ? {
    labels: ['음색과 질감', '리듬과 움직임', '곡이 펼쳐지는 방식'],
    impact: '다른 곡을 들을 때도 이 소리가 어떻게 달라지는지 찾아보세요.',
    lifestyle: [scene, '익숙한 곡과 처음 듣는 곡을 한 곡씩 골라 지금 기분에 어울리는 쪽을 찾아보세요.', '같은 곡도 집중해 들을 때와 일상의 배경으로 들을 때 다르게 느껴질 수 있어요.'],
    challenge: ['장르 이름이 같아도 곡마다 음색과 에너지는 달라요.', '마음에 드는 부분과 낯선 부분을 하나씩 골라보세요.', '지금의 기분과 듣는 장소에 따라 다른 곡이 더 잘 맞을 수 있어요.'],
    relationship: '친구와 한 곡씩 추천을 교환하고, 목소리·리듬·멜로디 중 어떤 부분이 먼저 귀에 들어왔는지 이야기해보세요. 서로 다르게 들은 지점이 다음 곡을 고르는 힌트가 됩니다.',
    activities: ['대표곡과 발견곡을 번갈아 듣고 좋아하는 소리를 골라보기', scene, '친구와 곡 하나씩 교환하고 기억나는 장면 말해보기', '추천 장르 중 아직 듣지 않은 장르 한 곡 시도해보기'],
  } : language === 'ja' ? {
    labels: ['音色と質感', 'リズムと動き', '曲の展開'],
    impact: '別の曲ではこの音がどう変わるか探してみましょう。',
    lifestyle: [scene, '知っている曲と初めて聴く曲を選び、今の気分に合う方を探してみましょう。', '集中して聴くときと日常の背景として聴くときでは、同じ曲も違って感じられます。'],
    challenge: ['同じジャンルでも、曲ごとに音色やエネルギーは異なります。', '好きな部分とまだなじみのない部分を一つずつ探してみましょう。', '気分や聴く場所によって、別の曲が合うこともあります。'],
    relationship: '友達と一曲ずつ交換して、声・リズム・旋律のどれが最初に耳に届いたか話してみましょう。感じ方の違いが次の曲を選ぶヒントになります。',
    activities: ['代表曲と新しい曲を交互に聴き、好きな音を探す', scene, '友達と一曲ずつ交換し、浮かんだ景色を話す', 'おすすめの中からまだ聴いていないジャンルを一つ試す'],
  } : {
    labels: ['Tone and texture', 'Rhythm and movement', 'How the song unfolds'],
    impact: 'Listen for how this sound changes in another track.',
    lifestyle: [scene, 'Choose one familiar track and one new track, then find which fits your mood today.', 'The same track can feel different when you focus on it and when it plays in the background.'],
    challenge: ['Tracks in the same genre can differ in texture and energy.', 'Find one part you enjoy and one that still feels unfamiliar.', 'Your mood and listening setting may make a different track feel closer.'],
    relationship: 'Trade one track with a friend and talk about whether the voice, rhythm, or melody caught your ear first. Your different impressions can help you choose the next song.',
    activities: ['Alternate a defining track and a discovery, and pick the sounds you enjoy', scene, 'Trade a track with a friend and describe a scene it brings to mind', 'Try a track from a recommended genre you have not explored'],
  };
  return {
    ...original,
    coreTraits: [tone, rhythm, form].map((description, index) => ({ traitName: text.labels[index], score: original.coreTraits[index]?.score ?? 0, description, impact: text.impact })),
    lifestyleInsights: text.lifestyle,
    strengths: characteristics.length ? characteristics.slice(0, 3) : [tone, rhythm, form],
    challenges: text.challenge,
    relationshipCompatibility: text.relationship,
    musicPreferences: [tone, rhythm, form],
    recommendedActivities: text.activities,
  };
}
