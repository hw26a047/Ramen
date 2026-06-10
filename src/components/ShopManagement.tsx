/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameSaveState, Ramen, ActiveCustomer, CustomerType } from '../types';
import { CUSTOMERS } from '../data';
import { Play, TrendingUp, Users, Award, ShieldAlert, CheckCircle, Flame } from 'lucide-react';

interface ShopManagementProps {
  saveState: GameSaveState;
  onUpdateSaveState: (updater: (prev: GameSaveState) => GameSaveState) => void;
  onNavigateToCreator: () => void;
}

export default function ShopManagement({
  saveState,
  onUpdateSaveState,
  onNavigateToCreator,
}: ShopManagementProps) {
  const [isOperating, setIsOperating] = useState(false); // 営業中フラグ
  const [timeRemaining, setTimeRemaining] = useState(0); // 本日の残り営業秒 (1日 = 45秒)
  const [activeCustomers, setActiveCustomers] = useState<ActiveCustomer[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [dailyCustomersCount, setDailyCustomersCount] = useState(0);
  const [dailySatisfiedCount, setDailySatisfiedCount] = useState(0);
  const [popularRamenSales, setPopularRamenSales] = useState<Record<string, number>>({});
  
  // レポートモーダルの表示
  const [showReport, setShowReport] = useState(false);
  const [dailyEarnedFamous, setDailyEarnedFamous] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const operatingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const customerSpawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // メニュー登録されているラーメンリストを取得
  const activeMenuRamen = saveState.ramenRecipes.filter((r) =>
    saveState.activeMenuIds.includes(r.id)
  );

  // カウンター席（例えば５席分）の占有状態
  const [seats, setSeats] = useState<(string | null)[]>([null, null, null, null, null]);

  // 開放済みのお客さんタイプ
  const unlockedCustomerTypes = CUSTOMERS.filter(
    (c) => saveState.famous >= c.unlockedAtFamous
  );

  // 1. 営業開始
  const startOperation = () => {
    if (activeMenuRamen.length === 0) {
      alert('販売メニュー（ラーメン）を1つ以上登録してください！メニュー画面から登録できます。');
      return;
    }
    
    setIsOperating(true);
    setTimeRemaining(45); // 45秒営業
    setDailyRevenue(0);
    setDailyCustomersCount(0);
    setDailySatisfiedCount(0);
    setPopularRamenSales({});
    setDailyEarnedFamous(0);
    setActiveCustomers([]);
    setSeats([null, null, null, null, null]);
    setShowReport(false);
  };

  // 2. お客さんのスポーンロジックと、時間進行
  useEffect(() => {
    if (!isOperating) return;

    // 2.1 ゲーム内時間の進行
    operatingTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endOperation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 2.2 お客さんの来店頻度（知名度が高いほど来店頻度が上がる）
    const spawnRate = Math.max(1200, 4500 - saveState.famous * 0.8); // 1.2秒〜4.5秒に1人
    customerSpawnTimerRef.current = setInterval(() => {
      spawnCustomer();
    }, spawnRate);

    return () => {
      if (operatingTimerRef.current) clearInterval(operatingTimerRef.current);
      if (customerSpawnTimerRef.current) clearInterval(customerSpawnTimerRef.current);
    };
  }, [isOperating, activeCustomers, seats, saveState.famous]);

  // 2.3 お客さんを1人生成して店舗へ誘導
  const spawnCustomer = () => {
    if (unlockedCustomerTypes.length === 0) return;

    // 空き席を探す
    const emptySeatIndex = seats.findIndex((seat) => seat === null);
    if (emptySeatIndex === -1) {
      // 満席の場合はしばらく来ない、または待機列(簡易のために今回はスルー、もしくは確率で諦めて帰る)
      return;
    }

    // ランダムにタイプを選ぶ
    const randomType = unlockedCustomerTypes[Math.floor(Math.random() * unlockedCustomerTypes.length)];
    
    // 客インスタンスを作成
    const newCust: ActiveCustomer = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      typeId: randomType.id,
      state: 'entering',
      yOffset: -50, // 入口から歩いてくる表現
      xPosition: emptySeatIndex, // 座席位置をもっておく
      patienceRemaining: randomType.patience,
      selectedRamenId: null,
      eatTimeRemaining: 6, // 6秒で食べる
      feedbackEmoji: '😋',
      feedbackText: '何にしようかな？',
      paidAmount: 0
    };

    // 席を抑える
    const newSeats = [...seats];
    newSeats[emptySeatIndex] = newCust.id;
    setSeats(newSeats);

    setActiveCustomers((prev) => [...prev, newCust]);
    setDailyCustomersCount((prev) => prev + 1);
  };

  // 3. お客さんの状態エミュレーション（毎秒更新）
  useEffect(() => {
    if (!isOperating) return;

    const gameLoop = setInterval(() => {
      setActiveCustomers((prevCustomers) => {
        return prevCustomers.map((cust) => {
          const type = CUSTOMERS.find((c) => c.id === cust.typeId)!;
          
          if (cust.state === 'entering') {
            // 入店フェーズ -> 席に着く
            return {
              ...cust,
              state: 'waiting',
              yOffset: 0,
              feedbackText: '注文中...',
              feedbackEmoji: '💭'
            };
          }

          if (cust.state === 'waiting') {
            // 注文待ちフェーズ：購入するラーメンを決定
            // 好みのラーメンを予算とステータスを突き合わせて評価
            let bestRamen: Ramen | null = null;
            let bestScore = -999;

            activeMenuRamen.forEach((ramen) => {
              let fitness = 100;

              // 予算チェック。大幅オーバーは絶対に買わない
              if (ramen.price > type.budget) {
                fitness -= 200; // 予算オーバーは大きな減点
              } else if (ramen.price <= type.budget * 0.8) {
                fitness += 20;  // 懐に優しいと嬉しい
              }

              // 太さの好み
              if (type.preferredThickness.includes(ramen.noodle.thickness)) {
                fitness += 40;
              } else {
                fitness -= 20;
              }

              // ちぢれの好み
              if (type.preferredWaviness.includes(ramen.noodle.waviness)) {
                fitness += 20;
              }

              // コクと旨味の最低ライン
              if (ramen.richness >= type.minRichness) fitness += 30;
              else fitness -= 30;

              if (ramen.taste >= type.minTaste) fitness += 40;
              else fitness -= 40;

              if (fitness > bestScore) {
                bestScore = fitness;
                bestRamen = ramen;
              }
            });

            // 注文の意思決定
            if (bestRamen && bestScore > 0) {
              const r = bestRamen as Ramen;
              // 注文して食べ始める
              const finalPrice = r.price;
              
              // 満足度を元にフィードバック
              let emoji = '😋';
              let text = 'うまい！';
              let satisfyBonus = 0;

              if (bestScore > 150) {
                emoji = '🥰';
                text = '極上コンボ！至高の一杯だ！';
                satisfyBonus = 2; // 大満足
              } else if (bestScore < 30) {
                emoji = '😐';
                text = 'まあまあかな、少し高すぎる';
                satisfyBonus = 0; // 不満
              } else {
                emoji = '😋';
                text = '美味しいね、スープが染みる！';
                satisfyBonus = 1; // 満足
              }

              // 売り上げ加算
              setDailyRevenue((prev) => prev + finalPrice);
              if (satisfyBonus > 0) {
                setDailySatisfiedCount((prev) => prev + 1);
              }

              // ラーメンの調理・販売数集計
              setPopularRamenSales((prev) => ({
                ...prev,
                [r.id]: (prev[r.id] || 0) + 1,
              }));

              // 知名度（評判）ボーナス蓄積
              setDailyEarnedFamous((prev) => prev + satisfyBonus * 3);

              return {
                ...cust,
                state: 'eating',
                selectedRamenId: r.id,
                eatTimeRemaining: 5,
                feedbackEmoji: emoji,
                feedbackText: text,
                paidAmount: finalPrice
              };
            } else {
              // 食べたいラーメンがない、または高すぎる
              const noMatchText = bestRamen && (bestRamen as Ramen).price > type.budget 
                ? '高すぎて手が出ないよ...' 
                : '食べたいラーメンがないな...';

              return {
                ...cust,
                state: 'leaving',
                yOffset: -50,
                feedbackEmoji: '😰',
                feedbackText: noMatchText,
              };
            }
          }

          if (cust.state === 'eating') {
            if (cust.eatTimeRemaining > 1) {
              // ずるずる食べている
              return {
                ...cust,
                eatTimeRemaining: cust.eatTimeRemaining - 1,
                feedbackEmoji: '🍜',
                feedbackText: 'ずるずる...'
              };
            } else {
              // 完食。退店フェーズ
              return {
                ...cust,
                state: 'leaving',
                yOffset: -50,
                feedbackEmoji: '✨',
                feedbackText: 'ごちそうさま！また来るよ！',
              };
            }
          }

          if (cust.state === 'leaving') {
            // 退店処理 - 席を開放
            setTimeout(() => {
              setSeats((prevSeats) => {
                const s = [...prevSeats];
                s[cust.xPosition] = null;
                return s;
              });
              setActiveCustomers((prev) => prev.filter((c) => c.id !== cust.id));
            }, 800);
            return {
              ...cust,
              isCleanedUp: true,
            };
          }

          return cust;
        }).filter((c) => !(c as any).isCleanedUp);
      });
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [isOperating, activeMenuRamen]);

  // 4. 営業終了処理
  const endOperation = () => {
    setIsOperating(false);
    if (operatingTimerRef.current) clearInterval(operatingTimerRef.current);
    if (customerSpawnTimerRef.current) clearInterval(customerSpawnTimerRef.current);

    // セーブステートに売り上げを反映
    onUpdateSaveState((prev) => {
      const updatedRecipes = prev.ramenRecipes.map((recipe) => {
        const soldToday = popularRamenSales[recipe.id] || 0;
        return {
          ...recipe,
          salesCount: recipe.salesCount + soldToday,
        };
      });

      return {
        ...prev,
        cash: prev.cash + dailyRevenue,
        famous: Math.max(0, prev.famous + dailyEarnedFamous),
        day: prev.day + 1,
        ramenRecipes: updatedRecipes,
      };
    });

    setShowReport(true);
  };

  return (
    <div id="shop_management_root" className="w-full max-w-6xl mx-auto space-y-6 text-[#4A2C2A]">
      {/* 営業トップステータス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 開店/時間状況 */}
        <div className="bg-white border-4 border-[#E0C097] p-5 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden text-[#4A2C2A]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <span className="text-xxs font-mono text-gray-500 uppercase tracking-widest block mb-1 font-bold">
              現在の活動ステージ
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-[#D32F2F]">{saveState.day}日目</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isOperating ? 'bg-red-100 text-red-600 border border-red-200 animate-pulse' : 'bg-[#FFFBF0] text-gray-500 border border-gray-200'
              }`}>
                {isOperating ? '営業中' : '準備中'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            {isOperating ? (
              <div id="operation_timer_progress" className="w-full bg-[#FFFBF0] p-3 rounded-2xl border border-[#E0C097] flex justify-between items-center">
                <span className="text-xs text-gray-600 font-bold">営業終了まで...</span>
                <span className="text-lg font-black font-mono text-[#D32F2F] animate-pulse">
                  {timeRemaining} 秒
                </span>
              </div>
            ) : (
              <button
                id="btn_start_shop_operation"
                onClick={startOperation}
                className="w-full py-3.5 h-14 bg-[#FBC02D] hover:bg-[#F9A825] border-b-4 border-[#C49000] text-[#4A2C2A] text-xs sm:text-sm font-black rounded-2xl flex items-center justify-center gap-2 group transition-all"
              >
                <Play size={15} fill="#4A2C2A" />
                <span>開店</span>
              </button>
            )}
          </div>
        </div>

        {/* 店舗統計（売上） */}
        <div className="bg-white border-4 border-[#E0C097] p-5 rounded-3xl flex flex-col justify-between shadow-sm text-[#4A2C2A]">
          <div>
            <span className="text-xxs font-mono text-gray-500 uppercase tracking-widest block mb-1 font-bold">
              本日売上 / 資金
            </span>
            <div className="flex items-baseline justify-between">
              <span id="current_operating_cash" className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                {isOperating ? dailyRevenue : saveState.cash} <span className="text-xs">G</span>
              </span>
              {!isOperating && (
                <span className="text-xxs text-gray-400 font-bold">（手元資金）</span>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-4 pt-4 border-t border-gray-150 text-xs text-gray-500 font-mono">
            <div>
              <span className="text-[10px] text-gray-400 block font-bold">来店数:</span>
              <span className="font-bold text-[#4A2C2A]">{dailyCustomersCount} 人</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-bold">知名度（ファン数）:</span>
              <span className="font-bold text-[#D32F2F]">{saveState.famous} 人</span>
            </div>
          </div>
        </div>

        {/* メニュー設定看板 */}
        <div className="bg-white border-4 border-[#E0C097] p-5 rounded-3xl flex flex-col justify-between shadow-sm text-[#4A2C2A]">
          <div>
            <span className="text-xxs font-mono text-gray-500 uppercase tracking-widest block mb-1 font-bold">
              現在の提供中メニュー
            </span>
            {activeMenuRamen.length === 0 ? (
              <div className="bg-red-50 border border-red-200 p-2 text-xs rounded-xl text-red-600 font-bold">
                ⚠️ メニューが未登録です。ラーメンを開発してメニューに設定してください。
              </div>
            ) : (
              <div className="space-y-1.5 mt-1 max-h-24 overflow-y-auto">
                {activeMenuRamen.map((ramen) => (
                  <div key={ramen.id} className="flex justify-between items-center text-xs bg-[#FFFBF0] border border-[#E0C097] px-2.5 py-1 rounded-lg">
                    <span className="font-bold truncate text-[#4A2C2A] w-32">🍜 {ramen.name}</span>
                    <span className="font-mono font-bold text-emerald-600">{ramen.price} G</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isOperating && (
            <div className="mt-3 flex justify-between gap-2">
              <button
                id="btn_shortcut_to_editor"
                onClick={onNavigateToCreator}
                className="w-full py-2 bg-[#FFFBF0] hover:bg-orange-55 border border-[#E0C097] text-[10px] sm:text-xs font-bold text-[#4A2C2A] rounded-xl transition"
              >
                新規ラーメン作成 🛠️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* バーチャル・お食事スペース（ラーメン店の再現レイアウト） */}
      <div id="virtual_restaurant_grid" className="bg-white border-4 border-[#E0C097] rounded-3xl p-3 sm:p-4 shadow-sm relative overflow-hidden min-h-[250px] text-[#4A2C2A]">
        {/* 背景の格子畳・木目模様（レトロ感） */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(224,192,151,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(224,192,151,0.06)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* のれん看板 */}
        <div className="absolute top-0 inset-x-0 h-8 bg-[#D32F2F] border-b-4 border-[#8B0000] shadow flex justify-around items-center select-none z-10">
          <div className="text-white text-[9px] font-bold tracking-widest px-1.5 bg-[#8B0000] rounded">味</div>
          <div className="text-white text-[9px] font-bold tracking-widest px-1.5 bg-[#8B0000] rounded">自</div>
          <div className="text-white text-[9px] font-bold tracking-widest px-1.5 bg-[#8B0000] rounded">慢</div>
          <div className="text-yellow-400 font-serif text-xs font-black italic tracking-widest px-2 sm:px-4">
            こだわり庵
          </div>
          <div className="text-white text-[9px] font-bold tracking-widest px-1.5 bg-[#8B0000] rounded">の</div>
          <div className="text-white text-[9px] font-bold tracking-widest px-1.5 bg-[#8B0000] rounded">れ</div>
          <div className="text-white text-[9px] font-bold tracking-widest px-1.5 bg-[#8B0000] rounded">ん</div>
        </div>

        {/* 厨房スペース (上側) */}
        <div className="h-14 bg-orange-50/60 border border-orange-200 rounded-2xl mb-8 flex justify-around items-center px-3 relative mt-6">
          <span className="absolute -bottom-2 left-4 bg-orange-100 px-2 border border-orange-200 text-[8px] text-[#4A2C2A] font-extrabold rounded-full">
            厨房（ラーメン職人）
          </span>
          <div className="flex gap-2 items-center">
            <span className="text-2xl animate-bounce">🧑‍🍳</span>
            <div className="text-[10px] text-[#4A2C2A] font-mono leading-none">
              <span className="text-[#D32F2F] font-black inline-block mr-1">● 湯沸中</span>
              <span className="text-gray-400 text-[9px]">湯切り完了!</span>
            </div>
          </div>
          {/* 湯気エフェクト */}
          <div className="flex gap-1.5">
            <span className="text-lg animate-pulse filter blur-[0.5px]">♨️</span>
            <span className="text-xl animate-bounce [animation-duration:1.5s] filter blur-[0.5px]">♨️</span>
          </div>
        </div>

        {/* カウンター席 (下側) */}
        <div className="grid grid-cols-5 gap-2 max-w-4xl mx-auto pt-4 border-t-8 border-[#8B0000] h-32 relative bg-[#FFFBF0] rounded-b-2xl px-2">
          {seats.map((customerId, idx) => {
            const customer = activeCustomers.find((c) => c.id === customerId);
            const customerType = customer ? CUSTOMERS.find((ct) => ct.id === customer.typeId) : null;

            return (
              <div
                key={`seat-${idx}`}
                className="flex flex-col items-center justify-end relative h-full group pb-1"
              >
                {/* 席番号 */}
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#E0C097] font-black">
                  席{idx + 1}
                </span>

                {customer ? (
                  <div
                    className="flex flex-col items-center transition-all duration-500 w-full"
                    style={{
                      transform: `translateY(${customer.yOffset}px)`,
                    }}
                  >
                    {/* フキダシ feedback */}
                    {customer.feedbackText && (
                      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white border border-[#E0C097] text-[#4A2C2A] text-[8px] py-1 px-1.5 rounded-lg text-center shadow-md w-20 sm:w-24 z-20 animate-fade-in font-sans leading-none">
                        <span className="font-bold text-xs block mb-0.5">{customer.feedbackEmoji}</span>
                        <p className="leading-tight block text-[8px] font-bold text-[#4A2C2A] truncate">
                          {customer.feedbackText}
                        </p>
                        {/* 吹き出しの三角突き出し */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-[#E0C097] rotate-45" />
                      </div>
                    )}

                    {/* 客の絵文字アバターとアニメーション */}
                    <div className={`relative text-3xl sm:text-4xl cursor-default select-none ${
                      customer.state === 'eating' ? 'animate-bounce [animation-duration:0.6s]' : ''
                    }`}>
                      {customerType?.emoji}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-[#FBC02D] border border-[#C49000] text-[#4A2C2A] font-bold font-sans rounded px-0.5 scale-90 whitespace-nowrap">
                        {customerType?.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* ラーメンどんぶり representation (食べてる時だけ出現) */}
                    {customer.state === 'eating' && (
                      <div className="w-6 h-6 rounded-full border-2 border-[#D32F2F] bg-[#FFF8E7] absolute -top-4 flex items-center justify-center animate-pulse shadow-md z-15">
                        <span className="text-[8px] text-[#D32F2F] font-mono">💮</span>
                      </div>
                    )}
                  </div>
                ) : (
                  // 空席の表現（丸椅子）
                  <div className="w-8 h-8 rounded-full bg-[#E0C097] border border-[#C49000] flex items-center justify-center text-white text-[9px] font-bold select-none hover:bg-[#C49000] transition shadow-inner">
                    空
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 営業中テロップ案内 */}
        {!isOperating && activeCustomers.length === 0 && (
          <div className="absolute inset-x-0 bottom-12 text-center animate-pulse z-0 pointer-events-none">
            <p className="text-xs text-slate-500 font-bold font-sans flex items-center justify-center gap-1.5">
              <span>🎏 暖簾は開いております。いつでも「開店」で営業を開始できます！</span>
            </p>
          </div>
        )}
      </div>

      {/* 営業日次報告モーダル */}
      {showReport && (
        <div id="operation_report_modal" className="fixed inset-0 bg-[#4A2C2A]/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-4 border-[#E0C097] rounded-3xl p-6 shadow-2xl max-w-sm w-full relative text-[#4A2C2A]">
            <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-[#D32F2F] to-[#FBC02D] rounded-t-2xl" />
            
            <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-4 mb-4">
              <span className="text-3xl">📊</span>
              <h3 className="text-lg font-black text-[#D32F2F] mt-2">本日の営業報告結果</h3>
              <p className="text-xxs text-gray-550">お疲れ様でした！本日の店舗収支と評価です。</p>
            </div>

            <div className="space-y-3 font-mono">
              <div className="flex justify-between items-center text-xs bg-[#FFFBF0] p-2.5 rounded-xl border border-[#E0C097]">
                <span className="text-gray-600 flex items-center gap-1.5 font-bold font-sans">
                  <TrendingUp size={14} className="text-emerald-600" />
                  本日売上高:
                </span>
                <span className="font-extrabold text-emerald-600 text-sm">+{dailyRevenue} G</span>
              </div>

              <div className="flex justify-between items-center text-xs bg-[#FFFBF0] p-2.5 rounded-xl border border-[#E0C097]">
                <span className="text-gray-600 flex items-center gap-1.5 font-bold font-sans">
                  👥
                  総来店客数:
                </span>
                <span className="font-extrabold text-[#4A2C2A] text-sm">{dailyCustomersCount} 名</span>
              </div>

              <div className="flex justify-between items-center text-xs bg-[#FFFBF0] p-2.5 rounded-xl border border-[#E0C097]">
                <span className="text-gray-600 flex items-center gap-1.5 font-bold font-sans">
                  <CheckCircle size={14} className="text-blue-500" />
                  満足された客数:
                </span>
                <span className="font-extrabold text-blue-600">
                  {dailySatisfiedCount} 名 ({dailyCustomersCount > 0 ? Math.round((dailySatisfiedCount / dailyCustomersCount) * 100) : 0}%)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs bg-[#FFFBF0] p-2.5 rounded-xl border border-[#E0C097]">
                <span className="text-gray-600 flex items-center gap-1.5 font-bold font-sans">
                  <Flame size={14} className="text-[#D32F2F] animate-pulse" />
                  獲得した知名度評判:
                </span>
                <span className="font-extrabold text-[#D32F2F]">+{dailyEarnedFamous} F</span>
              </div>
            </div>

            {/* 売れたラーメン内訳 */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-gray-500 mb-2 border-b border-[#E0C097] pb-1 font-sans flex items-center gap-1">
                <span>🍜 商品別本日の販売内訳</span>
              </h4>
              <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {Object.keys(popularRamenSales).length === 0 ? (
                  <p className="text-gray-400 italic text-center text-[10px]">本日は販売がありませんでした</p>
                ) : (
                  Object.entries(popularRamenSales).map(([id, count]) => {
                    const r = saveState.ramenRecipes.find((recipe) => recipe.id === id);
                    if (!r) return null;
                    return (
                      <div key={id} className="flex justify-between items-center bg-[#FFFBF0] p-2 rounded-lg border border-[#E0C097]">
                        <span className="font-bold text-[#4A2C2A] truncate w-40">{r.name}</span>
                        <span className="font-mono text-gray-500 text-xxs block font-bold">
                          {count} 杯販
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button
              id="btn_close_report"
              onClick={() => setShowReport(false)}
              className="w-full mt-6 py-3 h-12 bg-[#FBC02D] hover:bg-[#F9A825] border-b-4 border-[#C49000] text-[#4A2C2A] text-xs font-black rounded-2xl transition duration-300"
            >
              一日の活動を終える（準備期間へ）
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
