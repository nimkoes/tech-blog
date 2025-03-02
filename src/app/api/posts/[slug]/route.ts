import { NextResponse } from "next/server";
import { getMarkdownContent } from "@/utils/getMarkdownContent";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const contentHtml = await getMarkdownContent(params.slug);

  if (!contentHtml) {
    return NextResponse.json({ error: "게시물을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ content: contentHtml });
}