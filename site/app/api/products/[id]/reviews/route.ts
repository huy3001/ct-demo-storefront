import { type NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/app/api/_utils';
import { createProductReview } from '@/lib/ct/product';

interface ReviewRequestBody {
  rating?: unknown;
  author?: unknown;
  title?: unknown;
  content?: unknown;
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

    const review = await createProductReview(id, {
      rating,
      author,
      title,
      content,
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
