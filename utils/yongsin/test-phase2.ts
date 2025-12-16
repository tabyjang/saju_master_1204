/**
 * ============================================
 * Phase 2: 신강/신약 판정 테스트
 * ============================================
 * 
 * 실행 방법: npx tsx utils/yongsin/test-phase2.ts
 */

import type { SajuInput } from './types';
import { analyzePhase2, formatPhase2Result, getStrengthLevelName } from './index';

// ============================================
// 테스트 케이스 정의
// ============================================

/**
 * 테스트 사주 생성 헬퍼
 */
function createTestSaju(
  yearGan: string, yearJi: string,
  monthGan: string, monthJi: string,
  dayGan: string, dayJi: string,
  hourGan: string, hourJi: string,
  dayUnseong?: string
): SajuInput {
  return {
    pillars: {
      year: {
        cheonGan: { char: yearGan },
        jiJi: { char: yearJi },
      },
      month: {
        cheonGan: { char: monthGan },
        jiJi: { char: monthJi },
      },
      day: {
        cheonGan: { char: dayGan },
        jiJi: { char: dayJi, unseong: dayUnseong ? { name: dayUnseong } : undefined },
      },
      hour: {
        cheonGan: { char: hourGan },
        jiJi: { char: hourJi },
      },
    },
  } as SajuInput;
}

// ============================================
// 테스트 케이스
// ============================================

const testCases: { name: string; saju: SajuInput; expected: string }[] = [
  {
    name: '1. 신강 사주 - 비겁+인성 많음',
    // 甲木 일간 + 寅月(득령) + 卯日地支 + 목/수 많음
    saju: createTestSaju(
      '甲', '寅',  // 년: 갑인 (목목)
      '丙', '卯',  // 월: 병묘 (화목) - 목의 왕지
      '甲', '寅',  // 일: 갑인 (목목)
      '壬', '子',  // 시: 임자 (수수) - 인성
      '건록'      // 12운성 건록
    ),
    expected: 'strong',
  },
  {
    name: '2. 신약 사주 - 재관 많음',
    // 甲木 일간 + 申月(실령) + 금/토 많음
    saju: createTestSaju(
      '庚', '申',  // 년: 경신 (금금) - 관성
      '戊', '申',  // 월: 무신 (토금) - 재성+관성
      '甲', '戌',  // 일: 갑술 (목토) - 재성
      '庚', '申',  // 시: 경신 (금금) - 관성
      '묘'        // 12운성 묘
    ),
    expected: 'weak',
  },
  {
    name: '3. 중화 사주 - 균형 잡힘',
    // 甲木 일간 + 적당한 균형
    saju: createTestSaju(
      '甲', '子',  // 년: 갑자 (목수) - 비겁+인성
      '丙', '寅',  // 월: 병인 (화목) - 식상+비겁
      '甲', '午',  // 일: 갑오 (목화) - 식상
      '庚', '申',  // 시: 경신 (금금) - 관성
      '병'        // 12운성 병
    ),
    expected: 'neutral',
  },
  {
    name: '4. 태왕 사주 (극신강) - 종왕격 가능성',
    // 庚金 일간 + 전부 금
    saju: createTestSaju(
      '庚', '申',  // 년: 경신 (금금)
      '庚', '酉',  // 월: 경유 (금금) - 금의 왕지
      '庚', '申',  // 일: 경신 (금금)
      '辛', '酉',  // 시: 신유 (금금)
      '건록'
    ),
    expected: 'extreme_strong',
  },
  {
    name: '5. 태약 사주 (극신약) - 종격 가능성',
    // 乙木 일간 + 전부 금/토
    saju: createTestSaju(
      '戊', '戌',  // 년: 무술 (토토) - 재성
      '庚', '申',  // 월: 경신 (금금) - 관성, 금의 생지
      '乙', '丑',  // 일: 을축 (목토) - 재성
      '辛', '酉',  // 시: 신유 (금금) - 관성
      '절'        // 12운성 절
    ),
    expected: 'extreme_weak',
  },
  {
    name: '6. 통근 테스트 - 월지 통근 신강',
    // 丙火 일간 + 巳月 통근
    saju: createTestSaju(
      '丙', '寅',  // 년: 병인 (화목) - 비겁+인성
      '甲', '巳',  // 월: 갑사 (목화) - 인성+비겁(통근!)
      '丙', '午',  // 일: 병오 (화화) - 비겁
      '丁', '未',  // 시: 정미 (화토)
      '제왕'
    ),
    expected: 'strong',
  },
  {
    name: '7. 득령만 있는 경우 - 약한 신강',
    // 壬水 일간 + 子月(득령) but 다른 곳 적군
    saju: createTestSaju(
      '戊', '寅',  // 년: 무인 (토목) - 관성
      '庚', '子',  // 월: 경자 (금수) - 인성+비겁
      '壬', '戌',  // 일: 임술 (수토) - 관성
      '丙', '午',  // 시: 병오 (화화) - 재성
      '관대'
    ),
    expected: 'neutral', // or strong depending on calculation
  },
];

// ============================================
// 테스트 실행
// ============================================

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║           Phase 2: 신강/신약 판정 테스트                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

let passCount = 0;
let failCount = 0;

for (const testCase of testCases) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📋 ${testCase.name}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const { pillars } = testCase.saju;
  console.log(`사주: ${pillars.year.cheonGan.char}${pillars.year.jiJi.char} ${pillars.month.cheonGan.char}${pillars.month.jiJi.char} ${pillars.day.cheonGan.char}${pillars.day.jiJi.char} ${pillars.hour.cheonGan.char}${pillars.hour.jiJi.char}`);
  console.log('');
  
  try {
    const result = analyzePhase2(testCase.saju);
    
    // 전체 결과 출력
    console.log(formatPhase2Result(result));
    console.log('');
    
    // 판정 결과 확인
    const actualLevel = result.strength.level;
    const expectedLevel = testCase.expected;
    
    const isPassed = actualLevel === expectedLevel;
    const statusIcon = isPassed ? '✅' : '⚠️';
    const statusText = isPassed ? 'PASS' : 'DIFFERENT';
    
    console.log(`예상: ${expectedLevel} (${getStrengthLevelName(expectedLevel as any)})`);
    console.log(`실제: ${actualLevel} (${getStrengthLevelName(actualLevel)})`);
    console.log(`결과: ${statusIcon} ${statusText}`);
    
    if (isPassed) {
      passCount++;
    } else {
      failCount++;
    }
    
  } catch (error) {
    console.error(`❌ 오류 발생:`, error);
    failCount++;
  }
  
  console.log('');
}

// ============================================
// 테스트 결과 요약
// ============================================

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                     테스트 결과 요약                         ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`총 테스트: ${testCases.length}개`);
console.log(`통과: ${passCount}개`);
console.log(`실패/다름: ${failCount}개`);
console.log('');

if (failCount === 0) {
  console.log('🎉 모든 테스트 통과!');
} else {
  console.log('⚠️ 일부 결과가 예상과 다릅니다.');
  console.log('   → 가중치 조정으로 결과가 달라질 수 있습니다.');
  console.log('   → weights.ts에서 STRENGTH_THRESHOLDS 조절 가능');
}

// ============================================
// 상세 분석 데모
// ============================================

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                     상세 분석 데모                           ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// 데모: 첫 번째 테스트 케이스의 상세 로그
const demoResult = analyzePhase2(testCases[0].saju);
console.log('📊 분석 로그:');
for (const log of demoResult.logs) {
  console.log(`  ${log}`);
}
console.log('');

console.log('📈 신강/신약 상세:');
console.log(`  - 등급: ${getStrengthLevelName(demoResult.strength.level)}`);
console.log(`  - 지수: ${demoResult.strength.index.toFixed(2)}`);
console.log(`  - 득령: ${demoResult.strength.deukryeong ? '✓' : '✗'}`);
console.log(`  - 득지: ${demoResult.strength.deukji ? '✓' : '✗'}`);
console.log(`  - 아군 점수: ${demoResult.strength.supportScore.toFixed(2)}`);
console.log(`  - 적군 점수: ${demoResult.strength.opposeScore.toFixed(2)}`);
console.log(`  - 득세 점수: ${demoResult.strength.deukseScore.toFixed(2)}`);
console.log(`  - 통근 계수: ${demoResult.strength.tonggeunCoefficient.toFixed(2)}`);
