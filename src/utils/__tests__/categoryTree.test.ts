import { describe, expect, it } from "vitest";
import categoryData from "~/resources/category.json";
import postIndex from "~/resources/post-index.json";
import { buildCategoryTree, collectCategoryGroupIds, filterCategoryTree, findCategoryAncestorIds } from "~/utils/categoryTree";
import type { CategoryNode, PostMeta } from "~/types/content";

describe("categoryTree", () => {
  const tree = buildCategoryTree(categoryData as CategoryNode[], postIndex as PostMeta[]);

  it("kubernetes의 시리즈와 개별 글을 서로 다른 계층으로 유지한다", () => {
    const kubernetes = tree.find((group) => group.name === "Kubernetes");
    const series = kubernetes?.children.find((child) => child.type === "group" && child.name === "대세는 쿠버네티스");
    const directPosts = kubernetes?.children.filter((child) => child.type === "post") ?? [];

    expect(kubernetes?.postCount).toBe(19);
    expect(series).toMatchObject({ type: "group", kind: "series", postCount: 15 });
    expect(directPosts).toHaveLength(4);
  });

  it("검색 결과에서도 일치한 글의 상위 폴더를 유지한다", () => {
    const filtered = filterCategoryTree(tree, "static pod");
    const kubernetes = filtered.find((group) => group.name === "Kubernetes");

    expect(kubernetes).toBeDefined();
    expect(kubernetes?.children.some((child) => child.type === "post")).toBe(true);
  });

  it("모든 폴더 식별자를 중복 없이 수집한다", () => {
    const ids = collectCategoryGroupIds(tree);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("10-01");
  });

  it("현재 글의 상위 카테고리와 시리즈 경로를 찾는다", () => {
    expect(findCategoryAncestorIds(tree, "0003-kubernetes")).toEqual(["10", "10-01"]);
    expect(findCategoryAncestorIds(tree, "0056-kubernetes-static-pod")).toEqual(["10"]);
    expect(findCategoryAncestorIds(tree, "0020-spring-security-inner-structure")).toEqual(["20", "20-series"]);
    expect(findCategoryAncestorIds(tree, "0084-133-whiteship-java-live-study-s01")).toEqual(["90", "95"]);
  });

  it("독립 시리즈를 기술 대분류 아래에 배치한다", () => {
    const spring = tree.find((group) => group.name === "Spring");
    const java = tree.find((group) => group.name === "Java");

    expect(spring?.children).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "group", name: "Spring Security 내부 구조", kind: "series" })]),
    );
    expect(java?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "group", name: "나 혼자 떠드는 자바", kind: "series" }),
        expect.objectContaining({ type: "group", name: "Whiteship Java live study", kind: "series" }),
        expect.objectContaining({ type: "group", name: "단편", kind: "folder" }),
      ]),
    );
  });
});
