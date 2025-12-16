/**
 * ============================================
 * Phase 1 테스트
 * ============================================
 * 
 * 실행: npx ts-node utils/yongsin/test-phase1.ts
 */

import type { Pillar } from '../../types';
import type { SajuInput } from './types';
import { analyzePhase1, formatPhase1Result } from './index';

// ============================================
// 테스트용 사주 데이터 생성 헬퍼
// ============================================

function createTestPillar(gan: string, ji: string, label: string): Pillar {
  return {
    label,
    ganji: `${gan}${ji}`,
    cheonGan: {
      char: gan,
      ohaeng: 'wood', // 실제로는 계산됨
      sibsin: { name: '-', hanja: '-' },
    },
    jiJi: {
      char: ji,
      ohaeng: 'wood', // 실제로는 계산됨
      sibsin: { name: '-', hanja: '-' },
      jijanggan: [],
      unseong: { name: '-', hanja: '-' },
    },
  };
}

function createTestSaju(
  yearGan: string, yearJi: string,
  monthGan: string, monthJi: string,
  dayGan: string, dayJi: string,
  hourGan: string, hourJi: string
): SajuInput {
  return {
    pillars: {
      year: createTestPillar(yearGan, yearJi, '년주'),
      month: createTestPillar(monthGan, monthJi, '월주'),
      day: createTestPillar(dayGan, dayJi, '일주'),
      hour: createTestPillar(hourGan, hourJi, '시주'),
    },
  };
}

// ============================================
// 테스트 케이스
// ============================================

console.log('╔══════════════════════════════════════════════════╗');
console.log('║      Phase 1 오행 세력표 테스트                  ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');

// 테스트 1: 기본 사주 (삼합 없음)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 1: 기본 사주 (甲子년 乙丑월 丙寅일 丁卯시)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const test1 = createTestSaju('甲', '子', '乙', '丑', '丙', '寅', '丁', '卯');
const result1 = analyzePhase1(test1);
console.log(formatPhase1Result(result1));
console.log('');

// 테스트 2: 삼합 (인오술 화국)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 2: 삼합 화국 (寅午戌 삼합)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const test2 = createTestSaju('甲', '寅', '丙', '午', '戊', '戌', '庚', '辰');
const result2 = analyzePhase1(test2);
console.log(formatPhase1Result(result2));
console.log('');

// 테스트 3: 충 (자오충)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 3: 왕지충 (子午 충)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const test3 = createTestSaju('甲', '子', '丙', '午', '戊', '辰', '庚', '申');
const result3 = analyzePhase1(test3);
console.log(formatPhase1Result(result3));
console.log('');

// 테스트 4: 방합 (인묘진 목방)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 4: 방합 목국 (寅卯辰 방합)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const test4 = createTestSaju('甲', '寅', '乙', '卯', '丙', '辰', '丁', '巳');
const result4 = analyzePhase1(test4);
console.log(formatPhase1Result(result4));
console.log('');

// 테스트 5: 천간합 (갑기합토)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 5: 천간합 (甲己 합토) - 진토월');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const test5 = createTestSaju('甲', '辰', '己', '辰', '丙', '戌', '庚', '戌');
const result5 = analyzePhase1(test5);
console.log(formatPhase1Result(result5));
console.log('');

// 테스트 6: 복합 (삼합 + 충)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 6: 복합 상호작용 (삼합 + 충)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const test6 = createTestSaju('壬', '申', '癸', '子', '甲', '辰', '乙', '卯');
// 신자진 수국 삼합 + 묘유충은 없음
const result6 = analyzePhase1(test6);
console.log(formatPhase1Result(result6));
console.log('');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 완료!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
