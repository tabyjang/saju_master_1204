/**
 * ============================================
 * Phase 2: 신강/신약 판정 계산기
 * ============================================
 * 
 * 일간(日干)의 강약을 판정합니다.
 * 
 * 판정 기준:
 * 1. 득령(得令) - 월지가 일간을 돕는가?
 * 2. 득지(得地) - 일지가 일간을 돕는가? 12운성은?
 * 3. 득세(得勢) - 전체적으로 아군이 많은가?
 * 4. 통근(通根) - 일간이 지지에 뿌리가 있는가?
 */

import type { Pillar } from '../../types';
import type {
  Ohaeng,
  OhaengScores,
  StrengthLevel,
  StrengthResult,
  SajuInput,
} from './types';

import {
  TONGGEUN_COEFFICIENT,
  STRENGTH_THRESHOLDS,
  STRENGTH_SCORES,
} from './weights';

import {
  CHEONGAN_INFO,
  JIJI_INFO,
  JIJANGGAN_DETAIL,
  GENERATES_ME,
  SIBSIN_CATEGORIES,
  getSibsinName,
} from './data';

// ============================================
// 십성 분류 유틸리티
// ============================================

/**
 * 오행이 일간 기준으로 어떤 십성 카테고리인지 판별
 */
export function getSibsinCategory(
  dayMasterOhaeng: Ohaeng,
  targetOhaeng: Ohaeng
): 'bigyeop' | 'inseong' | 'siksang' | 'jaeseong' | 'gwanseong' {
  // 같은 오행 = 비겁
  if (dayMasterOhaeng === targetOhaeng) {
    return 'bigyeop';
  }
  
  // 나를 생하는 오행 = 인성
  if (GENERATES_ME[dayMasterOhaeng] === targetOhaeng) {
    return 'inseong';
  }
  
  // 내가 생하는 오행 = 식상
  const iGenerate: { [key in Ohaeng]: Ohaeng } = {
    wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood'
  };
  if (iGenerate[dayMasterOhaeng] === targetOhaeng) {
    return 'siksang';
  }
  
  // 내가 극하는 오행 = 재성
  const iControl: { [key in Ohaeng]: Ohaeng } = {
    wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire'
  };
  if (iControl[dayMasterOhaeng] === targetOhaeng) {
    return 'jaeseong';
  }
  
  // 나를 극하는 오행 = 관성
  return 'gwanseong';
}

/**
 * 십성 카테고리가 아군(나를 돕는)인지 판별
 */
export function isSupport(category: string): boolean {
  return category === 'bigyeop' || category === 'inseong';
}

/**
 * 십성 카테고리가 적군(나를 빼거나 극하는)인지 판별
 */
export function isOppose(category: string): boolean {
  return category === 'siksang' || category === 'jaeseong' || category === 'gwanseong';
}

// ============================================
// 득령 (得令) 판정
// ============================================

/**
 * 득령 여부 판정
 * 
 * 득령 = 월지가 일간을 돕는 오행인 경우
 * - 월지가 비겁(같은 오행)이면 득령
 * - 월지가 인성(나를 생하는 오행)이면 득령
 * 
 * @param dayMasterOhaeng 일간의 오행
 * @param monthBranchOhaeng 월지의 오행
 * @returns 득령 여부
 */
export function checkDeukryeong(
  dayMasterOhaeng: Ohaeng,
  monthBranchOhaeng: Ohaeng
): boolean {
  const category = getSibsinCategory(dayMasterOhaeng, monthBranchOhaeng);
  return isSupport(category);
}

/**
 * 득령 상세 판정 (지장간 기준)
 * 
 * 월지의 본기 오행뿐만 아니라 지장간 전체를 검토
 * 
 * @param dayMasterOhaeng 일간의 오행
 * @param monthBranch 월지 글자
 * @returns { 득령여부, 강도(0~1), 상세설명 }
 */
export function checkDeukryeongDetail(
  dayMasterOhaeng: Ohaeng,
  monthBranch: string
): { isDeukryeong: boolean; strength: number; description: string } {
  const jjgInfo = JIJANGGAN_DETAIL[monthBranch];
  if (!jjgInfo) {
    return { isDeukryeong: false, strength: 0, description: '지장간 정보 없음' };
  }
  
  let supportDays = 0;
  let totalDays = jjgInfo.totalDays;
  const supportChars: string[] = [];
  
  for (const jjg of jjgInfo.chars) {
    const jjgOhaeng = CHEONGAN_INFO[jjg.char]?.ohaeng;
    if (!jjgOhaeng) continue;
    
    const category = getSibsinCategory(dayMasterOhaeng, jjgOhaeng);
    if (isSupport(category)) {
      supportDays += jjg.days;
      supportChars.push(`${jjg.char}(${jjg.days}일)`);
    }
  }
  
  const strength = supportDays / totalDays;
  const isDeukryeong = strength >= 0.5; // 50% 이상이면 득령
  
  let description = '';
  if (isDeukryeong) {
    description = `득령 ✓ - ${monthBranch}월 지장간 중 ${supportChars.join(', ')}이 아군 (${Math.round(strength * 100)}%)`;
  } else if (strength > 0) {
    description = `약한 득령 - ${monthBranch}월 지장간 중 일부 아군 (${Math.round(strength * 100)}%)`;
  } else {
    description = `실령 ✗ - ${monthBranch}월에 아군 지장간 없음`;
  }
  
  return { isDeukryeong, strength, description };
}

// ============================================
// 득지 (得地) 판정
// ============================================

/**
 * 득지 여부 판정
 * 
 * 득지 = 일지가 일간을 돕는 오행인 경우
 * 
 * @param dayMasterOhaeng 일간의 오행
 * @param dayBranchOhaeng 일지의 오행
 * @returns 득지 여부
 */
export function checkDeukji(
  dayMasterOhaeng: Ohaeng,
  dayBranchOhaeng: Ohaeng
): boolean {
  const category = getSibsinCategory(dayMasterOhaeng, dayBranchOhaeng);
  return isSupport(category);
}

/**
 * 12운성 기반 득지 판정
 * 
 * 장생, 관대, 건록, 제왕이면 득지로 봄
 * 
 * @param unseongName 12운성 이름
 * @returns 강한 운성인지 여부
 */
export function isStrongUnseong(unseongName: string): boolean {
  const strongUnseongs = ['장생', '관대', '건록', '제왕'];
  return strongUnseongs.includes(unseongName);
}

/**
 * 득지 상세 판정
 */
export function checkDeukjiDetail(
  dayMasterOhaeng: Ohaeng,
  dayBranch: string,
  unseongName?: string
): { isDeukji: boolean; byOhaeng: boolean; byUnseong: boolean; description: string } {
  const dayBranchOhaeng = JIJI_INFO[dayBranch]?.ohaeng;
  
  // 오행 기반 득지
  const byOhaeng = dayBranchOhaeng ? checkDeukji(dayMasterOhaeng, dayBranchOhaeng) : false;
  
  // 12운성 기반 득지
  const byUnseong = unseongName ? isStrongUnseong(unseongName) : false;
  
  const isDeukji = byOhaeng || byUnseong;
  
  let description = '';
  if (byOhaeng && byUnseong) {
    description = `득지 ✓✓ - 일지 ${dayBranch}이 아군 + 12운성 ${unseongName}`;
  } else if (byOhaeng) {
    description = `득지 ✓ - 일지 ${dayBranch}이 아군`;
  } else if (byUnseong) {
    description = `득지 ✓ - 12운성 ${unseongName}으로 득지`;
  } else {
    description = `실지 ✗ - 일지에서 도움 없음`;
  }
  
  return { isDeukji, byOhaeng, byUnseong, description };
}

// ============================================
// 득세 (得勢) 계산
// ============================================

/**
 * 득세 계산
 * 
 * 아군(비겁+인성) 점수 vs 적군(식상+재관) 점수 비교
 * 
 * @param dayMasterOhaeng 일간의 오행
 * @param scores 보정된 오행별 점수
 * @returns { 아군점수, 적군점수, 차이, 설명 }
 */
export function calculateDeukse(
  dayMasterOhaeng: Ohaeng,
  scores: OhaengScores
): { supportScore: number; opposeScore: number; difference: number; description: string } {
  let supportScore = 0;
  let opposeScore = 0;
  
  const supportDetails: string[] = [];
  const opposeDetails: string[] = [];
  
  for (const [ohaeng, score] of Object.entries(scores) as [Ohaeng, number][]) {
    const category = getSibsinCategory(dayMasterOhaeng, ohaeng);
    
    if (isSupport(category)) {
      supportScore += score;
      if (score > 0) {
        supportDetails.push(`${ohaeng}(${score.toFixed(1)})`);
      }
    } else if (isOppose(category)) {
      opposeScore += score;
      if (score > 0) {
        opposeDetails.push(`${ohaeng}(${score.toFixed(1)})`);
      }
    }
  }
  
  const difference = supportScore - opposeScore;
  
  const description = `아군 ${supportScore.toFixed(1)} [${supportDetails.join(', ')}] vs 적군 ${opposeScore.toFixed(1)} [${opposeDetails.join(', ')}] = 차이 ${difference >= 0 ? '+' : ''}${difference.toFixed(1)}`;
  
  return { supportScore, opposeScore, difference, description };
}

// ============================================
// 통근 (通根) 계산
// ============================================

/**
 * 일간의 통근 여부 및 계수 계산
 * 
 * 통근 = 일간과 같은 오행이 지지의 지장간에 있는 경우
 * 
 * @param dayMasterChar 일간 글자
 * @param pillars 사주 4주
 * @returns { 통근계수, 통근위치들, 설명 }
 */
export function calculateTonggeun(
  dayMasterChar: string,
  pillars: SajuInput['pillars']
): { coefficient: number; positions: string[]; description: string } {
  const dayMasterOhaeng = CHEONGAN_INFO[dayMasterChar]?.ohaeng;
  if (!dayMasterOhaeng) {
    return { coefficient: TONGGEUN_COEFFICIENT.NO_ROOT, positions: [], description: '일간 정보 없음' };
  }
  
  const tonggeunPositions: { position: string; branch: string; chars: string[] }[] = [];
  
  // 각 지지의 지장간 검사
  const positionData = [
    { position: 'month', branch: pillars.month.jiJi.char, weight: TONGGEUN_COEFFICIENT.MONTH },
    { position: 'day', branch: pillars.day.jiJi.char, weight: TONGGEUN_COEFFICIENT.DAY },
    { position: 'hour', branch: pillars.hour.jiJi.char, weight: TONGGEUN_COEFFICIENT.HOUR_YEAR },
    { position: 'year', branch: pillars.year.jiJi.char, weight: TONGGEUN_COEFFICIENT.HOUR_YEAR },
  ];
  
  let maxCoefficient = TONGGEUN_COEFFICIENT.NO_ROOT;
  
  for (const { position, branch, weight } of positionData) {
    if (!branch || branch === '-') continue;
    
    const jjgInfo = JIJANGGAN_DETAIL[branch];
    if (!jjgInfo) continue;
    
    const matchingChars: string[] = [];
    
    for (const jjg of jjgInfo.chars) {
      const jjgOhaeng = CHEONGAN_INFO[jjg.char]?.ohaeng;
      // 같은 오행이거나 같은 글자면 통근
      if (jjgOhaeng === dayMasterOhaeng || jjg.char === dayMasterChar) {
        matchingChars.push(jjg.char);
      }
    }
    
    if (matchingChars.length > 0) {
      tonggeunPositions.push({ position, branch, chars: matchingChars });
      if (weight > maxCoefficient) {
        maxCoefficient = weight;
      }
    }
  }
  
  const positions = tonggeunPositions.map(t => `${t.position}(${t.branch}:${t.chars.join(',')})`);
  
  let description = '';
  if (tonggeunPositions.length === 0) {
    description = `무근(無根) - 일간 ${dayMasterChar}이 지지에 뿌리 없음 (계수: ${maxCoefficient})`;
  } else {
    description = `통근 ✓ - ${positions.join(', ')} (계수: ${maxCoefficient})`;
  }
  
  return { coefficient: maxCoefficient, positions, description };
}

// ============================================
// 신강약 지수 및 등급 판정
// ============================================

/**
 * 신강약 지수(Index_DM) 계산
 * 
 * 공식: Index_DM = (아군점수 × 통근계수) - 적군점수 + 득령보너스 + 득지보너스
 */
export function calculateStrengthIndex(
  supportScore: number,
  opposeScore: number,
  tonggeunCoefficient: number,
  isDeukryeong: boolean,
  isDeukji: boolean
): number {
  let index = (supportScore * tonggeunCoefficient) - opposeScore;
  
  // 득령 보너스
  if (isDeukryeong) {
    index += STRENGTH_SCORES.DEUKRYEONG;
  }
  
  // 득지 보너스
  if (isDeukji) {
    index += STRENGTH_SCORES.DEUKJI;
  }
  
  return index;
}

/**
 * 신강약 등급 판정
 */
export function determineStrengthLevel(index: number): StrengthLevel {
  if (index >= STRENGTH_THRESHOLDS.EXTREME_STRONG) {
    return 'extreme_strong';
  } else if (index > STRENGTH_THRESHOLDS.NEUTRAL_MAX) {
    return 'strong';
  } else if (index >= STRENGTH_THRESHOLDS.NEUTRAL_MIN) {
    return 'neutral';
  } else if (index > STRENGTH_THRESHOLDS.EXTREME_WEAK) {
    return 'weak';
  } else {
    return 'extreme_weak';
  }
}

/**
 * 등급 한글 이름
 */
export function getStrengthLevelName(level: StrengthLevel): string {
  const names: { [key in StrengthLevel]: string } = {
    extreme_strong: '태왕 (극신강)',
    strong: '신강 (身强)',
    neutral: '중화 (中和)',
    weak: '신약 (身弱)',
    extreme_weak: '태약 (극신약)',
  };
  return names[level];
}

// ============================================
// 통합 신강/신약 분석
// ============================================

/**
 * Phase 2 전체 분석: 신강/신약 판정
 * 
 * @param input 사주 입력 데이터
 * @param adjustedScores Phase 1에서 보정된 오행 점수
 * @returns 신강/신약 판정 결과
 */
export function analyzeStrength(
  input: SajuInput,
  adjustedScores: OhaengScores
): StrengthResult {
  const { pillars } = input;
  
  // 일간 정보
  const dayMasterChar = pillars.day.cheonGan.char;
  const dayMasterInfo = CHEONGAN_INFO[dayMasterChar];
  const dayMasterOhaeng = dayMasterInfo?.ohaeng || 'wood';
  
  // 월지, 일지 정보
  const monthBranch = pillars.month.jiJi.char;
  const dayBranch = pillars.day.jiJi.char;
  const dayUnseong = pillars.day.jiJi.unseong?.name;
  
  // 1. 득령 판정
  const deukryeongResult = checkDeukryeongDetail(dayMasterOhaeng, monthBranch);
  
  // 2. 득지 판정
  const deukjiResult = checkDeukjiDetail(dayMasterOhaeng, dayBranch, dayUnseong);
  
  // 3. 득세 계산
  const deukseResult = calculateDeukse(dayMasterOhaeng, adjustedScores);
  
  // 4. 통근 계산
  const tonggeunResult = calculateTonggeun(dayMasterChar, pillars);
  
  // 5. 신강약 지수 계산
  const index = calculateStrengthIndex(
    deukseResult.supportScore,
    deukseResult.opposeScore,
    tonggeunResult.coefficient,
    deukryeongResult.isDeukryeong,
    deukjiResult.isDeukji
  );
  
  // 6. 등급 판정
  const level = determineStrengthLevel(index);
  const levelName = getStrengthLevelName(level);
  
  // 종합 설명
  const descriptions: string[] = [
    `일간: ${dayMasterChar} (${dayMasterOhaeng})`,
    deukryeongResult.description,
    deukjiResult.description,
    deukseResult.description,
    tonggeunResult.description,
    `신강약 지수: ${index.toFixed(1)} → ${levelName}`,
  ];
  
  return {
    level,
    index,
    deukryeong: deukryeongResult.isDeukryeong,
    deukji: deukjiResult.isDeukji,
    deukseScore: deukseResult.difference,
    tonggeunCoefficient: tonggeunResult.coefficient,
    supportScore: deukseResult.supportScore,
    opposeScore: deukseResult.opposeScore,
    description: descriptions.join('\n'),
  };
}

// ============================================
// 출력 포맷
// ============================================

/**
 * 신강/신약 결과 포맷 출력
 */
export function formatStrengthResult(result: StrengthResult): string {
  const lines: string[] = [];
  
  lines.push('╔══════════════════════════════════════════╗');
  lines.push('║      Phase 2: 신강/신약 판정             ║');
  lines.push('╚══════════════════════════════════════════╝');
  lines.push('');
  
  // 판정 결과
  const levelEmoji = {
    extreme_strong: '🔥🔥',
    strong: '🔥',
    neutral: '⚖️',
    weak: '💧',
    extreme_weak: '💧💧',
  };
  
  lines.push(`📊 판정 결과: ${levelEmoji[result.level]} ${getStrengthLevelName(result.level)}`);
  lines.push(`📈 신강약 지수: ${result.index.toFixed(1)}`);
  lines.push('');
  
  // 3대 요소
  lines.push('┌──────────────────────────────────────────┐');
  lines.push('│              3대 판정 요소               │');
  lines.push('├──────────────────────────────────────────┤');
  lines.push(`│ 득령(得令): ${result.deukryeong ? '✓ 예' : '✗ 아니오'}                         │`);
  lines.push(`│ 득지(得地): ${result.deukji ? '✓ 예' : '✗ 아니오'}                         │`);
  lines.push(`│ 득세(得勢): ${result.deukseScore >= 0 ? '+' : ''}${result.deukseScore.toFixed(1)}                         │`);
  lines.push('└──────────────────────────────────────────┘');
  lines.push('');
  
  // 점수 상세
  lines.push('┌──────────────────────────────────────────┐');
  lines.push('│              점수 상세                   │');
  lines.push('├──────────────────────────────────────────┤');
  lines.push(`│ 아군(인성+비겁): ${result.supportScore.toFixed(1).padStart(6)}              │`);
  lines.push(`│ 적군(식상+재관): ${result.opposeScore.toFixed(1).padStart(6)}              │`);
  lines.push(`│ 통근 계수: ${result.tonggeunCoefficient.toFixed(1).padStart(6)}                    │`);
  lines.push('└──────────────────────────────────────────┘');
  lines.push('');
  
  // 해석
  lines.push('┌──────────────────────────────────────────┐');
  lines.push('│              해석                        │');
  lines.push('├──────────────────────────────────────────┤');
  
  if (result.level === 'extreme_strong') {
    lines.push('│ 일간이 극도로 강합니다.                 │');
    lines.push('│ → 종왕격/종강격 가능성 검토 필요        │');
    lines.push('│ → 일반 억부법 적용 불가                 │');
  } else if (result.level === 'strong') {
    lines.push('│ 일간이 강합니다.                        │');
    lines.push('│ → 설기(식상)나 극(관살)이 필요          │');
  } else if (result.level === 'neutral') {
    lines.push('│ 일간이 중화 상태입니다.                 │');
    lines.push('│ → 가장 이상적인 균형 상태               │');
    lines.push('│ → 조후나 격국 용신을 우선 고려          │');
  } else if (result.level === 'weak') {
    lines.push('│ 일간이 약합니다.                        │');
    lines.push('│ → 생조(인성)나 도움(비겁)이 필요        │');
  } else {
    lines.push('│ 일간이 극도로 약합니다.                 │');
    lines.push('│ → 종격(종재/종살/종아) 가능성 검토      │');
    lines.push('│ → 일반 억부법 적용 불가                 │');
  }
  
  lines.push('└──────────────────────────────────────────┘');
  
  return lines.join('\n');
}
