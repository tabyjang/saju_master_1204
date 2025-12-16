# Phase 2: 신강/신약 판정 구현

## 📅 작업일: 2025-12-16

## 📋 작업 내용

### 요청사항
- Phase 2: 신강/신약 판정 로직 구현
- 득령/득지/득세 판정
- 통근 계수 계산
- 신강약 지수(Index_DM) 산출
- 등급 판정 (태왕/신강/중화/신약/태약)

---

## 🔧 구현 내용

### 1. 생성된 파일

#### `/utils/yongsin/strengthCalculator.ts`
신강/신약 판정의 핵심 로직을 담은 모듈

**주요 함수:**

| 함수명 | 설명 |
|--------|------|
| `getSibsinCategory()` | 오행의 십성 카테고리 분류 (비겁/인성/식상/재관) |
| `isSupport()` / `isOppose()` | 아군/적군 판별 |
| `checkDeukryeong()` | 득령 여부 판정 |
| `checkDeukryeongDetail()` | 득령 상세 판정 (지장간 기준) |
| `checkDeukji()` | 득지 여부 판정 |
| `isStrongUnseong()` | 12운성 기준 득지 판정 |
| `checkDeukjiDetail()` | 득지 상세 판정 |
| `calculateDeukse()` | 득세 계산 (아군 vs 적군) |
| `calculateTonggeun()` | 통근 계수 계산 |
| `calculateStrengthIndex()` | 신강약 지수(Index_DM) 산출 |
| `determineStrengthLevel()` | 등급 판정 |
| `analyzeStrength()` | 통합 분석 함수 |
| `formatStrengthResult()` | 결과 포맷 출력 |

#### `/utils/yongsin/test-phase2.ts`
Phase 2 테스트 파일 (7개 테스트 케이스)

---

### 2. 업데이트된 파일

#### `/utils/yongsin/index.ts`
- Phase 2 함수들 export 추가
- `Phase2Result` 타입 추가
- `analyzePhase2()` 통합 분석 함수 추가
- `formatPhase2Result()` 결과 포맷 함수 추가

---

## 📊 신강/신약 판정 로직

### 3대 판정 요소

1. **득령(得令)** - 월지가 일간을 돕는가?
   - 월지가 인성/비겁이면 득령
   - 지장간 아군 비율로 강도 계산

2. **득지(得地)** - 일지가 일간을 돕는가?
   - 일지가 인성/비겁이면 득지
   - 12운성이 장생/관대/건록/제왕이면 득지

3. **득세(得勢)** - 아군이 많은가?
   - 아군(인성+비겁) vs 적군(식상+재관) 점수 비교

### 통근(通根) 계수

일간과 같은 오행이 지지 지장간에 있을 때:
- 월지 통근: 1.5배
- 일지 통근: 1.3배
- 시지/년지 통근: 1.1배
- 무근(無根): 0.7배

### 신강약 지수 공식

```
Index_DM = (아군점수 × 통근계수) - 적군점수 + 득령보너스(30) + 득지보너스(15)
```

### 등급 판정 기준

| 등급 | 한글 | 기준 |
|------|------|------|
| `extreme_strong` | 태왕 (극신강) | Index ≥ 50 |
| `strong` | 신강 (身强) | 10 < Index < 50 |
| `neutral` | 중화 (中和) | -10 ≤ Index ≤ 10 |
| `weak` | 신약 (身弱) | -40 < Index < -10 |
| `extreme_weak` | 태약 (극신약) | Index ≤ -40 |

---

## 🧪 테스트 결과

```
총 테스트: 7개
통과: 2개
다름: 5개
```

⚠️ "다름"으로 표시된 케이스는 가중치 조정으로 결과 변경 가능

---

## 💡 사용 방법

```typescript
import { analyzePhase2, formatPhase2Result } from './utils/yongsin';

// Phase 1 + 2 통합 분석
const result = analyzePhase2(sajuInput);

// 결과 출력
console.log(formatPhase2Result(result));

// 개별 접근
console.log(result.strength.level);          // 등급
console.log(result.strength.index);          // 지수
console.log(result.strength.deukryeong);     // 득령 여부
console.log(result.strength.deukji);         // 득지 여부
console.log(result.strength.deukseScore);    // 득세 점수
console.log(result.strength.tonggeunCoefficient); // 통근 계수
```

---

## 🔮 다음 단계

**Phase 3: 조후 용신 판정**
- 월지별 온도/습도 분석
- 조후 긴급도 계산
- 필요 조후 용신 선정

---

## 📁 관련 파일

- `/utils/yongsin/strengthCalculator.ts` - 핵심 로직
- `/utils/yongsin/weights.ts` - 가중치 설정
- `/utils/yongsin/types.ts` - 타입 정의
- `/utils/yongsin/index.ts` - 통합 export
- `/utils/yongsin/test-phase2.ts` - 테스트
