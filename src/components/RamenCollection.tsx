/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameSaveState, Ramen, SoupIngredient, Topping } from '../types';
import ToppingCanvas from './ToppingCanvas';
import { BookOpen } from 'lucide-react';

interface RamenCollectionProps {
  saveState: GameSaveState;
  allSoupIngredients: SoupIngredient[];
  allToppings: Topping[];
  onUpdateSaveState: (updater: (prev: GameSaveState) => GameSaveState) => void;
  onAlertMessage: (msg: string) => void;
}

export default function RamenCollection({
  saveState,
  allSoupIngredients,
  allToppings,
  onUpdateSaveState,
  onAlertMessage,
}: RamenCollectionProps) {
  const [selectedRamenId, setSelectedRamenId] = useState<string | null>(null);

  const activeRamen = saveState.ramenRecipes.find((r) => r.id === selectedRamenId);

  // 提供中メニューの最大登録数（知名度、ファン数により拡張。最初は2、後で3に増える）
  const maxMenuSlots = saveState.famous >= 1000 ? 4 : saveState.famous >= 250 ? 3 : 2;

  // メニュー登録を切り替える
  const toggleMenuRegistration = (ramenId: string) => {
    onUpdateSaveState((prev) => {
      let currentMenu = [...prev.activeMenuIds];
      const isRegistered = currentMenu.includes(ramenId);

      if (isRegistered) {
        currentMenu = currentMenu.filter((id) => id !== ramenId);
        onAlertMessage('メニュー提供リストから外しました。');
      } else {
        if (currentMenu.length >= maxMenuSlots) {
          onAlertMessage(`メニュー登録上限に達しています！(最大: ${maxMenuSlots}枠)※知名度アップで解放`);
          return prev;
        }
        currentMenu.push(ramenId);
        onAlertMessage('メニューに新しく登録しました！');
      }
      return { ...prev, activeMenuIds: currentMenu };
    });
  };

  return (
    <div id="ramen_cookbook_root" className="w-full max-w-6xl mx-auto text-slate-200 h-[calc(100vh-100px)] sm:h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-900">
      
      {/* 画面ヘッダー */}
      <div className="border-b border-slate-900 pb-1 flex-shrink-0">
        <h2 className="text-sm sm:text-base font-black bg-gradient-to-r from-teal-400 to-amber-400 bg-clip-text text-transparent flex items-center gap-1">
          📖 秘伝レシピ・お品書き図鑑
        </h2>
        <p className="text-[9px] sm:text-xs text-slate-400 leading-none mt-0.5">
          販売メニュー設定（最大{maxMenuSlots}枠。余白をタップして詳細確認）
        </p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden mt-2">
        {/* 左側：開発レシピ一覧リスト */}
        <div className="lg:col-span-6 space-y-2 flex flex-col min-h-0 overflow-hidden">
          <label className="text-[10px] font-bold text-slate-400">🔖 レシピリスト ({saveState.ramenRecipes.length}種)</label>

          {saveState.ramenRecipes.length === 0 ? (
            <div id="no_recipes_splash" className="bg-slate-900 border border-slate-850 p-6 rounded-xl text-center space-y-2 flex-1 flex flex-col items-center justify-center">
              <BookOpen size={30} className="text-slate-600" />
              <p className="text-xxs text-slate-400 leading-normal">
                まだ開発が完了したラーメンがありません。<br />
                「開発」タブからラーメンを創作してください！
              </p>
            </div>
          ) : (
            <div id="recipes_flex_grid" className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0">
              {saveState.ramenRecipes.map((ramen) => {
                const isRegistered = saveState.activeMenuIds.includes(ramen.id);
                const isSelected = selectedRamenId === ramen.id;

                return (
                  <div
                    key={ramen.id}
                    id={`recipe-row-${ramen.id}`}
                    onClick={() => setSelectedRamenId(ramen.id)}
                    className={`p-2.5 border rounded-xl relative transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-teal-400 ring-1 ring-teal-400/20 shadow'
                        : 'bg-slate-900/40 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 pr-4 min-w-0 flex-1">
                      <span className="text-xl">🍜</span>
                      <div className="truncate">
                        <h3 className="text-xxs sm:text-xs font-bold text-slate-100 truncate leading-tight">
                          {ramen.name}
                        </h3>
                        <div className="mt-0.5 flex flex-wrap gap-x-2 text-[9px] font-mono text-slate-400 leading-tight">
                          <div>
                            <span className="text-slate-500">美味:</span> <span className="font-bold text-amber-500">{ramen.score}点</span>
                          </div>
                          <div>
                            <span className="text-slate-500">売価:</span> <span className="font-bold text-emerald-400">{ramen.price}G</span>
                          </div>
                          <div>
                            <span className="text-slate-500">累計:</span> <span className="font-bold text-teal-400">{ramen.salesCount}杯</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* メニュー登録ボタン */}
                    <button
                      id={`btn_toggle_menu_${ramen.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenuRegistration(ramen.id);
                      }}
                      className={`flex flex-col items-center justify-center py-0.5 px-2 rounded-lg border font-bold transition flex-shrink-0 z-10 text-[9px] leading-tight ${
                        isRegistered
                          ? 'bg-emerald-950 border-emerald-800 text-emerald-400 hover:bg-emerald-900'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <span>{isRegistered ? '販売中 💮' : '提供する'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 右側：選択したラーメンの詳細ビジュアル＆分析レポート */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-850 p-3.5 rounded-2xl shadow flex flex-col min-h-0 overflow-y-auto">
          {activeRamen ? (
            <div id="ramen_inspect_details" className="space-y-3 animate-fade-in flex flex-col items-center">
              <span className="text-[9px] font-mono text-teal-400 uppercase tracking-widest block font-bold self-start">
                【個別分析レシピ】
              </span>

              {/* 盛り付けビジュアル */}
              <div className="scale-75 select-none -my-4 flex-shrink-0">
                <ToppingCanvas
                  soupIngredients={activeRamen.soupIngredients}
                  noodle={activeRamen.noodle}
                  toppings={activeRamen.toppings}
                  onToppingsChange={() => {}}
                  availableToppings={allToppings}
                  selectedToppingId={null}
                  readOnly={true}
                />
              </div>

              <div className="w-full space-y-2 text-xxs">
                <div className="text-center">
                  <h3 className="text-xs sm:text-sm font-black text-slate-100">{activeRamen.name}</h3>
                  <p className="mt-0.5 text-[10px] text-slate-400 bg-slate-950 py-0.5 px-2 rounded-full inline-block font-mono border border-slate-900">
                    麺:{' '}
                    {activeRamen.noodle.thickness === 'ultra_fine' ? '極細' :
                     activeRamen.noodle.thickness === 'fine' ? '細' :
                     activeRamen.noodle.thickness === 'medium' ? '中' :
                     activeRamen.noodle.thickness === 'thick' ? '太' : '極太'}{' '}
                    / {activeRamen.noodle.waviness === 'straight' ? 'ストレート' : 'ちぢれ'}
                  </p>
                </div>

                {/* 5指標メーター */}
                <div className="space-y-1.5 bg-slate-950 p-2.5 border border-slate-900 rounded-xl font-mono text-[10px]">
                  <div className="flex justify-between items-center bg-slate-900 p-1.5 rounded border border-slate-850">
                    <span className="font-bold text-amber-400">🏅 総合評価:</span>
                    <span className="font-black text-white">{activeRamen.score} 点</span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-500 text-[9px]">
                        <span>味わい:</span>
                        <span className="font-bold text-slate-300">{activeRamen.taste}</span>
                      </div>
                      <div className="bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full" style={{ width: `${Math.min(100, (activeRamen.taste / 300) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-500 text-[9px]">
                        <span>コク:</span>
                        <span className="font-bold text-slate-300">{activeRamen.richness}</span>
                      </div>
                      <div className="bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-orange-400 h-full" style={{ width: `${Math.min(100, (activeRamen.richness / 250) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-500 text-[9px]">
                        <span>香り:</span>
                        <span className="font-bold text-slate-300">{activeRamen.aroma}</span>
                      </div>
                      <div className="bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-purple-400 h-full" style={{ width: `${Math.min(100, (activeRamen.aroma / 180) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-500 text-[9px]">
                        <span>見栄え:</span>
                        <span className="font-bold text-slate-300">{activeRamen.visual} pt</span>
                      </div>
                      <div className="bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-pink-400 h-full" style={{ width: `${Math.min(100, (activeRamen.visual / 180) * 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-900 flex justify-between text-[8px] text-slate-400">
                    <span>原価: <span className="text-emerald-400 font-bold">{activeRamen.cost}G</span></span>
                    <span>販売価格: <span className="text-amber-400 font-bold">{activeRamen.price}G</span></span>
                  </div>
                </div>

                {/* スープに使用した具材たちのアイコン */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-sans block font-bold">🧪 投入出汁素材</span>
                  <div className="flex flex-wrap gap-1">
                    {activeRamen.soupIngredients.map((id, idx) => {
                      const ing = allSoupIngredients.find(i => i.id === id);
                      if (!ing) return null;
                      return (
                        <span key={idx} className="bg-slate-950 border border-slate-900 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">
                          {ing.emoji} {ing.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div id="no_inspections_placeholder" className="my-auto flex flex-col items-center justify-center text-center py-10">
              <BookOpen size={30} className="text-slate-600 animate-pulse" />
              <h3 className="text-xxs font-bold text-slate-500 mt-2">
                ← レシピ一覧から確認するラーメンを選択してください
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
