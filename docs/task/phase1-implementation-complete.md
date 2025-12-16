# Phase 1: 오행 세력표 구현 완료

## 📅 작성일: 2025-12-16

## ✅ 완료된 작업

### 1. 가중치 설정 파일 (`weights.ts`)
모든 가중치 수치를 별도 파일로 분리하여 쉽게 조절 가능하도록 구현

**조절 가능한 가중치:**
- 위치별 가중치 (천간/지지)
- 지장간 배분율
- 합(合) 배수
- 충(沖) 감산율
- 월령 사령 보너스
- 통근 계수
- 조후 긴급도
- 신강/신약 임계값

### 2. 기초 데이터 파일 (`data.ts`)
- 천간 10개 데이터
- 지지 12개 데이터
- 지장간 상세 정보 (일수별)
- 오행 상생상극 관계
- 십성 계산 함수
- 합/충 데이터

### 3. 타입 정의 (`types.ts`)
- `OhaengScores` - 오행별 점수
- `CharacterScore` - 글자별 상세 점수
- `ForceMatrix` - 오행 세력표
- `HabInfo` / `ChungInfo` - 합/충 정보
- `Phase1Result` - Phase 1 결과

### 4. 오행 세력표 계산 (`forceCalculator.ts`)
- 천간 점수 계산
- 지지 점수 계산 (지장간 분해)
- 위치 가중치 적용
- 월령 사령 보너스

### 5. 합/충 상호작용 (`interactions.ts`)
- 천간합 탐지 (진합/기반 구분)
- 삼합/반합 탐지
- 방합 탐지
- 육합 탐지
- 충 탐지 (왕지충/생지충/고지충)
- 점수 조정 계산

---

## 📁 생성된 파일

```
utils/yongsin/
├── weights.ts          # ⭐ 가중치 설정 (조절 가능)
├── types.ts            # 타입 정의
├── data.ts             # 기초 데이터
├── forceCalculator.ts  # 오행 세력표 계산
├── interactions.ts     # 합/충 상호작용
├── index.ts            # 메인 export
└── test-phase1.ts      # 테스트 파일
```

---

## 🎯 사용 방법

### 기본 사용

```typescript
import { analyzePhase1, formatPhase1Result } from './utils/yongsin';

const sajuInput = {
  pillars: {
    year: { ... },
    month: { ... },
    day: { ... },
    hour: { ... },
  }
};

const result = analyzePhase1(sajuInput);
console.log(formatPhase1Result(result));
```

### 가중치 조절

`utils/yongsin/weights.ts` 파일에서 원하는 가중치 수정:

```typescript
// 예: 월지 가중치를 3.0에서 3.5로 변경
export const JIJI_WEIGHTS = {
  YEAR: 1.5,
  MONTH: 3.5,  // 3.0 → 3.5
  DAY: 1.8,
  HOUR: 1.2,
};
```

---

## 📊 테스트 결과

| 테스트 | 설명 | 결과 |
|--------|------|------|
| 1 | 기본 사주 | ✅ 정상 |
| 2 | 삼합 화국 (寅午戌) | ✅ 화 50% 증폭 |
| 3 | 왕지충 (子午) | ✅ 화 감소 + 수국 삼합 |
| 4 | 방합 목국 (寅卯辰) | ✅ 목 73% 증폭 |
| 5 | 천간합 (甲己 합토) | ✅ 토 62% 증폭 |
| 6 | 복합 상호작용 | ✅ 수 65% |

---

## 📝 다음 단계 (Phase 2)

- [ ] 신강/신약 판정 로직 구현
- [ ] 득령/득지/득세 계산
- [ ] 통근 계수 적용
- [ ] 신강약 지수(Index_DM) 산출

---

## 💡 주요 가중치 기본값

| 항목 | 값 | 설명 |
|------|-----|------|
| 월지 가중치 | 3.0 | 가장 중요 |
| 일지 가중치 | 1.8 | 두 번째 |
| 삼합 완성 배수 | 2.0 | 점수 2배 |
| 방합 완성 배수 | 1.8 | 점수 1.8배 |
| 왕지충 감산 | 0.6 | 40% 감소 |
| 생지충 감산 | 0.7 | 30% 감소 |
| 고지충 감산 | 0.8 | 20% 감소 + 개고 |

---

작성자: Claude
버전: 1.0
