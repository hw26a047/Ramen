/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// スープのカテゴリ
export type SoupCategory = 'gala' | 'seafood' | 'vegetable' | 'sauce' | 'oil';

// スープ素材の定義
export interface SoupIngredient {
  id: string;
  name: string;
  category: SoupCategory;
  dashi: number;    // 出汁・旨味
  koku: number;     // コク・濃厚さ
  aroma: number;    // 香り
  cost: number;     // 原価
  description: string;
  emoji: string;
  level: number;    // 素材レベル（アップグレード可能）
}

// 麺の太さ定義
export type NoodleThickness = 'ultra_fine' | 'fine' | 'medium' | 'thick' | 'ultra_thick';
// 麺のちぢれ定義
export type NoodleWaviness = 'straight' | 'wavy';

export interface NoodleConfig {
  thickness: NoodleThickness;
  waviness: NoodleWaviness;
  hydration: 'low' | 'medium' | 'high'; // 加水率
}

// トッピングの定義
export interface Topping {
  id: string;
  name: string;
  emoji: string;
  dashi: number;     // 追加される旨味
  koku: number;      // 追加されるコク
  aroma: number;     // 追加される香り
  visual: number;    // 見栄え
  volume: number;    // ボリューム・満腹感
  cost: number;      // トッピング原価
  description: string;
}

// ラーメンに配置されたトッピングの情報
export interface PlacedTopping {
  placementId: string; // ユニークな配置ID
  toppingId: string;
  x: number;          // 丼上の相対座標 (0% - 100%)
  y: number;
  rotation: number;   // 回転角度 (0 - 360)
  scale: number;      // サイズ倍率
}

// ラーメンの全体定義
export interface Ramen {
  id: string;
  name: string;
  soupIngredients: string[]; // 使用したスープ素材のID(最大8個。順序も重要にする)
  noodle: NoodleConfig;
  toppings: PlacedTopping[];
  
  // 算出ステータス
  taste: number;      // 旨味 (スープ出汁 + トッピング出汁)
  richness: number;   // コク (スープコク + トッピングコク)
  aroma: number;      // 香り (スープ香り + トッピング香り)
  visual: number;     // 見栄え (トッピング見栄え + 盛り付けバランス)
  volume: number;     // ボリューム (麺 + トッピングボリューム)
  
  synergy: number;    // スープと麺、具材の相性倍率 (0.5 - 2.0)
  score: number;      // 総合美味しさスコア (0 - 1000)
  
  cost: number;       // 総原価
  price: number;      // 販売価格
  salesCount: number; // 累計販売数
}

// お客さんの定義
export interface CustomerType {
  id: string;
  name: string;
  emoji: string;
  description: string;
  favoriteStyle: string; // 好みのジャンル
  preferredThickness: NoodleThickness[];
  preferredWaviness: NoodleWaviness[];
  minRichness: number;   // 求めるコクの最低値
  minTaste: number;      // 求める旨味の最低値
  budget: number;        // 財布（最大支払額）
  patience: number;      // 待てる時間 (秒)
  unlockedAtFamous: number; // この知名度で開放
}

// 稼働中のお客さんインスタンス
export interface ActiveCustomer {
  id: string;
  typeId: string;
  state: 'entering' | 'waiting' | 'eating' | 'leaving';
  yOffset: number; // アニメーション用
  xPosition: number; // テーブルや座席位置
  patienceRemaining: number;
  selectedRamenId: string | null;
  eatTimeRemaining: number;
  feedbackEmoji: string | null;
  feedbackText: string | null;
  paidAmount: number;
}

// コンテストの定義
export interface Contest {
  id: string;
  name: string;
  description: string;
  minFamous: number;      // 必要知名度
  entryFee: number;       // 参加費
  conditionsText: string; // 審査基準の説明
  targetTaste: number;    // 目安となる必要旨味
  targetRichness: number; // 目安となる必要コク
  targetVisual: number;   // 目安となる必要見栄え
  opponents: {
    name: string;
    ramenName: string;
    score: number;
  }[];
  rewardCash: number;
  rewardUnlockId: string | null; // 報酬で手に入る材料/トッピングID
  rewardFamous: number;   // 獲得知名度
  isCompleted: boolean;
}

// ゲームのセーブ状態
export interface GameSaveState {
  cash: number;           // 所持金
  famous: number;         // 知名度・ファンの数
  day: number;            // 経過日数
  unlockedIngredients: string[]; // 開放済みのスープ素材ID
  unlockedToppings: string[];    // 開放済みのトッピングID
  ingredientLevels: Record<string, number>; // 素材のレベル { [id]: level }
  ramenRecipes: Ramen[];  // 開発したラーメンレシピリスト
  activeMenuIds: string[]; // メニューに登録されているラーメンID(最大3〜5種)
  completedContestIds: string[]; // クリアしたコンテスト
}
