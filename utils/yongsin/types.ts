/**
 * ============================================
 * 용신 알고리즘 타입 정의
 * ============================================
 */

import type { Pillar } from '../../types';

// ============================================
// 기본 타입
// ============================================

/** 오행 타입 */
export type Ohaeng = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/** 음양 타입 */
export type YinYang = 'yang' | 'yin';

/** 위치 타입 */
export type Position = 'year' | 'month' | 'day' | 'hour';

/** 천간/지지 구분 */
export type GanJiType = 'cheongan' | 'jiji';

// ============================================
// 오행 세력표 (Force Matrix)
// ============================================

/**
 * 오행별 점수
 * - 각 오행의 세력을 수치화한 결과
 */
export interface OhaengScores {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

/**
 * 글자별 상세 점수 정보
 */
export interface CharacterScore {
  /** 글자 (예: 甲, 子) */
  char: string;
  
  /** 오행 */
  ohaeng: Ohaeng;
  
  /** 위치 (년/월/일/시) */
  position: Position;
  
  /** 천간/지지 구분 */
  type: GanJiType;
  
  /** 기본 점수 */
  baseScore: number;
  
  /** 위치 가중치 */
  positionWeight: number;
  
  /** 최종 점수 (기본 점수 × 위치 가중치) */
  finalScore: number;
  
  /** 지장간 분해 점수 (지지인 경우) */
  jijangganScores?: {
    char: string;
    ohaeng: Ohaeng;
    days: number;
    score: number;
  }[];
}

/**
 * 오행 세력표 결과
 */
export interface ForceMatrix {
  /** 오행별 최종 점수 */
  scores: OhaengScores;
  
  /** 오행별 점수 (백분율) */
  percentages: OhaengScores;
  
  /** 글자별 상세 점수 */
  details: CharacterScore[];
  
  /** 총점 */
  totalScore: number;
  
  /** 일간 정보 */
  dayMaster: {
    char: string;
    ohaeng: Ohaeng;
    yinYang: YinYang;
  };
}

// ============================================
// 합(合) / 충(沖) 상호작용
// ============================================

/** 합의 종류 */
export type HabType = 
  | 'samhab_full'      // 삼합 완성
  | 'samhab_half'      // 반합
  | 'banghab_full'     // 방합 완성
  | 'banghab_half'     // 방합 반합
  | 'yukhab'           // 육합
  | 'cheongan_true'    // 천간합 진합
  | 'cheongan_tie';    // 천간합 기반

/** 충의 종류 */
export type ChungType = 
  | 'king'     // 왕지충 (자오, 묘유)
  | 'birth'    // 생지충 (인신, 사해)
  | 'storage'; // 고지충 (진술, 축미)

/**
 * 합 정보
 */
export interface HabInfo {
  type: HabType;
  chars: string[];
  resultOhaeng: Ohaeng;
  multiplier: number;
  description: string;
}

/**
 * 충 정보
 */
export interface ChungInfo {
  type: ChungType;
  chars: [string, string];
  reduction: number;
  hasStorageOpen: boolean;
  description: string;
}

/**
 * 상호작용 분석 결과
 */
export interface InteractionResult {
  /** 발견된 합 목록 */
  habs: HabInfo[];
  
  /** 발견된 충 목록 */
  chungs: ChungInfo[];
  
  /** 오행 점수 조정값 */
  adjustments: OhaengScores;
  
  /** 상호작용 설명 */
  descriptions: string[];
}

// ============================================
// 신강/신약 판정
// ============================================

/** 신강/신약 등급 */
export type StrengthLevel = 
  | 'extreme_strong'  // 태왕 (극신강)
  | 'strong'          // 신강
  | 'neutral'         // 중화
  | 'weak'            // 신약
  | 'extreme_weak';   // 태약 (극신약)

/**
 * 신강/신약 판정 결과
 */
export interface StrengthResult {
  /** 등급 */
  level: StrengthLevel;
  
  /** 신강약 지수 (Index_DM) */
  index: number;
  
  /** 득령 여부 */
  deukryeong: boolean;
  
  /** 득지 여부 */
  deukji: boolean;
  
  /** 득세 점수 (아군 - 적군) */
  deukseScore: number;
  
  /** 통근 계수 */
  tonggeunCoefficient: number;
  
  /** 아군(인성+비겁) 점수 */
  supportScore: number;
  
  /** 적군(식상+재관) 점수 */
  opposeScore: number;
  
  /** 판정 설명 */
  description: string;
}

// ============================================
// 용신 관련
// ============================================

/** 용신 관점 */
export type YongsinPerspective = 
  | 'eokbu'     // 억부
  | 'johu'      // 조후
  | 'gyeokguk'  // 격국
  | 'tonggwan'  // 통관
  | 'byeongyak'; // 병약

/**
 * 용신 후보
 */
export interface YongsinCandidate {
  /** 오행 */
  ohaeng: Ohaeng;
  
  /** 대표 천간 (예: 목 → 甲/乙) */
  representativeChars: string[];
  
  /** 관점 */
  perspective: YongsinPerspective;
  
  /** 점수 */
  score: number;
  
  /** 선정 이유 */
  reason: string;
}

/**
 * 최종 용신 결과
 */
export interface YongsinResult {
  /** 제1용신 */
  primary: YongsinCandidate;
  
  /** 제2용신 (희신) */
  secondary?: YongsinCandidate;
  
  /** 기신 (꺼리는 오행) */
  enemy?: {
    ohaeng: Ohaeng;
    reason: string;
  };
  
  /** 한신 (중립) */
  neutral?: Ohaeng[];
  
  /** 관점별 분석 */
  analysis: {
    eokbu?: YongsinCandidate;
    johu?: YongsinCandidate;
    gyeokguk?: YongsinCandidate;
    tonggwan?: YongsinCandidate;
    byeongyak?: YongsinCandidate;
  };
  
  /** 종합 해석 */
  interpretation: string;
}

// ============================================
// 입력 타입
// ============================================

/**
 * 사주 입력 데이터
 */
export interface SajuInput {
  /** 사주 4주 */
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  
  /** 생년월일시 (월령 사령 계산용) */
  birthDate?: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
}

// ============================================
// 전체 분석 결과
// ============================================

/**
 * Phase 1 오행 세력표 분석 결과
 */
export interface Phase1Result {
  /** 기본 오행 세력표 */
  forceMatrix: ForceMatrix;
  
  /** 상호작용 분석 */
  interactions: InteractionResult;
  
  /** 최종 보정된 오행 점수 */
  adjustedScores: OhaengScores;
  
  /** 분석 로그 */
  logs: string[];
}
