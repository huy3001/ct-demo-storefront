import { type NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/app/api/_utils';
import { createProductReview } from '@/lib/ct/product';
import type { ReviewMedia } from '@/lib/types';

interface ReviewRequestBody {
  rating?: unknown;
  author?: unknown;
  title?: unknown;
  content?: unknown;
  media?: unknown;
}

function parseMedia(value: unknown): ReviewMedia[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ReviewMedia[] => {
    if (!item || typeof item !== 'object') return [];
    const media = item as Record<string, unknown>;
    if (
      (media.type !== 'image' && media.type !== 'video') ||
      typeof media.url !== 'string' ||
      !/^https?:\/\//.test(media.url)
    ) {
      return [];
    }
    return [{
      type: media.type,
      url: media.url,
      name: typeof media.name === 'string' ? media.name : undefined,
    }];
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as ReviewRequestBody;
    const rating = Number(body.rating);
    const author = typeof body.author === 'string' ? body.author.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const media = parseMedia(body.media);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be a whole number from 1 to 5' },
        { status: 400 },
      );
    }
    if (!author || !title || !content) {
      return NextResponse.json(
        { message: 'Author name, title, and review are required' },
        { status: 400 },
      );
    }
    if (Array.isArray(body.media) && media.length !== body.media.length) {
      return NextResponse.json(
        { message: 'Review media must contain valid hosted image or video URLs' },
        { status: 400 },
      );
    }
    if (media.filter((item) => item.type === 'video').length > 1 || (media.some((item) => item.type === 'video') && media.length > 1)) {
      return NextResponse.json(
        { message: 'Attach up to 3 images or 1 video' },
        { status: 400 },
      );
    }
    if (media.length > 3) {
      return NextResponse.json(
        { message: 'Attach up to 3 images or 1 video' },
        { status: 400 },
      );
    }

    const review = await createProductReview(id, {
      rating,
      author,
      title,
      content,
      ...(media.length ? { media } : {}),
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
