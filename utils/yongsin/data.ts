/**
 * ============================================
 * 용신 알고리즘 기초 데이터
 * ============================================
 * 
 * 천간, 지지, 오행 관계 등 기본 데이터 정의
 */

import type { Ohaeng, YinYang } from './types';

// ============================================
// 천간 (天干) 데이터
// ============================================

/** 10천간 */
export const CHEONGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

/** 천간별 오행/음양 정보 */
export const CHEONGAN_INFO: { [key: string]: { ohaeng: Ohaeng; yinYang: YinYang } } = {
  '甲': { ohaeng: 'wood', yinYang: 'yang' },
  '乙': { ohaeng: 'wood', yinYang: 'yin' },
  '丙': { ohaeng: 'fire', yinYang: 'yang' },
  '丁': { ohaeng: 'fire', yinYang: 'yin' },
  '戊': { ohaeng: 'earth', yinYang: 'yang' },
  '己': { ohaeng: 'earth', yinYang: 'yin' },
  '庚': { ohaeng: 'metal', yinYang: 'yang' },
  '辛': { ohaeng: 'metal', yinYang: 'yin' },
  '壬': { ohaeng: 'water', yinYang: 'yang' },
  '癸': { ohaeng: 'water', yinYang: 'yin' },
};

// ============================================
// 지지 (地支) 데이터
// ============================================

/** 12지지 */
export const JIJI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/** 지지별 오행/음양 정보 */
export const JIJI_INFO: { [key: string]: { ohaeng: Ohaeng; yinYang: YinYang; category: 'king' | 'birth' | 'storage' } } = {
  '子': { ohaeng: 'water', yinYang: 'yang', category: 'king' },    // 왕지
  '丑': { ohaeng: 'earth', yinYang: 'yin', category: 'storage' },  // 고지
  '寅': { ohaeng: 'wood', yinYang: 'yang', category: 'birth' },    // 생지
  '卯': { ohaeng: 'wood', yinYang: 'yin', category: 'king' },      // 왕지
  '辰': { ohaeng: 'earth', yinYang: 'yang', category: 'storage' }, // 고지
  '巳': { ohaeng: 'fire', yinYang: 'yang', category: 'birth' },    // 생지
  '午': { ohaeng: 'fire', yinYang: 'yin', category: 'king' },      // 왕지
  '未': { ohaeng: 'earth', yinYang: 'yin', category: 'storage' },  // 고지
  '申': { ohaeng: 'metal', yinYang: 'yang', category: 'birth' },   // 생지
  '酉': { ohaeng: 'metal', yinYang: 'yin', category: 'king' },     // 왕지
  '戌': { ohaeng: 'earth', yinYang: 'yang', category: 'storage' }, // 고지
  '亥': { ohaeng: 'water', yinYang: 'yang', category: 'birth' },   // 생지
};

/** 왕지 (자오묘유) */
export const KING_BRANCHES = ['子', '午', '卯', '酉'] as const;

/** 생지 (인신사해) */
export const BIRTH_BRANCHES = ['寅', '申', '巳', '亥'] as const;

/** 고지 (진술축미) */
export const STORAGE_BRANCHES = ['辰', '戌', '丑', '未'] as const;

// ============================================
// 지장간 (地藏干) 상세 데이터
// ============================================

/**
 * 지장간 상세 정보
 * - 각 지지 안에 숨어있는 천간들
 * - 여기(餘氣), 중기(中氣), 본기(本氣) 순서
 * - days: 사령 일수 (총 30일)
 */
export const JIJANGGAN_DETAIL: {
  [key: string]: {
    chars: { char: string; type: 'yeogi' | 'junggi' | 'bongi'; days: number }[];
    totalDays: number;
  };
} = {
  // ========== 사왕지 (四旺地) ==========
  '子': {
    chars: [
      { char: '壬', type: 'yeogi', days: 10 },
      { char: '癸', type: 'bongi', days: 20 },
    ],
    totalDays: 30,
  },
  '午': {
    chars: [
      { char: '丙', type: 'yeogi', days: 10 },
      { char: '己', type: 'junggi', days: 9 },
      { char: '丁', type: 'bongi', days: 11 },
    ],
    totalDays: 30,
  },
  '卯': {
    chars: [
      { char: '甲', type: 'yeogi', days: 10 },
      { char: '乙', type: 'bongi', days: 20 },
    ],
    totalDays: 30,
  },
  '酉': {
    chars: [
      { char: '庚', type: 'yeogi', days: 10 },
      { char: '辛', type: 'bongi', days: 20 },
    ],
    totalDays: 30,
  },
  
  // ========== 사생지 (四生地) ==========
  '寅': {
    chars: [
      { char: '戊', type: 'yeogi', days: 7 },
      { char: '丙', type: 'junggi', days: 7 },
      { char: '甲', type: 'bongi', days: 16 },
    ],
    totalDays: 30,
  },
  '申': {
    chars: [
      { char: '戊', type: 'yeogi', days: 7 },
      { char: '壬', type: 'junggi', days: 7 },
      { char: '庚', type: 'bongi', days: 16 },
    ],
    totalDays: 30,
  },
  '巳': {
    chars: [
      { char: '戊', type: 'yeogi', days: 7 },
      { char: '庚', type: 'junggi', days: 7 },
      { char: '丙', type: 'bongi', days: 16 },
    ],
    totalDays: 30,
  },
  '亥': {
    chars: [
      { char: '戊', type: 'yeogi', days: 7 },
      { char: '甲', type: 'junggi', days: 7 },
      { char: '壬', type: 'bongi', days: 16 },
    ],
    totalDays: 30,
  },
  
  // ========== 사고지 (四庫地) ==========
  '辰': {
    chars: [
      { char: '乙', type: 'yeogi', days: 9 },
      { char: '癸', type: 'junggi', days: 3 },
      { char: '戊', type: 'bongi', days: 18 },
    ],
    totalDays: 30,
  },
  '戌': {
    chars: [
      { char: '辛', type: 'yeogi', days: 9 },
      { char: '丁', type: 'junggi', days: 3 },
      { char: '戊', type: 'bongi', days: 18 },
    ],
    totalDays: 30,
  },
  '丑': {
    chars: [
      { char: '癸', type: 'yeogi', days: 9 },
      { char: '辛', type: 'junggi', days: 3 },
      { char: '己', type: 'bongi', days: 18 },
    ],
    totalDays: 30,
  },
  '未': {
    chars: [
      { char: '丁', type: 'yeogi', days: 9 },
      { char: '乙', type: 'junggi', days: 3 },
      { char: '己', type: 'bongi', days: 18 },
    ],
    totalDays: 30,
  },
};

// ============================================
// 오행 관계
// ============================================

/** 상생 관계 (A → B: A가 B를 생함) */
export const SANGSAENG: { [key in Ohaeng]: Ohaeng } = {
  wood: 'fire',   // 목생화
  fire: 'earth',  // 화생토
  earth: 'metal', // 토생금
  metal: 'water', // 금생수
  water: 'wood',  // 수생목
};

/** 상극 관계 (A → B: A가 B를 극함) */
export const SANGGEUK: { [key in Ohaeng]: Ohaeng } = {
  wood: 'earth',  // 목극토
  earth: 'water', // 토극수
  water: 'fire',  // 수극화
  fire: 'metal',  // 화극금
  metal: 'wood',  // 금극목
};

/** 나를 생하는 오행 (인성) */
export const GENERATES_ME: { [key in Ohaeng]: Ohaeng } = {
  wood: 'water',  // 수생목
  fire: 'wood',   // 목생화
  earth: 'fire',  // 화생토
  metal: 'earth', // 토생금
  water: 'metal', // 금생수
};

/** 나를 극하는 오행 (관성) */
export const CONTROLS_ME: { [key in Ohaeng]: Ohaeng } = {
  wood: 'metal',  // 금극목
  fire: 'water',  // 수극화
  earth: 'wood',  // 목극토
  metal: 'fire',  // 화극금
  water: 'earth', // 토극수
};

// ============================================
// 십성 (十星) 관계
// ============================================

/**
 * 십성 계산
 * @param dayMasterOhaeng 일간의 오행
 * @param targetOhaeng 대상의 오행
 * @param sameYinYang 음양이 같은지 여부
 * @returns 십성 이름
 */
export function getSibsinName(
  dayMasterOhaeng: Ohaeng,
  targetOhaeng: Ohaeng,
  sameYinYang: boolean
): string {
  // 같은 오행 (비겁)
  if (dayMasterOhaeng === targetOhaeng) {
    return sameYinYang ? '비견' : '겁재';
  }
  
  // 내가 생하는 오행 (식상)
  if (SANGSAENG[dayMasterOhaeng] === targetOhaeng) {
    return sameYinYang ? '식신' : '상관';
  }
  
  // 내가 극하는 오행 (재성)
  if (SANGGEUK[dayMasterOhaeng] === targetOhaeng) {
    return sameYinYang ? '편재' : '정재';
  }
  
  // 나를 극하는 오행 (관성)
  if (CONTROLS_ME[dayMasterOhaeng] === targetOhaeng) {
    return sameYinYang ? '편관' : '정관';
  }
  
  // 나를 생하는 오행 (인성)
  if (GENERATES_ME[dayMasterOhaeng] === targetOhaeng) {
    return sameYinYang ? '편인' : '정인';
  }
  
  return '알수없음';
}

/**
 * 십성 분류
 */
export const SIBSIN_CATEGORIES = {
  /** 비겁 (나와 같은 오행) */
  BIGYEOP: ['비견', '겁재'],
  
  /** 인성 (나를 생하는 오행) */
  INSEONG: ['편인', '정인'],
  
  /** 식상 (내가 생하는 오행) */
  SIKSANG: ['식신', '상관'],
  
  /** 재성 (내가 극하는 오행) */
  JAESEONG: ['편재', '정재'],
  
  /** 관성 (나를 극하는 오행) */
  GWANSEONG: ['편관', '정관'],
  
  /** 아군 (비겁 + 인성) */
  SUPPORT: ['비견', '겁재', '편인', '정인'],
  
  /** 적군 (식상 + 재성 + 관성) */
  OPPOSE: ['식신', '상관', '편재', '정재', '편관', '정관'],
} as const;

// ============================================
// 합(合) 데이터
// ============================================

/** 천간합 */
export const CHEONGAN_HAB: { [key: string]: { pair: string; resultOhaeng: Ohaeng } } = {
  '甲': { pair: '己', resultOhaeng: 'earth' }, // 갑기합토
  '己': { pair: '甲', resultOhaeng: 'earth' },
  '乙': { pair: '庚', resultOhaeng: 'metal' }, // 을경합금
  '庚': { pair: '乙', resultOhaeng: 'metal' },
  '丙': { pair: '辛', resultOhaeng: 'water' }, // 병신합수
  '辛': { pair: '丙', resultOhaeng: 'water' },
  '丁': { pair: '壬', resultOhaeng: 'wood' },  // 정임합목
  '壬': { pair: '丁', resultOhaeng: 'wood' },
  '戊': { pair: '癸', resultOhaeng: 'fire' },  // 무계합화
  '癸': { pair: '戊', resultOhaeng: 'fire' },
};

/** 삼합 */
export const SAMHAB: { [key: string]: { members: string[]; resultOhaeng: Ohaeng; king: string } } = {
  '목국': { members: ['亥', '卯', '未'], resultOhaeng: 'wood', king: '卯' },
  '화국': { members: ['寅', '午', '戌'], resultOhaeng: 'fire', king: '午' },
  '금국': { members: ['巳', '酉', '丑'], resultOhaeng: 'metal', king: '酉' },
  '수국': { members: ['申', '子', '辰'], resultOhaeng: 'water', king: '子' },
};

/** 방합 */
export const BANGHAB: { [key: string]: { members: string[]; resultOhaeng: Ohaeng } } = {
  '목방': { members: ['寅', '卯', '辰'], resultOhaeng: 'wood' },
  '화방': { members: ['巳', '午', '未'], resultOhaeng: 'fire' },
  '금방': { members: ['申', '酉', '戌'], resultOhaeng: 'metal' },
  '수방': { members: ['亥', '子', '丑'], resultOhaeng: 'water' },
};

/** 육합 */
export const YUKHAB: { [key: string]: { pair: string; resultOhaeng: Ohaeng } } = {
  '子': { pair: '丑', resultOhaeng: 'earth' }, // 자축합토
  '丑': { pair: '子', resultOhaeng: 'earth' },
  '寅': { pair: '亥', resultOhaeng: 'wood' },  // 인해합목
  '亥': { pair: '寅', resultOhaeng: 'wood' },
  '卯': { pair: '戌', resultOhaeng: 'fire' },  // 묘술합화
  '戌': { pair: '卯', resultOhaeng: 'fire' },
  '辰': { pair: '酉', resultOhaeng: 'metal' }, // 진유합금
  '酉': { pair: '辰', resultOhaeng: 'metal' },
  '巳': { pair: '申', resultOhaeng: 'water' }, // 사신합수
  '申': { pair: '巳', resultOhaeng: 'water' },
  '午': { pair: '未', resultOhaeng: 'fire' },  // 오미합화 (토설도 있음)
  '未': { pair: '午', resultOhaeng: 'fire' },
};

// ============================================
// 충(沖) 데이터
// ============================================

/** 지지충 */
export const JIJI_CHUNG: { [key: string]: string } = {
  '子': '午', '午': '子',  // 자오충
  '丑': '未', '未': '丑',  // 축미충
  '寅': '申', '申': '寅',  // 인신충
  '卯': '酉', '酉': '卯',  // 묘유충
  '辰': '戌', '戌': '辰',  // 진술충
  '巳': '亥', '亥': '巳',  // 사해충
};

/** 충 분류 */
export const CHUNG_CATEGORY: { [key: string]: 'king' | 'birth' | 'storage' } = {
  '子午': 'king',
  '午子': 'king',
  '卯酉': 'king',
  '酉卯': 'king',
  '寅申': 'birth',
  '申寅': 'birth',
  '巳亥': 'birth',
  '亥巳': 'birth',
  '辰戌': 'storage',
  '戌辰': 'storage',
  '丑未': 'storage',
  '未丑': 'storage',
};

// ============================================
// 오행 한글/영어 변환
// ============================================

export const OHAENG_KOREAN: { [key in Ohaeng]: string } = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
};

export const OHAENG_HANJA: { [key in Ohaeng]: string } = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};
