import { api } from "./api";

/**
 * 번역 키 더미 데이터 생성 유틸리티
 * 브라우저 콘솔에서 사용할 수 있습니다.
 * 
 * 사용법:
 * import { generateDummyKeys } from '@/lib/generate-dummy-keys';
 * await generateDummyKeys('project-id-here', 100);
 */

interface CreateKeyDto {
  name: string;
  description?: string;
}

/**
 * 더미 번역 키 이름 생성
 */
function generateKeyName(index: number): string {
  const namespaces = [
    "common",
    "auth",
    "dashboard",
    "settings",
    "profile",
    "notification",
    "error",
    "success",
    "validation",
    "navigation",
  ];

  const actions = [
    "title",
    "description",
    "button",
    "label",
    "placeholder",
    "message",
    "error",
    "success",
    "loading",
    "empty",
  ];

  const namespace = namespaces[Math.floor(Math.random() * namespaces.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const number = index > 0 ? `.${index}` : "";

  return `${namespace}.${action}${number}`;
}

/**
 * 더미 설명 생성
 */
function generateDescription(keyName: string): string {
  const descriptions = [
    `${keyName}에 대한 설명`,
    `${keyName} 관련 텍스트`,
    `${keyName} 필드의 라벨`,
    `${keyName} 메시지`,
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

/**
 * 영어 번역 생성
 */
function generateEnglishTranslation(keyName: string): string {
  const parts = keyName.split(".");
  const namespace = parts[0];
  const action = parts[1] || "text";

  const translations: Record<string, Record<string, string[]>> = {
    common: {
      title: ["Welcome", "Home", "Dashboard", "Overview"],
      description: ["This is a description", "Detailed information", "Overview text"],
      button: ["Submit", "Cancel", "Save", "Delete", "Edit"],
      label: ["Name", "Email", "Password", "Confirm"],
      placeholder: ["Enter text", "Type here", "Input value"],
      message: ["Message sent", "Operation completed", "Success"],
      error: ["An error occurred", "Something went wrong", "Failed"],
      success: ["Success", "Completed", "Done"],
      loading: ["Loading...", "Please wait", "Processing"],
      empty: ["No data", "Empty", "Nothing here"],
    },
    auth: {
      title: ["Sign In", "Sign Up", "Login", "Register"],
      description: ["Please sign in to continue", "Create your account"],
      button: ["Sign In", "Sign Up", "Logout", "Login"],
      label: ["Email", "Password", "Username", "Confirm Password"],
      placeholder: ["Enter email", "Enter password", "Enter username"],
      message: ["Login successful", "Registration complete"],
      error: ["Invalid credentials", "Login failed", "Registration failed"],
      success: ["Login successful", "Registration successful"],
      loading: ["Signing in...", "Creating account..."],
      empty: ["No account", "Not registered"],
    },
    dashboard: {
      title: ["Dashboard", "Overview", "Main"],
      description: ["Your dashboard", "Overview of your data"],
      button: ["View Details", "Export", "Refresh"],
      label: ["Total", "Count", "Status"],
      placeholder: ["Search...", "Filter..."],
      message: ["Data loaded", "Updated"],
      error: ["Failed to load", "Error loading data"],
      success: ["Data loaded successfully"],
      loading: ["Loading dashboard..."],
      empty: ["No data available"],
    },
    settings: {
      title: ["Settings", "Preferences", "Configuration"],
      description: ["Manage your settings", "Configure preferences"],
      button: ["Save Settings", "Reset", "Apply"],
      label: ["Theme", "Language", "Notifications"],
      placeholder: ["Select option", "Choose..."],
      message: ["Settings saved", "Changes applied"],
      error: ["Failed to save", "Error saving settings"],
      success: ["Settings saved successfully"],
      loading: ["Saving settings..."],
      empty: ["No settings"],
    },
  };

  const namespaceTranslations = translations[namespace] || translations.common;
  const actionTranslations = namespaceTranslations[action] || ["Text"];

  return actionTranslations[Math.floor(Math.random() * actionTranslations.length)];
}

/**
 * 한국어 번역 생성
 */
function generateKoreanTranslation(keyName: string, englishTranslation: string): string {
  const parts = keyName.split(".");
  const namespace = parts[0];
  const action = parts[1] || "text";

  const translations: Record<string, Record<string, string[]>> = {
    common: {
      title: ["환영합니다", "홈", "대시보드", "개요"],
      description: ["설명입니다", "상세 정보", "개요 텍스트"],
      button: ["제출", "취소", "저장", "삭제", "편집"],
      label: ["이름", "이메일", "비밀번호", "확인"],
      placeholder: ["텍스트 입력", "여기에 입력", "값 입력"],
      message: ["메시지 전송됨", "작업 완료", "성공"],
      error: ["오류가 발생했습니다", "문제가 발생했습니다", "실패"],
      success: ["성공", "완료", "완료됨"],
      loading: ["로딩 중...", "잠시만 기다려주세요", "처리 중"],
      empty: ["데이터 없음", "비어있음", "내용 없음"],
    },
    auth: {
      title: ["로그인", "회원가입", "로그인", "가입"],
      description: ["계속하려면 로그인하세요", "계정을 만드세요"],
      button: ["로그인", "회원가입", "로그아웃", "로그인"],
      label: ["이메일", "비밀번호", "사용자명", "비밀번호 확인"],
      placeholder: ["이메일 입력", "비밀번호 입력", "사용자명 입력"],
      message: ["로그인 성공", "가입 완료"],
      error: ["잘못된 인증 정보", "로그인 실패", "가입 실패"],
      success: ["로그인 성공", "가입 성공"],
      loading: ["로그인 중...", "계정 생성 중..."],
      empty: ["계정 없음", "가입되지 않음"],
    },
    dashboard: {
      title: ["대시보드", "개요", "메인"],
      description: ["대시보드", "데이터 개요"],
      button: ["상세 보기", "내보내기", "새로고침"],
      label: ["전체", "개수", "상태"],
      placeholder: ["검색...", "필터..."],
      message: ["데이터 로드됨", "업데이트됨"],
      error: ["로드 실패", "데이터 로드 오류"],
      success: ["데이터 로드 성공"],
      loading: ["대시보드 로딩 중..."],
      empty: ["데이터 없음"],
    },
    settings: {
      title: ["설정", "환경설정", "구성"],
      description: ["설정 관리", "환경설정 구성"],
      button: ["설정 저장", "초기화", "적용"],
      label: ["테마", "언어", "알림"],
      placeholder: ["옵션 선택", "선택..."],
      message: ["설정 저장됨", "변경사항 적용됨"],
      error: ["저장 실패", "설정 저장 오류"],
      success: ["설정 저장 성공"],
      loading: ["설정 저장 중..."],
      empty: ["설정 없음"],
    },
  };

  const namespaceTranslations = translations[namespace] || translations.common;
  const actionTranslations = namespaceTranslations[action];

  if (actionTranslations && actionTranslations.length > 0) {
    return actionTranslations[Math.floor(Math.random() * actionTranslations.length)];
  }

  // 매핑이 없으면 영어 번역을 기반으로 간단한 한국어 생성
  return `${englishTranslation} (한국어)`;
}

interface TranslationUpdateItem {
  key: string;
  locale: string;
  value: string;
}

/**
 * 프로젝트의 언어 목록 조회
 */
async function getProjectLocales(projectId: string): Promise<Array<{ code: string; name: string }>> {
  try {
    const { data } = await api.get(`/projects/${projectId}/locales`);
    return data.map((locale: { code: string; name: string; isActive: boolean }) => ({
      code: locale.code,
      name: locale.name,
    }));
  } catch (error) {
    console.error("언어 목록 조회 실패:", error);
    return [];
  }
}

/**
 * 번역 키 더미 데이터 생성 및 추가 (번역 포함)
 * 
 * @param projectId 프로젝트 ID
 * @param count 생성할 키 개수 (기본값: 100)
 * @param delay 각 요청 사이의 지연 시간(ms) (기본값: 50ms, 서버 부하 방지)
 * @param addTranslations 번역도 함께 추가할지 여부 (기본값: true)
 */
export async function generateDummyKeys(
  projectId: string,
  count: number = 100,
  delay: number = 50,
  addTranslations: boolean = true
): Promise<{ success: number; failed: number; translationSuccess: number; translationFailed: number; errors: string[] }> {
  if (!projectId) {
    throw new Error("프로젝트 ID가 필요합니다.");
  }

  // 프로젝트의 언어 목록 조회
  let locales: Array<{ code: string; name: string }> = [];
  if (addTranslations) {
    locales = await getProjectLocales(projectId);
    const hasEn = locales.some((l) => l.code === "en");
    const hasKo = locales.some((l) => l.code === "ko");

    if (!hasEn || !hasKo) {
      console.warn(
        "⚠️ 영어(en) 또는 한국어(ko) 언어가 프로젝트에 없습니다. 번역을 추가하려면 먼저 언어를 추가해주세요."
      );
      if (!hasEn) console.warn("  - 영어(en) 언어가 필요합니다.");
      if (!hasKo) console.warn("  - 한국어(ko) 언어가 필요합니다.");
    }
  }

  const keys: CreateKeyDto[] = [];
  const usedNames = new Set<string>();

  // 중복되지 않는 키 이름 생성
  for (let i = 0; i < count; i++) {
    let keyName: string;
    let attempts = 0;
    
    do {
      keyName = generateKeyName(i);
      attempts++;
      
      // 무한 루프 방지
      if (attempts > 100) {
        keyName = `key.${Date.now()}.${i}`;
        break;
      }
    } while (usedNames.has(keyName));
    
    usedNames.add(keyName);
    
    keys.push({
      name: keyName,
      description: Math.random() > 0.3 ? generateDescription(keyName) : undefined,
    });
  }

  console.log(`📝 ${count}개의 번역 키 생성 시작...`);
  if (addTranslations) {
    console.log(`🌍 번역 추가: 영어(en), 한국어(ko)`);
  }
  console.log("생성된 키 목록:", keys.map((k) => k.name));

  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  const createdKeys: string[] = [];

  // 순차적으로 키 추가 (서버 부하 방지)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    
    try {
      await api.post(`/projects/${projectId}/keys`, key);
      success++;
      createdKeys.push(key.name);
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ 키 생성: ${i + 1}/${keys.length} 완료...`);
      }
      
      // 서버 부하 방지를 위한 지연
      if (i < keys.length - 1 && delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error: unknown) {
      failed++;
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      errors.push(`키 생성 실패 - ${key.name}: ${errorMessage}`);
      console.error(`❌ ${key.name} 추가 실패:`, errorMessage);
    }
  }

  // 번역 추가
  let translationSuccess = 0;
  let translationFailed = 0;

  if (addTranslations && createdKeys.length > 0) {
    const hasEn = locales.some((l) => l.code === "en");
    const hasKo = locales.some((l) => l.code === "ko");

    if (hasEn && hasKo) {
      console.log(`\n🌍 번역 추가 시작... (${createdKeys.length}개 키)`);

      // 일괄 번역 업데이트 (배치 단위로 처리)
      const batchSize = 20; // 한 번에 20개씩 처리
      
      for (let i = 0; i < createdKeys.length; i += batchSize) {
        const batch = createdKeys.slice(i, i + batchSize);
        const updates: TranslationUpdateItem[] = [];

        for (const keyName of batch) {
          const englishTranslation = generateEnglishTranslation(keyName);
          const koreanTranslation = generateKoreanTranslation(keyName, englishTranslation);

          updates.push(
            { key: keyName, locale: "en", value: englishTranslation },
            { key: keyName, locale: "ko", value: koreanTranslation }
          );
        }

        try {
          await api.patch(`/projects/${projectId}/translations`, {
            updates,
          });
          translationSuccess += batch.length;
          
          if (i + batchSize >= createdKeys.length || (i + batchSize) % 20 === 0) {
            console.log(`✅ 번역 추가: ${Math.min(i + batchSize, createdKeys.length)}/${createdKeys.length} 완료...`);
          }
        } catch (error: unknown) {
          translationFailed += batch.length;
          const errorMessage = error instanceof Error 
            ? error.message 
            : String(error);
          errors.push(`번역 추가 실패 (배치 ${Math.floor(i / batchSize) + 1}): ${errorMessage}`);
          console.error(`❌ 번역 추가 실패:`, errorMessage);
        }

        // 서버 부하 방지를 위한 지연
        if (i + batchSize < createdKeys.length && delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay * 2));
        }
      }
    } else {
      console.warn("⚠️ 영어(en) 또는 한국어(ko) 언어가 없어 번역을 추가하지 않습니다.");
    }
  }

  const result = {
    success,
    failed,
    translationSuccess,
    translationFailed,
    errors,
  };

  console.log(`\n✨ 완료!`);
  console.log(`✅ 키 생성 성공: ${success}개`);
  console.log(`❌ 키 생성 실패: ${failed}개`);
  if (addTranslations) {
    console.log(`✅ 번역 추가 성공: ${translationSuccess}개`);
    console.log(`❌ 번역 추가 실패: ${translationFailed}개`);
  }
  
  if (errors.length > 0) {
    console.log(`\n에러 목록:`, errors);
  }

  return result;
}

/**
 * 브라우저 콘솔에서 사용하기 위한 글로벌 함수 등록
 * 개발 모드 또는 환경 변수로 활성화된 경우 사용 가능
 */
const isDummyGeneratorEnabled =
  import.meta.env.DEV ||
  import.meta.env.MODE === "development" ||
  import.meta.env.VITE_ENABLE_DUMMY_GENERATOR === "true";

if (isDummyGeneratorEnabled && typeof window !== "undefined") {
  (window as Window & { generateDummyKeys?: typeof generateDummyKeys }).generateDummyKeys = generateDummyKeys;
  console.log(
    "💡 더미 키 생성 함수가 등록되었습니다.\n" +
    "사용법: await generateDummyKeys('project-id', 100)"
  );
}

