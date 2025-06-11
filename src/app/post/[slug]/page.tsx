import {getAllDocuments, getDocumentByFileName} from '~/utils/getAllDocuments';
import PostClient from './PostClient';

export default function PostPage({params}: { params: { slug: string } }) {
  const document = getDocumentByFileName(params.slug);

  if (!document) {
    return <div>존재하지 않는 게시물입니다.</div>;
  }

  return <PostClient slug={params.slug} document={document}/>;
}

export function generateStaticParams() {
  return getAllDocuments().map((doc: any) => ({slug: doc.fileName}));
}
