/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SoupIngredient, Topping, CustomerType, Contest, NoodleConfig } from './types';

// スープ素材の初期マスターデータ
export const SOUP_INGREDIENTS: SoupIngredient[] = [
  // --- 調味料・タレ ---
  {
    id: 'sauce_shoyu',
    name: '醤油タレ',
    category: 'sauce',
    dashi: 15,
    koku: 5,
    aroma: 25,
    cost: 40,
    description: 'キレと香りのある基本の醤油ダレ。',
    emoji: '🪵',
    level: 1
  },
  {
    id: 'sauce_shio',
    name: '塩タレ',
    category: 'sauce',
    dashi: 25,
    koku: 2,
    aroma: 10,
    cost: 30,
    description: 'ガラの旨味を引き立てる透き通った塩ダレ。',
    emoji: '🧂',
    level: 1
  },
  {
    id: 'sauce_miso',
    name: '特製味噌ダレ',
    category: 'sauce',
    dashi: 20,
    koku: 35,
    aroma: 30,
    cost: 60,
    description: '数種類の味噌をブレンドした濃厚芳醇ダレ。',
    emoji: '🟤',
    level: 1
  },
  // --- 肉・ガラ ---
  {
    id: 'gala_chicken',
    name: '鶏ガラ',
    category: 'gala',
    dashi: 35,
    koku: 15,
    aroma: 20,
    cost: 80,
    description: 'あっさりしながらもしっかりとしたコクを生む出汁の基本。',
    emoji: '🐔',
    level: 1
  },
  {
    id: 'gala_pork_bones',
    name: '豚骨',
    category: 'gala',
    dashi: 30,
    koku: 45,
    aroma: 15,
    cost: 110,
    description: '長時間煮込んで旨味とマイルドな脂分を抽出。濃厚。',
    emoji: '🦴',
    level: 1
  },
  {
    id: 'gala_marudori',
    name: '丸鶏',
    category: 'gala',
    dashi: 50,
    koku: 25,
    aroma: 35,
    cost: 150,
    description: '鶏肉の旨味を贅沢に丸ごと煮出した極上のスープ。',
    emoji: '🐓',
    level: 1
  },
  // --- 魚介 ---
  {
    id: 'seafood_konbu',
    name: '真昆布',
    category: 'seafood',
    dashi: 40,
    koku: 5,
    aroma: 15,
    cost: 70,
    description: 'グルタミン酸の透き通るような洗練された旨味。',
    emoji: '🥬',
    level: 1
  },
  {
    id: 'seafood_niboshi',
    name: '煮干し',
    category: 'seafood',
    dashi: 45,
    koku: 15,
    aroma: 30,
    cost: 90,
    description: 'パンチの効いた魚介の香りと深みのある出汁。',
    emoji: '🐟',
    level: 1
  },
  {
    id: 'seafood_katsuobushi',
    name: '鰹節',
    category: 'seafood',
    dashi: 42,
    koku: 8,
    aroma: 45,
    cost: 95,
    description: '削りたての豊かな香りとイノシン酸の旨味。',
    emoji: '🪵',
    level: 1
  },
  // --- 野菜 ---
  {
    id: 'veg_negi',
    name: '長ネギ',
    category: 'vegetable',
    dashi: 10,
    koku: 8,
    aroma: 25,
    cost: 20,
    description: 'ネギのさわやかな香りと、スープの臭み消し。',
    emoji: '🌱',
    level: 1
  },
  {
    id: 'veg_ninniku',
    name: 'ニンニク',
    category: 'vegetable',
    dashi: 15,
    koku: 25,
    aroma: 40,
    cost: 25,
    description: '強烈なスタミナとパンチ力、圧倒的な引き。',
    emoji: '🧄',
    level: 1
  },
  {
    id: 'veg_onion',
    name: 'タマネギ',
    category: 'vegetable',
    dashi: 20,
    koku: 12,
    aroma: 15,
    cost: 30,
    description: 'じっくり炒めたような甘みと、優しいまろやかさ。',
    emoji: '🧅',
    level: 1
  },
  {
    id: 'veg_ginger',
    name: '生姜',
    category: 'vegetable',
    dashi: 12,
    koku: 5,
    aroma: 30,
    cost: 22,
    description: 'ピリッとした引き締め効果と爽やかな芳香。',
    emoji: '🫚',
    level: 1
  },
  // --- 香味油・その他 ---
  {
    id: 'oil_chiyu',
    name: '黄金鶏油',
    category: 'oil',
    dashi: 10,
    koku: 30,
    aroma: 35,
    cost: 45,
    description: '鶏特有のまろやかで甘い芳醇な香りをまとう。',
    emoji: '💛',
    level: 1
  },
  {
    id: 'oil_lard',
    name: '極上ラード',
    category: 'oil',
    dashi: 5,
    koku: 40,
    aroma: 20,
    cost: 35,
    description: 'スープの温度を保ち、こってりとした旨さを閉じ込める。',
    emoji: '⚪',
    level: 1
  },
  {
    id: 'oil_mayu',
    name: '黒マー油',
    category: 'oil',
    dashi: 15,
    koku: 35,
    aroma: 50,
    cost: 65,
    description: '焦がしにんにくの圧倒的な香ばしさとスモーキーさ。',
    emoji: '🖤',
    level: 1
  }
];

// トッピングの初期マスターデータ
export const TOPPINGS: Topping[] = [
  {
    id: 'top_chashu',
    name: '炙りチャーシュー',
    emoji: '🥩',
    dashi: 25,
    koku: 35,
    aroma: 20,
    visual: 40,
    volume: 35,
    cost: 80,
    description: '豚バラ肉をじっくり煮込み、提供直前に香ばしく炙った極上チャーシュー。'
  },
  {
    id: 'top_tamago',
    name: '半熟味付け玉子',
    emoji: '🥚',
    dashi: 15,
    koku: 20,
    aroma: 5,
    visual: 35,
    volume: 15,
    cost: 40,
    description: '秘伝のタレに漬け込んだ、黄身がトロトロの黄金の味玉。'
  },
  {
    id: 'top_menma',
    name: '極太出汁メンマ',
    emoji: '🎋',
    dashi: 10,
    koku: 5,
    aroma: 10,
    visual: 20,
    volume: 10,
    cost: 25,
    description: 'コリコリとした食感が癖になる丁寧に戻された味付きメンマ。'
  },
  {
    id: 'top_negi',
    name: '切りたて白髪ネギ',
    emoji: '🌱',
    dashi: 5,
    koku: 2,
    aroma: 15,
    visual: 25,
    volume: 5,
    cost: 15,
    description: 'シャキシャキした食感とさっぱりとした辛みがラーメンを引き締める。'
  },
  {
    id: 'top_nori',
    name: '高級有明のり',
    emoji: '⬛',
    dashi: 12,
    koku: 5,
    aroma: 25,
    visual: 30,
    volume: 3,
    cost: 20,
    description: 'スープを吸わせ、麺を巻いて食べるのが最高。磯の芳醇な香り。'
  },
  {
    id: 'top_naruto',
    name: '昭和レトロナルト',
    emoji: '🍥',
    dashi: 2,
    koku: 0,
    aroma: 2,
    visual: 35,
    volume: 5,
    cost: 10,
    description: 'これがあるだけで昔懐かしい昭和の中華そば風の彩りに変貌する。'
  },
  {
    id: 'top_moyashi',
    name: 'シャキシャキもやし',
    emoji: '🥗',
    dashi: 5,
    koku: 2,
    aroma: 2,
    visual: 15,
    volume: 45,
    cost: 12,
    description: '驚くべき高ボリュームとお買い得さを両立する、二郎系ラーメンの必須具材。'
  },
  {
    id: 'top_butter',
    name: '北海道バター',
    emoji: '🧈',
    dashi: 10,
    koku: 35,
    aroma: 25,
    visual: 18,
    volume: 8,
    cost: 30,
    description: 'スープを入れるだけでコクが跳ね上がる。味噌や塩との相性が最高。'
  },
  {
    id: 'top_corn',
    name: '甘口スイートコーン',
    emoji: '🌽',
    dashi: 8,
    koku: 5,
    aroma: 5,
    visual: 25,
    volume: 10,
    cost: 18,
    description: 'プチプチ弾ける甘さと鮮やかな黄色のビカル。味噌に最適。'
  },
  {
    id: 'top_garlic_crush',
    name: '生刻みニンニク',
    emoji: '🧄',
    dashi: 8,
    koku: 15,
    aroma: 30,
    visual: 10,
    volume: 5,
    cost: 10,
    description: '問答無用のスタミナビジュアル。圧倒的な旨味と中毒性。'
  },
  {
    id: 'top_spinach',
    name: '出汁ほうれん草',
    emoji: '🥬',
    dashi: 10,
    koku: 5,
    aroma: 5,
    visual: 25,
    volume: 10,
    cost: 25,
    description: '家系ラーメンには欠かせない。こってりした醤油スープに入ると絶品。'
  }
];

// お客さんの定義
export const CUSTOMERS: CustomerType[] = [
  {
    id: 'cust_grandpa',
    name: 'あっさり喜ぶおじいちゃん',
    emoji: '👴',
    description: '胃に優しい昔ながらの東京醤油ラーメンを求めてやってくる。',
    favoriteStyle: 'あっさり醤油・塩',
    preferredThickness: ['ultra_fine', 'fine', 'medium'],
    preferredWaviness: ['straight', 'wavy'],
    minRichness: 0,
    minTaste: 80,
    budget: 850,
    patience: 40,
    unlockedAtFamous: 0
  },
  {
    id: 'cust_student',
    name: '食欲旺盛な高校生',
    emoji: '🧑‍🎓',
    description: '安くてお腹がいっぱいになる、こってりボリューム抜群のラーメンが大好物。',
    favoriteStyle: 'こってり大盛り',
    preferredThickness: ['medium', 'thick', 'ultra_thick'],
    preferredWaviness: ['wavy'],
    minRichness: 60,
    minTaste: 100,
    budget: 750,
    patience: 30,
    unlockedAtFamous: 100
  },
  {
    id: 'cust_office_lady',
    name: '健康志向の会社員OL',
    emoji: '👩‍💼',
    description: '味はもちろん、盛り付けの華やかさ(見栄え)や豊かな香りと上品さを重視する。',
    favoriteStyle: '美瑛・極上スープ',
    preferredThickness: ['ultra_fine', 'fine'],
    preferredWaviness: ['straight'],
    minRichness: 10,
    minTaste: 150,
    budget: 1200,
    patience: 35,
    unlockedAtFamous: 300
  },
  {
    id: 'cust_salaryman',
    name: '戦うビジネスマン',
    emoji: '👨‍💼',
    description: '仕事帰りにガツンとニンニクの効いた、濃厚なスタミナ系ラーメンで疲れを癒したい。',
    favoriteStyle: '濃厚スタミナ豚骨',
    preferredThickness: ['fine', 'medium', 'thick'],
    preferredWaviness: ['straight', 'wavy'],
    minRichness: 80,
    minTaste: 160,
    budget: 1000,
    patience: 35,
    unlockedAtFamous: 600
  },
  {
    id: 'cust_maniac',
    name: '孤高のラーメンオタク',
    emoji: '🥸',
    description: 'スープの出汁（Wスープ）や麺の相性を厳しくレビューする。財布の紐が少し緩い。',
    favoriteStyle: 'こだわり職人系',
    preferredThickness: ['ultra_fine', 'fine', 'medium', 'thick', 'ultra_thick'],
    preferredWaviness: ['straight', 'wavy'],
    minRichness: 40,
    minTaste: 220,
    budget: 1500,
    patience: 45,
    unlockedAtFamous: 1200
  },
  {
    id: 'cust_gourmet',
    name: 'B級グルメ王女',
    emoji: '👑',
    description: '圧倒的な旨味と贅沢なトッピングの調和。絶品ラーメンなら幾らでも払う。',
    favoriteStyle: '極上贅沢オールスター',
    preferredThickness: ['medium', 'thick'],
    preferredWaviness: ['wavy'],
    minRichness: 50,
    minTaste: 250,
    budget: 2500,
    patience: 50,
    unlockedAtFamous: 2500
  }
];

// コンテストの初期定義
export const CONTESTS: Contest[] = [
  {
    id: 'contest_town',
    name: '町内ラーメン街道祭り',
    description: '「まずはここから！近所のラーメン好き達をうならせよう」',
    minFamous: 50,
    entryFee: 300,
    conditionsText: '基準: あっさりから濃厚まで幅広く。合格点: 320以上',
    targetTaste: 80,
    targetRichness: 40,
    targetVisual: 50,
    opponents: [
      { name: 'ラーメン横丁のオヤジ', ramenName: '昔ながらの醤油中華', score: 280 },
      { name: 'キッチンハルカ', ramenName: 'あっさり塩ラーメン', score: 310 }
    ],
    rewardCash: 1500,
    rewardUnlockId: 'top_tamago', // 味玉アンロック
    rewardFamous: 150,
    isCompleted: false
  },
  {
    id: 'contest_city',
    name: '市民ヌードルグランプリ',
    description: '「市内の人気行列店が勢揃い。本格的な出汁の旨味と麺の調和が試される」',
    minFamous: 400,
    entryFee: 1000,
    conditionsText: '基準: スープの純粋な「旨味（Taste）」が重視される！合格点: 480以上',
    targetTaste: 160,
    targetRichness: 80,
    targetVisual: 80,
    opponents: [
      { name: '満開家', ramenName: 'ガッツリ濃厚家系', score: 420 },
      { name: '麺屋さざなみ', ramenName: '鯛出汁塩そば', score: 465 }
    ],
    rewardCash: 5000,
    rewardUnlockId: 'seafood_niboshi', // 煮干しアンロック
    rewardFamous: 400,
    isCompleted: false
  },
  {
    id: 'contest_prefecture',
    name: '県民スタミナ拉麺頂上決戦',
    description: '「濃厚なコクとニンニクなどのパンチが光る、スタミナ満点ラーメンの祭典！」',
    minFamous: 1000,
    entryFee: 3000,
    conditionsText: '基準: こってりした「コク（Richness）」が最重要！合格点: 630以上',
    targetTaste: 220,
    targetRichness: 180,
    targetVisual: 120,
    opponents: [
      { name: '麺獄ジロウ', ramenName: 'メガマシマシニンニク', score: 580 },
      { name: '味噌の金剛', ramenName: '特製焦がしバター味噌', score: 610 }
    ],
    rewardCash: 12000,
    rewardUnlockId: 'oil_mayu', // 黒マー油アンロック
    rewardFamous: 900,
    isCompleted: false
  },
  {
    id: 'contest_national',
    name: 'ジャパン拉麺サミット',
    description: '「全国から名だたる最高峰の店が集結。味、コク、見栄えすべてが超一級品である必要がある」',
    minFamous: 2500,
    entryFee: 8000,
    conditionsText: '基準: 総合評価。「見栄え（Visual）」と「旨味（Taste）」の合計！合格点: 780以上',
    targetTaste: 300,
    targetRichness: 240,
    targetVisual: 200,
    opponents: [
      { name: '京都鳳凰庵', ramenName: '九条ネギ極上鴨そば', score: 720 },
      { name: '麺処コズミック', ramenName: '分子ガストロノミー中華', score: 765 }
    ],
    rewardCash: 35000,
    rewardUnlockId: 'gala_marudori', // 丸鶏アンロック
    rewardFamous: 2000,
    isCompleted: false
  }
];

// 麺の設定による各種パラメータ補正を取得
export const getNoodleStats = (config: NoodleConfig) => {
  let tasteMod = 0;
  let richnessMod = 0;
  let aromaMod = 0;
  let cost = 50; // 麺のベースコスト

  // 太さ
  switch (config.thickness) {
    case 'ultra_fine':
      tasteMod = -5;
      richnessMod = -10;
      aromaMod = 15;
      cost += 10;
      break;
    case 'fine':
      tasteMod = 0;
      richnessMod = -5;
      aromaMod = 8;
      cost += 5;
      break;
    case 'medium':
      tasteMod = 5;
      richnessMod = 5;
      aromaMod = 0;
      cost += 0;
      break;
    case 'thick':
      tasteMod = 10;
      richnessMod = 15;
      aromaMod = -5;
      cost += 10;
      break;
    case 'ultra_thick':
      tasteMod = 15;
      richnessMod = 30;
      aromaMod = -15;
      cost += 20;
      break;
  }

  // ちぢれ
  if (config.waviness === 'wavy') {
    // ちぢれ麺はスープの持ち上げ（旨味・コク）が増す
    tasteMod += 5;
    richnessMod += 10;
    cost += 5;
  } else {
    // ストレート麺はすすりやすさ・香り・のどごしが増す
    aromaMod += 10;
  }

  // 加水率
  switch (config.hydration) {
    case 'low': // 低加水（パツパツ。スープを吸う：博多系）
      tasteMod += 10;
      aromaMod += 5;
      cost += 5;
      break;
    case 'medium':
      break;
    case 'high': // 多加水（モッチリ。コシが強い：喜多方・佐野）
      richnessMod += 5;
      cost += 10;
      break;
  }

  return { tasteMod, richnessMod, aromaMod, cost };
};

// 開発したラーメンのパラメータと相性、総合スコアを計算するロジック
export const calculateRamenSpecs = (
  name: string,
  soupIngredientIds: string[],
  noodle: NoodleConfig,
  placedToppings: { toppingId: string; x: number; y: number }[],
  allSoupIngredients: SoupIngredient[],
  allToppings: Topping[]
) => {
  let baseTaste = 0;
  let baseRichness = 0;
  let baseAroma = 0;
  let totalCost = 0;

  // 1. スープ素材の合算値
  // カテゴリごとの登場回数をカウントしてペナルティや相性を算出
  const categoryCounts: Record<string, number> = {};
  let totalLevelSum = 0;

  soupIngredientIds.forEach((id) => {
    const ing = allSoupIngredients.find((i) => i.id === id);
    if (ing) {
      // レベル補正（レベル1ごとに+10%性能アップ）
      const levelMultiplier = 1 + (ing.level - 1) * 0.1;
      
      baseTaste += ing.dashi * levelMultiplier;
      baseRichness += ing.koku * levelMultiplier;
      baseAroma += ing.aroma * levelMultiplier;
      totalCost += ing.cost;
      totalLevelSum += ing.level;

      categoryCounts[ing.category] = (categoryCounts[ing.category] || 0) + 1;
    }
  });

  // 1.1 スープのエッジペナルティとボーナス
  let soupSynergy = 1.0;
  
  // Wスープボーナス (豚骨等の肉ガラカテゴリ ＆ 昆布等の魚介カテゴリが両方入っている)
  if ((categoryCounts['gala'] || 0) > 0 && (categoryCounts['seafood'] || 0) > 0) {
    soupSynergy += 0.25; // 25%の旨味シナジー！
  }

  // 野菜を煮込むとスープに深みと甘み
  if ((categoryCounts['vegetable'] || 0) > 0) {
    soupSynergy += 0.1;
  }

  // 味の有無判定(タレが入っているか)
  if (!categoryCounts['sauce'] || categoryCounts['sauce'] === 0) {
    // タレなし＝味がないペナルティ
    soupSynergy -= 0.5;
  } else if (categoryCounts['sauce'] > 2) {
    // タレが多すぎる＝しょっぱすぎるペナルティ
    soupSynergy -= 0.2;
  }

  // 香りオイルボーナス
  if ((categoryCounts['oil'] || 0) > 0) {
    soupSynergy += 0.15;
  }

  // 2. 麺のステータス取得と相性
  const noodleStats = getNoodleStats(noodle);
  baseTaste += noodleStats.tasteMod;
  baseRichness += noodleStats.richnessMod;
  baseAroma += noodleStats.aromaMod;
  totalCost += noodleStats.cost;

  // 2.1 スープの濃厚さと、麺の太さ・ちぢれ度の相性
  // 濃厚度（コク）の算出
  const estimatedSoupRichness = baseRichness * soupSynergy;
  let noodleSynergy = 1.0;

  if (estimatedSoupRichness > 80) {
    // 濃厚スープ(豚骨、ラード等、味噌など)
    // 太麺・ちぢれ麺が相性抜群
    if (noodle.thickness === 'thick' || noodle.thickness === 'ultra_thick') {
      noodleSynergy += 0.2;
    }
    if (noodle.waviness === 'wavy') {
      noodleSynergy += 0.15;
    }
    // 極細ストレートはスープに負ける（博多豚骨は例外的に細いので適度に補正、基本は太が有利）
    if (noodle.thickness === 'ultra_fine' && noodle.waviness === 'straight') {
      // 博多風：豚骨が主体（魚介・味噌・醤油などがなく、豚骨とラード主体）ならOK
      const isPurePork = soupIngredientIds.includes('gala_pork_bones') && !soupIngredientIds.includes('sauce_miso');
      if (isPurePork) {
        noodleSynergy += 0.25; // 博多豚骨本場ボーナス！
      } else {
        noodleSynergy -= 0.2; // それ以外でコッテリに細ストレートは伸びやすい
      }
    }
  } else if (estimatedSoupRichness < 30) {
    // あっさりスープ
    // 極細、細、中細ストレートが相性抜群
    if (noodle.thickness === 'ultra_fine' || noodle.thickness === 'fine') {
      noodleSynergy += 0.25;
    }
    if (noodle.waviness === 'straight') {
      noodleSynergy += 0.15;
    }
    // 極太麺は麺勝ちしてしまう
    if (noodle.thickness === 'ultra_thick' || noodle.thickness === 'thick') {
      noodleSynergy -= 0.25;
    }
  } else {
    // 中量級スープ
    if (noodle.thickness === 'medium') {
      noodleSynergy += 0.15;
    }
  }

  // 3. トッピングのステータス合算
  let toppingTaste = 0;
  let toppingRichness = 0;
  let toppingAroma = 0;
  let toppingVisual = 0;
  let toppingVolume = 0;

  // 配置されたトッピングのIDを抽出
  const toppingIds = placedToppings.map(t => t.toppingId);
  const uniqueToppings = Array.from(new Set(toppingIds));

  placedToppings.forEach((pt) => {
    const top = allToppings.find((t) => t.id === pt.toppingId);
    if (top) {
      toppingTaste += top.dashi;
      toppingRichness += top.koku;
      toppingAroma += top.aroma;
      toppingVisual += top.visual;
      toppingVolume += top.volume;
      totalCost += top.cost;
    }
  });

  // 盛り付け数ボーナス＆ペナルティ（トッピング全くなしは美観ペナルティ）
  if (placedToppings.length === 0) {
    toppingVisual -= 30;
  } else {
    // 異なる種類のトッピングがある方が美観アップ
    toppingVisual += uniqueToppings.length * 10;
    // 盛りすぎペナルティ (10個以上乗せるとごちゃごちゃして見栄え低下)
    if (placedToppings.length > 8) {
      toppingVisual -= (placedToppings.length - 8) * 8;
    }
  }

  // 3.1 トッピングの組み合わせ名物コンボ！
  let comboBonusTaste = 0;
  let comboBonusRichness = 0;
  let comboBonusVisual = 0;
  let comboDescription = '';

  const has = (id: string) => toppingIds.includes(id);

  // 【特製1】三種の神器 (チャーシュー, 味玉, メンマ)
  if (has('top_chashu') && has('top_tamago') && has('top_menma')) {
    comboBonusTaste += 20;
    comboBonusVisual += 30;
    comboDescription = '三種の神器・極み乗せ';
  }

  // 【特製2】マシマシニンニク二郎風 (もやし、にんにく、チャーシューで極太麺)
  if (has('top_moyashi') && (has('top_garlic_crush') || soupIngredientIds.includes('veg_ninniku')) && has('top_chashu') && (noodle.thickness === 'thick' || noodle.thickness === 'ultra_thick')) {
    comboBonusRichness += 40;
    comboBonusTaste += 25;
    toppingVolume += 60;
    comboDescription = 'スタミナG系マシマシ';
  }

  // 【特製3】家系盛 (のり、ほうれん草、チャーシュー、豚骨スープ)
  if (has('top_nori') && has('top_spinach') && has('top_chashu') && soupIngredientIds.includes('gala_pork_bones')) {
    comboBonusRichness += 30;
    comboBonusTaste += 15;
    comboBonusVisual += 25;
    comboDescription = '伝統の本格横浜家系';
  }

  // 【特製4】味噌バターコーン (味噌ダレ、バター、コーン)
  if (has('top_butter') && has('top_corn') && soupIngredientIds.includes('sauce_miso')) {
    comboBonusRichness += 35;
    comboBonusTaste += 15;
    comboBonusVisual += 20;
    comboDescription = '北の味覚・黄金味噌バター';
  }

  // バランスを整えた集計
  const totalTaste = Math.max(0, Math.round((baseTaste * soupSynergy + toppingTaste + comboBonusTaste)));
  const totalRichness = Math.max(0, Math.round((baseRichness * soupSynergy + toppingRichness + comboBonusRichness)));
  const totalAroma = Math.max(0, Math.round((baseAroma + toppingAroma)));
  const totalVisual = Math.max(0, Math.round(toppingVisual + comboBonusVisual));
  const totalVolume = Math.max(10, 50 + (noodle.thickness === 'ultra_thick' ? 30 : noodle.thickness === 'thick' ? 15 : 0) + toppingVolume);

  // 総合シナジー倍率
  const combinedSynergy = Math.round((soupSynergy * noodleSynergy) * 100) / 100;

  // 美味しさスコア (0-1000)
  // 計算：(出汁 + コク + 香り/2) * シナジー + 見栄え * 0.8
  let score = Math.round((totalTaste * 1.5 + totalRichness * 1.2 + totalAroma * 0.8) * combinedSynergy + totalVisual * 1.2);
  score = Math.min(999, Math.max(50, score));

  // 正当な販売価格（スコアの1.1倍〜1.5倍、原価との兼ね合いでプレイヤーが変更できるようにするが、目安となる標準価格）
  // プレイヤーが設定できるが、ゲームバランス上、最初は自動で適正価格(原価の2.5倍〜3倍前後)を提案する
  const recommendedPrice = Math.round(totalCost * 2.8 + (score / 4));

  return {
    taste: totalTaste,
    richness: totalRichness,
    aroma: totalAroma,
    visual: totalVisual,
    volume: totalVolume,
    synergy: combinedSynergy,
    score,
    cost: Math.round(totalCost),
    price: Math.max(300, Math.round(recommendedPrice / 10) * 10), // 10円単位に丸める
    comboName: comboDescription || null
  };
};
