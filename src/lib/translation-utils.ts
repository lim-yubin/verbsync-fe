import type { TranslationMatrix } from "@/types/api";

/**
 * 키 이름에서 namespace 추출
 * @example
 * getNamespace("login.title") // "login"
 * getNamespace("home.hero.title") // "home.hero"
 * getNamespace("button") // ""
 */
export function getNamespace(key: string): string {
  const lastDotIndex = key.lastIndexOf(".");
  return lastDotIndex === -1 ? "" : key.substring(0, lastDotIndex);
}

/**
 * 키 이름에서 마지막 부분 추출 (namespace 제외)
 * @example
 * getKeyName("login.title") // "title"
 * getKeyName("home.hero.title") // "title"
 * getKeyName("button") // "button"
 */
export function getKeyName(key: string): string {
  const lastDotIndex = key.lastIndexOf(".");
  return lastDotIndex === -1 ? key : key.substring(lastDotIndex + 1);
}

/**
 * 키를 namespace별로 그룹화
 */
export function groupKeysByNamespace(
  rows: TranslationMatrix["rows"]
): Map<string, TranslationMatrix["rows"]> {
  const groups = new Map<string, TranslationMatrix["rows"]>();

  rows.forEach((row) => {
    const namespace = getNamespace(row.key);
    const groupKey = namespace || "(root)"; // namespace가 없으면 "(root)" 그룹

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(row);
  });

  return groups;
}

/**
 * 모든 namespace 목록 추출
 */
export function extractNamespaces(rows: TranslationMatrix["rows"]): string[] {
  const namespaces = new Set<string>();

  rows.forEach((row) => {
    const namespace = getNamespace(row.key);
    if (namespace) {
      namespaces.add(namespace);
    }
  });

  return Array.from(namespaces).sort();
}

/**
 * 키 필터링 (검색 쿼리, namespace, 빈 번역 필터)
 */
export function filterKeys(
  rows: TranslationMatrix["rows"],
  options: {
    searchQuery?: string;
    selectedNamespaces?: string[];
    showEmptyOnly?: boolean;
    emptyLocaleCode?: string;
  }
): TranslationMatrix["rows"] {
  let filtered = [...rows];

  // 검색 쿼리 필터
  if (options.searchQuery?.trim()) {
    const query = options.searchQuery.trim().toLowerCase();
    filtered = filtered.filter((row) => {
      // 키 이름으로 검색
      if (row.key.toLowerCase().includes(query)) {
        return true;
      }

      // namespace로 검색 (예: "login" 입력 시 "login.*" 키 매칭)
      const namespace = getNamespace(row.key);
      if (namespace.toLowerCase().includes(query)) {
        return true;
      }

      // 설명으로 검색
      if (row.description?.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }

  // Namespace 필터
  if (options.selectedNamespaces && options.selectedNamespaces.length > 0) {
    filtered = filtered.filter((row) => {
      const namespace = getNamespace(row.key);
      // "(root)" 그룹 처리
      if (namespace === "" && options.selectedNamespaces.includes("(root)")) {
        return true;
      }
      return options.selectedNamespaces.includes(namespace);
    });
  }

  // 빈 번역 필터
  if (options.showEmptyOnly) {
    filtered = filtered.filter((row) => {
      if (options.emptyLocaleCode) {
        // 특정 언어의 빈 번역만 필터링
        const value = row.translations[options.emptyLocaleCode] || "";
        return !value.trim();
      } else {
        // 모든 언어가 비어있는 키만 필터링
        return Object.values(row.translations).every(
          (value) => !value.trim()
        );
      }
    });
  }

  return filtered;
}

/**
 * 키 정렬
 */
export function sortKeys(
  rows: TranslationMatrix["rows"],
  sortBy: "created" | "name" | "namespace",
  keysWithCreatedAt?: Array<{ name: string; createdAt: string }>
): TranslationMatrix["rows"] {
  const sorted = [...rows];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.key.localeCompare(b.key));

    case "namespace":
      return sorted.sort((a, b) => {
        const namespaceA = getNamespace(a.key);
        const namespaceB = getNamespace(b.key);

        // namespace가 같으면 키 이름으로 정렬
        if (namespaceA === namespaceB) {
          return a.key.localeCompare(b.key);
        }

        return namespaceA.localeCompare(namespaceB);
      });

    case "created":
    default:
      if (keysWithCreatedAt) {
        return sorted.sort((a, b) => {
          const keyA = keysWithCreatedAt.find((k) => k.name === a.key);
          const keyB = keysWithCreatedAt.find((k) => k.name === b.key);

          if (!keyA || !keyB) return 0;

          return (
            new Date(keyA.createdAt).getTime() -
            new Date(keyB.createdAt).getTime()
          );
        });
      }
      return sorted;
  }
}

