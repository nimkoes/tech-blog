import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import styles from "./page.module.scss";
import TableOfContents from "@/components/TableOfContents/TableOfContents";

interface PostProps {
    params: { slug: string };
}

// ✅ Markdown 파일이 저장된 폴더 경로
const postsDirectory = path.join(process.cwd(), "public/resources");

// ✅ 🔥 정적 사이트 생성을 위한 모든 Markdown 파일을 반환
export async function generateStaticParams() {
    "use server"; // ✅ Next.js에서 서버 환경에서 실행됨을 명시
    const filenames = await fs.promises.readdir(postsDirectory); // ✅ 비동기 파일 읽기
    return filenames
        .filter((filename) => filename.endsWith(".md"))
        .map((filename) => ({ slug: filename.replace(/\.md$/, "") }));
}

// ✅ 🔥 SEO를 위한 메타데이터 생성
export async function generateMetadata({ params }: PostProps) {
    "use server"; // ✅ 서버 실행 명시

    const filePath = path.join(postsDirectory, `${params.slug}.md`);
    if (!fs.existsSync(filePath)) {
        return { title: "게시물을 찾을 수 없습니다." };
    }

    const fileContents = await fs.promises.readFile(filePath, "utf8"); // ✅ 비동기 파일 읽기
    const { data } = matter(fileContents);

    return {
        title: data.title || params.slug,
        description: data.description || "기본 설명",
    };
}

// ✅ 🔥 Markdown을 HTML로 변환하여 렌더링
export default async function PostPage({ params }: PostProps) {
    "use server"; // ✅ 서버 실행 명시

    const filePath = path.join(postsDirectory, `${params.slug}.md`);
    if (!fs.existsSync(filePath)) {
        return <div className={styles.notFound}>게시물을 찾을 수 없습니다.</div>;
    }

    const fileContents = await fs.promises.readFile(filePath, "utf8"); // ✅ 비동기 파일 읽기
    const { content } = matter(fileContents);

    const processedContent = await remark()
        .use(remarkGfm) // ✅ GitHub 스타일 Markdown 지원
        .use(remarkRehype) // ✅ Markdown을 HTML로 변환
        .use(rehypeHighlight) // ✅ 코드 하이라이팅 적용
        .use(rehypeStringify) // ✅ HTML 변환
        .process(content);

    return (
        <article className={styles.markdown}>
            <TableOfContents />
            <div dangerouslySetInnerHTML={{ __html: processedContent.toString() }} />
        </article>
    );
}