/**
 * ============================================
 * 용신(用神) 알고리즘 - Phase 1 & 2
 * ============================================
 * 
 * Phase 1: 오행 세력표 계산 및 상호작용 분석
 * Phase 2: 신강/신약 판정
 */

// 타입 Export
export * from './types';

// 가중치 Export (조절 가능)
export * from './weights';

// 기초 데이터 Export
export * from './data';

// 오행 세력표 계산
export {
  createEmptyScores,
  addScores,
  calculatePercentages,
  calculateCheonganScore,
  calculateJijiScore,
  calculatePillarScore,
  calculateForceMatrix,
  formatForceMatrix,
  summarizeForceMatrix,
} from './forceCalculator';

// 합/충 상호작용
export {
  detectCheonganHab,
  detectSamhab,
  detectBanghab,
  detectYukhab,
  detectChung,
  calculateHabAdjustments,
  calculateChungAdjustments,
  analyzeInteractions,
  formatInteractionResult,
} from './interactions';

// 신강/신약 판정 (Phase 2)
export {
  getSibsinCategory,
  isSupport,
  isOppose,
  checkDeukryeong,
  checkDeukryeongDetail,
  checkDeukji,
  isStrongUnseong,
  checkDeukjiDetail,
  calculateDeukse,
  calculateTonggeun,
  calculateStrengthIndex,
  determineStrengthLevel,
  getStrengthLevelName,
  analyzeStrength,
  formatStrengthResult,
} from './strengthCalculator';

// ============================================
// Phase 1 통합 함수
// ============================================

import type { SajuInput, Phase1Result, StrengthResult, OhaengScores } from './types';
import { calculateForceMatrix, addScores } from './forceCalculator';
import { analyzeInteractions } from './interactions';
import { analyzeStrength, formatStrengthResult } from './strengthCalculator';

/**
 * Phase 1 전체 분석 실행
 * 
 * 1. 기본 오행 세력표 계산
 * 2. 합/충 상호작용 분석
 * 3. 최종 보정된 점수 산출
 * 
 * @param input 사주 입력 데이터
 * @param saryeongChar 월령 사령 글자 (선택)
 * @returns Phase 1 분석 결과
 */
export function analyzePhase1(
  input: SajuInput,
  saryeongChar?: string
): Phase1Result {
  const logs: string[] = [];
  
  // Step 1: 기본 오행 세력표 계산
  logs.push('Step 1: 기본 오행 세력표 계산');
  const forceMatrix = calculateForceMatrix(input, saryeongChar);
  logs.push(`  - 총점: ${forceMatrix.totalScore.toFixed(2)}`);
  logs.push(`  - 일간: ${forceMatrix.dayMaster.char} (${forceMatrix.dayMaster.ohaeng})`);
  
  // Step 2: 합/충 상호작용 분석
  logs.push('Step 2: 합/충 상호작용 분석');
  const interactions = analyzeInteractions(input, forceMatrix.scores);
  logs.push(`  - 발견된 합: ${interactions.habs.length}개`);
  logs.push(`  - 발견된 충: ${interactions.chungs.length}개`);
  
  // Step 3: 최종 보정된 점수 계산
  logs.push('Step 3: 최종 보정된 점수 계산');
  const adjustedScores: OhaengScores = addScores(
    forceMatrix.scores,
    interactions.adjustments
  );
  
  // 음수 방지
  for (const key of Object.keys(adjustedScores) as (keyof OhaengScores)[]) {
    if (adjustedScores[key] < 0) {
      adjustedScores[key] = 0;
    }
  }
  
  logs.push('  - 계산 완료');
  
  return {
    forceMatrix,
    interactions,
    adjustedScores,
    logs,
  };
}

/**
 * Phase 1 결과 출력
 */
export function formatPhase1Result(result: Phase1Result): string {
  const lines: string[] = [];
  
  lines.push('╔══════════════════════════════════════════╗');
  lines.push('║       Phase 1: 오행 세력표 분석          ║');
  lines.push('╚══════════════════════════════════════════╝');
  lines.push('');
  
  // 일간 정보
  const dm = result.forceMatrix.dayMaster;
  lines.push(`📍 일간: ${dm.char} (${dm.ohaeng}, ${dm.yinYang})`);
  lines.push('');
  
  // 기본 오행 점수
  lines.push('┌──────────────────────────────────────────┐');
  lines.push('│           기본 오행 세력표               │');
  lines.push('├──────────────────────────────────────────┤');
  const scores = result.forceMatrix.scores;
  const pct = result.forceMatrix.percentages;
  lines.push(`│ 목(木): ${scores.wood.toFixed(2).padStart(6)} (${pct.wood.toFixed(1).padStart(5)}%)          │`);
  lines.push(`│ 화(火): ${scores.fire.toFixed(2).padStart(6)} (${pct.fire.toFixed(1).padStart(5)}%)          │`);
  lines.push(`│ 토(土): ${scores.earth.toFixed(2).padStart(6)} (${pct.earth.toFixed(1).padStart(5)}%)          │`);
  lines.push(`│ 금(金): ${scores.metal.toFixed(2).padStart(6)} (${pct.metal.toFixed(1).padStart(5)}%)          │`);
  lines.push(`│ 수(水): ${scores.water.toFixed(2).padStart(6)} (${pct.water.toFixed(1).padStart(5)}%)          │`);
  lines.push('└──────────────────────────────────────────┘');
  lines.push('');
  
  // 상호작용
  if (result.interactions.habs.length > 0 || result.interactions.chungs.length > 0) {
    lines.push('┌──────────────────────────────────────────┐');
    lines.push('│            합(合)/충(沖) 분석            │');
    lines.push('├──────────────────────────────────────────┤');
    
    for (const hab of result.interactions.habs) {
      lines.push(`│ ✓ ${hab.description.padEnd(36)}│`);
    }
    for (const chung of result.interactions.chungs) {
      lines.push(`│ ✗ ${chung.description.padEnd(36)}│`);
    }
    lines.push('└──────────────────────────────────────────┘');
    lines.push('');
  }
  
  // 최종 보정된 점수
  lines.push('┌──────────────────────────────────────────┐');
  lines.push('│           최종 보정된 오행 점수          │');
  lines.push('├──────────────────────────────────────────┤');
  const adj = result.adjustedScores;
  const adjTotal = adj.wood + adj.fire + adj.earth + adj.metal + adj.water;
  lines.push(`│ 목(木): ${adj.wood.toFixed(2).padStart(6)} (${((adj.wood/adjTotal)*100).toFixed(1).padStart(5)}%)          │`);
  lines.push(`│ 화(火): ${adj.fire.toFixed(2).padStart(6)} (${((adj.fire/adjTotal)*100).toFixed(1).padStart(5)}%)          │`);
  lines.push(`│ 토(土): ${adj.earth.toFixed(2).padStart(6)} (${((adj.earth/adjTotal)*100).toFixed(1).padStart(5)}%)          │`);
  lines.push(`│ 금(金): ${adj.metal.toFixed(2).padStart(6)} (${((adj.metal/adjTotal)*100).toFixed(1).padStart(5)}%)          │`);
  lines.push(`│ 수(水): ${adj.water.toFixed(2).padStart(6)} (${((adj.water/adjTotal)*100).toFixed(1).padStart(5)}%)          │`);
  lines.push('└──────────────────────────────────────────┘');
  
  return lines.join('\n');
}

// ============================================
// Phase 2 통합 함수
// ============================================

/**
 * Phase 2 전체 결과 타입
 */
export interface Phase2Result {
  /** Phase 1 분석 결과 */
  phase1: Phase1Result;
  
  /** 신강/신약 판정 결과 */
  strength: StrengthResult;
  
  /** 분석 로그 */
  logs: string[];
}

/**
 * Phase 1 + 2 통합 분석 실행
 * 
 * 1. Phase 1: 오행 세력표 계산
 * 2. Phase 2: 신강/신약 판정
 * 
 * @param input 사주 입력 데이터
 * @param saryeongChar 월령 사령 글자 (선택)
 * @returns Phase 1 + 2 분석 결과
 */
export function analyzePhase2(
  input: SajuInput,
  saryeongChar?: string
): Phase2Result {
  const logs: string[] = [];
  
  // Phase 1 실행
  logs.push('=== Phase 1: 오행 세력표 계산 ===');
  const phase1Result = analyzePhase1(input, saryeongChar);
  logs.push(...phase1Result.logs);
  
  // Phase 2 실행
  logs.push('');
  logs.push('=== Phase 2: 신강/신약 판정 ===');
  const strengthResult = analyzeStrength(input, phase1Result.adjustedScores);
  logs.push(strengthResult.description);
  
  return {
    phase1: phase1Result,
    strength: strengthResult,
    logs,
  };
}

/**
 * Phase 2 결과 출력 (Phase 1 포함)
 */
export function formatPhase2Result(result: Phase2Result): string {
  const lines: string[] = [];
  
  // Phase 1 결과
  lines.push(formatPhase1Result(result.phase1));
  lines.push('');
  
  // Phase 2 결과
  lines.push(formatStrengthResult(result.strength));
  
  return lines.join('\n');
}
