/**
 * 격국(格局) 판단을 위한 기초 데이터 정의
 * 
 * 이 파일은 격국 판단에 필요한 모든 기본 데이터를 포함합니다:
 * - 지장간(地藏干) 상세 데이터 (사령일수 포함)
 * - 합(合) 데이터 (천간합, 삼합, 방합)
 * - 오행 관계 데이터
 */

import type { Ohaeng } from '../types';

// ============================================
// 1. 지장간(地藏干) 상세 데이터
// ============================================

/**
 * 지장간 상세 정보
 * 각 지지(地支) 안에 숨어있는 천간(天干)들과 그 사령일수
 */
export interface JijangganDetail {
  /** 천간 글자 */
  char: string;
  /** 사령일수 (7일, 9일, 10일, 11일, 16일, 18일, 20일) */
  days: number;
  /** 지장간 종류 */
  type: '여기' | '중기' | '본기';
}

/**
 * 월지별 지장간 정보
 */
export interface WoljiJijanggan {
  /** 월지 글자 */
  월지: string;
  /** 여기(餘氣) - 전달의 남은 기운 */
  여기?: JijangganDetail;
  /** 중기(中氣) - 삼합으로 묘지 입고 */
  중기?: JijangganDetail;
  /** 본기(本氣) - 해당 계절의 주인 */
  본기: JijangganDetail;
}

// ============================================
// 사왕지(四旺地): 자오묘유 (子午卯酉)
// ============================================
/**
 * 왕지(旺地) - 오행의 기운이 가장 왕성한 곳
 * 특징: 본기가 매우 강함, 투출 여부와 관계없이 본기가 격
 */
export const wangjiJijanggan: Record<string, WoljiJijanggan> = {
  '子': {
    월지: '子',
    여기: { char: '壬', days: 10, type: '여기' },
    본기: { char: '癸', days: 20, type: '본기' },
  },
  '午': {
    월지: '午',
    여기: { char: '丙', days: 10, type: '여기' },
    중기: { char: '己', days: 9, type: '중기' }, // 기토 섞임
    본기: { char: '丁', days: 11, type: '본기' },
  },
  '卯': {
    월지: '卯',
    여기: { char: '甲', days: 10, type: '여기' },
    본기: { char: '乙', days: 20, type: '본기' },
  },
  '酉': {
    월지: '酉',
    여기: { char: '庚', days: 10, type: '여기' },
    본기: { char: '辛', days: 20, type: '본기' },
  },
};

// ============================================
// 사생지(四生地): 인신사해 (寅申巳亥)
// ============================================
/**
 * 생지(生地) - 오행의 기운이 막 생겨나는 곳
 * 특징: 여기(7일) + 중기(7일) + 본기(16일) = 30일
 * 여기(餘氣)는 모두 무토(戊) - 전달의 남은 기운
 */
export const saengjiJijanggan: Record<string, WoljiJijanggan> = {
  '寅': {
    월지: '寅',
    여기: { char: '戊', days: 7, type: '여기' }, // 전달(丑)의 남은 기운
    중기: { char: '丙', days: 7, type: '중기' }, // 장생하는 불
    본기: { char: '甲', days: 16, type: '본기' }, // 본체 나무
  },
  '申': {
    월지: '申',
    여기: { char: '戊', days: 7, type: '여기' }, // 전달(未)의 남은 기운
    중기: { char: '壬', days: 7, type: '중기' }, // 장생하는 물
    본기: { char: '庚', days: 16, type: '본기' }, // 본체 금
  },
  '巳': {
    월지: '巳',
    여기: { char: '戊', days: 7, type: '여기' }, // 전달(辰)의 남은 기운
    중기: { char: '庚', days: 7, type: '중기' }, // 장생하는 금
    본기: { char: '丙', days: 16, type: '본기' }, // 본체 불
  },
  '亥': {
    월지: '亥',
    여기: { char: '戊', days: 7, type: '여기' }, // 전달(戌)의 남은 기운
    중기: { char: '甲', days: 7, type: '중기' }, // 장생하는 나무
    본기: { char: '壬', days: 16, type: '본기' }, // 본체 물
  },
};

// ============================================
// 사고지(四庫地): 진술축미 (辰戌丑未)
// ============================================
/**
 * 고지(庫地) - 오행의 기운이 갈무리된 창고
 * 특징: 여기(9일) + 중기(3일) + 본기(18일) = 30일
 * 잡기재관인격(雜氣財官印格) - 반드시 투출해야 격이 됨
 */
export const gojiJijanggan: Record<string, WoljiJijanggan> = {
  '辰': {
    월지: '辰',
    여기: { char: '乙', days: 9, type: '여기' }, // 전달(卯)의 남은 기운
    중기: { char: '癸', days: 3, type: '중기' }, // 삼합으로 묘지 입고
    본기: { char: '戊', days: 18, type: '본기' }, // 해당 계절 토(土)
  },
  '未': {
    월지: '未',
    여기: { char: '丁', days: 9, type: '여기' }, // 전달(午)의 남은 기운
    중기: { char: '乙', days: 3, type: '중기' }, // 삼합으로 묘지 입고
    본기: { char: '己', days: 18, type: '본기' }, // 해당 계절 토(土)
  },
  '戌': {
    월지: '戌',
    여기: { char: '辛', days: 9, type: '여기' }, // 전달(酉)의 남은 기운
    중기: { char: '丁', days: 3, type: '중기' }, // 삼합으로 묘지 입고
    본기: { char: '戊', days: 18, type: '본기' }, // 해당 계절 토(土)
  },
  '丑': {
    월지: '丑',
    여기: { char: '癸', days: 9, type: '여기' }, // 전달(子)의 남은 기운
    중기: { char: '辛', days: 3, type: '중기' }, // 삼합으로 묘지 입고
    본기: { char: '己', days: 18, type: '본기' }, // 해당 계절 토(土)
  },
};

// ============================================
// 전체 지장간 데이터 통합
// ============================================
export const allJijangganData: Record<string, WoljiJijanggan> = {
  ...wangjiJijanggan,
  ...saengjiJijanggan,
  ...gojiJijanggan,
};

// ============================================
// 2. 합(合) 데이터
// ============================================

/**
 * 천간합(天干合) - 5합
 * 일간이 다른 천간과 합을 이루면 화기격 가능
 */
export const cheonganHap: Record<string, string> = {
  '甲': '己', // 갑기합토
  '己': '甲',
  '乙': '庚', // 을경합금
  '庚': '乙',
  '丙': '辛', // 병신합수
  '辛': '丙',
  '丁': '壬', // 정임합목
  '壬': '丁',
  '戊': '癸', // 무계합화
  '癸': '戊',
};

/**
 * 천간합으로 합화되는 오행
 */
export const cheonganHapOhaeng: Record<string, Ohaeng> = {
  '甲': 'earth', // 갑기합토
  '己': 'earth',
  '乙': 'metal', // 을경합금
  '庚': 'metal',
  '丙': 'water', // 병신합수
  '辛': 'water',
  '丁': 'wood', // 정임합목
  '壬': 'wood',
  '戊': 'fire', // 무계합화
  '癸': 'fire',
};

/**
 * 삼합(三合) - 4개
 * 지지 3개가 모여 하나의 오행 국(局)을 형성
 */
export const samhap: Record<string, { 지지: string[]; 오행: Ohaeng; 왕지: string }> = {
  '인오술': {
    지지: ['寅', '午', '戌'],
    오행: 'fire',
    왕지: '午', // 화국의 왕지
  },
  '사유축': {
    지지: ['巳', '酉', '丑'],
    오행: 'metal',
    왕지: '酉', // 금국의 왕지
  },
  '신자진': {
    지지: ['申', '子', '辰'],
    오행: 'water',
    왕지: '子', // 수국의 왕지
  },
  '해묘미': {
    지지: ['亥', '卯', '未'],
    오행: 'wood',
    왕지: '卯', // 목국의 왕지
  },
};

/**
 * 방합(方合) - 4개
 * 지지 3개가 모여 하나의 오행 방(方)을 형성
 */
export const banghap: Record<string, { 지지: string[]; 오행: Ohaeng; 왕지: string }> = {
  '인묘진': {
    지지: ['寅', '卯', '辰'],
    오행: 'wood',
    왕지: '卯', // 목방의 왕지
  },
  '사오미': {
    지지: ['巳', '午', '未'],
    오행: 'fire',
    왕지: '午', // 화방의 왕지
  },
  '신유술': {
    지지: ['申', '酉', '戌'],
    오행: 'metal',
    왕지: '酉', // 금방의 왕지
  },
  '해자축': {
    지지: ['亥', '子', '丑'],
    오행: 'water',
    왕지: '子', // 수방의 왕지
  },
};

// ============================================
// 3. 오행 관계 헬퍼
// ============================================

/**
 * 오행 상생(相生) 관계
 * 목생화, 화생토, 토생금, 금생수, 수생목
 */
export const ohaengSangsaeng: Record<Ohaeng, Ohaeng> = {
  wood: 'fire',   // 목생화
  fire: 'earth',  // 화생토
  earth: 'metal', // 토생금
  metal: 'water', // 금생수
  water: 'wood',  // 수생목
};

/**
 * 오행 상극(相剋) 관계
 * 목극토, 토극수, 수극화, 화극금, 금극목
 */
export const ohaengSanggeuk: Record<Ohaeng, Ohaeng> = {
  wood: 'earth',  // 목극토
  fire: 'metal',  // 화극금
  earth: 'water', // 토극수
  metal: 'wood',  // 금극목
  water: 'fire',  // 수극화
};

/**
 * 오행이 상생 관계인지 확인
 */
export function isSangsaeng(source: Ohaeng, target: Ohaeng): boolean {
  return ohaengSangsaeng[source] === target;
}

/**
 * 오행이 상극 관계인지 확인
 */
export function isSanggeuk(source: Ohaeng, target: Ohaeng): boolean {
  return ohaengSanggeuk[source] === target;
}

// ============================================
// 4. 월지 분류 헬퍼
// ============================================

/**
 * 월지가 왕지(旺地)인지 확인
 */
export function isWangji(월지: string): boolean {
  return 월지 in wangjiJijanggan;
}

/**
 * 월지가 생지(生地)인지 확인
 */
export function isSaengji(월지: string): boolean {
  return 월지 in saengjiJijanggan;
}

/**
 * 월지가 고지(庫地)인지 확인
 */
export function isGoji(월지: string): boolean {
  return 월지 in gojiJijanggan;
}

/**
 * 월지 분류 반환
 */
export function classifyWolji(월지: string): '왕지' | '생지' | '고지' | '알수없음' {
  if (isWangji(월지)) return '왕지';
  if (isSaengji(월지)) return '생지';
  if (isGoji(월지)) return '고지';
  return '알수없음';
}

// ============================================
// 5. 건록지/양인지 데이터
// ============================================

/**
 * 건록지(建祿地) - 일간의 건록지
 * 음양 무관, 모두 건록격 가능
 */
export const geonrokji: Record<string, string> = {
  '甲': '寅', '乙': '卯',
  '丙': '巳', '丁': '午',
  '戊': '巳', '己': '午',
  '庚': '申', '辛': '酉',
  '壬': '亥', '癸': '子',
};

/**
 * 양인지(羊刃地) - 양간(甲丙戊庚壬)의 양인지
 * 오직 양간만 해당! 모두 자오묘유(왕지)
 */
export const yanginji: Record<string, string> = {
  '甲': '卯', // 양목
  '丙': '午', // 양화
  '戊': '午', // 양토
  '庚': '酉', // 양금
  '壬': '子', // 양수
};

/**
 * 일간의 건록지인지 확인
 */
export function isGeonrokji(일간: string, 월지: string): boolean {
  return geonrokji[일간] === 월지;
}

/**
 * 일간의 양인지인지 확인 (양간만!)
 */
export function isYangiinji(일간: string, 월지: string): boolean {
  return yanginji[일간] === 월지;
}

/**
 * 일간이 양간인지 확인
 */
export function isYanggan(일간: string): boolean {
  return 일간 in yanginji;
}

