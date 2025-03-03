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
import PostHeader from "@/app/post/[slug]/PostHeader";

interface PostProps {
    params: { slug: string };
}

// ✅ Markdown 파일이 저장된 폴더 경로
const postsDirectory = path.join(process.cwd(), "public/resources");

// ✅ 정적 경로를 생성하는 함수
export async function generateStaticParams() {
    const filenames = fs.readdirSync(postsDirectory);
    return filenames
        .filter((filename) => filename.endsWith(".md"))
        .map((filename) => ({ slug: filename.replace(/\.md$/, "") }));
}

// ✅ SEO를 위한 메타데이터 생성
export async function generateMetadata({ params }: PostProps) {
    const filePath = path.join(postsDirectory, `${params.slug}.md`);
    if (!fs.existsSync(filePath)) {
        return { title: "게시물을 찾을 수 없습니다." };
    }
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);

    return {
        title: data.title || params.slug,
        description: data.description || "기본 설명",
    };
}

// ✅ Markdown에서 메타데이터 읽기
export default async function PostPage({ params }: PostProps) {
    const filePath = path.join(postsDirectory, `${params.slug}.md`);
    if (!fs.existsSync(filePath)) {
        return <div className={styles.notFound}>게시물을 찾을 수 없습니다.</div>;
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const { content, data } = matter(fileContents);

    const processedContent = await remark()
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(content);

    return (
        <article className={styles.markdown}>
            <PostHeader title={data.title} description={data.description} author={data.author} date={data.date} tags={data.tags} />
            <TableOfContents />
            <div dangerouslySetInnerHTML={{ __html: processedContent.toString() }} />
        </article>
    );
}

// // ✅ Markdown을 HTML로 변환하여 렌더링
// export default async function PostPage({ params }: PostProps) {
//     const filePath = path.join(postsDirectory, `${params.slug}.md`);
//     if (!fs.existsSync(filePath)) {
//         return <div className={styles.notFound}>게시물을 찾을 수 없습니다.</div>;
//     }
//
//     const fileContents = fs.readFileSync(filePath, "utf8");
//     const { content } = matter(fileContents);
//
//     const processedContent = await remark()
//         .use(remarkGfm)
//         .use(remarkRehype)
//         .use(rehypeHighlight)
//         .use(rehypeStringify)
//         .process(content);
//
//     return (
//         <article className={styles.markdown}>
//             <TableOfContents />
//             <div dangerouslySetInnerHTML={{ __html: processedContent.toString() }} />
//         </article>
//     );
// }