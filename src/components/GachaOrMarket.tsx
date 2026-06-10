/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameSaveState, SoupIngredient, Topping } from '../types';
import { ShoppingBag, ArrowUp } from 'lucide-react';

interface GachaOrMarketProps {
  saveState: GameSaveState;
  allSoupIngredients: SoupIngredient[];
  allToppings: Topping[];
  onUpdateSaveState: (updater: (prev: GameSaveState) => GameSaveState) => void;
  onAlertMessage: (msg: string) => void;
}

export default function GachaOrMarket({
  saveState,
  allSoupIngredients,
  allToppings,
  onUpdateSaveState,
  onAlertMessage,
}: GachaOrMarketProps) {
  const [activeTab, setActiveTab] = useState<'upgrade' | 'shop'>('upgrade');

  // 1. スープ素材のアップグレード（レベルアップ）
  const getUpgradeCost = (id: string, currentLevel: number) => {
    return Math.round(180 * Math.pow(currentLevel, 1.4));
  };

  const handleUpgradeIngredient = (ing: SoupIngredient) => {
    const currentLevel = saveState.ingredientLevels[ing.id] || 1;
    const cost = getUpgradeCost(ing.id, currentLevel);

    if (saveState.cash < cost) {
      onAlertMessage('資金が足りません！店舗営業で稼いできましょう。');
      return;
    }

    onUpdateSaveState((prev) => {
      const currentLevels = { ...prev.ingredientLevels };
      const nextLevel = (currentLevels[ing.id] || 1) + 1;
      currentLevels[ing.id] = nextLevel;

      return {
        ...prev,
        cash: prev.cash - cost,
        ingredientLevels: currentLevels,
      };
    });

    onAlertMessage(`🎉「${ing.name}」の素材レベルが Lv.${currentLevel + 1} にアップ！出汁スープ効果が+10%強化されました。`);
  };

  // 2. 新規仕入れ（ショップでの素材/トッピングライセンス買付）
  // 未開放のスープ素材
  const lockedSoupIngredients = allSoupIngredients.filter(
    (i) => !saveState.unlockedIngredients.includes(i.id)
  );

  // 未開放のトッピング素材
  const lockedToppings = allToppings.filter(
    (t) => !saveState.unlockedToppings.includes(t.id)
  );

  // 仕入れ買付ライセンス価格の決定
  const getIngredientPurchaseCost = (category: string) => {
    switch (category) {
      case 'gala': return 1200;
      case 'seafood': return 800;
      case 'oil': return 600;
      case 'sauce': return 1000;
      default: return 500;
    }
  };

  const getToppingPurchaseCost = (id: string) => {
    if (id === 'top_chashu') return 2000;
    if (id === 'top_butter') return 1200;
    if (id === 'top_corn') return 500;
    if (id === 'top_garlic_crush') return 400;
    if (id === 'top_spinach') return 600;
    return 800; // デフォルト
  };

  const handlePurchaseSoupIngredient = (id: string, name: string, cost: number) => {
    if (saveState.cash < cost) {
      onAlertMessage('資金が足りません！');
      return;
    }

    onUpdateSaveState((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      unlockedIngredients: [...prev.unlockedIngredients, id],
    }));

    onAlertMessage(`🔓 新しいスープ素材「${name}」を仕入れ買付しました！開発スロットで使用可能です。`);
  };

  const handlePurchaseTopping = (id: string, name: string, cost: number) => {
    if (saveState.cash < cost) {
      onAlertMessage('資金が足りません！');
      return;
    }

    onUpdateSaveState((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      unlockedToppings: [...prev.unlockedToppings, id],
    }));

    onAlertMessage(`🔓 新しいトッピング「${name}」を仕入れ買付しました！丼へ盛り付け可能です。`);
  };

  return (
    <div id="gacha_market_root" className="w-full bg-white rounded-2xl border-2 sm:border-4 border-[#E0C097] p-3 text-[#4A2C2A] h-[calc(100vh-100px)] sm:h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      {/* 画面ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#E0C097]/40 pb-2 flex-shrink-0">
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#D32F2F] flex items-center gap-1.5 leading-tight">
            🪵 仕入れ市場 ＆ 素材研究工房
          </h2>
          <p className="text-[10px] sm:text-xs text-gray-550 font-bold leading-none mt-0.5">
            稼いだ資金を原材料のアップグレード、トッピング具材ライセンスの買付に投資して、全開発メニューの味わいを高めよう！
          </p>
        </div>

        {/* 所持金表示 */}
        <div className="bg-[#FFFBF0] border border-[#E0C097] px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono text-[10px] sm:text-xs shadow-sm w-fit self-end sm:self-auto">
          <span className="text-gray-400 block font-sans font-bold">手元資金:</span>
          <span className="font-extrabold text-emerald-600">{saveState.cash} G</span>
        </div>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-1.5 bg-[#FFFBF0]/60 p-1 rounded-xl w-fit border border-[#E0C097]/40 mt-2 flex-shrink-0">
        <button
          onClick={() => setActiveTab('upgrade')}
          className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition flex items-center gap-1 cursor-pointer ${
            activeTab === 'upgrade' ? 'bg-[#FBC02D] text-[#4A2C2A] shadow-sm' : 'text-gray-505 hover:bg-white/60'
          }`}
        >
          <ArrowUp size={11.5} />
          <span>① 原材料のアップグレード</span>
        </button>
        <button
          onClick={() => setActiveTab('shop')}
          className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition flex items-center gap-1 cursor-pointer ${
            activeTab === 'shop' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-505 hover:bg-white/60'
          }`}
        >
          <ShoppingBag size={11.5} />
          <span>② 仕入れ市場 (ライセンス買付)</span>
        </button>
      </div>

      {/* ==================== スクロール可能な中身 ==================== */}
      <div className="flex-1 overflow-y-auto mt-2.5 pr-0.5 min-h-0 pb-2">
        {/* ==================== 1. レベルアップ（強化） ==================== */}
        {activeTab === 'upgrade' && (
          <div id="material_upgrade_section" className="space-y-3 animate-fade-in">
            <div className="bg-[#FFFBF0] p-2.5 border border-[#E0C097] rounded-xl leading-normal text-[10px] text-gray-500 font-bold">
              💡 <span className="font-extrabold text-[#D32F2F]">素材レベルアップの恩恵:</span> アップグレードを行うと、ラーメン開発時に得られる『旨味・コク・香り』のステータス値が<span className="text-[#D32F2F] font-black">1レベルごとに10%</span>加算されベース素材の潜在力が飛躍します！
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allSoupIngredients
                .filter((ing) => saveState.unlockedIngredients.includes(ing.id))
                .map((ing) => {
                  const currentLevel = saveState.ingredientLevels[ing.id] || 1;
                  const cost = getUpgradeCost(ing.id, currentLevel);
                  const canAfford = saveState.cash >= cost;

                  return (
                    <div
                      key={ing.id}
                      id={`upgrade-card-${ing.id}`}
                      className="bg-white border border-[#E0C097]/70 p-3 rounded-xl shadow-sm hover:border-[#D32F2F] transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* 上段 */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-2xl filter drop-shadow flex-shrink-0">{ing.emoji}</span>
                            <div className="min-w-0 pr-1">
                              <h3 className="text-[11px] sm:text-xs font-black text-[#4A2C2A] truncate">{ing.name}</h3>
                              <span className="text-[8px] text-gray-400 font-bold">
                                {ing.category === 'sauce' ? 'タレ' :
                                 ing.category === 'gala' ? '肉・ガラ' :
                                 ing.category === 'seafood' ? '魚介' :
                                 ing.category === 'vegetable' ? '野菜' : '香味油'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-[#FFF9E6] border border-[#C49000]/40 text-[#D32F2F] font-black font-mono text-[9px] px-2 py-0.5 rounded-full flex-shrink-0">
                            Lv.{currentLevel}
                          </div>
                        </div>

                        {/* ステータス */}
                        <div className="grid grid-cols-3 gap-1 py-1.5 my-2 border-t border-b border-gray-100 text-[8.5px] font-mono text-gray-500 text-center font-bold">
                          <div>
                            <span className="block text-gray-400">出汁旨味</span>
                            <span className="font-extrabold text-[#4A2C2A]">
                              {ing.dashi} <span className="text-[8px] text-[#D32F2F]">+{Math.round(ing.dashi * currentLevel * 0.1)}</span>
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-400">濃厚コク</span>
                            <span className="font-extrabold text-[#4A2C2A]">
                              {ing.koku} <span className="text-[8px] text-[#D32F2F]">+{Math.round(ing.koku * currentLevel * 0.1)}</span>
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-400">風味香り</span>
                            <span className="font-extrabold text-[#4A2C2A]">
                              {ing.aroma} <span className="text-[8px] text-[#D32F2F]">+{Math.round(ing.aroma * currentLevel * 0.1)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* レベルアップボタン */}
                      <button
                        id={`btn_upgrade_${ing.id}`}
                        onClick={() => handleUpgradeIngredient(ing)}
                        className={`w-full py-1.5 px-3 rounded-lg text-[9.5px] font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                          canAfford
                            ? 'bg-[#FBC02D] text-[#4A2C2A] border-b-2 border-[#C49000] hover:bg-[#F9A825] active:border-b-0 shadow-sm'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-150'
                        }`}
                      >
                        <ArrowUp size={11} />
                        <span>レベルアップ ({cost} G)</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ==================== 2. 新規買付ショップ ==================== */}
        {activeTab === 'shop' && (
          <div id="liquor_market_section" className="space-y-4 animate-fade-in pb-2">
            {/* A. スープの新規素材 */}
            <div className="space-y-2">
              <h3 className="text-[10px] sm:text-xs font-black text-[#D32F2F] border-b border-[#E0C097]/40 pb-1 flex items-center gap-1.5">
                <span>🧪 未契約のスープ素材 ({lockedSoupIngredients.length})</span>
              </h3>

              {lockedSoupIngredients.length === 0 ? (
                <p className="text-[9.5px] text-gray-400 italic font-bold">すべてのスープ素材を取得完了しております！</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {lockedSoupIngredients.map((ing) => {
                    const cost = getIngredientPurchaseCost(ing.category);
                    const canAfford = saveState.cash >= cost;

                    return (
                      <div
                        key={ing.id}
                        className="bg-white border border-[#E0C097]/70 p-3 rounded-xl flex flex-col justify-between shadow-sm"
                      >
                        <div className="flex gap-2 min-w-0">
                          <span className="text-2.5xl flex-shrink-0">{ing.emoji}</span>
                          <div className="min-w-0">
                            <h4 className="text-[11px] sm:text-xs font-black text-[#4A2C2A] truncate">{ing.name}</h4>
                            <p className="text-[9px] text-gray-500 font-medium mt-0.5 line-clamp-2 leading-normal">{ing.description}</p>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[9px] text-emerald-600 font-mono font-extrabold">買付料: {cost} G</span>
                          <button
                            id={`btn_buy_${ing.id}`}
                            onClick={() => handlePurchaseSoupIngredient(ing.id, ing.name, cost)}
                            disabled={!canAfford}
                            className={`py-1 px-2.5 rounded-lg text-[9px] font-black transition cursor-pointer ${
                              canAfford
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                                : 'bg-gray-50 text-gray-450 cursor-not-allowed border border-gray-150'
                            }`}
                          >
                            買付仕入れ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* B. 未開放のトッピング */}
            <div className="space-y-2 pt-2">
              <h3 className="text-[10px] sm:text-xs font-black text-[#D32F2F] border-b border-[#E0C097]/40 pb-1 flex items-center gap-1.5">
                <span>🥩 未契約のトッピング具材 ({lockedToppings.length})</span>
              </h3>

              {lockedToppings.length === 0 ? (
                <p className="text-[9.5px] text-gray-400 italic font-bold">すべての追加トッピングを取得完了しております！</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {lockedToppings.map((top) => {
                    const cost = getToppingPurchaseCost(top.id);
                    const canAfford = saveState.cash >= cost;

                    return (
                      <div
                        key={top.id}
                        className="bg-white border border-[#E0C097]/70 p-3 rounded-xl flex flex-col justify-between shadow-sm"
                      >
                        <div className="flex gap-2 min-w-0">
                          <span className="text-2.5xl flex-shrink-0">{top.emoji}</span>
                          <div className="min-w-0">
                            <h4 className="text-[11px] sm:text-xs font-black text-[#4A2C2A] truncate">{top.name}</h4>
                            <p className="text-[9px] text-gray-500 font-medium mt-0.5 line-clamp-2 leading-normal">{top.description}</p>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[9px] text-emerald-600 font-mono font-extrabold">買付料: {cost} G</span>
                          <button
                            id={`btn_buy_${top.id}`}
                            onClick={() => handlePurchaseTopping(top.id, top.name, cost)}
                            disabled={!canAfford}
                            className={`py-1 px-2.5 rounded-lg text-[9px] font-black transition cursor-pointer ${
                              canAfford
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                                : 'bg-gray-50 text-gray-450 cursor-not-allowed border border-gray-150'
                            }`}
                          >
                            買付仕入れ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
