/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameSaveState, Ramen } from './types';
import { SOUP_INGREDIENTS, TOPPINGS } from './data';
import ShopManagement from './components/ShopManagement';
import RamenCreator from './components/RamenCreator';
import RamenCollection from './components/RamenCollection';
import ContestSection from './components/ContestSection';
import GachaOrMarket from './components/GachaOrMarket';
import { ChefHat, BookOpen, Trophy, ShoppingBag, Store, RotateCcw, AlertCircle, VolumeX, Volume2 } from 'lucide-react';

const SAVE_KEY = 'kodawari_ramen_sim_save_v1';

const INITIAL_STATE: GameSaveState = {
  cash: 2500,               // 初期所持金 (G)
  famous: 0,                // 知名度・ファン数
  day: 1,                   // 経過日数
  unlockedIngredients: [
    'sauce_shoyu',
    'sauce_shio',
    'gala_chicken',
    'veg_negi',
    'veg_onion',
    'oil_lard'
  ],
  unlockedToppings: [
    'top_chashu',
    'top_menma',
    'top_negi',
    'top_naruto',
    'top_moyashi'
  ],
  ingredientLevels: {
    sauce_shoyu: 1,
    sauce_shio: 1,
    gala_chicken: 1,
    veg_negi: 1,
    veg_onion: 1,
    oil_lard: 1
  },
  ramenRecipes: [],
  activeMenuIds: [],
  completedContestIds: []
};

export default function App() {
  const [saveState, setSaveState] = useState<GameSaveState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'shop' | 'creator' | 'cookbook' | 'contest' | 'market'>('shop');
  
  // トースト notification
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // 1. ローカルストレージからセーブデータのロード
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // フィールドが欠損している場合の安全フォールバック
        const merged: GameSaveState = {
          ...INITIAL_STATE,
          ...parsed,
          ingredientLevels: {
            ...INITIAL_STATE.ingredientLevels,
            ...(parsed.ingredientLevels || {}),
          },
        };
        setSaveState(merged);
      }
    } catch (e) {
      console.error('Failed to load save state', e);
    }
  }, []);

  // 2. セーブデータが更新されたらローカルストレージに保存
  const updateSaveState = (updater: (prev: GameSaveState) => GameSaveState) => {
    setSaveState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to write save state', e);
      }
      return next;
    });
  };

  // 全リセット処理
  const handleResetGame = () => {
    if (confirm('最初からゲームをやり直しますか？（セーブデータが完全に消去されます）')) {
      localStorage.removeItem(SAVE_KEY);
      setSaveState(INITIAL_STATE);
      setActiveTab('shop');
      showAlert('🛠️ ゲームデータが初期化されました。新店舗としてスタートします！');
    }
  };

  // 簡易アラートメッセージ表示
  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => {
      setAlertMessage((current) => current === msg ? null : current);
    }, 4500);
  };

  // ラーメンが新しく開発完了したとき
  const handleRamenCreated = (newRamen: Ramen) => {
    updateSaveState((prev) => {
      const updatedRecipes = [...prev.ramenRecipes, newRamen];
      // 自動的に最初のレシピならメニューに設定
      const updatedMenu = prev.activeMenuIds.length === 0 ? [newRamen.id] : prev.activeMenuIds;
      
      return {
        ...prev,
        ramenRecipes: updatedRecipes,
        activeMenuIds: updatedMenu,
      };
    });

    showAlert(`✨ 伝説の1杯「${newRamen.name}」が新開発されました！(評価スコア: ${newRamen.score}点)`);
    setActiveTab('cookbook'); // 図鑑(メニュー設定)へ移動
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF8E7] text-[#4A2C2A] font-sans select-none antialiased overflow-hidden">
      {/* 共通トップグローバルバー */}
      <header className="bg-[#D32F2F] border-b-2 border-[#8B0000] shadow-sm flex-shrink-0 z-40">
        <div className="max-w-6xl mx-auto px-3 py-1.5 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-yellow-400 shadow-inner">
              <span className="text-sm filter drop-shadow">🍜</span>
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black text-white italic tracking-tight leading-none">
                こだわりラーメン館
              </h1>
            </div>
          </div>

          {/* セーブ状態メタ */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-xxs sm:text-xs">
            <div className="flex flex-col items-center bg-[#8B0000] py-0.5 px-2 rounded-md border border-red-500/10">
              <span className="text-[8px] text-red-200">知名度</span>
              <span className="font-bold text-yellow-300 font-mono text-[9px] sm:text-xxs">{saveState.famous} 人</span>
            </div>
            
            <div className="flex flex-col items-center bg-[#8B0000] py-0.5 px-2 rounded-md border border-red-500/10 font-mono">
              <span className="text-[8px] text-red-200">資金</span>
              <span className="font-bold text-yellow-300 text-[9px] sm:text-xxs">{saveState.cash} G</span>
            </div>

            <button
              id="btn_reset_save"
              onClick={handleResetGame}
              className="p-1 bg-[#8B0000] hover:bg-[#a11111] text-red-200 hover:text-white rounded-md border border-red-500/10 transition"
              title="リセット"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>
      </header>

      {/* メインタブナビゲーション */}
      <nav className="bg-[#D32F2F] border-b-2 border-[#8B0000] flex-shrink-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-1.5 py-0.5 flex gap-0.5 justify-around items-center select-none">
          {/* 1. 店舗 */}
          <button
            id="tab_shop"
            onClick={() => setActiveTab('shop')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 rounded transition duration-200 cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-[#FBC02D] text-[#4A2C2A] font-black'
                : 'text-white hover:bg-[#8B0000]'
            }`}
          >
            <Store size={12} />
            <span className="text-[9px] sm:text-xs font-bold">店舗</span>
          </button>

          {/* 2. 開発 */}
          <button
            id="tab_creator"
            onClick={() => setActiveTab('creator')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 rounded transition duration-200 cursor-pointer ${
              activeTab === 'creator'
                ? 'bg-[#FBC02D] text-[#4A2C2A] font-black'
                : 'text-white hover:bg-[#8B0000]'
            }`}
          >
            <ChefHat size={12} />
            <span className="text-[9px] sm:text-xs font-bold">開発</span>
          </button>

          {/* 3. 図鑑メニュー */}
          <button
            id="tab_cookbook"
            onClick={() => setActiveTab('cookbook')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 rounded transition duration-200 cursor-pointer ${
              activeTab === 'cookbook'
                ? 'bg-[#FBC02D] text-[#4A2C2A] font-black'
                : 'text-white hover:bg-[#8B0000]'
            }`}
          >
            <BookOpen size={12} />
            <span className="text-[9px] sm:text-xs font-bold">レシピ</span>
          </button>

          {/* 4. 品評会 */}
          <button
            id="tab_contest"
            onClick={() => setActiveTab('contest')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 rounded transition duration-200 cursor-pointer ${
              activeTab === 'contest'
                ? 'bg-[#FBC02D] text-[#4A2C2A] font-black'
                : 'text-white hover:bg-[#8B0000]'
            }`}
          >
            <Trophy size={12} />
            <span className="text-[9px] sm:text-xs font-bold">品評会</span>
          </button>

          {/* 5. 買い出し仕入れ */}
          <button
            id="tab_market"
            onClick={() => setActiveTab('market')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 rounded transition duration-200 cursor-pointer ${
              activeTab === 'market'
                ? 'bg-[#FBC02D] text-[#4A2C2A] font-black'
                : 'text-white hover:bg-[#8B0000]'
            }`}
          >
            <ShoppingBag size={12} />
            <span className="text-[9px] sm:text-xs font-bold">買い出し</span>
          </button>
        </div>
      </nav>

      {/* メインステージコンテンツ */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-3 sm:p-5 pb-6 overflow-y-auto overflow-x-hidden">
        {activeTab === 'shop' && (
          <ShopManagement
            saveState={saveState}
            onUpdateSaveState={updateSaveState}
            onNavigateToCreator={() => setActiveTab('creator')}
          />
        )}

        {activeTab === 'creator' && (
          <RamenCreator
            saveState={saveState}
            allSoupIngredients={SOUP_INGREDIENTS}
            allToppings={TOPPINGS}
            onComplete={handleRamenCreated}
            onCancel={() => setActiveTab('shop')}
          />
        )}

        {activeTab === 'cookbook' && (
          <RamenCollection
            saveState={saveState}
            allSoupIngredients={SOUP_INGREDIENTS}
            allToppings={TOPPINGS}
            onUpdateSaveState={updateSaveState}
            onAlertMessage={showAlert}
          />
        )}

        {activeTab === 'contest' && (
          <ContestSection
            saveState={saveState}
            onUpdateSaveState={updateSaveState}
            onUnlockNewAsset={(type, id, name) => {
              showAlert(`🎁 新規${type === 'topping' ? 'トッピング' : 'スープ素材'}「${name}」をアンロック！`);
            }}
          />
        )}

        {activeTab === 'market' && (
          <GachaOrMarket
            saveState={saveState}
            allSoupIngredients={SOUP_INGREDIENTS}
            allToppings={TOPPINGS}
            onUpdateSaveState={updateSaveState}
            onAlertMessage={showAlert}
          />
        )}
      </main>

      {/* トースト通知ポップアップ */}
      {alertMessage && (
        <div id="toast_notification" className="fixed bottom-6 right-6 bg-white border-2 border-[#E0C097] text-[#4A2C2A] text-xs py-3 px-4 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 animate-fade-in max-w-sm">
          <span className="text-xl">✨</span>
          <p className="font-bold leading-relaxed">{alertMessage}</p>
        </div>
      )}
    </div>
  );
}
