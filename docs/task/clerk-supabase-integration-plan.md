# Clerk + Supabase 통합 계획서

## 📅 작성일: 2025-12-16

## 📌 요약
사주 분석 앱(selfsaju)에 Clerk(인증)과 Supabase(데이터베이스)를 통합하는 계획

---

## 🎯 목표
1. **사용자 인증** - Clerk을 통한 로그인/회원가입 (Google, Kakao 소셜 로그인)
2. **데이터 저장** - Supabase에 사주 분석 결과 및 채팅 기록 저장
3. **사용자별 히스토리** - 이전 분석 결과 조회 기능

---

## 🛠️ 현재 기술 스택
- React 19 + Vite + TypeScript
- Google Gemini API (AI 분석)
- Vercel 배포

---

## 📦 추가할 패키지
```bash
npm install @clerk/clerk-react @supabase/supabase-js
```

---

## 📋 구현 단계

### Phase 1: Clerk 설정 (인증)
- [ ] Clerk 프로젝트 생성 및 키 발급
- [ ] `@clerk/clerk-react` 설치
- [ ] ClerkProvider 적용 (index.tsx)
- [ ] AuthButtons 컴포넌트 생성
- [ ] 소셜 로그인 설정 (Google, Kakao)

### Phase 2: Supabase 설정 (데이터베이스)
- [ ] Supabase 프로젝트 생성
- [ ] `@supabase/supabase-js` 설치
- [ ] 테이블 생성
  - [ ] profiles (사용자 프로필)
  - [ ] saju_analyses (분석 결과)
  - [ ] chat_messages (채팅 기록)
- [ ] RLS 정책 설정

### Phase 3: Clerk-Supabase 연동
- [ ] Clerk 로그인 시 Supabase profiles 동기화
- [ ] JWT 토큰 연동 (선택)

### Phase 4: 앱 통합
- [ ] App.tsx에 인증 로직 추가
- [ ] 분석 결과 저장 기능
- [ ] 분석 히스토리 목록 UI
- [ ] 테스트

---

## 🗄️ 데이터베이스 스키마

### profiles 테이블
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### saju_analyses 테이블
```sql
CREATE TABLE saju_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  name TEXT,
  birth_year INT,
  birth_month INT,
  birth_day INT,
  birth_hour INT,
  birth_minute INT,
  gender TEXT,
  is_lunar BOOLEAN DEFAULT FALSE,
  year_pillar JSONB,
  month_pillar JSONB,
  day_pillar JSONB,
  hour_pillar JSONB,
  stage1_result TEXT,
  stage2_result TEXT,
  stage3_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### chat_messages 테이블
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES saju_analyses(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📁 새로 추가할 파일
```
/workspace
├── services/
│   ├── supabaseClient.ts     # Supabase 클라이언트
│   └── analysisStorage.ts    # 분석 저장 서비스
├── components/
│   ├── AuthButtons.tsx       # 로그인/로그아웃 버튼
│   └── MyAnalysesList.tsx    # 분석 히스토리 목록
├── hooks/
│   └── useSupabaseUser.ts    # Clerk-Supabase 연동 훅
└── .env.local                # 환경 변수
```

---

## 🔐 환경 변수
```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
```

---

## ⏱️ 예상 소요 시간
- Phase 1 (Clerk): 2-3시간
- Phase 2 (Supabase): 1-2시간
- Phase 3 (연동): 2-3시간
- Phase 4 (통합): 2-3시간
- **총계: 7-11시간**

---

## 💡 고려사항
1. **Kakao 로그인** - 한국 사용자 타겟이면 필수
2. **무료 한도** - Clerk 10,000 MAU, Supabase 500MB
3. **비로그인 사용** - 로그인 없이도 분석 가능하게 할지 결정 필요
4. **보안** - Clerk JWT를 Supabase RLS에 연동 권장

---

## 📝 다음 단계
1. Clerk/Supabase 계정 생성 및 프로젝트 설정
2. 환경 변수 설정
3. Phase 1부터 순차 구현

---

작성자: Claude
버전: 1.0
