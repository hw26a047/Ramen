/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Ramen, SoupIngredient, Topping, NoodleConfig, GameSaveState } from '../types';
import { calculateRamenSpecs } from '../data';
import ToppingCanvas from './ToppingCanvas';
import { Play, RotateCcw, Sparkles, Plus, Check, Info, Volume2, VolumeX, ArrowRight, ArrowLeft } from 'lucide-react';

interface RamenCreatorProps {
  saveState: GameSaveState;
  allSoupIngredients: SoupIngredient[];
  allToppings: Topping[];
  onComplete: (ramen: Ramen) => void;
  onCancel: () => void;
}

// 簡単な Web Audio API でのSE生成機能（ミュート対応）
const playSound = (type: 'plop' | 'boil' | 'complete' | 'click', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'plop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'boil') {
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(5, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 1.5);
    } else if (type === 'complete') {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
      });
    }
  } catch (e) {
    console.warn('AudioContext error', e);
  }
};

export default function RamenCreator({
  saveState,
  allSoupIngredients,
  allToppings,
  onComplete,
  onCancel,
}: RamenCreatorProps) {
  // 開発ステップ：1: スープ, 2: 自家製麺, 3: トッピング・盛り付け, 4: 仕上げ・完成
  const [creationStep, setCreationStep] = useState<1 | 2 | 3 | 4>(1);

  const [ramenName, setRamenName] = useState('');
  const [soupSlots, setSoupSlots] = useState<string[]>([]);
  const [noodle, setNoodle] = useState<NoodleConfig>({
    thickness: 'medium',
    waviness: 'straight',
    hydration: 'medium',
  });
  const [toppings, setToppings] = useState<any[]>([]);
  const [selectedToppingId, setSelectedToppingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'gala' | 'seafood' | 'vegetable' | 'sauce' | 'oil'>('all');
  
  // 調理演出用ステート
  const [cookingPhase, setCookingPhase] = useState<'idle' | 'brewing' | 'boiling' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  // 音設定
  const [isMuted, setIsMuted] = useState(false);

  // 使用可能な素材（アンロック済みのスープ素材）
  const availableSoupIngredients = allSoupIngredients.filter(
    (i) => saveState.unlockedIngredients.includes(i.id)
  ).map(ing => ({
    ...ing,
    level: saveState.ingredientLevels[ing.id] || 1
  }));

  // 使用可能なトッピング（アンロック済み）
  const availableToppings = allToppings.filter(
    (t) => saveState.unlockedToppings.includes(t.id)
  );

  // スープの最大スロット数
  const maxSoupSlots = saveState.famous >= 1500 ? 8 : saveState.famous >= 500 ? 6 : 4;

  // リアルタイムスペック計算
  const specs = calculateRamenSpecs(
    ramenName,
    soupSlots,
    noodle,
    toppings,
    availableSoupIngredients,
    availableToppings
  );

  // カテゴリ別のスープ素材フィルタ
  const filteredSoupIngredients = availableSoupIngredients.filter(
    (i) => activeCategory === 'all' || i.category === activeCategory
  );

  // スープ素材スロットの追加
  const addSoupIngredient = (id: string) => {
    if (soupSlots.length >= maxSoupSlots) return;
    playSound('click', isMuted);
    setSoupSlots([...soupSlots, id]);
  };

  // スープ素材の取り消し
  const removeSoupSlot = (index: number) => {
    playSound('click', isMuted);
    setSoupSlots(soupSlots.filter((_, idx) => idx !== index));
  };

  // トッピング配置時
  const handleToppingsChange = (newToppings: any[]) => {
    if (newToppings.length > toppings.length) {
      playSound('plop', isMuted);
    } else if (newToppings.length < toppings.length) {
      playSound('click', isMuted);
    }
    setToppings(newToppings);
  };

  // 名前を自動提案する
  const generateRamenName = () => {
    playSound('click', isMuted);
    const isMiso = soupSlots.includes('sauce_miso');
    const isPork = soupSlots.includes('gala_pork_bones');
    const isShoyu = soupSlots.includes('sauce_shoyu');
    const isShio = soupSlots.includes('sauce_shio');
    const isNiboshi = soupSlots.includes('seafood_niboshi');
    
    let prefix = '特製';
    if (specs.score > 750) prefix = '至高の';
    else if (specs.score > 550) prefix = '芳醇';
    else if (specs.score > 400) prefix = '名物';

    let coreName = '中華そば';
    if (isMiso) {
      coreName = '味噌ラーメン';
      if (toppings.some(t => t.toppingId === 'top_butter')) {
        coreName = '和風バター味噌';
      }
    } else if (isPork) {
      coreName = '豚骨ラーメン';
      if (soupSlots.includes('oil_mayu')) {
        coreName = '黒マー油和風とんこつ';
      } else if (noodle.thickness === 'ultra_fine') {
        coreName = '博多極細とんこつ';
      }
    } else if (isShoyu) {
      coreName = isNiboshi ? '本ぼし醤油そば' : '東京クラシック醤油そば';
    } else if (isShio) {
      coreName = isNiboshi ? '煮干し塩そば' : 'なごみ極塩らーめん';
    }

    let suffix = '極み';
    if (specs.comboName) {
      suffix = specs.comboName;
    } else if (toppings.length > 5) {
      suffix = '全盛りスペシャル';
    }

    const randomWord = ['魂の一杯', '匠の極', '至福', '究極'][Math.floor(Math.random() * 4)];
    setRamenName(`${prefix}${coreName} 〜${suffix || randomWord}〜`);
  };

  // 開発プロセス開始！
  const startCooking = () => {
    if (soupSlots.length === 0) {
      alert('スープに材料を1つ以上入れてください！');
      return;
    }
    playSound('boil', isMuted);
    setCookingPhase('brewing');
    setProgress(0);
  };

  // クッキングアニメーション
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cookingPhase === 'brewing') {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 45) {
            clearInterval(timer);
            setCookingPhase('boiling');
            return 45;
          }
          return prev + 3;
        });
      }, 50);
    } else if (cookingPhase === 'boiling') {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(timer);
            setCookingPhase('completed');
            playSound('complete', isMuted);
            return 100;
          }
          return prev + 4;
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [cookingPhase]);

  // レシピ完成保存
  const saveRecipe = () => {
    const finalName = ramenName.trim() || '名無しオリジナルラーメン';
    const newRamen: Ramen = {
      id: `ramen_${Date.now()}`,
      name: finalName,
      soupIngredients: soupSlots,
      noodle,
      toppings,
      taste: specs.taste,
      richness: specs.richness,
      aroma: specs.aroma,
      visual: specs.visual,
      volume: specs.volume,
      synergy: specs.synergy,
      score: specs.score,
      cost: specs.cost,
      price: specs.price,
      salesCount: 0
    };
    onComplete(newRamen);
  };

  return (
    <div id="ramen_creator_root" className="w-full max-w-6xl mx-auto bg-white rounded-2xl border-2 sm:border-4 border-[#E0C097] p-3 sm:p-5 text-[#4A2C2A] h-[calc(100vh-100px)] sm:h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden">
      
      {/* 1. 簡素化したヘッダー */}
      <div className="flex justify-between items-center pb-2 border-b border-[#E0C097] flex-shrink-0">
        <div>
          <h2 className="text-sm sm:text-lg font-black text-[#D32F2F] flex items-center gap-1">
            🍜 ラーメン開発工房
          </h2>
          <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">手順にそってオリジナルラーメンを作りましょう</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn_toggle_mute"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 sm:p-2 hover:bg-[#FFFBF0] rounded-lg text-gray-400 hover:text-[#4A2C2A] transition"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button
            id="btn_cancel_create"
            onClick={onCancel}
            className="px-2.5 py-1 bg-[#FFFBF0] hover:bg-orange-50 rounded-lg border border-[#E0C097] text-xxs sm:text-xs font-black transition text-[#4A2C2A]"
          >
            戻る
          </button>
        </div>
      </div>

      {cookingPhase === 'idle' ? (
        <div className="flex-1 flex flex-col justify-between overflow-hidden mt-2 text-xs">
          
          {/* 2. ステップ進行インジケーター */}
          <div className="flex items-center justify-between bg-[#FFFBF0] py-1.5 px-3 rounded-xl border border-[#E0C097] flex-shrink-0 text-[10px] sm:text-xs">
            <button 
              onClick={() => setCreationStep(1)}
              className={`flex items-center gap-1 font-bold focus:outline-none ${creationStep === 1 ? 'text-[#D32F2F]' : 'text-gray-400'}`}
            >
              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] ${creationStep >= 1 ? 'bg-[#D32F2F] text-white' : 'bg-gray-200 text-gray-400'}`}>1</span>
              <span>出汁・タレ</span>
            </button>
            <div className="h-0.5 bg-[#E0C097] flex-1 mx-1.5" />
            <button 
              onClick={() => { if (soupSlots.length > 0) setCreationStep(2); }}
              className={`flex items-center gap-1 font-bold focus:outline-none ${creationStep === 2 ? 'text-[#D32F2F]' : 'text-gray-400'}`}
            >
              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] ${creationStep >= 2 ? 'bg-[#D32F2F] text-white' : 'bg-gray-200 text-gray-400'}`}>2</span>
              <span>自家製麺</span>
            </button>
            <div className="h-0.5 bg-[#E0C097] flex-1 mx-1.5" />
            <button 
              onClick={() => { if (soupSlots.length > 0) setCreationStep(3); }}
              className={`flex items-center gap-1 font-bold focus:outline-none ${creationStep === 3 ? 'text-[#D32F2F]' : 'text-gray-400'}`}
            >
              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] ${creationStep >= 3 ? 'bg-[#D32F2F] text-white' : 'bg-gray-200 text-gray-400'}`}>3</span>
              <span>盛り付け</span>
            </button>
            <div className="h-0.5 bg-[#E0C097] flex-1 mx-1.5" />
            <button 
              onClick={() => { if (soupSlots.length > 0) setCreationStep(4); }}
              className={`flex items-center gap-1 font-bold focus:outline-none ${creationStep === 4 ? 'text-[#D32F2F]' : 'text-gray-400'}`}
            >
              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] ${creationStep >= 4 ? 'bg-[#D32F2F] text-white' : 'bg-gray-200 text-gray-400'}`}>4</span>
              <span>仕上げ</span>
            </button>
          </div>

          {/* 3. 各ステップのメインコンテンツ領域 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden my-2 pr-1">
            
            {/* --- STEP 1: スープ調整 --- */}
            {creationStep === 1 && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-[#FFFBF0] border border-[#E0C097] p-3 rounded-xl">
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="font-bold text-[#D32F2F] text-xs">
                      🧪 ① スープ出汁・調味ダレ選定 ({soupSlots.length}/{maxSoupSlots})
                    </h3>
                    <span className="text-gray-400 text-[9px]">※タレ（醤油・塩・味噌等）は必須！</span>
                  </div>

                  {/* 現在のスロットプレビュー（クリックで削除） */}
                  <div id="soup_slots_container" className="flex flex-wrap gap-1.5 min-h-[38px] bg-white p-2 rounded-lg border border-[#E0C097] max-h-24 overflow-y-auto mb-2">
                    {soupSlots.length === 0 ? (
                      <p className="text-[10px] text-gray-400 m-auto text-center">下の素材をタップしてスープに加えましょう。タレを入れるとベース風味が定まります</p>
                    ) : (
                      soupSlots.map((slotId, idx) => {
                        const ing = availableSoupIngredients.find((i) => i.id === slotId);
                        if (!ing) return null;
                        return (
                          <div
                            key={`slot-${idx}`}
                            onClick={() => removeSoupSlot(idx)}
                            className="flex items-center gap-1 bg-[#FFFBF0] hover:bg-rose-50 hover:text-rose-700 border border-[#E0C097] py-0.5 px-1.5 rounded-lg text-xxs cursor-pointer select-none transition-all"
                            title="タップして除去"
                          >
                            <span>{ing.emoji}</span>
                            <span className="font-bold truncate max-w-[70px]">{ing.name}</span>
                            <span className="text-[9px] text-[#D32F2F]">×</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 香味・旨味素材のカタログ */}
                <div className="space-y-2">
                  <div className="flex overflow-x-auto gap-0.5 bg-gray-100 p-0.5 rounded-lg scrollbar-none">
                    {(['all', 'sauce', 'gala', 'seafood', 'vegetable', 'oil'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { playSound('click', isMuted); setActiveCategory(cat); }}
                        className={`flex-1 text-[9px] font-black py-1 px-1.5 rounded-md transition whitespace-nowrap ${
                          activeCategory === cat ? 'bg-[#FBC02D] text-[#4A2C2A]' : 'text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {cat === 'all' ? '全部' :
                         cat === 'sauce' ? 'タレ' :
                         cat === 'gala' ? 'ガラ肉' :
                         cat === 'seafood' ? '魚介' :
                         cat === 'vegetable' ? '野菜' : '香味油'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
                    {filteredSoupIngredients.map((ing) => (
                      <button
                        key={ing.id}
                        onClick={() => addSoupIngredient(ing.id)}
                        disabled={soupSlots.length >= maxSoupSlots}
                        className="flex flex-col bg-white hover:bg-orange-50 border border-[#E0C097] hover:border-[#D32F2F] p-1.5 rounded-xl text-left transition disabled:opacity-50 text-[10px]"
                      >
                        <div className="flex items-center gap-1 w-full">
                          <span className="text-sm flex-shrink-0">{ing.emoji}</span>
                          <span className="font-bold truncate text-[#4A2C2A] flex-1">{ing.name}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between w-full border-t border-gray-100 pt-1 text-[9px]">
                          <span className="text-emerald-600 font-bold">原価:{ing.cost}G</span>
                          <span className="text-slate-400">Lv{ing.level}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 2: 自家製麺の仕様 --- */}
            {creationStep === 2 && (
              <div className="space-y-3 animate-fade-in max-w-xl mx-auto">
                <div className="bg-[#FFFBF0] border border-[#E0C097] p-3 rounded-xl space-y-3">
                  <h3 className="font-bold text-[#D32F2F] text-xs flex items-center gap-1">
                    🌾 ② 小麦と水を練り上げる自家製麺の設定
                  </h3>

                  {/* 太さ */}
                  <div className="space-y-1">
                    <span className="text-xxs font-black text-gray-500 block">■ 麺の太さ（スープの重さに合わせましょう）</span>
                    <div className="grid grid-cols-5 gap-1">
                      {([
                        { id: 'ultra_fine', label: '極細' },
                        { id: 'fine', label: '細麺' },
                        { id: 'medium', label: '中太' },
                        { id: 'thick', label: '太麺' },
                        { id: 'ultra_thick', label: '極太' },
                      ] as const).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { playSound('click', isMuted); setNoodle({ ...noodle, thickness: opt.id }); }}
                          className={`py-1.5 rounded text-[10px] text-center font-bold transition ${
                            noodle.thickness === opt.id ? 'bg-[#FBC02D] text-[#4A2C2A]' : 'bg-white border border-[#E0C097] text-gray-500'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ちぢれ */}
                  <div className="space-y-1">
                    <span className="text-xxs font-black text-gray-500 block">■ ちぢれ度（ストレートは喉越し、ちぢれはスープ保持力）</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { id: 'straight', label: '🍜 ストレート麺', desc: 'のどごし抜群' },
                        { id: 'wavy', label: '➰ ちぢれ麺', desc: 'スープが劇的に絡む' }
                      ] as const).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { playSound('click', isMuted); setNoodle({ ...noodle, waviness: opt.id }); }}
                          className={`p-1.5 rounded-lg border text-left transition ${
                            noodle.waviness === opt.id ? 'bg-[#FFF9E6] border-[#FBC02D] text-[#D32F2F]' : 'border-gray-200 bg-white text-gray-500'
                          }`}
                        >
                          <div className="font-bold text-[10px]">{opt.label}</div>
                          <div className="text-[8px] text-gray-400">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 加水率 */}
                  <div className="space-y-1">
                    <span className="text-xxs font-black text-gray-500 block">■ 加水率（低いとパツパツとした硬め、高いとモチモチ麺）</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([
                        { id: 'low', label: '低加水', desc: 'パツっと博多系' },
                        { id: 'medium', label: '標準加水', desc: '高バランス王道' },
                        { id: 'high', label: '多加水', desc: 'もちもち極厚コシ' },
                      ] as const).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { playSound('click', isMuted); setNoodle({ ...noodle, hydration: opt.id }); }}
                          className={`p-1.5 rounded-lg text-center transition ${
                            noodle.hydration === opt.id ? 'bg-[#FBC02D] text-[#4A2C2A] font-black' : 'bg-white border border-[#E0C097] text-gray-500'
                          }`}
                        >
                          <span className="block font-bold text-[10px]">{opt.label}</span>
                          <span className="text-[8px] text-gray-400 block">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 3: トッピング盛り付け・お碗のデザイン --- */}
            {creationStep === 3 && (
              <div className="space-y-3 animate-fade-in flex flex-col items-center">
                
                {/* どんぶりプレビュー（中央に大きく） */}
                <div className="flex flex-col items-center select-none flex-shrink-0 touch-none py-1 relative">
                  <ToppingCanvas
                    soupIngredients={soupSlots}
                    noodle={noodle}
                    toppings={toppings}
                    onToppingsChange={handleToppingsChange}
                    availableToppings={availableToppings}
                    selectedToppingId={selectedToppingId}
                  />
                  <p className="text-[9px] text-gray-400 mt-1 font-bold">
                    💡 具材を追加：下のトッピングを選んでください
                  </p>
                  <p className="text-[8px] text-gray-400 leading-none">
                    （どんぶり上の具材はドラッグして位置調整できます）
                  </p>

                  {toppings.length > 0 && (
                    <button
                      onClick={() => { playSound('click', isMuted); setToppings([]); }}
                      className="absolute top-1 right-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded text-[9px] font-bold"
                    >
                      お碗を空にする
                    </button>
                  )}
                </div>

                {/* トッピングパレット */}
                <div className="w-full bg-[#FFFBF0] border border-[#E0C097] p-2.5 rounded-xl">
                  <div className="flex justify-between items-center mb-1 text-xxs">
                    <span className="font-bold text-[#D32F2F]">🥩 盛り付ける具材をタップ ({toppings.length}個配置中)</span>
                    {selectedToppingId && (
                      <button onClick={() => setSelectedToppingId(null)} className="text-red-500 font-bold hover:underline font-mono">
                        選択解除
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 py-1.5 overflow-x-auto scrollbar-thin select-none max-w-full">
                    {availableToppings.map((top) => {
                      const isSelected = selectedToppingId === top.id;
                      const useCount = toppings.filter(t => t.toppingId === top.id).length;

                      return (
                        <button
                          key={top.id}
                          onClick={() => {
                            playSound('click', isMuted);
                            // 具材をクリック：即座に追加
                            const newTopping = {
                              placementId: `tp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                              toppingId: top.id,
                              x: 43 + Math.random() * 14, // どんぶり中央付近
                              y: 43 + Math.random() * 14,
                              rotation: Math.floor(Math.random() * 360),
                              scale: 1.0,
                            };
                            handleToppingsChange([...toppings, newTopping]);
                            setSelectedToppingId(top.id);
                          }}
                          className={`flex flex-col items-center flex-shrink-0 w-16 p-1.5 rounded-xl border transition relative ${
                            isSelected
                              ? 'bg-[#FBC02D] border-[#C49000] text-[#4A2C2A]'
                              : 'bg-white border-[#E0C097]'
                          }`}
                        >
                          <span className="text-xl">{top.emoji}</span>
                          <span className="text-[8px] font-black mt-1 truncate w-full text-center">{top.name}</span>
                          <span className="text-[8px] font-mono text-gray-400">{top.cost}G</span>
                          {useCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white font-extrabold text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full shadow border border-white">
                              {useCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 4: 仕上げ・名前決定 --- */}
            {creationStep === 4 && (
              <div className="space-y-3 animate-fade-in max-w-xl mx-auto">
                <div className="bg-[#FFFBF0] border border-[#E0C097] p-3 rounded-xl space-y-3">
                  <h3 className="font-bold text-[#D32F2F] text-xs flex items-center gap-1.5">
                    ✍️ ④ 仕上げ：メニュー看板と推定スペック確認
                  </h3>

                  {/* 命名欄 */}
                  <div className="space-y-1">
                    <label className="text-xxs font-black text-gray-500 block">ラーメンの料理名</label>
                    <div className="flex gap-1.5 relative">
                      <input
                        id="input_ramen_name"
                        type="text"
                        maxLength={30}
                        value={ramenName}
                        onChange={(e) => setRamenName(e.target.value)}
                        placeholder="（例）特製こってり極み醤油そば..."
                        className="flex-1 bg-white border border-[#E0C097] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#D32F2F] text-[#4A2C2A] font-bold"
                      />
                      <button
                        id="btn_random_name"
                        type="button"
                        onClick={generateRamenName}
                        className="px-2.5 py-1.5 rounded-lg bg-[#FBC02D] hover:bg-[#F9A825] text-[#4A2C2A] text-xxs font-black transition flex items-center gap-0.5"
                      >
                        <Sparkles size={11} />
                        <span>おまかせ自動命名</span>
                      </button>
                    </div>
                  </div>

                  {/* パラメータ見積り */}
                  <div className="bg-white p-3 rounded-xl border border-[#E0C097] space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-bold font-mono">
                      <span className="text-gray-600">📊 開発ラーメン推計能力</span>
                      {specs.comboName && (
                        <span className="text-[#D32F2F] animate-pulse">✨ コンボ: {specs.comboName}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* 旨味 */}
                      <div className="space-y-0.5 bg-[#FFFBF0] p-1.5 rounded border border-gray-100">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-500 font-bold">味わい / 旨味</span>
                          <span className="font-black text-[#D32F2F]">{specs.taste}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, (specs.taste / 300) * 100)}%` }} />
                        </div>
                      </div>

                      {/* コク */}
                      <div className="space-y-0.5 bg-[#FFFBF0] p-1.5 rounded border border-gray-100">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-500 font-bold">コク / 濃厚さ</span>
                          <span className="font-black text-orange-600">{specs.richness}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-orange-400 h-full" style={{ width: `${Math.min(100, (specs.richness / 250) * 100)}%` }} />
                        </div>
                      </div>

                      {/* 香り */}
                      <div className="space-y-0.5 bg-[#FFFBF0] p-1.5 rounded border border-gray-100">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-500 font-bold">風味 / 香り</span>
                          <span className="font-black text-purple-600">{specs.aroma}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, (specs.aroma / 180) * 100)}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-[10px] bg-[#FFFBF0] p-2 rounded-xl text-center">
                      <div>
                        <span className="text-gray-400 block text-[9px]">見栄え</span>
                        <span className="font-extrabold text-[#D32F2F]">{specs.visual} pt</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px]">ボリューム</span>
                        <span className="font-extrabold text-emerald-600">{specs.volume}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px]">相性係数</span>
                        <span className="font-extrabold text-amber-700">x{specs.synergy.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px]">総合美味</span>
                        <span className="font-extrabold text-[#D32F2F]">{specs.score} 点</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-100">
                      <span className="font-bold text-gray-500">推定原価コスト:</span>
                      <span className="font-mono text-emerald-600 font-black text-sm">{specs.cost} G</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* 4. ステップ制御ナビゲーション（ボタン） */}
          <div className="bg-[#FFFBF0] p-2 border-t border-[#E0C097] flex justify-between items-center flex-shrink-0">
            {creationStep === 1 ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg text-xxs sm:text-xs transition"
              >
                開発中止して戻る
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { playSound('click', isMuted); setCreationStep((prev) => (prev - 1) as any); }}
                className="px-3 py-1.5 bg-white hover:bg-orange-50 text-[#4A2C2A] border border-[#E0C097] font-bold rounded-lg text-xxs sm:text-xs flex items-center gap-1 transition"
              >
                <ArrowLeft size={11} />
                <span>戻る</span>
              </button>
            )}

            <div className="text-xxs text-gray-400 font-mono hidden sm:block">
              ステップ {creationStep} / 4
            </div>

            {creationStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (creationStep === 1 && soupSlots.length === 0) {
                    alert('スープのベースとなる出汁やタレを1つ以上追加してください！');
                    return;
                  }
                  playSound('click', isMuted);
                  setCreationStep((prev) => (prev + 1) as any);
                }}
                className="px-4 py-1.5 bg-[#FBC02D] hover:bg-[#F9A825] text-[#4A2C2A] font-black rounded-lg text-xxs sm:text-xs flex items-center gap-1 shadow transition"
              >
                <span>進む</span>
                <ArrowRight size={11} />
              </button>
            ) : (
              <button
                id="btn_start_ramen_eval"
                onClick={startCooking}
                disabled={soupSlots.length === 0}
                className="px-4.5 py-1.5 bg-gradient-to-r from-[#D32F2F] to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-black rounded-lg text-xxs sm:text-xs flex items-center gap-1 shadow-md transition-all duration-300 disabled:opacity-50"
              >
                <Play size={11} fill="white" />
                <span>スープを煮込む＆完成！</span>
              </button>
            )}
          </div>

        </div>
      ) : (
        /* クッキング演出 & 最終リザルトフェーズ（スクロール不要で高さを固定） */
        <div className="flex-1 flex flex-col items-center justify-center py-2 max-w-md mx-auto text-center text-[#4A2C2A] overflow-y-auto">
          {cookingPhase === 'brewing' && (
            <div className="space-y-4 w-full animate-fade-in bg-white p-4 sm:p-5 rounded-2xl border border-[#E0C097]">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D32F2F] animate-spin [animation-duration:12s] opacity-35" />
                <div className="absolute inset-3 bg-[#FFFBF0] border border-[#E0C097] rounded-full flex flex-col items-center justify-center text-3xl">
                  🧪🌱🐔
                </div>
                <span className="absolute top-2 left-4 text-sm animate-bounce">🫧</span>
                <span className="absolute bottom-4 right-6 text-xs animate-ping">🫧</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-[#D32F2F]">スープを煮込み中...</h3>
                <p className="text-[10px] text-gray-400 font-bold">極上スープから最高の出汁を抽出しています！</p>
              </div>
              <div className="w-full bg-[#FFFBF0] border border-[#E0C097] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#D32F2F] h-full transition-all" style={{ width: `${(progress / 45) * 100}%` }} />
              </div>
            </div>
          )}

          {cookingPhase === 'boiling' && (
            <div className="space-y-4 w-full animate-fade-in bg-white p-4 sm:p-5 rounded-2xl border border-[#E0C097]">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FBC02D] animate-spin [animation-duration:8s] opacity-35" />
                <div className="absolute inset-3 bg-[#FFFBF0] border border-[#E0C097] rounded-full flex flex-col items-center justify-center text-3xl">
                  🌾♨️🍜
                </div>
                <span className="absolute top-4 right-4 text-lg animate-bounce">♨️</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-orange-600">自家製麺を茹で上げ中...</h3>
                <p className="text-[10px] text-gray-400 font-bold">麺の太さ、ちぢれに合わせて完璧なコシへ！</p>
              </div>
              <div className="w-full bg-[#FFFBF0] border border-[#E0C097] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#FBC02D] h-full transition-all" style={{ width: `${((progress - 45) / 45) * 100}%` }} />
              </div>
            </div>
          )}

          {cookingPhase === 'completed' && (
            <div className="space-y-3.5 w-full animate-fade-in flex flex-col justify-between h-full py-1">
              {/* 完成どんぶりプレビュー（小さめに） */}
              <div className="scale-75 sm:scale-80 select-none flex-shrink-0 -my-4">
                <ToppingCanvas
                  soupIngredients={soupSlots}
                  noodle={noodle}
                  toppings={toppings}
                  onToppingsChange={() => {}}
                  availableToppings={availableToppings}
                  selectedToppingId={null}
                  readOnly={true}
                />
              </div>

              <div className="bg-white border-2 border-[#E0C097] p-3 sm:p-4 rounded-xl shadow relative text-[#4A2C2A] text-left flex-1 flex flex-col justify-between">
                <div>
                  <div className="absolute -top-2.5 -right-2 bg-[#D32F2F] text-white font-black text-[9px] px-2.5 py-0.5 rounded-full shadow border border-white">
                    新開発！
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-[#D32F2F] leading-tight">
                    {ramenName.trim() || '名無しオリジナルラーメン'}
                  </h3>
                  {specs.comboName && (
                    <span className="inline-block bg-[#FFF9E6] border border-[#C49000] text-[#D32F2F] text-[9px] font-black py-0.5 px-2 rounded mt-1">
                      コンボ：{specs.comboName}
                    </span>
                  )}

                  <div className="my-2 border-t border-b border-[#E0C097] py-1.5 grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10px] font-mono leading-none">
                    <div className="flex justify-between">
                      <span className="text-gray-400">味わい:</span>
                      <span className="font-extrabold text-[#D32F2F]">{specs.taste}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">コク:</span>
                      <span className="font-extrabold text-orange-600">{specs.richness}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">香り:</span>
                      <span className="font-extrabold text-amber-600">{specs.aroma}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">彩り:</span>
                      <span className="font-extrabold text-[#D32F2F]">{specs.visual} pt</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E0C097] pt-1.5 col-span-2 text-xs font-black">
                      <span>総合美味しさ:</span>
                      <span className="text-[#D32F2F]">{specs.score} 点</span>
                    </div>
                  </div>
                </div>

                {/* 価格調整 */}
                <div className="pt-1.5 border-t border-[#E0C097]">
                  <div className="flex justify-between text-[9px] text-gray-500 mb-1 font-bold">
                    <span>原価:{specs.cost}G</span>
                    <span>販売目安:{specs.price}G</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <label className="text-[10px] text-[#4A2C2A] font-black">販売価格設定:</label>
                    <input
                      id="input_price_control"
                      type="number"
                      min={100}
                      max={5000}
                      step={10}
                      value={specs.price}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        specs.price = val;
                      }}
                      className="bg-orange-50 border border-[#E0C097] text-[#D32F2F] font-black font-mono rounded px-1.5 py-0.5 w-18 text-center text-[10px] focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-500">G</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-2 text-xxs">
                <button
                  id="btn_reconstruct_ramen"
                  onClick={() => { playSound('click', isMuted); setCookingPhase('idle'); }}
                  className="flex-1 py-2 bg-[#FFFBF0] hover:bg-orange-50 text-[#4A2C2A] font-bold rounded-lg border border-[#E0C097] transition"
                >
                  作り直す
                </button>
                <button
                  id="btn_confirm_ramen"
                  onClick={saveRecipe}
                  className="flex-1 py-2 bg-[#FBC02D] hover:bg-[#F9A825] border-b-2 border-[#C49000] text-[#4A2C2A] font-black rounded-lg transition"
                >
                  レシピに登録する
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
