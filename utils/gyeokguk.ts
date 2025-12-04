/**
 * 격국(格局) 판단 메인 로직
 * 
 * 이 파일은 격국 판단의 핵심 로직을 포함합니다:
 * - 투출(透出) 확인
 * - 월지별 격국 판단 (왕지, 생지, 고지)
 * - 특수격 판단 (전왕, 화기, 종격)
 * - 격국 명칭 결정
 */

import type { SajuInfo, Ohaeng } from '../types';
import { 
  allJijangganData, 
  wangjiJijanggan, 
  saengjiJijanggan, 
  gojiJijanggan,
  classifyWolji,
  isGeonrokji,
  isYangiinji,
  isYanggan,
  samhap,
  banghap,
  cheonganHap,
  cheonganHapOhaeng,
} from './geokguk-data';
import { earthlyBranchGanInfo } from './manse';
import { judgeSpecialGeokguk } from './geokguk-special';
import { judgeNaegyeokGeokguk } from './geokguk-naegyeok';

// ============================================
// 타입 정의
// ============================================

import type { GeokgukResult } from '../types';

/**
 * 십성 정보
 */
interface SibsinInfo {
  name: string;
  hanja: string;
}

// ============================================
// 1. 기본 헬퍼 함수
// ============================================

/**
 * 천간의 오행 반환
 */
export function getOhaengOfGan(천간: string): Ohaeng | null {
  const info = earthlyBranchGanInfo[천간];
  return info?.ohaeng || null;
}

/**
 * 천간의 음양 반환
 */
export function getYinYangOfGan(천간: string): 'yang' | 'yin' | null {
  const info = earthlyBranchGanInfo[천간];
  return info?.yinYang || null;
}

/**
 * 십성 계산 (일간 vs 대상 천간)
 * 기존 getSibsin 함수와 동일한 로직
 */
export function calculateSibsin(일간: string, 대상천간: string): SibsinInfo {
  const 일간Info = earthlyBranchGanInfo[일간];
  const 대상Info = earthlyBranchGanInfo[대상천간];
  
  if (!일간Info || !대상Info) {
    return { name: '-', hanja: '-' };
  }

  // 오행 관계 인덱스 (기존 ohaengRelation 로직)
  const ohaengRelation: { [key in Ohaeng]: { [key in Ohaeng]: number } } = {
    wood: { wood: 0, fire: 2, earth: 4, metal: 6, water: 8 },
    fire: { fire: 0, earth: 2, metal: 4, water: 6, wood: 8 },
    earth: { earth: 0, metal: 2, water: 4, wood: 6, fire: 8 },
    metal: { metal: 0, water: 2, wood: 4, fire: 6, earth: 8 },
    water: { water: 0, wood: 2, fire: 4, earth: 6, metal: 8 },
  };

  const relationIndex = ohaengRelation[일간Info.ohaeng][대상Info.ohaeng];
  const yinYangIndex = 일간Info.yinYang === 대상Info.yinYang ? 0 : 1;

  const sibsinMap: SibsinInfo[] = [
    { name: '비견', hanja: '比肩' },
    { name: '겁재', hanja: '劫財' },
    { name: '식신', hanja: '食神' },
    { name: '상관', hanja: '傷官' },
    { name: '편재', hanja: '偏財' },
    { name: '정재', hanja: '正財' },
    { name: '편관', hanja: '偏官' },
    { name: '정관', hanja: '正官' },
    { name: '편인', hanja: '偏印' },
    { name: '정인', hanja: '正印' },
  ];

  return sibsinMap[relationIndex + yinYangIndex];
}

/**
 * 투출(透出) 확인
 * 지장간의 글자가 천간 4글자 중 하나에 나타나는지 확인
 */
export function check투출(
  지장간글자: string,
  천간4글자: string[]
): boolean {
  return 천간4글자.includes(지장간글자);
}

/**
 * 여러 지장간 중 투출된 것 찾기
 */
export function find투출된지장간(
  지장간목록: string[],
  천간4글자: string[]
): string[] {
  return 지장간목록.filter(글자 => check투출(글자, 천간4글자));
}

/**
 * 천간 4글자 배열 추출 (SajuInfo에서)
 */
export function get천간4글자(sajuInfo: SajuInfo): string[] {
  return [
    sajuInfo.pillars.year.cheonGan.char,
    sajuInfo.pillars.month.cheonGan.char,
    sajuInfo.pillars.day.cheonGan.char,
    sajuInfo.pillars.hour.cheonGan.char,
  ];
}

/**
 * 지지 4글자 배열 추출 (SajuInfo에서)
 */
export function get지지4글자(sajuInfo: SajuInfo): string[] {
  return [
    sajuInfo.pillars.year.jiJi.char,
    sajuInfo.pillars.month.jiJi.char,
    sajuInfo.pillars.day.jiJi.char,
    sajuInfo.pillars.hour.jiJi.char,
  ];
}

/**
 * 일간 추출
 */
export function get일간(sajuInfo: SajuInfo): string {
  return sajuInfo.pillars.day.cheonGan.char;
}

/**
 * 월지 추출
 */
export function get월지(sajuInfo: SajuInfo): string {
  return sajuInfo.pillars.month.jiJi.char;
}

// ============================================
// 2. 격국 명칭 결정
// ============================================

/**
 * 십성으로 격국 명칭 결정
 * 
 * 특수 케이스:
 * - 비견 → 건록격 (월지가 일간의 건록지일 때)
 * - 겁재 → 양인격 (양간 + 월지가 양인지일 때)
 * - 겁재 → 월겁격 (음간 + 월지가 겁재지일 때)
 */
export function determine격명칭(
  일간: string,
  격용신: string,
  월지: string
): string {
  const sibsin = calculateSibsin(일간, 격용신);

  // 특수 케이스 1: 건록격
  if (sibsin.name === '비견' && isGeonrokji(일간, 월지)) {
    return '건록격';
  }

  // 특수 케이스 2: 양인격 (양간만!)
  if (sibsin.name === '겁재' && isYanggan(일간) && isYangiinji(일간, 월지)) {
    return '양인격';
  }

  // 특수 케이스 3: 월겁격 (음간)
  if (sibsin.name === '겁재' && !isYanggan(일간)) {
    // 음간의 겁재는 월겁격 (건록격과 동급)
    return '월겁격';
  }

  // 일반 케이스: 십성 + "격"
  return sibsin.name + '격';
}

// ============================================
// 3. 합(合) 탐지 함수
// ============================================

/**
 * 삼합(三合) 탐지
 * 지지 4글자에서 삼합이 형성되었는지 확인
 */
export function detect삼합(지지4글자: string[]): {
  성립: boolean;
  종류?: string;
  오행?: Ohaeng;
  왕지?: string;
} {
  for (const [key, value] of Object.entries(samhap)) {
    const 포함된지지 = value.지지.filter(지 => 지지4글자.includes(지));
    
    // 완전 삼합 (3개 모두)
    if (포함된지지.length === 3) {
      return {
        성립: true,
        종류: key,
        오행: value.오행,
        왕지: value.왕지,
      };
    }
  }

  return { 성립: false };
}

/**
 * 방합(方合) 탐지
 * 지지 4글자에서 방합이 형성되었는지 확인
 */
export function detect방합(지지4글자: string[]): {
  성립: boolean;
  종류?: string;
  오행?: Ohaeng;
  왕지?: string;
} {
  for (const [key, value] of Object.entries(banghap)) {
    const 포함된지지 = value.지지.filter(지 => 지지4글자.includes(지));
    
    // 완전 방합 (3개 모두)
    if (포함된지지.length === 3) {
      return {
        성립: true,
        종류: key,
        오행: value.오행,
        왕지: value.왕지,
      };
    }
  }

  return { 성립: false };
}

/**
 * 천간합 확인
 * 일간이 다른 천간과 천간합을 이루는지 확인
 */
export function check천간합(일간: string, 천간4글자: string[]): {
  성립: boolean;
  합화천간?: string;
  합화오행?: Ohaeng;
} {
  const 합화천간 = cheonganHap[일간];
  if (!합화천간) {
    return { 성립: false };
  }

  // 월간 또는 시간에 합화천간이 있는지 확인
  const 월간 = 천간4글자[1]; // 월주 천간
  const 시간 = 천간4글자[3]; // 시주 천간

  if (월간 === 합화천간 || 시간 === 합화천간) {
    return {
      성립: true,
      합화천간: 합화천간,
      합화오행: cheonganHapOhaeng[일간],
    };
  }

  return { 성립: false };
}

// ============================================
// 4. 메인 격국 판단 함수
// ============================================

/**
 * 격국 판단 메인 함수
 * 
 * 판단 순서:
 * 1. 입력 검증
 * 2. 특수격 판단 (전왕 → 화기 → 종격)
 * 3. 내격 판단 (월지 분류에 따라)
 */
export function analyzeGeokguk(sajuInfo: SajuInfo): GeokgukResult {
  try {
    // ============================================
    // Step 0: 입력 검증
    // ============================================
    const 일간 = get일간(sajuInfo);
    const 월지 = get월지(sajuInfo);
    const 천간4글자 = get천간4글자(sajuInfo);
    const 지지4글자 = get지지4글자(sajuInfo);

    // 기본 검증
    if (!일간 || !월지) {
      return {
        판단가능: false,
        메시지: '사주 데이터가 올바르지 않습니다',
        이유: ['일간 또는 월지 정보가 없습니다'],
      };
    }

    if (천간4글자.length !== 4 || 지지4글자.length !== 4) {
      return {
        판단가능: false,
        메시지: '사주 데이터가 올바르지 않습니다',
        이유: ['천간 또는 지지가 4개가 아닙니다'],
      };
    }

    // 월지 분류 확인
    const 월지분류 = classifyWolji(월지);
    if (월지분류 === '알수없음') {
      return {
        판단가능: false,
        메시지: '월지 분류 오류',
        이유: ['월지가 12지지에 속하지 않습니다'],
      };
    }

    // ============================================
    // Step 1: 특수격 판단 (전왕 → 화기 → 종격)
    // ============================================
    const 특수격결과 = judgeSpecialGeokguk(sajuInfo);
    if (특수격결과 && 특수격결과.판단가능) {
      return 특수격결과;
    }

    // ============================================
    // Step 2: 내격 판단 (월지 분류에 따라)
    // ============================================
    const 내격결과 = judgeNaegyeokGeokguk(sajuInfo);
    return 내격결과;

  } catch (error) {
    // 예상치 못한 오류
    return {
      판단가능: false,
      메시지: '격국 판단 중 오류가 발생했습니다',
      이유: [error instanceof Error ? error.message : '알 수 없는 오류'],
    };
  }
}

