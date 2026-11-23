import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostClient from './PostClient';
import { generateTOC } from '~/utils/generateTOC';
import { getCategoryPosts, getCategoryPostBySlug, getPostContent, getPostNavigation, getPostUrl } from '~/utils/contentRepository';
import {
  AUTHOR_NAME,
  SITE_LANGUAGE,
  SITE_LOCALE,
  SITE_NAME,
  getAuthorUrl,
  getHomeUrl,
  getPostDates,
  getPostOgImageUrl,
  getPostKeywords,
  getPostSeoDescription,
  serializeJsonLd,
} from '~/utils/seo';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getCategoryPosts().map(doc => ({ slug: doc.fileName }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getCategoryPostBySlug(slug);
  const content = getPostContent(slug);

  if (!document || !content) {
    return {
      title: '존재하지 않는 게시물',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = document.title;
  const description = getPostSeoDescription(content);
  const canonical = getPostUrl(slug);
  const ogImageUrl = getPostOgImageUrl(slug);
  const { publishedIso: publishedTime, modifiedIso: modifiedTime } = getPostDates(content);

  return {
    title,
    description,
    authors: [{ name: AUTHOR_NAME, url: getAuthorUrl() }],
    creator: AUTHOR_NAME,
    publisher: AUTHOR_NAME,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      publishedTime,
      modifiedTime,
      authors: [AUTHOR_NAME],
      tags: document.tags,
      section: document.tags[0] || 'technology',
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
    category: document.tags[0] || 'technology',
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const document = getCategoryPostBySlug(slug);
  const postContent = getPostContent(slug);

  if (!document || !postContent) {
    notFound();
  }

  const { toc, idMap, definitionHeadingMap } = generateTOC(postContent.content);
  const navigation = getPostNavigation(slug);
  const canonical = getPostUrl(slug);
  const description = getPostSeoDescription(postContent);
  const { publishedIso: datePublished, modifiedIso: dateModified } = getPostDates(postContent);
  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: document.title,
    description,
    url: canonical,
    mainEntityOfPage: canonical,
    inLanguage: SITE_LANGUAGE,
    isAccessibleForFree: true,
    datePublished,
    dateModified,
    keywords: getPostKeywords(document).join(', '),
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: getAuthorUrl(),
    },
    publisher: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: getAuthorUrl(),
    },
    image: [getPostOgImageUrl(slug)],
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: getHomeUrl(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: document.title,
        item: canonical,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <PostClient
        document={document}
        postContent={postContent}
        toc={toc}
        idMap={idMap}
        definitionHeadingMap={definitionHeadingMap}
        navigation={navigation}
      />
    </>
  );
}
