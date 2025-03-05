import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {remark} from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import styles from "./page.module.scss";
import TableOfContents from "@/components/TableOfContents/TableOfContents";
import GoToHome from "@/components/GoToHome/GoToHome";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import PostHeader from "@/app/post/[slug]/PostHeader";
import KakaoAdFit from "@/components/KakaoAdFit/KakaoAdFit";
import GoogleAdsense from "@/components/GoogleAdsense/GoogleAdsense";

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
    .map((filename) => ({slug: filename.replace(/\.md$/, "")}));
}

// ✅ SEO를 위한 메타데이터 생성
export async function generateMetadata({params}: PostProps) {
  const filePath = path.join(postsDirectory, `${params.slug}.md`);
  if (!fs.existsSync(filePath)) {
    return {title: "게시물을 찾을 수 없습니다."};
  }
  const fileContents = fs.readFileSync(filePath, "utf8");
  const {data} = matter(fileContents);

  return {
    title: data.title || params.slug,
    description: data.description || "기본 설명",
  };
}

// ✅ Markdown에서 메타데이터 읽기
export default async function PostPage({params}: PostProps) {
  const filePath = path.join(postsDirectory, `${params.slug}.md`);
  if (!fs.existsSync(filePath)) {
    return <div className={styles.notFound}>게시물을 찾을 수 없습니다.</div>;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const {content, data} = matter(fileContents);

  // 본문을 h2 태그를 기준으로 분할
  const sections = content.split(/(?=## )/);
  const middleIndex = Math.floor(sections.length / 2);

  // 각 섹션을 HTML로 변환
  const processSection = async (section: string) => {
    const processed = await remark()
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeHighlight)
      .use(rehypeStringify)
      .process(
        section.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
          if (src.startsWith("images/")) {
            return `![${alt}](/resources/${src.replace("./", "")})`;
          }
          return match;
        })
      );
    return processed.toString();
  };

  // 첫 번째 부분과 두 번째 부분의 HTML 생성
  const firstHalf = await Promise.all(sections.slice(0, middleIndex).map(processSection));
  const secondHalf = await Promise.all(sections.slice(middleIndex).map(processSection));

  return (
    <>
      <div className={styles.container}>
        <PostHeader title={data.title} description={data.description} author={data.author} date={data.date}
          tags={data.tags}/>
        <TableOfContents/>
        <article className={styles.markdown}>
          <KakaoAdFit className={styles.topAd} />
          <div dangerouslySetInnerHTML={{ __html: firstHalf.join('') }} />
          <GoogleAdsense
            className={styles.middleAd}
            client="ca-pub-6151583773425822"
            slot="your-ad-slot-id"
          />
          <div dangerouslySetInnerHTML={{ __html: secondHalf.join('') }} />
          <GoogleAdsense
            className={styles.bottomAd}
            client="ca-pub-6151583773425822"
            slot="your-ad-slot-id"
          />
        </article>
      </div>
      <div className={styles.floatingButtons}>
        <GoToHome/>
      </div>
      <ScrollToTop/>
    </>
  );
}
