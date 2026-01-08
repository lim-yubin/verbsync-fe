# 💳 Paddle 결제 모듈 통합 계획

**작성일**: 2025-01-XX  
**대상 플랜**: Starter (우선)  
**결제 시스템**: Paddle  
**목표**: Starter 플랜 결제 기능 구현

---

## 📋 목차

1. [개요](#개요)
2. [Paddle 설정](#paddle-설정)
3. [백엔드 작업](#백엔드-작업)
4. [프론트엔드 작업](#프론트엔드-작업)
5. [Webhook 처리](#webhook-처리)
6. [테스트 계획](#테스트-계획)
7. [구현 순서](#구현-순서)

---

## 1. 개요

### 1.1 목표

- Starter 플랜 ($19/월) 결제 기능 구현
- Paddle을 통한 안전한 결제 처리
- Webhook을 통한 구독 상태 동기화

### 1.2 플랜 구조

- **FREE**: 무료 (기본)
- **STARTER**: $19/월 (결제 대상)
- **PRO**: $79/월 (향후 구현)

### 1.3 기술 스택

- **백엔드**: NestJS + Prisma
- **프론트엔드**: React + TypeScript
- **결제**: Paddle API

---

## 2. Paddle 설정

### 2.1 Paddle 계정 설정

1. [Paddle Dashboard](https://vendors.paddle.com/) 접속
2. Sandbox 환경에서 테스트
3. Product 생성:
   - **Starter Monthly**: $19/월
   - Product ID 저장 필요

### 2.2 환경 변수 설정

**백엔드 (`.env`)**

```env
# Paddle 설정
PADDLE_API_KEY=your_paddle_api_key
PADDLE_VENDOR_ID=your_vendor_id
PADDLE_PUBLIC_KEY=your_public_key  # Webhook 검증용
PADDLE_ENV=sandbox  # sandbox | production
PADDLE_STARTER_MONTHLY_PRODUCT_ID=prod_xxxxx

# Frontend URL (결제 후 리다이렉트용)
FRONTEND_URL=http://localhost:5173
```

**프론트엔드 (`.env`)**

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 3. 백엔드 작업

### 3.1 의존성 설치

```bash
cd verbsync-be
npm install @paddle/paddle-nodejs-sdk
# 또는
npm install axios  # Paddle REST API 직접 호출
```

**참고**: Paddle은 공식 Node.js SDK가 없을 수 있으므로 REST API를 직접 호출하는 방식 권장

### 3.2 PaddleService 생성

**파일**: `src/subscription/paddle.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import axios from "axios";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PaddleService {
  private readonly apiKey: string;
  private readonly vendorId: string;
  private readonly baseUrl: string;
  private readonly publicKey: string;

  constructor(private prisma: PrismaService) {
    this.apiKey = process.env.PADDLE_API_KEY;
    this.vendorId = process.env.PADDLE_VENDOR_ID;
    this.publicKey = process.env.PADDLE_PUBLIC_KEY;
    this.baseUrl =
      process.env.PADDLE_ENV === "sandbox"
        ? "https://sandbox-api.paddle.com"
        : "https://api.paddle.com";
  }

  /**
   * Checkout 링크 생성 (Starter 플랜)
   */
  async createCheckoutLink(
    userId: string,
    userEmail: string,
    plan: "STARTER",
    period: "month" | "year" = "month"
  ): Promise<string> {
    const productId = process.env.PADDLE_STARTER_MONTHLY_PRODUCT_ID;

    // Paddle Checkout API 호출
    const response = await axios.post(
      `${this.baseUrl}/transactions`,
      {
        items: [
          {
            price_id: productId,
            quantity: 1,
          },
        ],
        customer_id: await this.getOrCreateCustomerId(userId, userEmail),
        custom_data: {
          userId,
          plan,
        },
        return_url: `${process.env.FRONTEND_URL}/subscription/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data.checkout.url;
  }

  /**
   * Paddle Customer ID 조회 또는 생성
   */
  private async getOrCreateCustomerId(
    userId: string,
    userEmail: string
  ): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { paddleCustomerId: true },
    });

    if (user?.paddleCustomerId) {
      return user.paddleCustomerId;
    }

    // Paddle에서 Customer 생성
    const response = await axios.post(
      `${this.baseUrl}/customers`,
      {
        email: userEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const customerId = response.data.data.id;

    // DB에 저장
    await this.prisma.user.update({
      where: { id: userId },
      data: { paddleCustomerId: customerId },
    });

    return customerId;
  }

  /**
   * Webhook 서명 검증
   */
  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    // Paddle Webhook 서명 검증 로직
    // https://developer.paddle.com/webhooks/verifying-webhooks
    const crypto = require("crypto");
    const verifier = crypto.createVerify("sha256");
    verifier.update(payload);
    return verifier.verify(this.publicKey, signature, "base64");
  }
}
```

### 3.3 SubscriptionService 확장

**파일**: `src/subscription/subscription.service.ts`

```typescript
// 기존 코드에 추가

/**
 * 플랜 업그레이드 (Paddle 결제 후)
 */
async upgradePlan(
  userId: string,
  plan: 'STARTER',
  paddleSubscriptionId: string
): Promise<void> {
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      planStartedAt: new Date(),
      planEndsAt: null, // 월간 구독이므로 자동 갱신
      paddleSubscriptionId,
    },
  });
}

/**
 * 구독 취소 처리
 */
async cancelSubscription(userId: string): Promise<void> {
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      plan: 'FREE',
      planEndsAt: new Date(), // 현재 구독 기간 종료일
    },
  });
}
```

### 3.4 SubscriptionController 확장

**파일**: `src/subscription/subscription.controller.ts`

```typescript
// 기존 코드에 추가

@Post('checkout')
@ApiOperation({ summary: 'Paddle Checkout 링크 생성' })
async createCheckout(
  @Request() req: RequestWithUser,
  @Body() dto: { plan: 'STARTER'; period?: 'month' | 'year' }
) {
  const user = await this.prisma.user.findUnique({
    where: { id: req.user.id },
    select: { email: true },
  });

  const checkoutUrl = await this.paddleService.createCheckoutLink(
    req.user.id,
    user.email,
    dto.plan,
    dto.period || 'month'
  );

  return { url: checkoutUrl };
}

@Post('webhook')
@ApiOperation({ summary: 'Paddle Webhook 처리' })
async handleWebhook(
  @Req() req: Request,
  @Headers('paddle-signature') signature: string
) {
  const payload = JSON.stringify(req.body);

  // Webhook 서명 검증
  const isValid = await this.paddleService.verifyWebhook(payload, signature);
  if (!isValid) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  const event = req.body;

  // 이벤트 타입별 처리
  switch (event.event_type) {
    case 'transaction.completed':
      await this.handleTransactionCompleted(event);
      break;
    case 'subscription.created':
    case 'subscription.updated':
      await this.handleSubscriptionUpdated(event);
      break;
    case 'subscription.cancelled':
      await this.handleSubscriptionCancelled(event);
      break;
  }

  return { received: true };
}

private async handleTransactionCompleted(event: any) {
  const { userId, plan } = event.data.custom_data;
  const subscriptionId = event.data.subscription_id;

  if (userId && plan === 'STARTER') {
    await this.subscriptionService.upgradePlan(
      userId,
      plan,
      subscriptionId
    );
  }
}

private async handleSubscriptionUpdated(event: any) {
  const subscriptionId = event.data.id;
  const user = await this.prisma.user.findUnique({
    where: { paddleSubscriptionId: subscriptionId },
  });

  if (user) {
    // 구독 상태 업데이트
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        planEndsAt: event.data.next_billed_at
          ? new Date(event.data.next_billed_at)
          : null,
      },
    });
  }
}

private async handleSubscriptionCancelled(event: any) {
  const subscriptionId = event.data.id;
  const user = await this.prisma.user.findUnique({
    where: { paddleSubscriptionId: subscriptionId },
  });

  if (user) {
    await this.subscriptionService.cancelSubscription(user.id);
  }
}
```

### 3.5 SubscriptionModule 업데이트

**파일**: `src/subscription/subscription.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionController } from "./subscription.controller";
import { PaddleService } from "./paddle.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [SubscriptionService, PaddleService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService, PaddleService],
})
export class SubscriptionModule {}
```

---

## 4. 프론트엔드 작업

### 4.1 API Hook 생성

**파일**: `src/hooks/useSubscription.ts`

```typescript
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (data: {
      plan: "STARTER";
      period?: "month" | "year";
    }) => {
      const { data: response } = await api.post<{ url: string }>(
        "/subscription/checkout",
        data
      );
      return response;
    },
  });
}
```

### 4.2 SubscriptionPage 업데이트

**파일**: `src/pages/SubscriptionPage.tsx`

```typescript
// 기존 코드 수정

import { useCreateCheckout } from "@/hooks/useSubscription";
import { toast } from "sonner";

export function SubscriptionPage() {
  const { mutate: createCheckout, isPending } = useCreateCheckout();

  const handleUpgrade = async (plan: Plan) => {
    if (plan === "STARTER") {
      createCheckout(
        { plan: "STARTER", period: "month" },
        {
          onSuccess: (data) => {
            // Paddle Checkout으로 리다이렉트
            window.location.href = data.url;
          },
          onError: (error) => {
            console.error("Failed to create checkout link:", error);
            toast.error("결제 링크 생성에 실패했습니다.");
          },
        }
      );
    } else if (plan === "PRO") {
      toast.info("Pro 플랜은 곧 출시 예정입니다.");
    }
  };

  // ... 나머지 코드
}
```

### 4.3 결제 성공 페이지 생성

**파일**: `src/pages/SubscriptionSuccessPage.tsx`

```typescript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { ROUTES } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";

export function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: planInfo, refetch } = usePlan();

  // 플랜 정보 새로고침
  useEffect(() => {
    refetch();
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAN });
  }, [refetch, queryClient]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <CardTitle className="text-2xl">결제가 완료되었습니다!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Starter 플랜으로 업그레이드되었습니다.
            </p>
            {planInfo && (
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-medium">
                  현재 플랜: {planInfo.plan}
                </p>
              </div>
            )}
            <Button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="w-full cursor-pointer"
            >
              대시보드로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
```

### 4.4 라우팅 추가

**파일**: `src/App.tsx` 또는 라우터 설정 파일

```typescript
<Route
  path="/subscription/success"
  element={
    <ProtectedRoute>
      <SubscriptionSuccessPage />
    </ProtectedRoute>
  }
/>
```

---

## 5. Webhook 처리

### 5.1 Webhook 엔드포인트 보안

- Paddle Webhook은 서명 검증 필수
- Public 엔드포인트이므로 인증 없이 접근 가능해야 함
- 서명 검증 실패 시 401 반환

### 5.2 처리할 이벤트

1. **transaction.completed**: 결제 완료 → 플랜 업그레이드
2. **subscription.updated**: 구독 갱신 → 만료일 업데이트
3. **subscription.cancelled**: 구독 취소 → FREE 플랜으로 다운그레이드

### 5.3 Paddle Dashboard 설정

1. Paddle Dashboard → Settings → Notifications
2. Webhook URL 설정: `https://your-backend.com/subscription/webhook`
3. 이벤트 선택:
   - Transaction completed
   - Subscription created
   - Subscription updated
   - Subscription cancelled

---

## 6. 테스트 계획

### 6.1 Sandbox 테스트

1. **Paddle Sandbox 계정 생성**
2. **테스트 카드 사용**:
   - 성공: `4242 4242 4242 4242`
   - 실패: `4000 0000 0000 0002`
3. **Webhook 테스트**: Paddle Dashboard에서 테스트 이벤트 전송

### 6.2 테스트 시나리오

1. ✅ Checkout 링크 생성
2. ✅ 결제 완료 후 플랜 업그레이드
3. ✅ Webhook 이벤트 처리
4. ✅ 구독 취소 처리
5. ✅ 결제 실패 처리

---

## 7. 구현 순서

### Phase 1: 백엔드 기본 구조 (1일)

- [ ] PaddleService 생성
- [ ] 환경 변수 설정
- [ ] Checkout 링크 생성 API
- [ ] Webhook 엔드포인트 생성

### Phase 2: 프론트엔드 통합 (1일)

- [ ] useCreateCheckout Hook
- [ ] SubscriptionPage 업데이트
- [ ] 결제 성공 페이지 생성
- [ ] 라우팅 추가

### Phase 3: Webhook 처리 (1일)

- [ ] Webhook 서명 검증
- [ ] 이벤트 핸들러 구현
- [ ] 플랜 업그레이드/다운그레이드 로직

### Phase 4: 테스트 및 디버깅 (1일)

- [ ] Sandbox 환경 테스트
- [ ] Webhook 테스트
- [ ] 에러 처리 개선

---

## 8. 참고 자료

- [Paddle API 문서](https://developer.paddle.com/api-reference)
- [Paddle Webhooks 가이드](https://developer.paddle.com/webhooks)
- [Paddle Checkout 문서](https://developer.paddle.com/guides/how-tos/checkout/implement-checkout)
- [Paddle Sandbox 테스트](https://developer.paddle.com/getting-started/sandbox)

---

## 9. 주의사항

1. **보안**: Webhook 서명 검증 필수
2. **에러 처리**: 결제 실패 시 사용자에게 명확한 메시지
3. **로깅**: 모든 결제 이벤트 로깅 (디버깅용)
4. **환경 분리**: Sandbox와 Production 환경 분리
5. **데이터 동기화**: Webhook 지연 시 대비책 필요

---

**다음 단계**: Phase 1부터 순차적으로 구현 시작
