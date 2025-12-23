# 💳 구독 플랜 구현 계획 (Free & Starter)

**작성일**: 2025-01-XX  
**대상 플랜**: Free, Starter  
**목표**: Free와 Starter 플랜의 핵심 기능 구현  
**결제 시스템**: Paddle

---

## 📋 목차

1. [플랜 요약](#플랜-요약)
2. [백엔드 작업](#백엔드-작업)
3. [프론트엔드 작업](#프론트엔드-작업)
4. [Paddle 결제 시스템 통합](#paddle-결제-시스템-통합)
5. [UI/UX 구현](#uiux-구현)
6. [구현 우선순위](#구현-우선순위)

---

## 1. 플랜 요약

### 🆓 Free (무료)

**기능**:

- ✅ 프로젝트 1개
- ✅ 번역 키 100개
- ✅ 언어 3개 지원
- ✅ 실시간 OTA 업데이트
- ✅ 도메인 보안 설정
- ✅ 기본 번역 관리 (생성, 수정, 삭제)
- ✅ JSON 다운로드 (단일 파일만)
- ❌ Excel/CSV Import/Export
- ❌ Import 기능

### 🚀 Starter ($19/월)

**기능**:

- ✅ 프로젝트 5개
- ✅ 번역 키 1,000개
- ✅ 언어 10개 지원
- ✅ Excel/CSV Import & Export
- ✅ 팀 멤버 초대 (최대 3명)
- ✅ Free 기능 모두 포함

---

## 2. 백엔드 작업

### 2.1 데이터베이스 스키마 변경

#### User 모델에 플랜 필드 추가

**파일**: `verbsync-be/prisma/schema.prisma`

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  plan      String   @default("FREE") // FREE, STARTER, PRO, ENTERPRISE
  planStartedAt DateTime? // 플랜 시작일
  planEndsAt    DateTime? // 플랜 만료일 (구독 취소 시)
  paddleCustomerId String? @unique // Paddle Customer ID
  paddleSubscriptionId String? @unique // Paddle Subscription ID
  // ... 기존 필드들
}
```

**마이그레이션**:

```bash
cd verbsync-be
npx prisma migrate dev --name add_subscription_plan
npx prisma generate
```

### 2.2 플랜 상수 및 유틸리티

**파일**: `verbsync-be/src/common/enums/plan.enum.ts`

```typescript
export enum Plan {
  FREE = "FREE",
  STARTER = "STARTER",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export const PLAN_FEATURES = {
  [Plan.FREE]: {
    canExportExcel: false,
    canImport: false,
    canInviteMembers: false,
  },
  [Plan.STARTER]: {
    canExportExcel: true,
    canImport: true,
    canInviteMembers: true,
  },
  // ... Pro, Enterprise
} as const;
```

### 2.3 플랜 정보 조회 API

**파일**: `verbsync-be/src/subscription/subscription.controller.ts`

```typescript
@Get('plan')
async getPlan(@User() user: User) {
  return {
    plan: user.plan,
    features: PLAN_FEATURES[user.plan],
    planStartedAt: user.planStartedAt,
    planEndsAt: user.planEndsAt,
  };
}
```

---

## 3. 프론트엔드 작업

### 3.1 타입 정의

**파일**: `src/types/api.ts`

```typescript
// ========== Subscription ==========
export type Plan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export interface PlanFeatures {
  canExportExcel: boolean;
  canImport: boolean;
  canInviteMembers: boolean;
}

export interface PlanInfo {
  plan: Plan;
  features: PlanFeatures;
  planStartedAt: string | null;
  planEndsAt: string | null;
}
```

### 3.2 플랜 상수 및 유틸리티

**파일**: `src/lib/plans.ts`

```typescript
import type { Plan } from "@/types/api";

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "무료",
  STARTER: "스타터",
  PRO: "프로",
  ENTERPRISE: "엔터프라이즈",
};

export const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  FREE: "개인 개발자 및 사이드 프로젝트를 위한 무료 플랜",
  STARTER: "성장하는 프로젝트와 소규모 팀을 위한 플랜",
  PRO: "대규모 프로젝트와 전문적인 관리가 필요한 팀",
  ENTERPRISE: "대기업, 대규모 조직, 엔터프라이즈급 요구사항",
};
```

### 3.3 플랜 정보 Hook

**파일**: `src/hooks/usePlan.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PlanInfo } from "@/types/api";

export function usePlan() {
  return useQuery<PlanInfo>({
    queryKey: ["plan"],
    queryFn: async () => {
      const { data } = await api.get<PlanInfo>("/subscription/plan");
      return data;
    },
  });
}
```

### 3.4 플랜 배지 컴포넌트

**파일**: `src/components/subscription/PlanBadge.tsx`

```typescript
import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS } from "@/lib/plans";
import type { Plan } from "@/types/api";

interface PlanBadgeProps {
  plan: Plan;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const variant =
    plan === "FREE" ? "secondary" : plan === "STARTER" ? "default" : "outline";

  return (
    <Badge variant={variant} className={className}>
      {PLAN_LABELS[plan]}
    </Badge>
  );
}
```

### 3.5 설정 페이지에 플랜 정보 표시

**파일**: `src/pages/SettingsPage.tsx`

```typescript
import { usePlan } from "@/hooks/usePlan";
import { PlanBadge } from "@/components/subscription/PlanBadge";
import { Button } from "@/components/ui/button";

export function SettingsPage() {
  const { data: planInfo } = usePlan();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">구독 플랜</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <span>현재 플랜:</span>
            <PlanBadge plan={planInfo?.plan || "FREE"} />
            {planInfo?.plan === "FREE" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/pricing")}
              >
                업그레이드
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3.6 대시보드에 플랜 정보 표시

**파일**: `src/pages/DashboardPage.tsx`

```typescript
import { usePlan } from "@/hooks/usePlan";
import { PlanBadge } from "@/components/subscription/PlanBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DashboardPage() {
  const { data: planInfo } = usePlan();

  return (
    <div>
      {planInfo && planInfo.plan === "FREE" && (
        <Alert className="mb-6">
          <AlertDescription>
            Starter 플랜으로 업그레이드하여 더 많은 프로젝트와 기능을
            사용하세요.{" "}
            <a href="/pricing" className="font-semibold underline">
              자세히 보기
            </a>
          </AlertDescription>
        </Alert>
      )}
      {/* 기존 대시보드 UI */}
    </div>
  );
}
```

---

## 4. Paddle 결제 시스템 통합

### 4.1 Paddle 설정

**백엔드**: `verbsync-be/src/subscription/paddle.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class PaddleService {
  private readonly apiKey: string;
  private readonly vendorId: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.PADDLE_API_KEY;
    this.vendorId = process.env.PADDLE_VENDOR_ID;
    this.baseUrl =
      process.env.PADDLE_ENV === "sandbox"
        ? "https://sandbox-api.paddle.com"
        : "https://api.paddle.com";
  }

  async generatePayLink(
    userId: string,
    userEmail: string,
    plan: "STARTER",
    period: "month" | "year"
  ) {
    const productId =
      period === "month"
        ? process.env.PADDLE_STARTER_MONTHLY_PRODUCT_ID
        : process.env.PADDLE_STARTER_YEARLY_PRODUCT_ID;

    const response = await axios.post(
      `${this.baseUrl}/transaction`,
      {
        vendor_id: this.vendorId,
        vendor_auth_code: this.apiKey,
        product_id: productId,
        customer_email: userEmail,
        passthrough: JSON.stringify({ userId, plan }),
        return_url: `${process.env.FRONTEND_URL}/subscription/success`,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.response.checkout.url;
  }

  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    // Paddle webhook 서명 검증
    // https://developer.paddle.com/webhook-reference/verifying-webhooks
    const crypto = require("crypto");
    const publicKey = process.env.PADDLE_PUBLIC_KEY;
    const verifier = crypto.createVerify("sha1");
    verifier.update(payload);
    return verifier.verify(publicKey, signature, "base64");
  }

  async handleWebhook(event: any) {
    // subscription_created, subscription_updated, subscription_cancelled 처리
    const { passthrough, subscription_id, customer_id } = event;
    const { userId, plan } = JSON.parse(passthrough);

    // User 테이블의 plan, paddleCustomerId, paddleSubscriptionId 업데이트
    await this.updateUserSubscription(userId, {
      plan,
      paddleCustomerId: customer_id,
      paddleSubscriptionId: subscription_id,
    });
  }

  private async updateUserSubscription(userId: string, data: any) {
    // Prisma를 통해 User 업데이트
  }
}
```

### 4.2 결제 링크 생성 API

**백엔드**: `verbsync-be/src/subscription/subscription.controller.ts`

```typescript
@Post('checkout')
async createCheckoutLink(
  @Body() dto: { plan: 'STARTER'; period: 'month' | 'year' },
  @User() user: User,
) {
  const url = await this.paddleService.generatePayLink(
    user.id,
    user.email,
    dto.plan,
    dto.period
  );
  return { url };
}
```

### 4.3 Paddle Webhook 엔드포인트

**백엔드**: `verbsync-be/src/subscription/subscription.controller.ts`

```typescript
@Post('webhook')
@RawBody() // Raw body 필요 (Paddle 서명 검증)
async handleWebhook(@Req() req: Request) {
  const signature = req.headers['paddle-signature'];
  const isValid = await this.paddleService.verifyWebhook(req.body, signature);

  if (!isValid) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  const event = JSON.parse(req.body);
  await this.paddleService.handleWebhook(event);
  return { received: true };
}
```

### 4.4 프론트엔드: 결제 페이지

**파일**: `src/pages/PricingPage.tsx`

```typescript
import { usePlan } from "@/hooks/usePlan";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

export function PricingPage() {
  const { data: planInfo, refetch } = usePlan();

  const handleUpgrade = async (plan: "STARTER", period: "month" | "year") => {
    try {
      const { data } = await api.post<{ url: string }>(
        "/subscription/checkout",
        { plan, period }
      );
      window.location.href = data.url; // Paddle Checkout으로 리다이렉트
    } catch (error) {
      console.error("Failed to create checkout link:", error);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">플랜 선택</h1>
        <p className="text-muted-foreground">
          프로젝트 규모에 맞는 최적의 플랜을 선택하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free 플랜 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>개인 개발자 및 사이드 프로젝트</CardDescription>
            <div className="text-3xl font-bold mt-4">$0</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>프로젝트 1개</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>번역 키 100개</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>언어 3개 지원</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>실시간 OTA 업데이트</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>도메인 보안 설정</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full" disabled>
              현재 플랜
            </Button>
          </CardContent>
        </Card>

        {/* Starter 플랜 카드 */}
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Starter</CardTitle>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                Most Popular
              </span>
            </div>
            <CardDescription>성장하는 프로젝트와 소규모 팀</CardDescription>
            <div className="text-3xl font-bold mt-4">
              $19<span className="text-sm">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>프로젝트 5개</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>번역 키 1,000개</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>언어 10개 지원</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Excel/CSV Import & Export</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>팀 멤버 초대 (최대 3명)</span>
              </li>
            </ul>
            <Button
              className="w-full"
              onClick={() => handleUpgrade("STARTER", "month")}
              disabled={planInfo?.plan === "STARTER"}
            >
              {planInfo?.plan === "STARTER" ? "현재 플랜" : "시작하기"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### 4.5 결제 성공 페이지

**파일**: `src/pages/SubscriptionSuccessPage.tsx`

```typescript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlan } from "@/hooks/usePlan";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const { refetch } = usePlan();

  useEffect(() => {
    // 플랜 정보 새로고침
    refetch();
  }, [refetch]);

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto text-center space-y-6">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-3xl font-bold">결제가 완료되었습니다!</h1>
        <p className="text-muted-foreground">
          플랜이 업그레이드되었습니다. 이제 모든 기능을 사용할 수 있습니다.
        </p>
        <Button onClick={() => navigate("/dashboard")}>대시보드로 이동</Button>
      </div>
    </div>
  );
}
```

---

## 5. UI/UX 구현

### 5.1 플랜별 기능 차별화

#### Import/Export 기능 (Starter 이상)

**파일**: `src/components/translation/TranslationToolbar.tsx`

```typescript
import { usePlan } from "@/hooks/usePlan";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TranslationToolbar() {
  const { data: planInfo } = usePlan();
  const canExport = planInfo?.features.canExportExcel;

  return (
    <div>
      {canExport ? (
        <Button onClick={handleExport}>Excel/CSV 내보내기</Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button disabled>Excel/CSV 내보내기</Button>
          </TooltipTrigger>
          <TooltipContent>
            Starter 플랜 이상에서 사용 가능합니다.{" "}
            <a href="/pricing" className="underline">
              업그레이드하기
            </a>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
```

### 5.2 멤버 초대 기능 (Starter 이상)

**파일**: `src/components/member/MemberList.tsx`

```typescript
import { usePlan } from "@/hooks/usePlan";
import { PermissionGuard } from "@/components/permission/PermissionGuard";

export function MemberList() {
  const { data: planInfo } = usePlan();
  const canInvite = planInfo?.features.canInviteMembers;

  return (
    <div>
      {canInvite ? (
        <Button onClick={handleInvite}>멤버 초대</Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button disabled>멤버 초대</Button>
          </TooltipTrigger>
          <TooltipContent>
            Starter 플랜 이상에서 사용 가능합니다.{" "}
            <a href="/pricing" className="underline">
              업그레이드하기
            </a>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
```

### 5.3 업그레이드 배너

대시보드, 설정 페이지 등에 Free 플랜 사용자에게 Starter 플랜 업그레이드를 유도하는 배너를 표시합니다.

---

## 6. 구현 우선순위

### Phase 1: 기본 플랜 시스템 (1주)

1. ✅ **백엔드**: User 모델에 plan 필드 추가
2. ✅ **백엔드**: 플랜 상수 및 유틸리티 정의
3. ✅ **백엔드**: 플랜 정보 조회 API
4. ✅ **프론트엔드**: 플랜 타입 정의
5. ✅ **프론트엔드**: 플랜 정보 Hook
6. ✅ **프론트엔드**: 설정 페이지에 플랜 정보 표시

### Phase 2: Paddle 결제 시스템 (1-2주)

1. ✅ **백엔드**: Paddle 설정 및 서비스
2. ✅ **백엔드**: Checkout 링크 생성 API
3. ✅ **백엔드**: Webhook 처리
4. ✅ **프론트엔드**: Pricing 페이지
5. ✅ **프론트엔드**: 결제 성공 페이지

### Phase 3: 플랜별 기능 차별화 (1주)

1. ✅ **프론트엔드**: Import/Export 기능 플랜 체크
2. ✅ **프론트엔드**: 멤버 초대 기능 플랜 체크
3. ✅ **프론트엔드**: 업그레이드 배너 및 유도 UI

---

## 7. 추가 고려사항

### 7.1 테스트

- 플랜별 기능 차별화 테스트
- 결제 플로우 테스트
- Webhook 처리 테스트

### 7.2 모니터링

- 플랜별 사용자 통계
- 결제 성공/실패 로그
- 업그레이드/다운그레이드 이벤트 추적

### 7.3 보안

- Paddle Webhook 서명 검증
- 결제 정보 암호화
- 사용자 인증 강화

---

## 8. 참고 자료

- [Paddle API 문서](https://developer.paddle.com/)
- [Paddle Webhooks 문서](https://developer.paddle.com/webhook-reference)
- [Paddle Checkout 문서](https://developer.paddle.com/guides/how-tos/checkout/implement-checkout)
- [SUBSCRIPTION_PLANS.md](./SUBSCRIPTION_PLANS.md) - 상세 플랜 정보
