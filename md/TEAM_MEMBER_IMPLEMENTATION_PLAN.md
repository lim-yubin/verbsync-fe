# 👥 팀 멤버 기능 구현 계획

**작성일**: 2025-01-11  
**버전**: 1.0

---

## 📋 목차

1. [개요](#개요)
2. [기능 요구사항](#기능-요구사항)
3. [백엔드 API 스펙 (필요)](#백엔드-api-스펙-필요)
4. [프론트엔드 구현 계획](#프론트엔드-구현-계획)
5. [타입 정의](#타입-정의)
6. [컴포넌트 구조](#컴포넌트-구조)
7. [페이지 구조](#페이지-구조)
8. [권한 관리](#권한-관리)
9. [구현 단계](#구현-단계)

---

## 1. 개요

### 목적

프로젝트에 팀 멤버를 초대하고 권한을 관리할 수 있는 기능을 구현합니다.

### 핵심 기능

- ✅ 프로젝트 멤버 목록 조회
- ✅ 이메일로 멤버 초대
- ✅ 멤버 권한 변경 (Owner/Editor/Viewer)
- ✅ 멤버 제거
- ✅ 현재 사용자의 권한 확인 및 UI 제한

### 권한 역할

| 역할       | 설명            | 권한                                                     |
| ---------- | --------------- | -------------------------------------------------------- |
| **Owner**  | 프로젝트 소유자 | 모든 권한 (설정 변경, 멤버 관리, 삭제)                   |
| **Editor** | 편집자          | 번역 편집, 키/언어 추가/수정 (설정 변경, 멤버 관리 불가) |
| **Viewer** | 조회자          | 읽기 전용 (모든 편집 불가)                               |

---

## 2. 기능 요구사항

### 2.1 멤버 목록 조회

- 프로젝트에 속한 모든 멤버 목록 표시
- 각 멤버의 정보:
  - 이름, 이메일
  - 역할 (Owner/Editor/Viewer)
  - 초대 상태 (활성/대기 중)
  - 초대일/가입일

### 2.2 멤버 초대

- 이메일 주소로 멤버 초대
- 초대 시 역할 선택 (Editor/Viewer)
- 초대 이메일 발송 (백엔드 처리)
- 초대 대기 중인 멤버 표시

### 2.3 멤버 권한 변경

- Owner만 가능
- 역할 변경 (Editor ↔ Viewer)
- Owner는 변경 불가 (최소 1명의 Owner 필요)

### 2.4 멤버 제거

- Owner만 가능
- 자신은 제거 불가
- 제거 확인 다이얼로그

### 2.5 권한 기반 UI 제한

- **Viewer**: 편집 버튼 비활성화, 읽기 전용 UI
- **Editor**: 설정 페이지 접근 불가, 멤버 관리 불가
- **Owner**: 모든 기능 접근 가능

---

## 3. 백엔드 API 스펙 (필요)

### 3.1 멤버 목록 조회

```
GET /projects/:projectId/members

Response 200:
{
  "members": [
    {
      "id": "string",
      "userId": "string",
      "projectId": "string",
      "role": "OWNER" | "EDITOR" | "VIEWER",
      "user": {
        "id": "string",
        "email": "string",
        "name": "string"
      },
      "status": "ACTIVE" | "PENDING",
      "invitedAt": "string",
      "joinedAt": "string | null",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### 3.2 멤버 초대

```
POST /projects/:projectId/members/invite

Request Body:
{
  "email": "string",
  "role": "EDITOR" | "VIEWER"
}

Response 201:
{
  "id": "string",
  "email": "string",
  "role": "EDITOR" | "VIEWER",
  "status": "PENDING",
  "invitedAt": "string"
}
```

**참고**:

- 백엔드에서 Resend를 통해 초대 이메일 자동 발송
- 초대 이메일에는 초대 수락 링크 포함 (토큰 기반)
- 이메일 발송 실패 시에도 멤버 레코드는 생성됨 (재발송 가능)

### 3.3 멤버 역할 변경

```
PATCH /projects/:projectId/members/:memberId/role

Request Body:
{
  "role": "EDITOR" | "VIEWER"
}

Response 200:
{
  "id": "string",
  "role": "EDITOR" | "VIEWER",
  "updatedAt": "string"
}
```

### 3.4 멤버 제거

```
DELETE /projects/:projectId/members/:memberId

Response 204
```

### 3.5 현재 사용자 권한 조회

```
GET /projects/:projectId/members/me

Response 200:
{
  "role": "OWNER" | "EDITOR" | "VIEWER",
  "permissions": {
    "canEdit": boolean,
    "canManageSettings": boolean,
    "canManageMembers": boolean,
    "canDeleteProject": boolean
  }
}
```

---

## 4. 프론트엔드 구현 계획

### 4.1 파일 구조

```
src/
├── types/
│   └── api.ts                    # Member 관련 타입 추가
│
├── hooks/
│   └── useMembers.ts             # 멤버 관련 API Hooks
│
├── components/
│   ├── member/
│   │   ├── MemberList.tsx        # 멤버 목록 컴포넌트
│   │   ├── MemberItem.tsx        # 멤버 아이템 컴포넌트
│   │   ├── InviteMemberDialog.tsx # 멤버 초대 다이얼로그
│   │   ├── RoleBadge.tsx         # 역할 배지 컴포넌트
│   │   ├── RoleSelect.tsx        # 역할 선택 컴포넌트
│   │   └── index.ts
│   │
│   └── permission/
│       ├── PermissionGuard.tsx   # 권한 체크 컴포넌트
│       └── usePermission.ts      # 권한 체크 Hook
│
├── pages/
│   └── ProjectMembersPage.tsx    # 멤버 관리 페이지
│
└── lib/
    └── permissions.ts             # 권한 상수 및 유틸리티
```

---

## 5. 타입 정의

### 5.1 Member 타입

```typescript
// src/types/api.ts

// ========== Member ==========
export type MemberRole = "OWNER" | "EDITOR" | "VIEWER";

export type MemberStatus = "ACTIVE" | "PENDING";

export interface ProjectMember {
  id: string;
  userId: string | null; // PENDING 상태면 null
  projectId: string;
  role: MemberRole;
  status: MemberStatus;
  user: {
    id: string;
    email: string;
    name: string;
  } | null; // PENDING 상태면 null
  invitedAt: string;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InviteMemberDto {
  email: string;
  role: "EDITOR" | "VIEWER"; // Owner는 초대 불가
}

export interface UpdateMemberRoleDto {
  role: "EDITOR" | "VIEWER"; // Owner는 변경 불가
}

export interface MemberPermissions {
  role: MemberRole;
  permissions: {
    canEdit: boolean;
    canManageSettings: boolean;
    canManageMembers: boolean;
    canDeleteProject: boolean;
  };
}
```

---

## 6. 컴포넌트 구조

### 6.1 MemberList.tsx

멤버 목록을 표시하는 메인 컴포넌트

**기능**:

- 멤버 목록 렌더링
- "멤버 초대" 버튼
- 멤버 정렬 (Owner → Editor → Viewer, 가입일순)

**UI**:

```
┌─────────────────────────────────────────────────┐
│  팀 멤버                        [+ 멤버 초대]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 👤 홍길동 (hong@example.com)            │   │
│  │    Owner                                │   │
│  │    가입일: 2025-01-01                   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 👤 김철수 (kim@example.com)             │   │
│  │    Editor                    [역할 변경] │   │
│  │    가입일: 2025-01-05        [제거]     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 📧 lee@example.com (초대 대기 중)       │   │
│  │    Viewer                                │   │
│  │    초대일: 2025-01-10        [취소]     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6.2 MemberItem.tsx

개별 멤버 아이템 컴포넌트

**기능**:

- 멤버 정보 표시
- 역할 배지
- 역할 변경 드롭다운 (Owner만)
- 제거 버튼 (Owner만, 자신 제외)

### 6.3 InviteMemberDialog.tsx

멤버 초대 다이얼로그

**기능**:

- 이메일 입력
- 역할 선택 (Editor/Viewer)
- 유효성 검증
- 초대 API 호출

**UI**:

```
┌─────────────────────────────────────┐
│  멤버 초대                           │
├─────────────────────────────────────┤
│                                     │
│  이메일                              │
│  ┌─────────────────────────────┐   │
│  │ user@example.com            │   │
│  └─────────────────────────────┘   │
│                                     │
│  역할                                │
│  ┌─────────────────────────────┐   │
│  │ Editor ▼                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [취소]              [초대하기]     │
│                                     │
└─────────────────────────────────────┘
```

### 6.4 RoleBadge.tsx

역할 배지 컴포넌트

**스타일**:

- Owner: 파란색 (primary)
- Editor: 초록색 (success)
- Viewer: 회색 (secondary)

### 6.5 PermissionGuard.tsx

권한 체크 컴포넌트

**사용 예시**:

```tsx
<PermissionGuard
  projectId={projectId}
  requiredPermission="canManageMembers"
  fallback={<div>권한이 없습니다</div>}
>
  <MemberList projectId={projectId} />
</PermissionGuard>
```

---

## 7. 페이지 구조

### 7.1 ProjectMembersPage.tsx

멤버 관리 페이지

**경로**: `/projects/:id/members`

**레이아웃**:

- AppLayout 사용
- ProjectSidebar에 "멤버" 메뉴 추가
- PageHeader + MemberList

**기능**:

- 멤버 목록 조회
- 멤버 초대
- 멤버 역할 변경
- 멤버 제거

---

## 8. 권한 관리

### 8.1 권한 상수

```typescript
// src/lib/permissions.ts

export const ROLE_PERMISSIONS: Record<
  MemberRole,
  {
    canEdit: boolean;
    canManageSettings: boolean;
    canManageMembers: boolean;
    canDeleteProject: boolean;
  }
> = {
  OWNER: {
    canEdit: true,
    canManageSettings: true,
    canManageMembers: true,
    canDeleteProject: true,
  },
  EDITOR: {
    canEdit: true,
    canManageSettings: false,
    canManageMembers: false,
    canDeleteProject: false,
  },
  VIEWER: {
    canEdit: false,
    canManageSettings: false,
    canManageMembers: false,
    canDeleteProject: false,
  },
};
```

### 8.2 usePermission Hook

```typescript
// src/components/permission/usePermission.ts

export function usePermission(projectId: string) {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ["projects", projectId, "members", "me"],
    queryFn: () =>
      api.get<MemberPermissions>(`/projects/${projectId}/members/me`),
  });

  return {
    role: permissions?.data.role,
    permissions: permissions?.data.permissions,
    isLoading,
    hasPermission: (permission: keyof MemberPermissions["permissions"]) => {
      return permissions?.data.permissions[permission] ?? false;
    },
  };
}
```

### 8.3 UI 제한 적용

**번역 페이지**:

```tsx
const { hasPermission } = usePermission(projectId);

<Button disabled={!hasPermission("canEdit")} onClick={handleSave}>
  저장
</Button>;
```

**설정 페이지**:

```tsx
const { hasPermission } = usePermission(projectId);

{
  hasPermission("canManageSettings") && <ProjectSettingsPage />;
}
```

---

## 9. 구현 단계

### Phase 1: 타입 및 API Hooks (1일)

- [ ] 타입 정의 (`src/types/api.ts`)
- [ ] API Hooks 구현 (`src/hooks/useMembers.ts`)
- [ ] 권한 상수 정의 (`src/lib/permissions.ts`)

### Phase 2: 기본 컴포넌트 (2일)

- [ ] RoleBadge 컴포넌트
- [ ] MemberItem 컴포넌트
- [ ] MemberList 컴포넌트
- [ ] InviteMemberDialog 컴포넌트

### Phase 3: 권한 관리 (1일)

- [ ] usePermission Hook
- [ ] PermissionGuard 컴포넌트
- [ ] 권한 체크 유틸리티

### Phase 4: 페이지 구현 (1일)

- [ ] ProjectMembersPage 구현
- [ ] ProjectSidebar에 "멤버" 메뉴 추가
- [ ] 라우팅 설정

### Phase 5: UI 제한 적용 (1일)

- [ ] 번역 페이지 편집 권한 체크
- [ ] 설정 페이지 접근 권한 체크
- [ ] 프로젝트 삭제 권한 체크

### Phase 6: 테스트 및 폴리싱 (1일)

- [ ] 권한별 UI 동작 테스트
- [ ] 에러 처리
- [ ] 로딩 상태
- [ ] Toast 알림

---

## 10. 추가 고려사항

### 10.1 초대 이메일

- **이메일 서비스**: Resend 사용
- 백엔드에서 초대 이메일 발송
- 초대 링크에 토큰 포함
- 초대 수락 시 자동 가입

**Resend 설정 참고**:

- Resend API Key 환경변수 설정 필요
- 이메일 템플릿 구성 (HTML/React Email)
- 발신자 이메일 도메인 인증 필요

### 10.2 멤버 수 제한

- 플랜별 멤버 수 제한 (Free: 1명, Starter: 3명, Pro: 무제한)
- 초대 시 제한 체크
- 제한 도달 시 업그레이드 안내

### 10.3 실시간 업데이트

- 멤버 추가/제거 시 목록 자동 갱신
- TanStack Query 캐시 무효화

### 10.4 보안

- Owner 권한 변경 시 확인 다이얼로그
- 멤버 제거 시 확인 다이얼로그
- 최소 1명의 Owner 보장

---

## 11. UI/UX 가이드라인

### 디자인 원칙

- **Linear/Vercel 스타일**: 깔끔하고 미니멀한 디자인
- **명확한 권한 표시**: 역할 배지로 한눈에 파악
- **안전한 액션**: 위험한 작업(제거, 역할 변경)은 확인 다이얼로그
- **접근성**: 키보드 네비게이션, 스크린 리더 지원

### 색상

- Owner: `text-blue-600 bg-blue-50` (primary)
- Editor: `text-green-600 bg-green-50` (success)
- Viewer: `text-gray-600 bg-gray-50` (secondary)
- Pending: `text-amber-600 bg-amber-50` (warning)

---

**끝!** 이 계획을 기반으로 단계별로 구현을 진행하세요! 🚀
