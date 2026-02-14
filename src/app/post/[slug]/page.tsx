import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostClient from './PostClient';
import { generateTOC } from '~/utils/generateTOC';
import { getBasePath, getCategoryPosts, getCategoryPostBySlug, getPostContent, getPostUrl, getSiteOrigin } from '~/utils/contentRepository';

interface PostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getCategoryPosts().map(doc => ({ slug: doc.fileName }));
}

export function generateMetadata({ params }: PostPageProps): Metadata {
  const document = getCategoryPostBySlug(params.slug);
  const content = getPostContent(params.slug);
  const siteOrigin = getSiteOrigin();
  const basePath = getBasePath();

  if (!document) {
    return {
      title: '존재하지 않는 게시물',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = document.title;
  const description = content?.description || '개념과 원리를 중심으로 정리한 기술 문서입니다.';
  const canonical = getPostUrl(params.slug);
  const ogImageUrl = `${siteOrigin}${basePath}/og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: document.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function PostPage({ params }: PostPageProps) {
  const document = getCategoryPostBySlug(params.slug);
  const postContent = getPostContent(params.slug);

  if (!document || !postContent) {
    notFound();
  }

  const { toc, idMap } = generateTOC(postContent.content);
  return <PostClient document={document} postContent={postContent} toc={toc} idMap={idMap} />;
}
