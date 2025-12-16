/**
 * ============================================
 * Phase 1-5: 합(合)/충(沖) 상호작용 처리
 * ============================================
 * 
 * 사주 글자 간의 상호작용을 분석하고 점수를 조정합니다.
 */

import type { Pillar } from '../../types';
import type {
  Ohaeng,
  OhaengScores,
  HabInfo,
  ChungInfo,
  InteractionResult,
  SajuInput,
} from './types';

import {
  HAB_MULTIPLIERS,
  CHUNG_REDUCTION,
} from './weights';

import {
  CHEONGAN_INFO,
  JIJI_INFO,
  CHEONGAN_HAB,
  SAMHAB,
  BANGHAB,
  YUKHAB,
  JIJI_CHUNG,
  CHUNG_CATEGORY,
  KING_BRANCHES,
} from './data';

import { createEmptyScores } from './forceCalculator';

// ============================================
// 천간합 분석
// ============================================

/**
 * 천간합 탐지
 * @param cheongans 천간 4글자 배열 [시간, 일간, 월간, 년간]
 * @param monthBranch 월지 (합화 성립 조건 체크용)
 */
export function detectCheonganHab(
  cheongans: string[],
  monthBranch: string
): HabInfo[] {
  const habs: HabInfo[] = [];
  
  // 인접한 천간끼리만 합 체크 (년-월, 월-일, 일-시)
  const pairs: [number, number][] = [[3, 2], [2, 1], [1, 0]]; // 년-월, 월-일, 일-시
  
  for (const [i, j] of pairs) {
    const char1 = cheongans[i];
    const char2 = cheongans[j];
    
    if (!char1 || !char2 || char1 === '-' || char2 === '-') continue;
    
    const habInfo = CHEONGAN_HAB[char1];
    if (!habInfo || habInfo.pair !== char2) continue;
    
    // 합화 조건 체크: 월지가 합화 오행을 지원하는가?
    const resultOhaeng = habInfo.resultOhaeng;
    const monthInfo = JIJI_INFO[monthBranch];
    const isTransformed = monthInfo?.ohaeng === resultOhaeng;
    
    if (isTransformed) {
      // 진합 (합화 성공)
      habs.push({
        type: 'cheongan_true',
        chars: [char1, char2],
        resultOhaeng,
        multiplier: HAB_MULTIPLIERS.CHEONGAN_HAB_TRUE,
        description: `${char1}${char2} 천간합 → ${resultOhaeng} 합화 성공`,
      });
    } else {
      // 기반 (합 실패, 묶임)
      habs.push({
        type: 'cheongan_tie',
        chars: [char1, char2],
        resultOhaeng,
        multiplier: HAB_MULTIPLIERS.CHEONGAN_HAB_TIE,
        description: `${char1}${char2} 천간합 기반 (합화 미성립)`,
      });
    }
  }
  
  return habs;
}

// ============================================
// 삼합 분석
// ============================================

/**
 * 삼합 탐지
 * @param jijis 지지 4글자 배열
 */
export function detectSamhab(jijis: string[]): HabInfo[] {
  const habs: HabInfo[] = [];
  const uniqueJijis = [...new Set(jijis.filter(j => j && j !== '-'))];
  
  for (const [name, info] of Object.entries(SAMHAB)) {
    const { members, resultOhaeng, king } = info;
    
    // 완전 삼합 체크
    const matchCount = members.filter(m => uniqueJijis.includes(m)).length;
    
    if (matchCount === 3) {
      // 삼합 완성
      habs.push({
        type: 'samhab_full',
        chars: members,
        resultOhaeng,
        multiplier: HAB_MULTIPLIERS.SAMHAB_FULL,
        description: `${members.join('')} 삼합 ${name} 완성`,
      });
    } else if (matchCount === 2) {
      // 반합 체크
      const matchedMembers = members.filter(m => uniqueJijis.includes(m));
      const hasKing = matchedMembers.includes(king);
      
      if (hasKing) {
        // 왕지 포함 반합
        habs.push({
          type: 'samhab_half',
          chars: matchedMembers,
          resultOhaeng,
          multiplier: HAB_MULTIPLIERS.SAMHAB_HALF_WITH_KING,
          description: `${matchedMembers.join('')} 반합 (왕지 ${king} 포함)`,
        });
      } else {
        // 왕지 미포함 가합 (약함)
        habs.push({
          type: 'samhab_half',
          chars: matchedMembers,
          resultOhaeng,
          multiplier: HAB_MULTIPLIERS.SAMHAB_HALF_WITHOUT_KING,
          description: `${matchedMembers.join('')} 가합 (왕지 미포함, 약함)`,
        });
      }
    }
  }
  
  return habs;
}

// ============================================
// 방합 분석
// ============================================

/**
 * 방합 탐지
 * @param jijis 지지 4글자 배열
 */
export function detectBanghab(jijis: string[]): HabInfo[] {
  const habs: HabInfo[] = [];
  const uniqueJijis = [...new Set(jijis.filter(j => j && j !== '-'))];
  
  for (const [name, info] of Object.entries(BANGHAB)) {
    const { members, resultOhaeng } = info;
    const matchCount = members.filter(m => uniqueJijis.includes(m)).length;
    
    if (matchCount === 3) {
      // 방합 완성
      habs.push({
        type: 'banghab_full',
        chars: members,
        resultOhaeng,
        multiplier: HAB_MULTIPLIERS.BANGHAB_FULL,
        description: `${members.join('')} 방합 ${name} 완성`,
      });
    } else if (matchCount === 2) {
      // 방합 반합
      const matchedMembers = members.filter(m => uniqueJijis.includes(m));
      habs.push({
        type: 'banghab_half',
        chars: matchedMembers,
        resultOhaeng,
        multiplier: HAB_MULTIPLIERS.BANGHAB_HALF,
        description: `${matchedMembers.join('')} 방합 반합`,
      });
    }
  }
  
  return habs;
}

// ============================================
// 육합 분석
// ============================================

/**
 * 육합 탐지 (인접한 지지끼리만)
 * @param jijis 지지 4글자 배열 [시지, 일지, 월지, 년지]
 */
export function detectYukhab(jijis: string[]): HabInfo[] {
  const habs: HabInfo[] = [];
  
  // 인접한 지지끼리만 육합 체크 (년-월, 월-일, 일-시)
  const pairs: [number, number][] = [[3, 2], [2, 1], [1, 0]];
  
  for (const [i, j] of pairs) {
    const char1 = jijis[i];
    const char2 = jijis[j];
    
    if (!char1 || !char2 || char1 === '-' || char2 === '-') continue;
    
    const habInfo = YUKHAB[char1];
    if (!habInfo || habInfo.pair !== char2) continue;
    
    habs.push({
      type: 'yukhab',
      chars: [char1, char2],
      resultOhaeng: habInfo.resultOhaeng,
      multiplier: HAB_MULTIPLIERS.YUKHAB,
      description: `${char1}${char2} 육합 → ${habInfo.resultOhaeng}`,
    });
  }
  
  return habs;
}

// ============================================
// 충(沖) 분석
// ============================================

/**
 * 지지충 탐지
 * @param jijis 지지 4글자 배열
 * @param scores 현재 오행 점수 (왕자충발 판단용)
 */
export function detectChung(
  jijis: string[],
  scores?: OhaengScores
): ChungInfo[] {
  const chungs: ChungInfo[] = [];
  const uniqueJijis = [...new Set(jijis.filter(j => j && j !== '-'))];
  
  // 모든 조합 체크
  for (let i = 0; i < uniqueJijis.length; i++) {
    for (let j = i + 1; j < uniqueJijis.length; j++) {
      const char1 = uniqueJijis[i];
      const char2 = uniqueJijis[j];
      
      if (JIJI_CHUNG[char1] !== char2) continue;
      
      // 충 종류 판별
      const categoryKey = `${char1}${char2}`;
      const category = CHUNG_CATEGORY[categoryKey] || CHUNG_CATEGORY[`${char2}${char1}`];
      
      if (!category) continue;
      
      // 감산율 결정
      let reduction: number;
      let hasStorageOpen = false;
      
      switch (category) {
        case 'king':
          reduction = CHUNG_REDUCTION.KING_CLASH;
          break;
        case 'birth':
          reduction = CHUNG_REDUCTION.BIRTH_CLASH;
          break;
        case 'storage':
          reduction = CHUNG_REDUCTION.STORAGE_CLASH;
          hasStorageOpen = true; // 고지충은 개고 효과
          break;
        default:
          reduction = 0.7;
      }
      
      const categoryNames = {
        king: '왕지충',
        birth: '생지충',
        storage: '고지충 (개고)',
      };
      
      chungs.push({
        type: category,
        chars: [char1, char2],
        reduction,
        hasStorageOpen,
        description: `${char1}${char2} ${categoryNames[category]}`,
      });
    }
  }
  
  return chungs;
}

// ============================================
// 상호작용에 의한 점수 조정
// ============================================

/**
 * 합에 의한 점수 조정 계산
 */
export function calculateHabAdjustments(
  habs: HabInfo[],
  baseScores: OhaengScores
): OhaengScores {
  const adjustments = createEmptyScores();
  
  for (const hab of habs) {
    switch (hab.type) {
      case 'samhab_full':
      case 'banghab_full':
        // 완전 합: 해당 오행 점수 증폭
        const currentScore = baseScores[hab.resultOhaeng];
        const bonus = currentScore * (hab.multiplier - 1);
        adjustments[hab.resultOhaeng] += bonus;
        break;
        
      case 'samhab_half':
      case 'banghab_half':
        // 반합: 약한 증폭
        const halfBonus = baseScores[hab.resultOhaeng] * (hab.multiplier - 1);
        adjustments[hab.resultOhaeng] += halfBonus;
        break;
        
      case 'cheongan_true':
        // 천간합 진합: 합화 오행에 보너스
        adjustments[hab.resultOhaeng] += baseScores[hab.resultOhaeng] * 0.5;
        break;
        
      case 'cheongan_tie':
        // 천간합 기반: 두 글자 모두 약화 (별도 처리 필요)
        break;
        
      case 'yukhab':
        // 육합: 약한 보너스
        adjustments[hab.resultOhaeng] += baseScores[hab.resultOhaeng] * 0.2;
        break;
    }
  }
  
  return adjustments;
}

/**
 * 충에 의한 점수 조정 계산
 */
export function calculateChungAdjustments(
  chungs: ChungInfo[],
  baseScores: OhaengScores
): OhaengScores {
  const adjustments = createEmptyScores();
  
  for (const chung of chungs) {
    const [char1, char2] = chung.chars;
    const ohaeng1 = JIJI_INFO[char1]?.ohaeng;
    const ohaeng2 = JIJI_INFO[char2]?.ohaeng;
    
    if (!ohaeng1 || !ohaeng2) continue;
    
    // 두 오행 모두 감산
    const reduction1 = baseScores[ohaeng1] * (1 - chung.reduction);
    const reduction2 = baseScores[ohaeng2] * (1 - chung.reduction);
    
    adjustments[ohaeng1] -= reduction1;
    adjustments[ohaeng2] -= reduction2;
    
    // 고지충 개고 효과: 지장간 점수 가산
    if (chung.hasStorageOpen) {
      // 고지의 지장간 오행들에 보너스
      const storageBonus = (baseScores[ohaeng1] + baseScores[ohaeng2]) * 0.1;
      adjustments[ohaeng1] += storageBonus;
      adjustments[ohaeng2] += storageBonus;
    }
  }
  
  return adjustments;
}

// ============================================
// 통합 상호작용 분석
// ============================================

/**
 * 전체 상호작용 분석
 */
export function analyzeInteractions(
  input: SajuInput,
  baseScores: OhaengScores
): InteractionResult {
  const { pillars } = input;
  
  // 천간, 지지 추출
  const cheongans = [
    pillars.hour.cheonGan.char,
    pillars.day.cheonGan.char,
    pillars.month.cheonGan.char,
    pillars.year.cheonGan.char,
  ];
  
  const jijis = [
    pillars.hour.jiJi.char,
    pillars.day.jiJi.char,
    pillars.month.jiJi.char,
    pillars.year.jiJi.char,
  ];
  
  const monthBranch = pillars.month.jiJi.char;
  
  // 합 탐지
  const cheonganHabs = detectCheonganHab(cheongans, monthBranch);
  const samhabs = detectSamhab(jijis);
  const banghabs = detectBanghab(jijis);
  const yukhabs = detectYukhab(jijis);
  
  const allHabs = [...cheonganHabs, ...samhabs, ...banghabs, ...yukhabs];
  
  // 충 탐지
  const chungs = detectChung(jijis, baseScores);
  
  // 점수 조정 계산
  const habAdjustments = calculateHabAdjustments(allHabs, baseScores);
  const chungAdjustments = calculateChungAdjustments(chungs, baseScores);
  
  // 총 조정값
  const adjustments: OhaengScores = {
    wood: habAdjustments.wood + chungAdjustments.wood,
    fire: habAdjustments.fire + chungAdjustments.fire,
    earth: habAdjustments.earth + chungAdjustments.earth,
    metal: habAdjustments.metal + chungAdjustments.metal,
    water: habAdjustments.water + chungAdjustments.water,
  };
  
  // 설명 생성
  const descriptions: string[] = [];
  
  for (const hab of allHabs) {
    descriptions.push(hab.description);
  }
  for (const chung of chungs) {
    descriptions.push(chung.description);
  }
  
  return {
    habs: allHabs,
    chungs,
    adjustments,
    descriptions,
  };
}

// ============================================
// 디버그 출력
// ============================================

/**
 * 상호작용 분석 결과 출력
 */
export function formatInteractionResult(result: InteractionResult): string {
  const lines: string[] = [];
  
  lines.push('==========================================');
  lines.push('       합(合)/충(沖) 상호작용 분석');
  lines.push('==========================================');
  lines.push('');
  
  if (result.habs.length > 0) {
    lines.push('--- 발견된 합 ---');
    for (const hab of result.habs) {
      lines.push(`  • ${hab.description} (배수: ${hab.multiplier})`);
    }
    lines.push('');
  }
  
  if (result.chungs.length > 0) {
    lines.push('--- 발견된 충 ---');
    for (const chung of result.chungs) {
      lines.push(`  • ${chung.description} (감산: ${((1 - chung.reduction) * 100).toFixed(0)}%)`);
    }
    lines.push('');
  }
  
  lines.push('--- 오행 점수 조정 ---');
  lines.push(`  목(木): ${result.adjustments.wood >= 0 ? '+' : ''}${result.adjustments.wood.toFixed(2)}`);
  lines.push(`  화(火): ${result.adjustments.fire >= 0 ? '+' : ''}${result.adjustments.fire.toFixed(2)}`);
  lines.push(`  토(土): ${result.adjustments.earth >= 0 ? '+' : ''}${result.adjustments.earth.toFixed(2)}`);
  lines.push(`  금(金): ${result.adjustments.metal >= 0 ? '+' : ''}${result.adjustments.metal.toFixed(2)}`);
  lines.push(`  수(水): ${result.adjustments.water >= 0 ? '+' : ''}${result.adjustments.water.toFixed(2)}`);
  lines.push('');
  lines.push('==========================================');
  
  return lines.join('\n');
}
