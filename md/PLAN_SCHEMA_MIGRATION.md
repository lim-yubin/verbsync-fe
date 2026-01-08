# 플랜 스키마 마이그레이션 가이드

## 변경 사항

`previousPlan` 컬럼을 추가하여 구독 취소 전 플랜을 추적합니다.

## ⚠️ 중요: 마이그레이션 순서

Prisma 마이그레이션은 **스키마 파일을 자동으로 업데이트하지 않습니다**. 다음 순서로 진행하세요:

1. **스키마 파일 수정** (수동) ← 먼저 해야 함!
2. **마이그레이션 실행** (자동으로 SQL 생성 및 DB 적용)
3. **Prisma Client 재생성** (자동)

## 1단계: Prisma 스키마 파일 수정

**파일**: `verbsync-be/prisma/schema.prisma`

`User` 모델에 `previousPlan` 필드를 추가하세요:

```prisma
model User {
  // ... 기존 필드들
  plan            String    @default("FREE")
  previousPlan    String?   @default("FREE") // 구독 취소 전 플랜 (추가)
  planStartedAt   DateTime?
  planEndsAt      DateTime?
  // ... 기타 필드들
}
```

## 2단계: 마이그레이션 실행

```bash
cd verbsync-be

# 마이그레이션 생성 및 적용
npx prisma migrate dev --name add_previous_plan

# Prisma Client 재생성 (자동으로 실행되지만 명시적으로 실행 가능)
npx prisma generate
```

`prisma migrate dev` 명령어는:
- ✅ 스키마 변경사항을 감지
- ✅ 마이그레이션 SQL 파일 생성 (`prisma/migrations/...`)
- ✅ 데이터베이스에 마이그레이션 적용
- ✅ Prisma Client 자동 재생성

## 3단계: 기존 데이터 마이그레이션 (선택)

기존 사용자의 `previousPlan`을 `plan`과 동일하게 설정하려면:

```sql
-- 기존 사용자의 previousPlan을 plan과 동일하게 설정
UPDATE "User" SET "previousPlan" = "plan" WHERE "previousPlan" IS NULL;
```

또는 Prisma Studio에서:
```bash
npx prisma studio
```

또는 마이그레이션 파일에 직접 추가:
```typescript
// prisma/migrations/XXXXXX_add_previous_plan/migration.sql
ALTER TABLE "User" ADD COLUMN "previousPlan" TEXT DEFAULT 'FREE';
UPDATE "User" SET "previousPlan" = "plan" WHERE "previousPlan" IS NULL;
```

## 동작 방식

### 1. 초기 사용자
- `previousPlan = "FREE"`, `plan = "FREE"` → FREE 플랜 유저

### 2. Starter 구독 중
- `previousPlan = "STARTER"`, `plan = "STARTER"` → STARTER 플랜 유저

### 3. 구독 취소 시
- `previousPlan = "STARTER"` (현재 plan을 previousPlan으로 저장)
- `plan = "FREE"` (현재 plan을 FREE로 변경)
- `planEndsAt = "2025-02-09"` (다음 결제일)

### 4. 취소 후 만료일 남아있음
- `previousPlan = "STARTER"`, `plan = "FREE"`, `planEndsAt = "2025-02-09"` (미래)
- `getEffectivePlan` → `plan = "FREE"`이고 `planEndsAt`이 미래이므로 → `previousPlan = "STARTER"` 반환
- 결과: STARTER 플랜 기능 사용 가능 ✅

### 5. 취소 후 만료일 지남
- `previousPlan = "STARTER"`, `plan = "FREE"`, `planEndsAt = "2025-02-09"` (과거)
- `getEffectivePlan` → `plan = "FREE"`이고 `planEndsAt`이 과거이므로 → `plan = "FREE"` 반환
- 결과: FREE 플랜으로 제한됨 ❌

## getEffectivePlan 로직

```typescript
export function getEffectivePlan(
  plan: Plan,
  previousPlan: Plan,
  planEndsAt: Date | null,
): Plan {
  // plan이 FREE가 아니면 정상 구독 중이므로 plan 그대로 사용
  if (plan !== Plan.FREE) {
    return plan;
  }

  // plan이 FREE인 경우
  // planEndsAt이 없으면 FREE 그대로
  if (!planEndsAt) {
    return Plan.FREE;
  }

  // planEndsAt이 미래 날짜면 previousPlan 사용 (만료일 전)
  const now = new Date();
  if (planEndsAt > now) {
    return previousPlan;
  }

  // 만료일이 지났으면 FREE로 전환
  return Plan.FREE;
}
```

