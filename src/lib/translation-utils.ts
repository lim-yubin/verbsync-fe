import type { TranslationMatrix } from "@/types/api";

export interface TranslationRow {
  key: string;
  description: string | null;
  translations: Record<string, string>;
}

export interface FilterOptions {
  searchQuery?: string;
  selectedNamespaces?: string[];
  showEmptyOnly?: boolean;
}

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
 * Namespace를 계층 구조로 분리
 * @example
 * getNamespaceParts("login.button.submit") // ["login", "login.button", "login.button.submit"]
 * getNamespaceParts("login") // ["login"]
 * getNamespaceParts("") // []
 */
export function getNamespaceParts(namespace: string): string[] {
  if (!namespace) return [];
  const parts = namespace.split(".");
  const result: string[] = [];
  for (let i = 1; i <= parts.length; i++) {
    result.push(parts.slice(0, i).join("."));
  }
  return result;
}

/**
 * Namespace 트리 노드
 */
export interface NamespaceNode {
  namespace: string;
  fullPath: string; // 전체 경로 (예: "login.button")
  level: number; // 깊이 (0부터 시작)
  children: Map<string, NamespaceNode>; // 하위 namespace들
  keys: TranslationRow[]; // 이 namespace에 직접 속한 키들
  // allKeys는 lazy evaluation으로 계산 (성능 최적화)
  // 필요할 때만 계산하여 메모리 사용량 감소
}

/**
 * 노드의 모든 키 개수 계산 (lazy evaluation)
 * 이 namespace와 하위 namespace의 모든 키 개수를 재귀적으로 계산
 */
export function getAllKeysCount(node: NamespaceNode): number {
  let count = node.keys.length;
  node.children.forEach((child) => {
    count += getAllKeysCount(child);
  });
  return count;
}

/**
 * 키를 계층적 namespace별로 그룹화
 * 성능 최적화: allKeys 배열을 저장하지 않고 필요할 때만 계산
 */
export function groupKeysByNamespaceHierarchical(
  rows: TranslationMatrix["rows"]
): Map<string, NamespaceNode> {
  const rootNodes = new Map<string, NamespaceNode>();

  // 모든 키를 처리
  rows.forEach((row) => {
    const namespace = getNamespace(row.key);
    
    if (!namespace) {
      // namespace가 없는 키는 "(root)" 그룹에
      if (!rootNodes.has("(root)")) {
        rootNodes.set("(root)", {
          namespace: "(root)",
          fullPath: "(root)",
          level: 0,
          children: new Map(),
          keys: [],
        });
      }
      rootNodes.get("(root)")!.keys.push(row);
      return;
    }

    // namespace를 계층 구조로 분리
    const parts = getNamespaceParts(namespace);
    
    // 루트 namespace (첫 번째 부분)
    const rootNamespace = parts[0];
    
    if (!rootNodes.has(rootNamespace)) {
      rootNodes.set(rootNamespace, {
        namespace: rootNamespace,
        fullPath: rootNamespace,
        level: 0,
        children: new Map(),
        keys: [],
      });
    }

    let currentNode = rootNodes.get(rootNamespace)!;

    // 중첩된 namespace 구조 생성
    for (let i = 1; i < parts.length; i++) {
      const currentPath = parts[i];
      const lastPart = parts[i].split(".").pop() || currentPath;

      if (!currentNode.children.has(currentPath)) {
        currentNode.children.set(currentPath, {
          namespace: lastPart,
          fullPath: currentPath,
          level: i,
          children: new Map(),
          keys: [],
        });
      }

      currentNode = currentNode.children.get(currentPath)!;
    }

    // 현재 노드에 키 추가 (이 노드에 직접 속한 키)
    currentNode.keys.push(row);
  });

  return rootNodes;
}

/**
 * 키를 namespace별로 그룹화 (기존 방식 - 평면 구조)
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
  options: FilterOptions,
  locales?: { code: string }[]
): TranslationMatrix["rows"] {
  const { searchQuery, selectedNamespaces, showEmptyOnly } = options;

  return rows.filter((row) => {
    const matchesSearch = searchQuery
      ? row.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (row.description &&
          row.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        getNamespace(row.key).toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesNamespace = selectedNamespaces && selectedNamespaces.length > 0
      ? (() => {
          const namespace = getNamespace(row.key);
          // "(root)" 그룹 처리
          if (namespace === "" && selectedNamespaces.includes("(root)")) {
            return true;
          }
          // 최상위 namespace 추출
          const rootNamespace = namespace ? namespace.split(".")[0] : "";
          // 선택된 최상위 namespace 중 하나와 일치하는지 확인
          return selectedNamespaces.includes(rootNamespace);
        })()
      : true;

    const matchesEmpty = showEmptyOnly
      ? locales?.some(
          (locale) =>
            !row.translations[locale.code] ||
            row.translations[locale.code].trim() === ""
        )
      : true;

    return matchesSearch && matchesNamespace && matchesEmpty;
  });
}

/**
 * 키 정렬
 */
export function sortKeys(
  rows: TranslationMatrix["rows"],
  sortBy: "created" | "name" | "namespace",
  allKeys: Array<{ name: string; createdAt: string }> | undefined
): TranslationMatrix["rows"] {
  if (!allKeys) return rows;

  return [...rows].sort((a, b) => {
    if (sortBy === "created") {
      const keyA = allKeys.find((k) => k.name === a.key);
      const keyB = allKeys.find((k) => k.name === b.key);
      return (keyA && keyB)
        ? new Date(keyA.createdAt).getTime() -
            new Date(keyB.createdAt).getTime()
        : 0;
    } else if (sortBy === "name") {
      return a.key.localeCompare(b.key);
    } else if (sortBy === "namespace") {
      const namespaceA = getNamespace(a.key);
      const namespaceB = getNamespace(b.key);
      if (namespaceA === namespaceB) {
        return a.key.localeCompare(b.key);
      }
      return namespaceA.localeCompare(namespaceB);
    }
    return 0;
  });
}
