'use client';

import {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import Accordion from '@/components/ui/atoms/accordion';
import Button from '@/components/ui/atoms/button';
import Input from '@/components/ui/atoms/input';
import Modal from '@/components/ui/organisms/modal';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Review } from '@/lib/types';

interface ReviewsContextValue {
  reviews: Review[];
  openReviewModal: () => void;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error('Product review components require ReviewsProvider');
  return context;
}

function Stars({ rating, interactive = false, onChange }: {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => interactive ? (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          aria-pressed={rating === star}
          className={`text-2xl leading-none ${star <= rating ? 'text-terra' : 'text-border'} hover:text-terra`}
        >
          ★
        </button>
      ) : (
        <span key={star} aria-hidden className={star <= rating ? 'text-terra' : 'text-border'}>★</span>
      ))}
    </span>
  );
}

function getAverageRating(reviews: Review[]) {
  if (reviews.length === 0) return 0;
  return Math.round(
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
  );
}

export function ProductReviewBlock({
  reviews,
  onWriteReview,
}: {
  reviews: Review[];
  onWriteReview?: () => void;
}) {
  const averageRating = getAverageRating(reviews);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <Stars rating={averageRating} />
      <span className="text-charcoal-light">
        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
      </span>
      {onWriteReview && (
        <button
          type="button"
          onClick={onWriteReview}
          className="font-medium text-terra underline-offset-4 hover:underline"
        >
          Write review
        </button>
      )}
    </div>
  );
}

export function ReviewsProvider({ productId, initialReviews, children }: {
  productId: string;
  initialReviews: Review[];
  children: ReactNode;
}) {
  const [reviews, setReviews] = useState(() => [...initialReviews].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  ));
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) return;
    const form = new FormData(event.currentTarget);
    const reviewInput = {
      rating,
      author: String(form.get('author') ?? '').trim(),
      title: String(form.get('title') ?? '').trim(),
      content: String(form.get('content') ?? '').trim(),
    };
    if (!reviewInput.author || !reviewInput.title || !reviewInput.content) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewInput),
      });
      const result = (await response.json()) as {
        review?: Review;
        message?: string;
      };
      if (!response.ok || !result.review) {
        throw new Error(result.message ?? 'Unable to send review');
      }

      setReviews((current) => [result.review!, ...current]);
      setRating(0);
      setIsOpen(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Unable to send review',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const value = useMemo(
    () => ({
      reviews,
      openReviewModal: () => {
        setSubmitError(null);
        setIsOpen(true);
      },
    }),
    [reviews],
  );

  return (
    <ReviewsContext.Provider value={value}>
      {children}
      {isOpen && (
        <Modal
          shouldCloseOnOverlayClick
          isOpen={isOpen}
          onRequestClose={(event) =>
            event.target === event.currentTarget &&
            !isSubmitting &&
            setIsOpen(false)
          }
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-sm bg-white p-6! shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <h2
              id={titleId}
              className="text-xl font-semibold text-charcoal"
            >
              Write a review
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              aria-label="Close"
              className="text-xl text-charcoal-light hover:text-charcoal"
            >
              <XMarkIcon className="size-6" />
            </button>
          </div>
          <form
            onSubmit={submitReview}
            className="mt-6 space-y-6"
          >
            <fieldset className="form-field w-full">
              <legend className="mb-2 text-sm">Rating</legend>
              <Stars
                rating={rating}
                interactive
                onChange={setRating}
              />
              {rating === 0 && (
                <span className="ml-3 text-xs text-charcoal-light">
                  Select 1–5 stars
                </span>
              )}
            </fieldset>
            {[
              { name: 'author', label: 'Author name' },
              { name: 'title', label: 'Review title' },
            ].map((field) => (
              <div
                className="form-field w-full"
                key={field.name}
              >
                <Input
                  label={field.label}
                  id={field.name}
                  name={field.name}
                  required
                />
              </div>
            ))}
            <div className="form-field w-full">
              <label
                htmlFor="content"
                className="block leading-loose text-sm text-gray-600 font-medium mb-2"
              >
                Review
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={5}
                className="w-full resize-y rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-400 focus:ring-0"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              {submitError && (
                <p
                  className="mr-auto self-center text-sm text-red-600"
                  role="alert"
                >
                  {submitError}
                </p>
              )}
              <Button
                type="button"
                size="xs"
                variant="secondary"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="xs"
                variant="primary"
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? 'Sending…' : 'Send review'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </ReviewsContext.Provider>
  );
}

export function ProductReviewSummary({
  showWriteReview = true,
}: {
  showWriteReview?: boolean;
}) {
  const { reviews, openReviewModal } = useReviews();
  return <ProductReviewBlock
    reviews={reviews}
    onWriteReview={showWriteReview ? openReviewModal : undefined}
  />;
}

export function ProductReviewsAccordion() {
  const { reviews } = useReviews();
  return (
    <Accordion
      variant="arrow"
      closedSectionTitle="Reviews"
      openSectionTitle="Reviews"
      className="border-b border-border"
      buttonClassName="font-medium text-charcoal py-5"
      panelClassName="pb-5 text-sm text-charcoal-light"
    >
      {reviews.length === 0 ? (
        <p className="text-sm text-charcoal-light">
          No reviews yet. Be the first to review this product.
        </p>
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="py-5 first:pt-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars rating={review.rating} />
                {review.createdAt && (
                  <time
                    dateTime={review.createdAt}
                    className="text-xs text-charcoal-light"
                  >
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'medium',
                    }).format(new Date(review.createdAt))}
                  </time>
                )}
              </div>
              <h3 className="mt-2 font-medium text-charcoal">{review.title}</h3>
              <p className="mt-1 text-xs text-charcoal-light">
                By {review.author}
              </p>
              <p className="mt-3 whitespace-pre-line text-sm text-charcoal-light">
                {review.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Accordion>
  );
}
