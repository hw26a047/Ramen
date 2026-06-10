/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameSaveState, Contest, Ramen } from '../types';
import { CONTESTS } from '../data';
import { Award, Trophy, ShieldCheck, Play, AlertTriangle } from 'lucide-react';

interface ContestSectionProps {
  saveState: GameSaveState;
  onUpdateSaveState: (updater: (prev: GameSaveState) => GameSaveState) => void;
  onUnlockNewAsset: (assetType: 'ingredient' | 'topping', id: string, name: string) => void;
}

export default function ContestSection({
  saveState,
  onUpdateSaveState,
  onUnlockNewAsset,
}: ContestSectionProps) {
  const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
  const [selectedRamenId, setSelectedRamenId] = useState<string | null>(null);
  
  // コンテスト実行中ステート
  const [isFighting, setIsFighting] = useState(false);
  const [fightStep, setFightStep] = useState<'idle' | 'introduction' | 'inspection' | 'scoring' | 'result'>('idle');
  const [scoreAnimation, setScoreAnimation] = useState({ player: 0, op1: 0, op2: 0 });
  const [judgeComments, setJudgeComments] = useState<string[]>([]);
  const [winnerName, setWinnerName] = useState('');

  const activeContest = CONTESTS.find((c) => c.id === selectedContestId);
  const activeRamen = saveState.ramenRecipes.find((r) => r.id === selectedRamenId);

  // コンテスト挑戦処理
  const handleEntry = () => {
    if (!activeContest || !activeRamen) return;
    if (saveState.cash < activeContest.entryFee) {
      alert('参加費が足りません！');
      return;
    }

    // 参加費支払い引き落とし
    onUpdateSaveState((prev) => ({
      ...prev,
      cash: prev.cash - activeContest.entryFee,
    }));

    // 審査コメントの生成アルゴリズム
    generateJudgeCritique(activeRamen, activeContest);

    setIsFighting(true);
    setFightStep('introduction');
    setScoreAnimation({ player: 0, op1: 0, op2: 0 });
  };

  // 審査コメント生成ロジック
  const generateJudgeCritique = (ramen: Ramen, contest: Contest) => {
    const comments: string[] = [];

    // 1. スープ＆出汁への言及
    if (ramen.taste > 220) {
      comments.push(`「スープのだし（旨味）の広がりが異次元だ！丸鶏や素材のコクが深く、喉から胃に染みわたる...」`);
    } else if (ramen.soupIngredients.includes('sauce_miso')) {
      comments.push(`「特製味噌の濃厚な香ばしさと、ニンニクのスタミナが一体となったスープに圧倒される！」`);
    } else if (ramen.soupIngredients.includes('gala_pork_bones')) {
      comments.push(`「徹底的に炊き上げられた豚骨の深い満足感！マー油や鶏油の使い方も洗練されておる」`);
    } else {
      comments.push(`「あっさりと品のあるベーススープに、醤油タレの心地よいカエシのキレが際立っているな」`);
    }

    // 2. 麺とスープの調和（相性）への言及
    if (ramen.synergy >= 1.3) {
      comments.push(`「麺の太さ、ちぢれ度がスープと完全に調和！一口すするたびに、旨さを極限まで持ち上げてくれる！」`);
    } else if (ramen.noodle.thickness === 'ultra_fine' && ramen.noodle.hydration === 'low') {
      comments.push(`「パツパツとした硬めの極細麺ののどごしが博多の本場を彷彿とさせ、すする手が止まらん！」`);
    } else if (ramen.noodle.thickness === 'ultra_thick') {
      comments.push(`「極太麺の圧倒的なワシワシ食感！スープのコクをしっかりと受け止め、強烈な個性を生んでおる！」`);
    } else {
      comments.push(`「非常に心地よく喉を通るストレート麺。スープとのバランスも取れており、職人のこだわりを感じる」`);
    }

    // 3. 盛り付け・トッピングへの言及
    const hasTopping = (id: string) => ramen.toppings.some((pt) => pt.toppingId === id);
    if (ramen.visual > 140) {
      comments.push(`「なんて神々しい盛り付けだ！美観ポイントがあまりに高く、食べる前から五感が喜ぶ芸術品！」`);
    } else if (hasTopping('top_chashu')) {
      comments.push(`「炙りチャーシューの香ばしい燻煙香と、じゅわっと溶ける肉厚な油分、これこそが最高峰の主役だ！」`);
    } else if (hasTopping('top_butter') && hasTopping('top_corn')) {
      comments.push(`「コーンの甘みと、じわじわとスープに溶ける北海道バターが最高の調和を見せておるな」`);
    } else {
      comments.push(`「ナルトや具材がバランス良く配置され、親しみやすさと洗練さを両立した素晴らしい仕上がり」`);
    }

    setJudgeComments(comments);
  };

  // 審査・採点のアニメーションのステップ
  useEffect(() => {
    if (!isFighting || !activeContest || !activeRamen) return;

    let timer: NodeJS.Timeout;
    
    if (fightStep === 'introduction') {
      timer = setTimeout(() => setFightStep('inspection'), 3000);
    } else if (fightStep === 'inspection') {
      timer = setTimeout(() => {
        setFightStep('scoring');
        // 得点加算アニメーションへ
        animateScores();
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [isFighting, fightStep]);

  // 点数加算アニメーション
  const animateScores = () => {
    if (!activeContest || !activeRamen) return;
    
    const playerTarget = activeRamen.score;
    const op1Target = activeContest.opponents[0].score;
    const op2Target = activeContest.opponents[1].score;

    let currentStep = 0;
    const steps = 40;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(interval);
        setScoreAnimation({ player: playerTarget, op1: op1Target, op2: op2Target });
        
        // 結果判定へ
        setTimeout(() => {
          const maxScore = Math.max(playerTarget, op1Target, op2Target);
          let winner = 'あなた';
          if (maxScore === op1Target) winner = activeContest.opponents[0].name;
          else if (maxScore === op2Target) winner = activeContest.opponents[1].name;

          setWinnerName(winner);
          setFightStep('result');

          // 勝った場合、ご褒美を解除
          if (winner === 'あなた') {
            onUpdateSaveState((prev) => {
              const updatedCompleted = prev.completedContestIds.includes(activeContest.id)
                ? prev.completedContestIds
                : [...prev.completedContestIds, activeContest.id];

              // 今回アンロックする新規アセットIDがある場合、アンロック
              let updatedIngredients = [...prev.unlockedIngredients];
              let updatedToppings = [...prev.unlockedToppings];

              if (activeContest.rewardUnlockId) {
                if (activeContest.rewardUnlockId.startsWith('top_')) {
                  if (!updatedToppings.includes(activeContest.rewardUnlockId)) {
                    updatedToppings.push(activeContest.rewardUnlockId);
                    // アンロック通知
                    onUnlockNewAsset('topping', activeContest.rewardUnlockId, '新トッピング素材');
                  }
                } else {
                  if (!updatedIngredients.includes(activeContest.rewardUnlockId)) {
                    updatedIngredients.push(activeContest.rewardUnlockId);
                    // アンロック通知
                    onUnlockNewAsset('ingredient', activeContest.rewardUnlockId, '新出汁素材');
                  }
                }
              }

              return {
                ...prev,
                cash: prev.cash + activeContest.rewardCash,
                famous: prev.famous + activeContest.rewardFamous,
                completedContestIds: updatedCompleted,
                unlockedIngredients: updatedIngredients,
                unlockedToppings: updatedToppings,
              };
            });
          }
        }, 1500);
      } else {
        setScoreAnimation({
          player: Math.floor((playerTarget * currentStep) / steps),
          op1: Math.floor((op1Target * currentStep) / steps),
          op2: Math.floor((op2Target * currentStep) / steps),
        });
      }
    }, 40);
  };

  const handleCloseFight = () => {
    setIsFighting(false);
    setFightStep('idle');
    setSelectedContestId(null);
    setSelectedRamenId(null);
  };

  return (
    <div id="contest_panel_root" className="w-full bg-white rounded-2xl border-2 sm:border-4 border-[#E0C097] p-3 text-[#4A2C2A] h-[calc(100vh-180px)] sm:h-[calc(100vh-190px)] flex flex-col justify-between overflow-hidden">
      {!isFighting ? (
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-3 overflow-hidden min-h-0">
          {/* 左コンテンツ：大会リスト */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden h-1/2 lg:h-full min-h-0">
            <div className="mb-1.5 flex-shrink-0">
              <h2 className="text-sm sm:text-base font-black text-[#D32F2F] flex items-center gap-1 leading-tight">
                🏮 全国名物ラーメンコンテスト品評会
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-550 font-bold leading-none mt-0.5">
                自慢の極みラーメンを出品し、名だたる審査員達の舌を唸らせて制覇を目指そう！
              </p>
            </div>

            {/* コンテスト一覧カード */}
            <div id="contests_list_container" className="space-y-1.5 flex-1 overflow-y-auto pr-1 min-h-0">
              {CONTESTS.map((contest) => {
                const isUnlocked = saveState.famous >= contest.minFamous;
                const isCompleted = saveState.completedContestIds.includes(contest.id);
                const isSelected = selectedContestId === contest.id;

                return (
                  <div
                    key={contest.id}
                    id={`contest-card-${contest.id}`}
                    onClick={() => {
                      if (isUnlocked) {
                        setSelectedContestId(isSelected ? null : contest.id);
                        setSelectedRamenId(null);
                      }
                    }}
                    className={`p-2.5 border-2 rounded-xl relative transition-all duration-200 select-none ${
                      !isUnlocked ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed text-gray-400' :
                      isSelected ? 'bg-white border-[#D32F2F] ring-2 ring-[#D32F2F]/15 shadow-sm cursor-pointer text-[#4A2C2A]' :
                      isCompleted ? 'bg-[#FFF9E6] border-[#C49000] hover:border-[#FBC02D] cursor-pointer text-[#4A2C2A]' :
                      'bg-white border-[#E0C097] hover:border-[#D32F2F] cursor-pointer text-[#4A2C2A]'
                    }`}
                  >
                    {isCompleted && (
                      <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-[#FFF9E6] border border-[#C49000] text-[#D32F2F] text-[9px] px-2 py-0.5 rounded-full font-black">
                        <ShieldCheck size={10} />
                        <span>制覇</span>
                      </div>
                    )}

                    <div className="flex gap-2.5 items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                        !isUnlocked ? 'bg-gray-200 text-gray-400' :
                        isCompleted ? 'bg-[#FFF9E6] text-[#D32F2F]' : 'bg-[#FFFBF0] border border-[#E0C097] text-[#D32F2F] shadow-inner'
                      }`}>
                        {isCompleted ? <Trophy size={13} /> : <Award size={13} />}
                      </div>

                      <div className="flex-1 min-w-0 pr-8">
                        <h4 className="text-xxs sm:text-xs font-black text-[#4A2C2A] flex items-center gap-1 truncate">
                          <span>{contest.name}</span>
                        </h4>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium line-clamp-1">{contest.description}</p>
                        
                        {isUnlocked ? (
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-mono text-gray-500 font-bold leading-none">
                            <div>
                              <span className="text-gray-450">参加費:</span>{' '}
                              <span className="font-extrabold text-[#4A2C2A]">{contest.entryFee}G</span>
                            </div>
                            <div>
                              <span className="text-gray-450">目安:</span>{' '}
                              <span className="font-extrabold text-[#D32F2F]">
                                {contest.targetTaste + contest.targetRichness}点
                              </span>
                            </div>
                            <div className="text-[#D32F2F]/90 font-sans font-black italic leading-none shrink-0">
                              {contest.conditionsText}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 flex items-center gap-0.5 bg-red-50 border border-red-200 py-0.5 px-2 rounded text-[9px] text-[#D32F2F] font-bold self-start w-max">
                            <AlertTriangle size={9} />
                            <span>解放知名度: {contest.minFamous} FP 以上</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右コンテンツ：出場ラーメン選択＆詳細 */}
          <div className="lg:col-span-5 bg-[#FFFBF0]/35 border border-[#E0C097]/40 p-2.5 sm:p-3 rounded-2xl shadow-sm h-1/2 lg:h-full overflow-y-auto text-[#4A2C2A] min-h-0 flex flex-col justify-between">
            {activeContest ? (
              <div id="contest_entry_panel" className="space-y-2.5 animate-fade-in flex flex-col justify-between h-full min-h-0">
                <div className="space-y-2 flex-1 overflow-y-auto pr-1 min-h-0">
                  <span className="text-[9px] font-mono text-[#D32F2F] uppercase tracking-widest block font-black">
                    【エントリー設定】
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-[#D32F2F] flex items-center gap-1 leading-tight">
                      🏮 {activeContest.name}
                    </h3>
                    <div className="bg-[#FFFBF0] p-2 rounded-xl border border-[#E0C097] text-[10px] text-[#4A2C2A] mt-1 leading-relaxed">
                      <p className="font-bold italic">{activeContest.description}</p>
                      <p className="text-[#D32F2F] font-black mt-1.5 border-t border-[#E0C097]/30 pt-1">
                        審査要請：{activeContest.conditionsText}
                      </p>
                    </div>
                  </div>

                  {/* 報酬チェック */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-white p-2 rounded-xl border border-[#E0C097]">
                    <div>
                      <span className="text-gray-450 block text-[9px]">優勝賞金:</span>
                      <span className="font-extrabold text-[#D32F2F] text-xs">{activeContest.rewardCash} G</span>
                    </div>
                    <div>
                      <span className="text-gray-450 block text-[9px]">獲得知名度:</span>
                      <span className="font-extrabold text-[#D32F2F] text-xs">+{activeContest.rewardFamous} FP</span>
                    </div>
                  </div>

                  {/* ライバルのデータ */}
                  <div className="bg-white p-2 rounded-xl border border-[#E0C097] text-[10px]">
                    <h4 className="text-[9px] font-black text-gray-500 mb-0.5">⚔️ 立ちふさがるライバル</h4>
                    <div className="space-y-0.5">
                      {activeContest.opponents.map((op, idx) => (
                        <div key={idx} className="flex justify-between font-mono text-[9px]">
                          <span className="text-[#4A2C2A] font-semibold truncate max-w-[140px]">🧑‍🍳 {op.name} <span className="text-[8px] text-gray-400">({op.ramenName})</span></span>
                          <span className="font-extrabold text-red-600">{op.score}点</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 出場ラーメン選定 */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 block">🍜 出品するラーメンを選択</label>
                    {saveState.ramenRecipes.length === 0 ? (
                      <div className="bg-red-50 border border-red-200 p-2 rounded-xl text-center">
                        <p className="text-[9px] text-[#D32F2F] font-bold leading-normal">
                          出品できるオリジナルラーメンがありません。<br />まずは「開発」からラーメンを開発してください！
                        </p>
                      </div>
                    ) : (
                      <select
                        id="select_contest_ramen"
                        value={selectedRamenId || ''}
                        onChange={(e) => {
                          setSelectedRamenId(e.target.value || null);
                        }}
                        className="w-full bg-white border border-[#E0C097] rounded-xl px-2 py-1.5 text-[10px] text-[#4A2C2A] font-bold focus:outline-none focus:ring-1 focus:ring-[#D32F2F]"
                      >
                        <option value="">-- 出品するラーメンを選択 --</option>
                        {saveState.ramenRecipes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.score}点)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* ボタン */}
                <button
                  id="btn_submit_to_contest"
                  onClick={handleEntry}
                  disabled={!selectedRamenId}
                  className="w-full bg-[#FBC02D] hover:bg-[#F9A825] border-b-2 border-[#C49000] text-[#4A2C2A] font-black py-2 rounded-xl transition shadow disabled:opacity-45 text-[10px] sm:text-xs flex items-center justify-center gap-1 flex-shrink-0 mt-1"
                >
                  <Play size={11} fill="#4A2C2A" />
                  <span>参加登録してコンテストに挑戦！ ({activeContest.entryFee}G)</span>
                </button>
              </div>
            ) : (
              <div id="no_contest_selected_placeholder" className="my-auto flex flex-col items-center justify-center text-center py-10 w-full">
                <Trophy size={26} className="text-gray-300 animate-bounce [animation-duration:4s]" />
                <h3 className="text-[9px] font-black text-[#E0C097] mt-2 uppercase tracking-wider">
                  ← 左の大会リストから挑戦するコンテストを選択
                </h3>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ==================== 審査・対決中アニメーション ==================== */
        <div id="contest_fight_animator_container" className="flex-1 flex flex-col items-center justify-center py-2 overflow-y-auto">
          <div id="contest_fight_animator" className="w-full max-w-sm bg-white border-2 border-[#E0C097] rounded-2xl p-4 shadow-sm space-y-3.5 text-center animate-fade-in text-[#4A2C2A] mx-auto">
            {fightStep === 'introduction' && (
              <div className="space-y-3 py-1 animate-scale-up">
                <span className="text-3xl animate-bounce block">🏮</span>
                <h2 className="text-sm font-black text-[#D32F2F]">コンテスト開会！</h2>
                <div className="bg-[#FFFBF0] border border-[#E0C097] p-2.5 rounded-xl text-[10px] text-[#4A2C2A] font-bold leading-normal">
                  <p className="text-[#4A2C2A]">「ただいまより、<span className="font-extrabold text-[#D32F2F]">{activeContest?.name}</span>の審査を執り行います！」</p>
                  <p className="text-gray-400 italic mt-1.5">ライバル店、そして自慢の極みラーメンが今、審査員のテーブルに用意されます...</p>
                </div>
              </div>
            )}

            {fightStep === 'inspection' && (
              <div className="space-y-3 py-1 animate-fade-in">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-black">
                  【審査員の実食テイスティング】
                </span>
                
                {/* 審査トリオ */}
                <div className="flex justify-around items-center border-b border-[#E0C097]/40 pb-2">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl animate-pulse">👴</span>
                    <span className="text-[8px] text-[#4A2C2A] font-black block mt-0.5">ラーメンのカリスマ</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl animate-pulse [animation-delay:0.2s]">👩‍🍳</span>
                    <span className="text-[8px] text-[#4A2C2A] font-black block mt-0.5">ミシュラン料理シェフ</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl animate-pulse [animation-delay:0.4s]">🥸</span>
                    <span className="text-[8px] text-[#4A2C2A] font-black block mt-0.5">拉麺評論家</span>
                  </div>
                </div>

                {/* 審査コメント */}
                <div id="contest_critique_comments" className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {judgeComments.slice(0, 3).map((cmt, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-[#FFFBF0] border border-[#E0C097] rounded-xl text-[9px] text-left animate-fade-in shadow-sm leading-normal"
                      style={{ animationDelay: `${idx * 1.5}s`, animationFillMode: 'both' }}
                    >
                      <p className="font-serif italic text-amber-700 font-bold">{cmt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fightStep === 'scoring' && (
              <div className="space-y-3 py-1 animate-fade-in">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-black">
                  【採点集計中...】
                </span>

                {/* グラフ的な得点競り上がりメーター */}
                <div id="grading_chart_container" className="space-y-2.5 text-left font-mono text-[9px] sm:text-xxs">
                  {/* 1. プレイヤー */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between leading-none text-red-700 font-extrabold">
                      <span className="truncate max-w-[130px]">🍜 あなた: {activeRamen?.name}</span>
                      <span className="font-black text-[11px]">{scoreAnimation.player} 点</span>
                    </div>
                    <div className="w-full bg-[#FFFBF0] h-2.5 border border-[#E0C097] rounded overflow-hidden relative shadow-inner">
                      <div
                        className="bg-red-500 h-full rounded transition-all duration-75"
                        style={{ width: `${Math.min(100, (scoreAnimation.player / 999) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. ライバル 1 */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between leading-none text-gray-500 font-bold">
                      <span className="truncate max-w-[130px]">👤 {activeContest?.opponents[0].name}</span>
                      <span>{scoreAnimation.op1} 点</span>
                    </div>
                    <div className="w-full bg-[#FFFBF0] h-2.5 border border-[#E0C097] rounded overflow-hidden relative shadow-inner">
                      <div
                        className="bg-gray-400 h-full transition-all duration-75"
                        style={{ width: `${Math.min(100, (scoreAnimation.op1 / 999) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. ライバル 2 */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between leading-none text-gray-500 font-bold">
                      <span className="truncate max-w-[130px]">👤 {activeContest?.opponents[1].name}</span>
                      <span>{scoreAnimation.op2} 点</span>
                    </div>
                    <div className="w-full bg-[#FFFBF0] h-2.5 border border-[#E0C097] rounded overflow-hidden relative shadow-inner">
                      <div
                        className="bg-gray-400 h-full transition-all duration-75"
                        style={{ width: `${Math.min(100, (scoreAnimation.op2 / 999) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {fightStep === 'result' && (
              <div className="space-y-3 pt-1 animate-scale-up">
                {winnerName === 'あなた' ? (
                  <div className="space-y-2 text-[#4A2C2A]">
                    <span className="text-3xl animate-bounce block leading-none">🏆</span>
                    <h3 className="text-xs sm:text-sm font-black text-[#D32F2F] leading-tight">
                      品評会 優勝！💮
                    </h3>
                    <p className="text-[9px] text-gray-500 font-bold">
                      見事ライバル店主達を抑え、栄光の頂点に輝きました。
                    </p>

                    {/* 報酬報告 */}
                    <div id="contest_reward_report" className="bg-[#FFFBF0] border border-[#E0C097] p-2 rounded text-[9px] text-left space-y-1 font-mono text-[#4A2C2A]">
                      <p className="text-[#D32F2F] font-black border-b border-[#E0C097] pb-1">🎁 【獲得賞品・報酬】</p>
                      <div className="flex justify-between font-bold leading-none mt-1">
                        <span className="text-gray-500">優勝賞金:</span>
                        <span className="font-bold text-emerald-600">+{activeContest?.rewardCash} G</span>
                      </div>
                      <div className="flex justify-between font-bold leading-none">
                        <span className="text-gray-500">知名度獲得:</span>
                        <span className="font-bold text-[#D32F2F]">+{activeContest?.rewardFamous} FP</span>
                      </div>
                      {activeContest?.rewardUnlockId && (
                        <div className="border-t border-[#E0C097] pt-1 mt-1 text-center bg-emerald-5 border-emerald-200 border py-0.5 rounded text-emerald-700 font-sans font-bold flex items-center justify-center gap-1">
                          <span>🔓 新素材が解放されました！</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-3xl block leading-none">🥈</span>
                    <h3 className="text-xs sm:text-sm font-black text-gray-600 leading-tight">
                      惜しくも敗北...！
                    </h3>
                    <p className="text-[9px] text-gray-400 font-semibold leading-relaxed">
                      優勝は「{winnerName}」でした。トッピング盛り付けや麺、スープの相性(組合せ)を見直してまた挑みましょう。
                    </p>
                  </div>
                )}

                <button
                  id="btn_finish_fight_interaction"
                  onClick={handleCloseFight}
                  className="px-4 py-1.5 bg-[#FBC02D] hover:bg-[#F9A825] border-b-2 border-[#C49000] text-[#4A2C2A] text-[9.5px] font-black rounded-lg transition duration-200 shadow w-full"
                >
                  会場をあとにする
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
