'use client';

import {
  createContext,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useContext,
  useId,
  useState,
} from 'react';
import Accordion from '@/components/ui/atoms/accordion';
import Button from '@/components/ui/atoms/button';
import Dropdown from '@/components/ui/atoms/dropdown';
import Image from '@/components/ui/atoms/image';
import Input from '@/components/ui/atoms/input';
import Modal from '@/components/ui/organisms/modal';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Review, ReviewMedia } from '@/lib/types';

type MediaFilter = 'all' | 'with-media' | 'images' | 'videos';
type SortOrder = 'most-recent' | 'highest-rating' | 'lowest-rating';

interface PendingMedia extends ReviewMedia {
  file: File;
}

interface ReviewsContextValue {
  reviews: Review[];
  openReviewModal: () => void;
}

const MAX_MEDIA_SIZE = 100 * 1024 * 1024;
const ReviewsContext = createContext<ReviewsContextValue | null>(null);

function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context)
    throw new Error('Product review components require ReviewsProvider');
  return context;
}

function Stars({
  rating,
  interactive = false,
  onChange,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  return (
    <span
      className="inline-flex gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) =>
        interactive ? (
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
          <span
            key={star}
            aria-hidden
            className={
              star <= Math.round(rating) ? 'text-terra' : 'text-border'
            }
          >
            ★
          </span>
        ),
      )}
    </span>
  );
}

function getAverageRating(reviews: Review[]) {
  if (reviews.length === 0) return 0;
  return (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  );
}

function hasMedia(review: Review, type?: ReviewMedia['type']) {
  return review.media?.some((media) => !type || media.type === type) ?? false;
}

function ReviewMediaGallery({ media }: { media?: ReviewMedia[] }) {
  if (!media?.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-3 relative">
      {media.map((item) =>
        item.type === 'image' ? (
          <Image
            key={item.url}
            src={item.url}
            alt={item.name ?? 'Review attachment'}
            className="size-24 rounded-sm border border-border object-cover sm:size-32"
          />
        ) : (
          <video
            key={item.url}
            controls
            preload="metadata"
            className="h-32 max-w-full rounded-sm border border-border bg-charcoal sm:w-56"
          >
            <track kind="captions" />
          </video>
        ),
      )}
    </div>
  );
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const max = Math.max(...reviews.map((review) => review.rating), 1);
  return (
    <div className="space-y-2 md:border-x md:border-border md:px-8">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = reviews.filter(
          (review) => review.rating === rating,
        ).length;
        return (
          <div
            key={rating}
            className="grid grid-cols-[2rem_1fr_1.5rem] items-center gap-2 text-xs"
          >
            <span className="text-charcoal">{rating} ★</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-border">
              <span
                className="block h-full rounded-full bg-terra"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </span>
            <span className="text-right text-charcoal-light">{count}</span>
          </div>
        );
      })}
    </div>
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
        {reviews.length}
        {reviews.length === 1 ? ' review' : ' reviews'}
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

export function ReviewsProvider({
  productId,
  initialReviews,
  children,
}: {
  productId: string;
  initialReviews: Review[];
  children: ReactNode;
}) {
  const [reviews, setReviews] = useState(() =>
    initialReviews
      .filter((review) => review.status === 'approved')
      .sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    ),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const titleId = useId();

  function closeModal() {
    if (isSubmitting) return;
    pendingMedia.forEach((media) => URL.revokeObjectURL(media.url));
    setPendingMedia([]);
    setMediaError(null);
    setIsOpen(false);
  }

  function selectMedia(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    const videoFiles = files.filter((file) => file.type.startsWith('video/'));
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (files.length !== videoFiles.length + imageFiles.length) {
      setMediaError('Only image and video files are supported.');
      return;
    }
    if (files.some((file) => file.size > MAX_MEDIA_SIZE)) {
      setMediaError('Each media file must be 100 MB or smaller.');
      return;
    }
    const existingHasVideo = pendingMedia.some(
      (media) => media.type === 'video',
    );
    if (
      videoFiles.length > 1 ||
      (videoFiles.length && (existingHasVideo || pendingMedia.length > 0)) ||
      (!videoFiles.length &&
        (existingHasVideo || pendingMedia.length + imageFiles.length > 3))
    ) {
      setMediaError('Attach up to 3 images or 1 video.');
      return;
    }

    setMediaError(null);
    setPendingMedia((current) => [
      ...current,
      ...files.map((file) => ({
        file,
        type: file.type.startsWith('video/')
          ? ('video' as const)
          : ('image' as const),
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    ]);
  }

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
    if (!reviewInput.author || !reviewInput.title || !reviewInput.content)
      return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(productId)}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewInput),
        },
      );
      const result = (await response.json()) as {
        review?: Review;
        message?: string;
      };
      if (!response.ok || !result.review)
        throw new Error(result.message ?? 'Unable to send review');

      if (result.review.status === 'approved') {
        setReviews((current) => [
          {
            ...result.review!,
            ...(pendingMedia.length
              ? {
                  media: pendingMedia.map(({ type, url, name }) => ({
                    type,
                    url,
                    name,
                  })),
                }
              : {}),
          },
          ...current,
        ]);
      }
      setRating(0);
      setPendingMedia([]);
      setSubmitSuccess(
        result.review.status === 'approved'
          ? 'Your review was published.'
          : 'Your review was submitted for moderation.',
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Unable to send review',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const value = {
    reviews,
    openReviewModal: () => {
      setSubmitError(null);
      setSubmitSuccess(null);
      setIsOpen(true);
    },
  };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
      {isOpen && (
        <Modal
          shouldCloseOnOverlayClick
          isOpen={isOpen}
          onRequestClose={closeModal}
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
              onClick={closeModal}
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
                className="mb-2 block text-sm leading-loose font-medium text-gray-600"
              >
                Review
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={5}
                className="w-full resize-y rounded-sm border border-gray-300 px-3 py-2 outline-none text-sm focus:border-gray-400 focus:ring-0"
              />
            </div>
            <div className="form-field w-full">
              <Input
                label="Add photos or a video"
                id="review-media"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={selectMedia}
                className="cursor-pointer border-0! p-0! rounded-none! file:border-0 file:bg-charcoal file:px-3 file:py-2 file:rounded-sm file:text-sm file:font-medium file:text-white hover:file:bg-terra"
              />
              <p className="mt-2 text-xs text-charcoal-light">
                Upload up to 3 images or 1 video. Maximum file size: 100 MB.
              </p>
              {mediaError && (
                <p
                  className="mt-2 text-sm text-red-600"
                  role="alert"
                >
                  {mediaError}
                </p>
              )}
              {pendingMedia.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {pendingMedia.map((media) => (
                    <div
                      key={media.url}
                      className="relative"
                    >
                      {media.type === 'image' ? (
                        <Image
                          src={media.url}
                          alt={media.name}
                          className="size-20 rounded-sm object-cover"
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="size-20 rounded-sm bg-charcoal object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(media.url);
                          setPendingMedia((current) =>
                            current.filter((item) => item.url !== media.url),
                          );
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-white p-0.5 text-charcoal shadow"
                        aria-label={`Remove ${media.name}`}
                      >
                        <XMarkIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              {submitError && (
                <p className="mr-auto self-center text-sm text-red-600" role="alert">
                  {submitError}
                </p>
              )}
              {submitSuccess && (
                <p className="mr-auto self-center text-sm text-green-700" role="status">
                  {submitSuccess}
                </p>
              )}
              <Button
                type="button"
                size="xs"
                variant="secondary"
                onClick={closeModal}
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
  return (
    <ProductReviewBlock
      reviews={reviews}
      onWriteReview={showWriteReview ? openReviewModal : undefined}
    />
  );
}

export function ProductReviewsAccordion() {
  const { reviews, openReviewModal } = useReviews();
  const [query, setQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('most-recent');
  const averageRating = getAverageRating(reviews);
  const hasFilters =
    query ||
    ratingFilter !== 'all' ||
    mediaFilter !== 'all' ||
    sortOrder !== 'most-recent';
  
  const ratingItems = [5, 4, 3, 2, 1].map((rating) => ({
    value: rating,
    label: `${rating} stars`,
  }));

  const mediaItems = [
    { value: 'all', label: 'All reviews' },
    { value: 'with-media', label: 'With media' },
    { value: 'images', label: 'Image only' },
    { value: 'videos', label: 'Video only' },
  ];

  const sortItems = [
    { value: 'most-recent', label: 'Most recent' },
    { value: 'highest-rating', label: 'Highest rating' },
    { value: 'lowest-rating', label: 'Lowest rating' },
  ];

  const matchingReviews = reviews
    .filter((review) => {
      const normalizedQuery = query.trim().toLocaleLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        [review.author, review.title, review.content].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        );
      const matchesRating =
        ratingFilter === 'all' || review.rating === Number(ratingFilter);
      const matchesMedia =
        mediaFilter === 'all' ||
        (mediaFilter === 'with-media' && hasMedia(review)) ||
        (mediaFilter === 'images' && hasMedia(review, 'image')) ||
        (mediaFilter === 'videos' && hasMedia(review, 'video'));
      return matchesQuery && matchesRating && matchesMedia;
    })
    .sort((a, b) => {
      if (sortOrder === 'highest-rating') return b.rating - a.rating;
      if (sortOrder === 'lowest-rating') return a.rating - b.rating;
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });

  function clearFilters() {
    setQuery('');
    setRatingFilter('all');
    setMediaFilter('all');
    setSortOrder('most-recent');
  }

  return (
    <Accordion
      variant="arrow"
      closedSectionTitle="Reviews"
      openSectionTitle="Reviews"
      className="border-b border-border"
      buttonClassName="font-medium text-charcoal py-5"
      panelClassName="pb-5 text-sm text-charcoal-light"
    >
      <div className="py-2">
        <div className="grid gap-6 border-b border-border pb-6 md:grid-cols-3 md:items-center md:gap-8">
          <div className="text-center">
            <p className="text-4xl font-semibold text-charcoal">
              {averageRating.toFixed(1)}
            </p>
            <Stars rating={averageRating} />
            <p className="mt-1 text-xs text-charcoal-light">
              Based on {reviews.length}{' '}
              {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <RatingDistribution reviews={reviews} />
          <div className="text-center">
            <Button
              type="button"
              size="s"
              onClick={openReviewModal}
              className="py-2.5! w-full md:w-auto"
            >
              Write a review
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center md:gap-6">
          <div className="relative flex-1">
            <label
              className="sr-only"
              htmlFor="search-reviews"
            >
              Search reviews
            </label>
            <Input
              labelPosition="inline"
              id="search-reviews"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reviews"
            />
            <MagnifyingGlassIcon className="pointer-events-none absolute right-3 top-3 size-4 text-charcoal" />
          </div>
          <div>
            <label
              className="sr-only"
              htmlFor="rating-filter"
            >
              Filter by rating
            </label>
            <Dropdown
              id="rating-filter"
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
              containerClassName="min-w-35"
              items={ratingItems}
            />
          </div>
          <div>
            <label
              className="sr-only"
              htmlFor="media-filter"
            >
              Filter by media
            </label>
            <Dropdown
              id="media-filter"
              value={mediaFilter}
              onChange={(event) =>
                setMediaFilter(event.target.value as MediaFilter)
              }
              containerClassName="min-w-35"
              items={mediaItems}
            />
          </div>
          <div className="flex items-center gap-2">
            <label
              className="text-sm text-charcoal"
              htmlFor="sort-order"
            >
              Sort by
            </label>
            <Dropdown
              id="sort-order"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as SortOrder)
              }
              containerClassName="flex-1 min-w-35"
              items={sortItems}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-4 text-sm">
          <p>
            Showing {matchingReviews.length} matching{' '}
            {matchingReviews.length === 1 ? 'review' : 'reviews'}
          </p>
          {hasFilters && (
            <Button
              variant="underlined"
              onClick={clearFilters}
              className="p-0! underline underline-offset-4 hover:text-terra"
            >
              Clear filters
            </Button>
          )}
        </div>

        {matchingReviews.length === 0 ? (
          <p className="border-t border-border py-6 text-sm text-charcoal-light">
            No reviews match your search and filters.
          </p>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {matchingReviews.map((review) => (
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
                <h3 className="mt-2 font-medium text-charcoal">
                  {review.title}
                </h3>
                <p className="mt-1 text-xs text-charcoal-light">
                  By {review.author}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm text-charcoal-light">
                  {review.content}
                </p>
                <ReviewMediaGallery media={review.media} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Accordion>
  );
}
