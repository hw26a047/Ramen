/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { PlacedTopping, Topping, NoodleConfig } from '../types';
import { RotateCw, Trash2, ZoomIn, ZoomOut } from 'lucide-react';

interface ToppingCanvasProps {
  soupIngredients: string[];
  noodle: NoodleConfig;
  toppings: PlacedTopping[];
  onToppingsChange: (toppings: PlacedTopping[]) => void;
  availableToppings: Topping[];
  selectedToppingId: string | null;
  readOnly?: boolean;
}

export default function ToppingCanvas({
  soupIngredients,
  noodle,
  toppings,
  onToppingsChange,
  availableToppings,
  selectedToppingId,
  readOnly = false,
}: ToppingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);

  // ドラッグ操作用のステート
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const dragStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [ghostCoordinates, setGhostCoordinates] = useState<{ x: number; y: number } | null>(null);

  // 新しくトッピングが追加されたら、自動的にそれを選択する
  useEffect(() => {
    if (toppings.length > 0) {
      const lastTopping = toppings[toppings.length - 1];
      setSelectedPlacementId(lastTopping.placementId);
    } else {
      setSelectedPlacementId(null);
    }
  }, [toppings.length]);

  // スープの見た目（色の設定）
  const getSoupVisual = () => {
    const isMiso = soupIngredients.includes('sauce_miso');
    const isPork = soupIngredients.includes('gala_pork_bones');
    const isShoyu = soupIngredients.includes('sauce_shoyu');
    const isShio = soupIngredients.includes('sauce_shio');
    const hasMayu = soupIngredients.includes('oil_mayu');

    let baseColor = 'rgba(218, 165, 32, 0.4)'; // デフォルト
    let gradientStyle = {};

    if (isMiso) {
      // 味噌スープ：不透明なオレンジ茶色
      baseColor = '#bc6c25'; 
      gradientStyle = {
        background: 'radial-gradient(circle, #dda15e 0%, #bc6c25 70%, #9b5a20 100%)',
      };
    } else if (isPork) {
      // 豚骨スープ：クリーミーなベージュ色
      baseColor = '#ede0d4';
      if (hasMayu) {
        // マー油入りとんこつ
        gradientStyle = {
          background: 'radial-gradient(circle, #ede0d4 20%, #ddb892 50%, #4a3c31 95%, #1a1a1a 100%)',
        };
      } else {
        gradientStyle = {
          background: 'radial-gradient(circle, #f5ebe0 20%, #ede0d4 70%, #ddb892 100%)',
        };
      }
    } else if (isShoyu) {
      // 醤油スープ：クリアな深い茶色
      baseColor = '#5c3d2e';
      gradientStyle = {
        background: 'radial-gradient(circle, rgba(160, 100, 70, 0.7) 10%, rgba(92, 61, 46, 0.9) 60%, rgba(50, 30, 20, 0.95) 100%)',
      };
    } else if (isShio) {
      // 塩スープ：透き通るような明るい黄色
      baseColor = '#f4e4c1';
      gradientStyle = {
        background: 'radial-gradient(circle, rgba(254, 250, 224, 0.6) 10%, rgba(244, 228, 193, 0.8) 70%, rgba(212, 163, 115, 0.9) 100%)',
      };
    } else {
      // デフォルト(お湯に近い)
      gradientStyle = {
        background: 'radial-gradient(circle, rgba(230,220,190,0.5) 0%, rgba(200,180,130,0.6) 100%)',
      };
    }

    return gradientStyle;
  };

  // 麺の描画パスの数
  const getNoodleLinesCount = () => {
    switch (noodle.thickness) {
      case 'ultra_fine': return 35;
      case 'fine': return 28;
      case 'medium': return 22;
      case 'thick': return 16;
      case 'ultra_thick': return 12;
    }
  };

  // 麺の太さ(px)
  const getNoodleWidth = () => {
    switch (noodle.thickness) {
      case 'ultra_fine': return 1.5;
      case 'fine': return 2.5;
      case 'medium': return 3.5;
      case 'thick': return 5;
      case 'ultra_thick': return 7;
    }
  };

  // 丼がクリックされた時（トッピングの新規配置）
  const handleBowlClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if (dragTargetId) return; // ドラッグ中なら新規配置はしない
    if (!containerRef.current) return;

    // もしトッピングが選択されているなら新規配置
    if (selectedToppingId) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // 丼の枠外(円形外)への配置を防ぐ簡易判定
      const distFromCenter = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
      if (distFromCenter > 42) {
        // 丼のふちに近すぎるため内側に引き込む
        return;
      }

      const newTopping: PlacedTopping = {
        placementId: `tp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        toppingId: selectedToppingId,
        x,
        y,
        rotation: Math.floor(Math.random() * 360), // ランダム初期回転
        scale: 1.0,
      };

      onToppingsChange([...toppings, newTopping]);
      setSelectedPlacementId(newTopping.placementId);
    } else {
      // トッピング選択なしの時は選択解除
      setSelectedPlacementId(null);
    }
  };

  // ドラッグ開始（マウス）
  const handleToppingMouseDown = (e: React.MouseEvent, placementId: string) => {
    if (readOnly) return;
    e.stopPropagation(); // 丼へのクリック判定を伝達させない
    
    setSelectedPlacementId(placementId);
    setDragTargetId(placementId);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickY = ((e.clientY - rect.top) / rect.height) * 100;

      const tp = toppings.find((t) => t.placementId === placementId);
      if (tp) {
        dragStartOffset.current = {
          x: clickX - tp.x,
          y: clickY - tp.y,
        };
      }
    }
  };

  // ドラッグ開始（タッチ）
  const handleToppingTouchStart = (e: React.TouchEvent, placementId: string) => {
    if (readOnly) return;
    e.stopPropagation(); // 丼へのタッチ判定を伝達させない
    
    setSelectedPlacementId(placementId);
    setDragTargetId(placementId);

    if (containerRef.current && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = ((touch.clientX - rect.left) / rect.width) * 100;
      const clickY = ((touch.clientY - rect.top) / rect.height) * 100;

      const tp = toppings.find((t) => t.placementId === placementId);
      if (tp) {
        dragStartOffset.current = {
          x: clickX - tp.x,
          y: clickY - tp.y,
        };
      }
    }
  };

  // ドラッグ移動中およびゴーストプレビュー処理
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    if (dragTargetId) {
      let newX = currentX - dragStartOffset.current.x;
      let newY = currentY - dragStartOffset.current.y;

      // 丼の枠内(半径42%円)に制限
      const distFromCenter = Math.sqrt(Math.pow(newX - 50, 2) + Math.pow(newY - 50, 2));
      if (distFromCenter > 42) {
        const angle = Math.atan2(newY - 50, newX - 50);
        newX = 50 + Math.cos(angle) * 42;
        newY = 50 + Math.sin(angle) * 42;
      }

      const updated = toppings.map((t) => {
        if (t.placementId === dragTargetId) {
          return { ...t, x: newX, y: newY };
        }
        return t;
      });
      onToppingsChange(updated);
    } else if (selectedToppingId) {
      // 選択中トッピングのプレビュー座標更新
      const distFromCenter = Math.sqrt(Math.pow(currentX - 50, 2) + Math.pow(currentY - 50, 2));
      if (distFromCenter <= 42) {
        setGhostCoordinates({ x: currentX, y: currentY });
      } else {
        const angle = Math.atan2(currentY - 50, currentX - 50);
        setGhostCoordinates({
          x: 50 + Math.cos(angle) * 42,
          y: 50 + Math.sin(angle) * 42,
        });
      }
    }
  };

  const handleContainerTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if (!dragTargetId) return;
    if (e.touches.length === 0) return;
    e.preventDefault();

    if (!containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = ((touch.clientX - rect.left) / rect.width) * 100;
    const currentY = ((touch.clientY - rect.top) / rect.height) * 100;

    let newX = currentX - dragStartOffset.current.x;
    let newY = currentY - dragStartOffset.current.y;

    const distFromCenter = Math.sqrt(Math.pow(newX - 50, 2) + Math.pow(newY - 50, 2));
    if (distFromCenter > 42) {
      const angle = Math.atan2(newY - 50, newX - 50);
      newX = 50 + Math.cos(angle) * 42;
      newY = 50 + Math.sin(angle) * 42;
    }

    const updated = toppings.map((t) => {
      if (t.placementId === dragTargetId) {
        return { ...t, x: newX, y: newY };
      }
      return t;
    });
    onToppingsChange(updated);
  };

  const handleContainerMouseUpOrLeave = () => {
    setDragTargetId(null);
    setGhostCoordinates(null);
  };

  // トッピングオブジェクトに対する操作
  const updateSelectedTopping = (updater: (tp: PlacedTopping) => PlacedTopping) => {
    if (!selectedPlacementId) return;
    const updated = toppings.map((t) => {
      if (t.placementId === selectedPlacementId) {
        return updater(t);
      }
      return t;
    });
    onToppingsChange(updated);
  };

  // 削除
  const handleDeleteSelected = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPlacementId) return;
    onToppingsChange(toppings.filter(t => t.placementId !== selectedPlacementId));
    setSelectedPlacementId(null);
  };

  // 回転
  const handleRotateSelected = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateSelectedTopping((t) => ({
      ...t,
      rotation: (t.rotation + 45) % 360,
    }));
  };

  // サイズ変更
  const handleScaleSelected = (factor: number, e: React.MouseEvent) => {
    e.stopPropagation();
    updateSelectedTopping((t) => ({
      ...t,
      scale: Math.max(0.6, Math.min(2.0, t.scale + factor)),
    }));
  };

  // SVGでの麺の描画要素
  const renderNoodles = () => {
    const linesCount = getNoodleLinesCount();
    const strokeWidth = getNoodleWidth();
    const strokeColor = noodle.hydration === 'high' ? '#fff2b2' : '#fbe285'; // 多加水は白っぽくツヤ、低加水は黄色っぽい
    const isWavy = noodle.waviness === 'wavy';

    const paths: React.ReactNode[] = [];

    for (let i = 0; i < linesCount; i++) {
      // 丼の中心をベースにした曲線を描く
      // プレイヤーが「お〜麺が入ってる」と感じるような、折り重なるパスカーブ
      const startX = 20 + (i * (60 / Math.max(1, linesCount)));
      const endX = 80 - (i * (60 / Math.max(1, linesCount))) + (Math.sin(i) * 10);
      
      let d = '';
      if (isWavy) {
        // ちぢれ麺: サイン波を重ねる
        d = `M ${startX} 20 `;
        const segments = 8;
        for (let s = 1; s <= segments; s++) {
          const ratio = s / segments;
          const currY = 20 + ratio * 60;
          const currX = startX + (endX - startX) * ratio + Math.sin(ratio * Math.PI * 4 + i) * 4;
          d += ` Q ${currX + (s % 2 === 0 ? 3 : -3)} ${currY - 5}, ${currX} ${currY}`;
        }
      } else {
        // ストレート麺: 緩やかなCubicベジェ曲線
        const cp1x = startX + (Math.cos(i) * 15);
        const cp1y = 35;
        const cp2x = endX - (Math.sin(i) * 15);
        const cp2y = 65;
        d = `M ${startX} 20 C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} 80`;
      }

      paths.push(
        <path
          key={`noodle-${i}`}
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.85 - (i % 4) * 0.05}
        />
      );
    }
    return paths;
  };

  return (
    <div className="flex flex-col items-center">
      {/* どんぶり本体 */}
      <div
        id="ramen_bowl_container"
        ref={containerRef}
        onClick={handleBowlClick}
        onMouseMove={handleContainerMouseMove}
        onTouchMove={handleContainerTouchMove}
        onMouseUp={handleContainerMouseUpOrLeave}
        onMouseLeave={handleContainerMouseUpOrLeave}
        onTouchEnd={handleContainerMouseUpOrLeave}
        className={`relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full border-8 sm:border-12 border-[#D32F2F] bg-[#4A2C2A] shadow-2xl overflow-hidden select-none transition-all duration-300 touch-none ${
          selectedToppingId ? 'ring-4 ring-[#FBC02D] ring-offset-2 cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* どんぶりのふちの和風模様 */}
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#FBC02D] opacity-35 pointer-events-none" />

        {/* スープ */}
        <div
          className="absolute inset-[8px] sm:inset-[12px] rounded-full transition-all duration-500 pointer-events-none"
          style={getSoupVisual()}
        />

        {/* 渦巻き模様・油の浮いたテクスチャ */}
        <div className="absolute inset-[10px] sm:inset-[16px] rounded-full bg-cover opacity-10 mix-blend-overlay pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 60%)' }} />

        {/* スープ油球（テカリの輪） */}
        <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-white opacity-10 blur-xl pointer-events-none" />

        {/* 麺 (SVGで描画) */}
        <svg
          className="absolute inset-[10px] sm:inset-[16px] w-[calc(100%-20px)] sm:w-[calc(100%-32px)] h-[calc(100%-20px)] sm:h-[calc(100%-32px)] pointer-events-none"
          viewBox="0 0 100 100"
        >
          {renderNoodles()}
        </svg>

        {/* 選択中のトッピングのゴーストプレビュー */}
        {selectedToppingId && ghostCoordinates && !readOnly && (
          <div
            style={{
              left: `${ghostCoordinates.x}%`,
              top: `${ghostCoordinates.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute pointer-events-none opacity-60 z-40 animate-pulse"
          >
            <div className="text-3xl sm:text-4xl md:text-5xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
              {availableToppings.find(t => t.id === selectedToppingId)?.emoji || '❓'}
            </div>
            {/* 配置可能を示す点線の枠 */}
            <div className="absolute -inset-2 border-2 border-dashed border-[#D32F2F] rounded-full animate-spin [animation-duration:8s]" />
          </div>
        )}

        {/* 配置されたトッピング */}
        {toppings.map((tp) => {
          const matchedTopping = availableToppings.find((t) => t.id === tp.toppingId);
          const isSelected = tp.placementId === selectedPlacementId;

          return (
            <div
              key={tp.placementId}
              id={`placed-topping-${tp.placementId}`}
              onMouseDown={(e) => handleToppingMouseDown(e, tp.placementId)}
              onTouchStart={(e) => handleToppingTouchStart(e, tp.placementId)}
              style={{
                left: `${tp.x}%`,
                top: `${tp.y}%`,
                transform: `translate(-50%, -50%) rotate(${tp.rotation}deg) scale(${tp.scale})`,
              }}
              className={`absolute select-none ${
                readOnly
                  ? 'pointer-events-none'
                  : 'cursor-grab active:cursor-grabbing'
              } transition-shadow ${
                isSelected && !readOnly
                  ? 'ring-4 ring-[#FBC02D] ring-offset-2 z-35 scale-120 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]'
                  : 'hover:scale-110 z-20 hover:ring-2 hover:ring-[#E0C097]/80'
              }`}
            >
              {/* トッピング実体 (Emoji + 影) */}
              <div className="relative text-3xl sm:text-4xl md:text-5xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] animate-fade-in pointer-events-none">
                {matchedTopping?.emoji || '❓'}
              </div>

              {/* 選択中の演出枠 */}
              {isSelected && !readOnly && (
                <div className="absolute -inset-2.5 border-2 border-dashed border-[#D32F2F] rounded-full animate-spin [animation-duration:12s]" />
              )}
            </div>
          );
        })}
      </div>

      {/* 配置したトッピング操作用パネル */}
      {selectedPlacementId && !readOnly && (
        <div id="topping_controls_panel" className="mt-4 flex flex-wrap items-center gap-2 bg-white border-4 border-[#E0C097] p-2.5 rounded-2xl shadow-sm animate-fade-in text-[#4A2C2A]">
          <span className="text-xs text-[#4A2C2A] px-2 font-black">
            {availableToppings.find(t => t.id === toppings.find(pt => pt.placementId === selectedPlacementId)?.toppingId)?.name}
          </span>
          <div className="h-4 w-[1px] bg-gray-200" />
          
          {/* 回転 */}
          <button
            id="btn_rotate_topping"
            onClick={handleRotateSelected}
            className="flex items-center gap-1 bg-[#FFFBF0] hover:bg-[#FBC02D]/15 border border-[#E0C097] text-[#4A2C2A] text-xs px-2.5 py-1.5 rounded-xl transition duration-200 font-bold cursor-pointer"
            title="回転"
          >
            <RotateCw size={13} className="text-[#D32F2F]" />
            <span>回転</span>
          </button>

          {/* 拡大 */}
          <button
            id="btn_scale_up_topping"
            onClick={(e) => handleScaleSelected(0.1, e)}
            className="flex items-center gap-1 bg-[#FFFBF0] hover:bg-[#FBC02D]/15 border border-[#E0C097] text-[#4A2C2A] text-xs p-1.5 rounded-xl transition duration-200 cursor-pointer"
            title="拡大"
          >
            <ZoomIn size={13} className="text-[#D32F2F]" />
          </button>

          {/* 縮小 */}
          <button
            id="btn_scale_down_topping"
            onClick={(e) => handleScaleSelected(-0.1, e)}
            className="flex items-center gap-1 bg-[#FFFBF0] hover:bg-[#FBC02D]/15 border border-[#E0C097] text-[#4A2C2A] text-xs p-1.5 rounded-xl transition duration-200 cursor-pointer"
            title="縮小"
          >
            <ZoomOut size={13} className="text-[#D32F2F]" />
          </button>

          <div className="h-4 w-[1px] bg-gray-200" />

          {/* 削除 */}
          <button
            id="btn_delete_topping"
            onClick={handleDeleteSelected}
            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-[#D32F2F] text-xs px-2.5 py-1.5 rounded-xl transition duration-200 font-bold cursor-pointer"
            title="トッピング取り消し"
          >
            <Trash2 size={13} />
            <span>撤去</span>
          </button>
        </div>
      )}

      {/* ガイド看板 */}
      {!readOnly && (
        <p className="text-xs text-gray-500 font-bold mt-2 text-center leading-relaxed">
          {selectedToppingId
            ? '💡 具材を選択したら丼内の好きな位置をドラッグして自由に配置できます！'
            : '💡 置いた具材をドラッグして移動、またはクリックして回転・サイズ調節・撤去ができます'}
        </p>
      )}
    </div>
  );
}
