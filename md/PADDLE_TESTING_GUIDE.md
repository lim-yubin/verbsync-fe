# 🧪 Paddle 결제 모듈 테스트 가이드

**작성일**: 2025-01-XX  
**대상**: Starter 플랜 결제 기능  
**환경**: Paddle Sandbox

---

## 📋 목차

1. [사전 준비](#사전-준비)
2. [Paddle Sandbox 설정](#paddle-sandbox-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [로컬 테스트](#로컬-테스트)
5. [Webhook 테스트](#webhook-테스트)
6. [문제 해결](#문제-해결)

---

## 1. 사전 준비

### 1.1 필요한 것들

- [ ] Paddle Sandbox 계정
- [ ] 로컬 개발 환경 (백엔드 + 프론트엔드 실행 가능)
- [ ] ngrok 또는 유사한 터널링 도구 (Webhook 테스트용)

### 1.2 의존성 설치

**백엔드**:

```bash
cd verbsync-be
npm install axios
```

**프론트엔드**:

```bash
cd verbsync-fe
npm install  # 이미 설치되어 있을 수 있음
```

---

## 2. Paddle Sandbox 설정

### 2.1 Paddle Sandbox 계정 생성

1. [Paddle Dashboard](https://vendors.paddle.com/) 접속
2. Sandbox 계정 생성 또는 로그인
3. Sandbox 환경으로 전환 (우측 상단)

### 2.2 Product 및 Price 생성

1. **Product 생성**:

   - Paddle Dashboard → Products → Create Product
   - Product Name: "Verbsync Starter"
   - Product Type: "Standard"
   - Save

2. **Price 생성**:
   - 생성한 Product 클릭
   - Add Price 클릭
   - Price 설정:
     - **Billing Cycle**: Monthly
     - **Price**: $19.00
     - **Currency**: USD
     - Save
   - **Price ID 복사** (예: `pri_01hxxxxxxxxxxxxx`)

### 2.3 API Key 생성

1. Paddle Dashboard → Developer Tools → Authentication
2. **API Keys** 탭 클릭
3. **New API Key** 클릭
4. Name: "Verbsync Development"
5. Permissions: Full Access (또는 필요한 권한만)
6. Save 후 **API Key 복사** (예: `pdl_sdbx_apikey_xxxxxxxxxxxxx`)

### 2.4 Public Key 확인 (Webhook 검증용)

1. Paddle Dashboard → Developer Tools → Authentication
2. **Public Key** 확인 및 복사
   - 형식: `-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`
   - 또는 단순 문자열 형식

### 2.5 Webhook URL 설정

**로컬 테스트를 위해 ngrok 사용**:

1. **ngrok 설치** (없는 경우):

   ```bash
   # macOS
   brew install ngrok

   # 또는 https://ngrok.com/download 에서 다운로드
   ```

2. **ngrok 터널 생성**:

   ```bash
   # 백엔드가 localhost:3000에서 실행 중일 때
   ngrok http 3000
   ```

3. **ngrok URL 복사** (예: `https://abc123.ngrok.io`)

4. **Paddle Dashboard에서 Webhook 설정**:
   - Paddle Dashboard → Developer Tools → Notifications
   - **Add Notification URL** 클릭
   - URL 입력: `https://abc123.ngrok.io/subscription/webhook`
   - Events 선택:
     - ✅ Transaction completed
     - ✅ Subscription created
     - ✅ Subscription updated
     - ✅ Subscription cancelled
   - Save

---

## 3. 환경 변수 설정

### 3.1 백엔드 환경 변수

**파일**: `verbsync-be/.env`

```env
# 기존 환경 변수들...
DATABASE_URL="mysql://user:password@localhost:3306/verbsync"
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

# Paddle 설정
PADDLE_API_KEY=pdl_sdbx_apikey_xxxxxxxxxxxxx  # 2.3에서 복사한 API Key
PADDLE_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----  # 2.4에서 복사한 Public Key
PADDLE_ENV=sandbox
PADDLE_STARTER_MONTHLY_PRICE_ID=pri_01hxxxxxxxxxxxxx  # 2.2에서 복사한 Price ID
```

**중요**:

- `PADDLE_PUBLIC_KEY`는 PEM 형식이거나 단순 문자열 형식 모두 가능 (코드에서 자동 변환)
- `PADDLE_STARTER_MONTHLY_PRICE_ID`는 반드시 Sandbox 환경의 Price ID 사용

### 3.2 프론트엔드 환경 변수

**파일**: `verbsync-fe/.env`

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 4. 로컬 테스트

### 4.1 백엔드 실행

```bash
cd verbsync-be
npm run start:dev
```

**확인사항**:

- 서버가 `http://localhost:3000`에서 실행되는지 확인
- Swagger 문서: `http://localhost:3000/api`

### 4.2 프론트엔드 실행

```bash
cd verbsync-fe
npm run dev
```

**확인사항**:

- 프론트엔드가 `http://localhost:5173`에서 실행되는지 확인

### 4.3 ngrok 터널 실행 (Webhook 테스트용)

```bash
ngrok http 3000
```

**확인사항**:

- ngrok URL 확인 (예: `https://abc123.ngrok.io`)
- 이 URL을 Paddle Dashboard의 Webhook URL로 설정

### 4.4 테스트 계정 로그인

1. 프론트엔드에서 회원가입 또는 로그인
2. 현재 플랜이 FREE인지 확인

### 4.5 결제 플로우 테스트

1. **구독 페이지 이동**:

   - `/subscription` 페이지로 이동
   - 또는 Settings → Subscription

2. **Starter 플랜 선택**:

   - Starter 플랜 카드에서 "업그레이드" 버튼 클릭
   - 로딩 상태 확인

3. **Paddle Checkout 페이지**:

   - Paddle Checkout 페이지로 리다이렉트되는지 확인
   - 테스트 카드 정보 입력:
     - **카드 번호**: `4242 4242 4242 4242`
     - **만료일**: 미래 날짜 (예: 12/25)
     - **CVV**: 임의의 3자리 숫자 (예: 123)
     - **이름**: 임의의 이름

4. **결제 완료**:

   - "Pay" 또는 "Complete Payment" 버튼 클릭
   - 결제 성공 페이지로 리다이렉트되는지 확인

5. **플랜 업그레이드 확인**:
   - `/subscription/success` 페이지에서 플랜이 STARTER로 변경되었는지 확인
   - 또는 `/subscription` 페이지에서 현재 플랜 확인

---

## 5. Webhook 테스트

### 5.1 Webhook 이벤트 확인

**백엔드 로그 확인**:

```bash
# 백엔드 터미널에서 로그 확인
# 다음과 같은 로그가 나타나야 함:
# - "Paddle webhook received: { eventType: 'transaction.completed', ... }"
# - "Transaction completed: { userId: '...', plan: 'STARTER', ... }"
# - "Plan upgraded successfully: { userId: '...', plan: 'STARTER' }"
```

### 5.2 Paddle Dashboard에서 Webhook 로그 확인

1. Paddle Dashboard → Developer Tools → Notifications
2. **Notification Logs** 탭 클릭
3. 최근 Webhook 이벤트 확인:
   - Status: Success (200)
   - Response Time 확인

### 5.3 수동 Webhook 테스트

Paddle Dashboard에서 테스트 이벤트 전송:

1. Paddle Dashboard → Developer Tools → Notifications
2. **Send Test Event** 클릭
3. Event Type 선택:
   - `transaction.completed`
   - `subscription.created`
4. **Send** 클릭
5. 백엔드 로그에서 이벤트 수신 확인

### 5.4 ngrok Web Inspector 확인

ngrok을 사용하는 경우:

1. 브라우저에서 `http://127.0.0.1:4040` 접속 (ngrok Web UI)
2. **Inspect** 탭에서 Webhook 요청 확인:
   - Request Headers (paddle-signature 포함)
   - Request Body
   - Response Status

---

## 6. 문제 해결

### 6.1 Checkout 링크 생성 실패

**증상**: "결제 링크 생성에 실패했습니다" 에러

**확인사항**:

- [ ] `PADDLE_API_KEY`가 올바른지 확인
- [ ] `PADDLE_STARTER_MONTHLY_PRICE_ID`가 올바른지 확인
- [ ] 백엔드 로그에서 에러 메시지 확인
- [ ] Paddle API 응답 구조 확인 (코드에서 `response.data.data.checkout.url` 경로 확인)

**해결방법**:

```typescript
// paddle.service.ts의 createCheckoutLink 메서드에서
// 실제 API 응답 구조에 맞게 수정 필요할 수 있음
console.log("Paddle API Response:", JSON.stringify(response.data, null, 2));
```

### 6.2 Webhook 서명 검증 실패

**증상**: "Invalid webhook signature" 에러

**확인사항**:

- [ ] `PADDLE_PUBLIC_KEY`가 올바른지 확인
- [ ] Public Key 형식 확인 (PEM 형식 또는 단순 문자열)
- [ ] Webhook 요청의 `paddle-signature` 헤더 확인
- [ ] Raw body가 제대로 전달되는지 확인

**해결방법**:

```typescript
// subscription.controller.ts에서 디버깅 로그 추가
console.log("Webhook signature:", signature);
console.log("Payload length:", payload.length);
console.log("Public key:", this.paddleService.publicKey?.substring(0, 50));
```

### 6.3 플랜 업그레이드 안 됨

**증상**: 결제는 완료되었지만 플랜이 업그레이드되지 않음

**확인사항**:

- [ ] Webhook 이벤트가 수신되었는지 확인 (백엔드 로그)
- [ ] `transaction.completed` 이벤트의 `custom_data`에 `userId`와 `plan`이 포함되는지 확인
- [ ] `subscription_id`가 있는지 확인
- [ ] 데이터베이스에서 User 테이블의 `plan` 필드 확인

**해결방법**:

```typescript
// subscription.controller.ts의 handleTransactionCompleted에서
// custom_data 확인
console.log("Custom data:", JSON.stringify(customData, null, 2));
console.log("Event data:", JSON.stringify(event.data, null, 2));
```

### 6.4 ngrok 연결 문제

**증상**: Webhook이 수신되지 않음

**확인사항**:

- [ ] ngrok이 실행 중인지 확인
- [ ] ngrok URL이 Paddle Dashboard에 올바르게 설정되었는지 확인
- [ ] ngrok Web Inspector에서 요청이 들어오는지 확인

**해결방법**:

- ngrok 재시작
- 새로운 ngrok URL로 Paddle Dashboard 업데이트

---

## 7. 테스트 체크리스트

### 7.1 기본 플로우

- [ ] Starter 플랜 결제 버튼 클릭
- [ ] Paddle Checkout 페이지로 리다이렉트
- [ ] 테스트 카드로 결제 완료
- [ ] 결제 성공 페이지로 리다이렉트
- [ ] 플랜이 STARTER로 업그레이드됨

### 7.2 Webhook 이벤트

- [ ] `transaction.completed` 이벤트 수신
- [ ] `subscription.created` 이벤트 수신 (있는 경우)
- [ ] 플랜 업그레이드 성공
- [ ] 데이터베이스에 `paddleSubscriptionId` 저장됨

### 7.3 에러 처리

- [ ] 결제 링크 생성 실패 시 에러 메시지 표시
- [ ] Webhook 서명 검증 실패 시 로그 기록
- [ ] 이벤트 처리 실패 시 로그 기록

---

## 8. 프로덕션 배포 전 체크리스트

- [ ] Paddle Live 환경으로 전환
- [ ] Live API Key 사용
- [ ] Live Price ID 사용
- [ ] Webhook URL을 실제 도메인으로 변경
- [ ] Public Key를 Live 환경의 것으로 변경
- [ ] 환경 변수 `PADDLE_ENV=production`으로 변경

---

## 9. 참고 자료

- [Paddle Sandbox 가이드](https://developer.paddle.com/getting-started/sandbox)
- [Paddle API 문서](https://developer.paddle.com/api-reference)
- [Paddle Webhooks 문서](https://developer.paddle.com/webhooks)
- [Paddle 테스트 카드](https://developer.paddle.com/getting-started/sandbox/test-cards)

---

**다음 단계**: 위 단계를 따라 테스트를 진행하세요!
