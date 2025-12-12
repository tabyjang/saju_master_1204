/**
 * 특수격(外格) 판단 로직
 * 
 * 전왕격, 화기격, 종격 판단
 * 내격 판단 전에 반드시 먼저 확인해야 함!
 */

import type { SajuInfo, Ohaeng, GeokgukResult } from '../types';
import {
  get일간,
  get월지,
  get천간4글자,
  get지지4글자,
  getOhaengOfGan,
  calculateSibsin,
  detect삼합,
  detect방합,
  check천간합,
} from './gyeokguk';
import { allJijangganData, ohaengSanggeuk } from './geokguk-data';
import { earthlyBranchGanInfo } from './manse';

// ============================================
// 1. 전왕격(專旺格) 판단
// ============================================

/**
 * 전왕격 명칭
 */
const jeonwangGeokgukNames: Record<Ohaeng, string> = {
  wood: '곡직인수격',   // 曲直仁壽格 (목)
  fire: '염상격',       // 炎上格 (화)
  earth: '가색격',      // 稼穡格 (토)
  metal: '종혁격',      // 從革格 (금)
  water: '윤하격',      // 潤下格 (수)
};

/**
 * 월령 득령 여부 확인
 * 월지의 본기가 일간과 같은 오행인지 확인
 */
function check월령득령(일간: string, 월지: string): boolean {
  const 일간오행 = getOhaengOfGan(일간);
  if (!일간오행) return false;

  const 지장간 = allJijangganData[월지];
  if (!지장간) return false;

  const 본기오행 = getOhaengOfGan(지장간.본기.char);
  return 일간오행 === 본기오행;
}

/**
 * 관살 존재 여부 및 유력성 판단
 * 관살 = 나를 극하는 오행 (편관, 정관)
 */
function check관살유력성(
  일간: string,
  천간4글자: string[],
  지지4글자: string[]
): { 존재: boolean; 유력: boolean } {
  const 일간오행 = getOhaengOfGan(일간);
  if (!일간오행) return { 존재: false, 유력: false };

  const 관살오행 = ohaengSanggeuk[일간오행]; // 나를 극하는 오행

  // 천간에서 관살 찾기
  const 천간관살 = 천간4글자.filter(간 => {
    const 오행 = getOhaengOfGan(간);
    return 오행 === 관살오행;
  });

  // 지지에서 관살 찾기 (본기 기준)
  const 지지관살 = 지지4글자.filter(지 => {
    const 지장간 = allJijangganData[지];
    if (!지장간) return false;
    const 본기오행 = getOhaengOfGan(지장간.본기.char);
    return 본기오행 === 관살오행;
  });

  const 관살존재 = 천간관살.length > 0 || 지지관살.length > 0;

  // 유력성 판단: 천간에 있거나, 지지 본기에 있으면 유력
  const 유력 = 천간관살.length > 0 || 지지관살.some(지 => {
    const 지장간 = allJijangganData[지];
    return 지장간 && 지장간.본기.days >= 16; // 본기가 강함
  });

  return { 존재: 관살존재, 유력 };
}

/**
 * 전왕격 판단
 */
export function judgeJeonwangGeokguk(sajuInfo: SajuInfo): GeokgukResult | null {
  const 일간 = get일간(sajuInfo);
  const 월지 = get월지(sajuInfo);
  const 천간4글자 = get천간4글자(sajuInfo);
  const 지지4글자 = get지지4글자(sajuInfo);

  const 일간오행 = getOhaengOfGan(일간);
  if (!일간오행) return null;

  // 조건 1: 월령 득령 여부
  if (!check월령득령(일간, 월지)) {
    return null;
  }

  // 조건 2: 지지에 방합 또는 삼합으로 일간 오행 국(局) 형성
  const 삼합결과 = detect삼합(지지4글자);
  const 방합결과 = detect방합(지지4글자);

  const 합국성립 = 
    (삼합결과.성립 && 삼합결과.오행 === 일간오행) ||
    (방합결과.성립 && 방합결과.오행 === 일간오행);

  if (!합국성립) {
    return null;
  }

  // 조건 3: 관살이 없거나 무력함
  const 관살체크 = check관살유력성(일간, 천간4글자, 지지4글자);
  if (관살체크.존재 && 관살체크.유력) {
    return null; // 관살이 유력하면 전왕격 아님
  }

  // 전왕격 성립!
  const 격명칭 = jeonwangGeokgukNames[일간오행];

  return {
    판단가능: true,
    격국: {
      격명칭,
      격용신: 일간, // 전왕격은 일간 자체가 용신
      격분류: '외격',
      월지,
      성격상태: 관살체크.존재 ? '파격' : '성격',
      강도: '강',
      신뢰도: 90,
      판단근거: {
        방법: '전왕격',
        합국여부: 삼합결과.성립 ? 삼합결과.종류 : 방합결과.종류,
      },
      해석: `${격명칭}이 성립합니다. 일간 ${일간}의 오행(${일간오행})이 지배적이며, 지지에 합국이 형성되어 전왕격이 됩니다.`,
    },
  };
}

// ============================================
// 2. 화기격(化氣格) 판단
// ============================================

/**
 * 화기격 명칭
 */
const hwagiGeokgukNames: Record<string, string> = {
  '甲己': '갑기화토격',
  '己甲': '갑기화토격',
  '乙庚': '을경화금격',
  '庚乙': '을경화금격',
  '丙辛': '병신화수격',
  '辛丙': '병신화수격',
  '丁壬': '정임화목격',
  '壬丁': '정임화목격',
  '戊癸': '무계화화격',
  '癸戊': '무계화화격',
};

/**
 * 화기격 판단
 */
export function judgeHwagiGeokguk(sajuInfo: SajuInfo): GeokgukResult | null {
  const 일간 = get일간(sajuInfo);
  const 월지 = get월지(sajuInfo);
  const 천간4글자 = get천간4글자(sajuInfo);

  // 조건 1: 일간이 월간/시간과 천간합 형성
  const 천간합결과 = check천간합(일간, 천간4글자);
  if (!천간합결과.성립 || !천간합결과.합화오행) {
    return null;
  }

  // 조건 2: 합화된 오행이 월지에서 왕성함 (월령 지원)
  const 지장간 = allJijangganData[월지];
  if (!지장간) return null;

  const 월지본기오행 = getOhaengOfGan(지장간.본기.char);
  if (월지본기오행 !== 천간합결과.합화오행) {
    return null; // 합화 오행과 월령이 일치하지 않음
  }

  // 조건 3: 합을 방해하는 충·극 없음 (간단 버전, 향후 확장 가능)
  // TODO: 충(沖), 극(剋) 로직은 향후 구현

  // 화기격 성립!
  const 합화쌍 = `${일간}${천간합결과.합화천간}`;
  const 격명칭 = hwagiGeokgukNames[합화쌍] || '화기격';

  return {
    판단가능: true,
    격국: {
      격명칭,
      격용신: 천간합결과.합화천간 || 일간,
      격분류: '외격',
      월지,
      성격상태: '성격',
      강도: '강',
      신뢰도: 85,
      판단근거: {
        방법: '화기격',
        투출천간: [천간합결과.합화천간 || ''],
      },
      해석: `${격명칭}이 성립합니다. 일간 ${일간}이 ${천간합결과.합화천간}과 합하여 ${천간합결과.합화오행}로 변화하였으며, 월령에서도 이를 지원합니다.`,
    },
  };
}

// ============================================
// 3. 종격(從格) 판단
// ============================================

/**
 * 종격 명칭
 */
const jongGeokgukNames: Record<string, string> = {
  '재성': '종재격',
  '관살': '종살격',
  '식상': '종아격',
  '비겁': '종세격',
};

/**
 * 일간의 지지 통근력 계산
 * 지지의 지장간에 일간과 같은 오행이 있는지 확인
 */
function calculate통근력(일간: string, 지지4글자: string[]): number {
  const 일간오행 = getOhaengOfGan(일간);
  if (!일간오행) return 0;

  let 통근점수 = 0;

  for (const 지 of 지지4글자) {
    const 지장간 = allJijangganData[지];
    if (!지장간) continue;

    // 본기 확인
    if (getOhaengOfGan(지장간.본기.char) === 일간오행) {
      통근점수 += 지장간.본기.days; // 사령일수만큼 점수
    }

    // 중기 확인
    if (지장간.중기 && getOhaengOfGan(지장간.중기.char) === 일간오행) {
      통근점수 += 지장간.중기.days * 0.5; // 중기는 절반 가중치
    }

    // 여기 확인
    if (지장간.여기 && getOhaengOfGan(지장간.여기.char) === 일간오행) {
      통근점수 += 지장간.여기.days * 0.3; // 여기는 더 낮은 가중치
    }
  }

  return 통근점수;
}

/**
 * 인성 존재 여부 및 유력성 판단
 * 인성 = 나를 생해주는 오행 (편인, 정인)
 */
function check인성유력성(
  일간: string,
  천간4글자: string[],
  지지4글자: string[]
): { 존재: boolean; 유력: boolean } {
  const 일간오행 = getOhaengOfGan(일간);
  if (!일간오행) return { 존재: false, 유력: false };

  // 상생 관계: 목생화, 화생토, 토생금, 금생수, 수생목
  const 인성오행Map: Record<Ohaeng, Ohaeng> = {
    wood: 'water',   // 수생목
    fire: 'wood',    // 목생화
    earth: 'fire',   // 화생토
    metal: 'earth',  // 토생금
    water: 'metal',  // 금생수
  };

  const 인성오행 = 인성오행Map[일간오행];

  // 천간에서 인성 찾기
  const 천간인성 = 천간4글자.filter(간 => {
    const 오행 = getOhaengOfGan(간);
    return 오행 === 인성오행;
  });

  // 지지에서 인성 찾기 (본기 기준)
  const 지지인성 = 지지4글자.filter(지 => {
    const 지장간 = allJijangganData[지];
    if (!지장간) return false;
    const 본기오행 = getOhaengOfGan(지장간.본기.char);
    return 본기오행 === 인성오행;
  });

  const 인성존재 = 천간인성.length > 0 || 지지인성.length > 0;

  // 유력성: 천간에 있거나, 지지 본기에 있으면 유력
  const 유력 = 천간인성.length > 0 || 지지인성.some(지 => {
    const 지장간 = allJijangganData[지];
    return 지장간 && 지장간.본기.days >= 16;
  });

  return { 존재: 인성존재, 유력 };
}

/**
 * 우세 오행 판별 (식상/재성/관살)
 */
function determine우세오행(
  일간: string,
  천간4글자: string[],
  지지4글자: string[]
): { 오행: Ohaeng; 종류: string } | null {
  const 일간오행 = getOhaengOfGan(일간);
  if (!일간오행) return null;

  // 각 오행별 점수 계산
  const 오행점수: Record<Ohaeng, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 천간 점수 (50점)
  for (const 간 of 천간4글자) {
    const 오행 = getOhaengOfGan(간);
    if (오행 && 오행 !== 일간오행) {
      const sibsin = calculateSibsin(일간, 간);
      // 식상, 재성, 관살만 계산
      if (['식신', '상관', '편재', '정재', '편관', '정관'].includes(sibsin.name)) {
        오행점수[오행] += 50;
      }
    }
  }

  // 지지 점수 (본기 기준, 사령일수만큼)
  for (const 지 of 지지4글자) {
    const 지장간 = allJijangganData[지];
    if (!지장간) continue;

    const 본기오행 = getOhaengOfGan(지장간.본기.char);
    if (본기오행 && 본기오행 !== 일간오행) {
      const sibsin = calculateSibsin(일간, 지장간.본기.char);
      if (['식신', '상관', '편재', '정재', '편관', '정관'].includes(sibsin.name)) {
        오행점수[본기오행] += 지장간.본기.days;
      }
    }
  }

  // 가장 높은 점수의 오행 찾기
  let 최고점수 = 0;
  let 우세오행: Ohaeng | null = null;
  let 우세종류 = '';

  for (const [오행, 점수] of Object.entries(오행점수) as [Ohaeng, number][]) {
    if (점수 > 최고점수) {
      최고점수 = 점수;
      우세오행 = 오행;
    }
  }

  if (!우세오행) return null;

  // 우세 오행의 종류 판별 (첫 번째로 만나는 십성으로)
  for (const 간 of 천간4글자) {
    const 오행 = getOhaengOfGan(간);
    if (오행 === 우세오행) {
      const sibsin = calculateSibsin(일간, 간);
      if (['식신', '상관'].includes(sibsin.name)) {
        우세종류 = '식상';
      } else if (['편재', '정재'].includes(sibsin.name)) {
        우세종류 = '재성';
      } else if (['편관', '정관'].includes(sibsin.name)) {
        우세종류 = '관살';
      } else if (['비견', '겁재'].includes(sibsin.name)) {
        우세종류 = '비겁';
      }
      break;
    }
  }

  return 우세오행 ? { 오행: 우세오행, 종류: 우세종류 || '재성' } : null;
}

/**
 * 종격 판단
 */
export function judgeJongGeokguk(sajuInfo: SajuInfo): GeokgukResult | null {
  const 일간 = get일간(sajuInfo);
  const 월지 = get월지(sajuInfo);
  const 천간4글자 = get천간4글자(sajuInfo);
  const 지지4글자 = get지지4글자(sajuInfo);

  // 조건 1: 일간이 지지에 통근력이 전혀 없음 (무근無根)
  const 통근력 = calculate통근력(일간, 지지4글자);
  if (통근력 >= 10) {
    // 가종격 가능성 (미약한 통근력)
    // TODO: 가종격 처리
    return null;
  }

  // 조건 2: 인성이 없거나 무력함
  const 인성체크 = check인성유력성(일간, 천간4글자, 지지4글자);
  if (인성체크.존재 && 인성체크.유력) {
    return null; // 인성이 유력하면 종격 아님
  }

  // 조건 3: 사주 내 특정 오행(식상/재성/관살)이 지배적
  const 우세오행결과 = determine우세오행(일간, 천간4글자, 지지4글자);
  if (!우세오행결과) {
    return null;
  }

  // 종격 성립!
  const 격명칭 = jongGeokgukNames[우세오행결과.종류] || '종격';

  return {
    판단가능: true,
    격국: {
      격명칭,
      격용신: 일간, // 종격은 따르는 오행이 용신
      격분류: '외격',
      월지,
      성격상태: 통근력 === 0 ? '성격' : '파격',
      강도: '강',
      신뢰도: 통근력 === 0 ? 90 : 70, // 통근력이 있으면 신뢰도 낮음
      판단근거: {
        방법: '종격',
        일간체크: `통근력: ${통근력.toFixed(1)}점`,
      },
      해석: `${격명칭}이 성립합니다. 일간 ${일간}이 고립무원하여 ${우세오행결과.오행}(${우세오행결과.종류})의 세력을 따릅니다.`,
    },
  };
}

// ============================================
// 4. 특수격 통합 판단 함수
// ============================================

/**
 * 특수격 판단 (전왕 → 화기 → 종격 순서)
 */
export function judgeSpecialGeokguk(sajuInfo: SajuInfo): GeokgukResult | null {
  // 1순위: 전왕격
  const 전왕결과 = judgeJeonwangGeokguk(sajuInfo);
  if (전왕결과 && 전왕결과.판단가능) {
    return 전왕결과;
  }

  // 2순위: 화기격
  const 화기결과 = judgeHwagiGeokguk(sajuInfo);
  if (화기결과 && 화기결과.판단가능) {
    return 화기결과;
  }

  // 3순위: 종격
  const 종결과 = judgeJongGeokguk(sajuInfo);
  if (종결과 && 종결과.판단가능) {
    return 종결과;
  }

  return null; // 특수격 아님
}

