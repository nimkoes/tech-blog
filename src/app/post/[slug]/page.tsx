import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostClient from './PostClient';
import { generateTOC } from '~/utils/generateTOC';
import { getBasePath, getCategoryPosts, getCategoryPostBySlug, getPostContent, getPostNavigation, getPostUrl, getSiteOrigin } from '~/utils/contentRepository';
import {
  AUTHOR_NAME,
  SITE_LANGUAGE,
  SITE_NAME,
  getDefaultOgImageUrl,
  getPostKeywords,
  getPostSeoDescription,
  parseIsoDate,
  serializeJsonLd,
} from '~/utils/seo';

interface PostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getCategoryPosts().map(doc => ({ slug: doc.fileName }));
}

export function generateMetadata({ params }: PostPageProps): Metadata {
  const document = getCategoryPostBySlug(params.slug);
  const content = getPostContent(params.slug);

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
  const description = getPostSeoDescription(content);
  const canonical = getPostUrl(params.slug);
  const ogImageUrl = getDefaultOgImageUrl();
  const publishedTime = parseIsoDate(content?.date || document.regDate);
  const modifiedTime = parseIsoDate(document.lastModifiedDate || content?.date);
  const keywords = getPostKeywords(document);

  return {
    title,
    description,
    keywords,
    authors: [{ name: AUTHOR_NAME, url: `${getSiteOrigin()}${getBasePath()}` }],
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

export default function PostPage({ params }: PostPageProps) {
  const document = getCategoryPostBySlug(params.slug);
  const postContent = getPostContent(params.slug);

  if (!document || !postContent) {
    notFound();
  }

  const { toc, idMap } = generateTOC(postContent.content);
  const navigation = getPostNavigation(params.slug);
  const canonical = getPostUrl(params.slug);
  const description = getPostSeoDescription(postContent);
  const datePublished = parseIsoDate(postContent.date || document.regDate);
  const dateModified = parseIsoDate(document.lastModifiedDate || postContent.date);
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
      url: `${getSiteOrigin()}${getBasePath()}`,
    },
    publisher: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: `${getSiteOrigin()}${getBasePath()}`,
    },
    image: [getDefaultOgImageUrl()],
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: `${getSiteOrigin()}${getBasePath()}`,
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
        navigation={navigation}
      />
    </>
  );
}
