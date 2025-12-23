# API 테스트 커버리지

## ✅ 테스트 완료된 API

### 인증 (Authentication)
- ✅ POST /auth/register - 회원가입
- ✅ POST /auth/login - 로그인
- ✅ POST /auth/logout - 로그아웃

### 구독 (Subscription)
- ✅ GET /subscription/plan - 플랜 정보 조회

### 프로젝트 (Projects)
- ✅ GET /projects - 프로젝트 목록 조회
- ✅ POST /projects - 프로젝트 생성
- ✅ GET /projects/:id - 프로젝트 상세 조회
- ✅ DELETE /projects/:id - 프로젝트 삭제

### 언어 (Locales)
- ✅ GET /projects/:id/locales - 언어 목록 조회
- ✅ POST /projects/:id/locales - 언어 추가
- ✅ PATCH /projects/:id/locales/:localeId/status - 언어 활성화/비활성화

### 번역 (Translations)
- ✅ GET /projects/:id/translations/matrix - 번역 매트릭스 조회
- ✅ POST /projects/:id/keys - 번역 키 추가
- ✅ PATCH /projects/:id/translations - 번역 일괄 업데이트

### 멤버 (Members)
- ✅ GET /members - 멤버 목록 조회
- ✅ GET /members/me - 멤버 권한 조회
- ✅ POST /members/invite - 멤버 초대

## ❌ 테스트 누락된 API

### 인증 (Authentication)
- ❌ POST /auth/refresh - Access Token 갱신
- ❌ GET /auth/me - 현재 사용자 정보 조회
- ❌ PATCH /auth/me - 프로필 수정
- ❌ PATCH /auth/me/password - 비밀번호 변경
- ❌ DELETE /auth/me - 계정 삭제

### 프로젝트 (Projects)
- ❌ GET /projects/:id/api-key - API Key 조회
- ❌ PATCH /projects/:id - 프로젝트 수정

### 언어 (Locales)
- ❌ DELETE /projects/:id/locales/:localeId - 언어 삭제

### 번역 키 (Keys)
- ❌ GET /projects/:id/keys - 번역 키 목록 조회
- ❌ PATCH /projects/:id/keys/:keyId - 번역 키 수정
- ❌ DELETE /projects/:id/keys/:keyId - 번역 키 삭제

### 멤버 (Members)
- ❌ PATCH /members/:memberId/role - 멤버 역할 변경
- ❌ DELETE /members/:memberId - 멤버 제거
- ❌ GET /members/invite/:token - 초대 정보 조회
- ❌ POST /members/invite/:token/accept - 초대 수락

### Public API
- ❌ GET /public/:apiKey/locales/:locale.json - Public 번역 조회

