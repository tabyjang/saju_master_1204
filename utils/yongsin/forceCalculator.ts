/**
 * ============================================
 * Phase 1: 오행 세력표 (Force Matrix) 계산기
 * ============================================
 * 
 * 사주 8글자의 오행 세력을 수치화합니다.
 */

import type { Pillar } from '../../types';
import type {
  Ohaeng,
  Position,
  OhaengScores,
  CharacterScore,
  ForceMatrix,
  SajuInput,
} from './types';

import {
  CHEONGAN_WEIGHTS,
  JIJI_WEIGHTS,
  JIJANGGAN_DAYS,
  WOLRYEONG_SARYEONG,
} from './weights';

import {
  CHEONGAN_INFO,
  JIJI_INFO,
  JIJANGGAN_DETAIL,
} from './data';

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 빈 오행 점수 객체 생성
 */
export function createEmptyScores(): OhaengScores {
  return {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
}

/**
 * 오행 점수 합산
 */
export function addScores(a: OhaengScores, b: OhaengScores): OhaengScores {
  return {
    wood: a.wood + b.wood,
    fire: a.fire + b.fire,
    earth: a.earth + b.earth,
    metal: a.metal + b.metal,
    water: a.water + b.water,
  };
}

/**
 * 오행 점수 백분율 계산
 */
export function calculatePercentages(scores: OhaengScores): OhaengScores {
  const total = scores.wood + scores.fire + scores.earth + scores.metal + scores.water;
  
  if (total === 0) {
    return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  }
  
  return {
    wood: Math.round((scores.wood / total) * 100 * 10) / 10,
    fire: Math.round((scores.fire / total) * 100 * 10) / 10,
    earth: Math.round((scores.earth / total) * 100 * 10) / 10,
    metal: Math.round((scores.metal / total) * 100 * 10) / 10,
    water: Math.round((scores.water / total) * 100 * 10) / 10,
  };
}

// ============================================
// 천간 점수 계산
// ============================================

/**
 * 천간 점수 계산
 * @param char 천간 글자
 * @param position 위치
 * @param isDayMaster 일간인지 여부
 */
export function calculateCheonganScore(
  char: string,
  position: Position,
  isDayMaster: boolean = false
): CharacterScore | null {
  // 일간은 점수 계산에서 제외
  if (isDayMaster) {
    return null;
  }
  
  const info = CHEONGAN_INFO[char];
  if (!info) {
    console.warn(`Unknown cheongan: ${char}`);
    return null;
  }
  
  // 위치별 가중치
  const positionWeight = CHEONGAN_WEIGHTS[position.toUpperCase() as keyof typeof CHEONGAN_WEIGHTS];
  
  // 천간 기본 점수 = 1.0
  const baseScore = 1.0;
  const finalScore = baseScore * positionWeight;
  
  return {
    char,
    ohaeng: info.ohaeng,
    position,
    type: 'cheongan',
    baseScore,
    positionWeight,
    finalScore,
  };
}

// ============================================
// 지지 점수 계산 (지장간 분해 포함)
// ============================================

/**
 * 지지 점수 계산 (지장간 분해)
 * @param char 지지 글자
 * @param position 위치
 * @param isWolryeongSaryeong 월령 사령 여부 (월지인 경우)
 * @param saryeongChar 사령 글자 (월지인 경우, 현재 사령하는 지장간)
 */
export function calculateJijiScore(
  char: string,
  position: Position,
  isWolryeongSaryeong: boolean = false,
  saryeongChar?: string
): CharacterScore | null {
  const info = JIJI_INFO[char];
  if (!info) {
    console.warn(`Unknown jiji: ${char}`);
    return null;
  }
  
  const jijangganInfo = JIJANGGAN_DETAIL[char];
  if (!jijangganInfo) {
    console.warn(`No jijanggan data for: ${char}`);
    return null;
  }
  
  // 위치별 가중치
  const positionWeight = JIJI_WEIGHTS[position.toUpperCase() as keyof typeof JIJI_WEIGHTS];
  
  // 지지 기본 점수 = 1.0
  const baseScore = 1.0;
  
  // 지장간 분해 점수 계산
  const jijangganScores = jijangganInfo.chars.map(jjg => {
    const jjgInfo = CHEONGAN_INFO[jjg.char];
    if (!jjgInfo) return null;
    
    // 일수 기반 비율 계산
    const ratio = jjg.days / jijangganInfo.totalDays;
    let score = baseScore * ratio * positionWeight;
    
    // 월령 사령 보너스 (월지이고, 현재 사령하는 글자인 경우)
    if (isWolryeongSaryeong && saryeongChar === jjg.char) {
      score *= WOLRYEONG_SARYEONG.COMMANDING_BONUS;
    }
    
    return {
      char: jjg.char,
      ohaeng: jjgInfo.ohaeng,
      days: jjg.days,
      score,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);
  
  // 총 점수
  const finalScore = jijangganScores.reduce((sum, jjg) => sum + jjg.score, 0);
  
  return {
    char,
    ohaeng: info.ohaeng,
    position,
    type: 'jiji',
    baseScore,
    positionWeight,
    finalScore,
    jijangganScores,
  };
}

// ============================================
// 단일 주(柱) 점수 계산
// ============================================

/**
 * 단일 주(柱)의 점수 계산
 */
export function calculatePillarScore(
  pillar: Pillar,
  position: Position,
  dayMasterChar: string,
  isWolryeongSaryeong: boolean = false,
  saryeongChar?: string
): { cheongan: CharacterScore | null; jiji: CharacterScore | null } {
  const isDayMaster = position === 'day';
  
  // 천간 점수
  const cheonganScore = calculateCheonganScore(
    pillar.cheonGan.char,
    position,
    isDayMaster
  );
  
  // 지지 점수
  const jijiScore = calculateJijiScore(
    pillar.jiJi.char,
    position,
    isWolryeongSaryeong && position === 'month',
    saryeongChar
  );
  
  return {
    cheongan: cheonganScore,
    jiji: jijiScore,
  };
}

// ============================================
// 전체 오행 세력표 계산
// ============================================

/**
 * 전체 오행 세력표 계산 (Phase 1 핵심)
 * 
 * @param input 사주 입력 데이터
 * @param saryeongChar 현재 월령 사령 글자 (선택)
 * @returns 오행 세력표
 */
export function calculateForceMatrix(
  input: SajuInput,
  saryeongChar?: string
): ForceMatrix {
  const { pillars } = input;
  const dayMasterChar = pillars.day.cheonGan.char;
  const dayMasterInfo = CHEONGAN_INFO[dayMasterChar];
  
  const details: CharacterScore[] = [];
  const scores = createEmptyScores();
  
  // 각 주(柱)별 점수 계산
  const positions: Position[] = ['year', 'month', 'day', 'hour'];
  
  for (const position of positions) {
    const pillar = pillars[position];
    
    // 시주가 없는 경우 (시간 모름)
    if (!pillar || pillar.cheonGan.char === '-') {
      continue;
    }
    
    const pillarScores = calculatePillarScore(
      pillar,
      position,
      dayMasterChar,
      position === 'month', // 월지만 월령 사령 체크
      saryeongChar
    );
    
    // 천간 점수 합산
    if (pillarScores.cheongan) {
      details.push(pillarScores.cheongan);
      scores[pillarScores.cheongan.ohaeng] += pillarScores.cheongan.finalScore;
    }
    
    // 지지 점수 합산 (지장간 분해된 점수)
    if (pillarScores.jiji) {
      details.push(pillarScores.jiji);
      
      // 지장간별 오행 점수 합산
      if (pillarScores.jiji.jijangganScores) {
        for (const jjgScore of pillarScores.jiji.jijangganScores) {
          scores[jjgScore.ohaeng] += jjgScore.score;
        }
      }
    }
  }
  
  // 총점 계산
  const totalScore = scores.wood + scores.fire + scores.earth + scores.metal + scores.water;
  
  // 백분율 계산
  const percentages = calculatePercentages(scores);
  
  return {
    scores,
    percentages,
    details,
    totalScore,
    dayMaster: {
      char: dayMasterChar,
      ohaeng: dayMasterInfo?.ohaeng || 'wood',
      yinYang: dayMasterInfo?.yinYang || 'yang',
    },
  };
}

// ============================================
// 디버그/출력 유틸리티
// ============================================

/**
 * 오행 세력표를 문자열로 출력
 */
export function formatForceMatrix(matrix: ForceMatrix): string {
  const lines: string[] = [];
  
  lines.push('==========================================');
  lines.push('         오행 세력표 (Force Matrix)');
  lines.push('==========================================');
  lines.push('');
  lines.push(`일간: ${matrix.dayMaster.char} (${matrix.dayMaster.ohaeng})`);
  lines.push('');
  lines.push('--- 오행별 점수 ---');
  lines.push(`목(木): ${matrix.scores.wood.toFixed(2)} (${matrix.percentages.wood}%)`);
  lines.push(`화(火): ${matrix.scores.fire.toFixed(2)} (${matrix.percentages.fire}%)`);
  lines.push(`토(土): ${matrix.scores.earth.toFixed(2)} (${matrix.percentages.earth}%)`);
  lines.push(`금(金): ${matrix.scores.metal.toFixed(2)} (${matrix.percentages.metal}%)`);
  lines.push(`수(水): ${matrix.scores.water.toFixed(2)} (${matrix.percentages.water}%)`);
  lines.push(`총점: ${matrix.totalScore.toFixed(2)}`);
  lines.push('');
  lines.push('--- 상세 내역 ---');
  
  for (const detail of matrix.details) {
    const typeStr = detail.type === 'cheongan' ? '천간' : '지지';
    lines.push(`[${detail.position}] ${detail.char} (${typeStr}): ${detail.finalScore.toFixed(2)}`);
    
    if (detail.jijangganScores) {
      for (const jjg of detail.jijangganScores) {
        lines.push(`    └ ${jjg.char}(${jjg.ohaeng}): ${jjg.score.toFixed(2)} (${jjg.days}일)`);
      }
    }
  }
  
  lines.push('==========================================');
  
  return lines.join('\n');
}

/**
 * 오행 세력표 요약 출력
 */
export function summarizeForceMatrix(matrix: ForceMatrix): {
  dominant: Ohaeng;
  weakest: Ohaeng;
  balanced: boolean;
} {
  const { percentages } = matrix;
  
  // 최강 오행
  let dominant: Ohaeng = 'wood';
  let maxPercent = percentages.wood;
  
  for (const [ohaeng, percent] of Object.entries(percentages) as [Ohaeng, number][]) {
    if (percent > maxPercent) {
      maxPercent = percent;
      dominant = ohaeng;
    }
  }
  
  // 최약 오행
  let weakest: Ohaeng = 'wood';
  let minPercent = percentages.wood;
  
  for (const [ohaeng, percent] of Object.entries(percentages) as [Ohaeng, number][]) {
    if (percent < minPercent) {
      minPercent = percent;
      weakest = ohaeng;
    }
  }
  
  // 균형 여부 (최대-최소 차이가 30% 이내)
  const balanced = (maxPercent - minPercent) <= 30;
  
  return { dominant, weakest, balanced };
}
