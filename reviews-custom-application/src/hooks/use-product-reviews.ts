import { useMemo } from 'react';
import { gql } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { ReviewDraft, ReviewRecord, ReviewStatus } from '../types';

const FETCH_PRODUCT_REVIEWS = gql`
  query FetchProductReviews($limit: Int!, $offset: Int!) {
    products(limit: $limit, offset: $offset) {
      results {
        id
        version
        masterData {
          current {
            masterVariant {
              id
              attributesRaw {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;

const UPDATE_PRODUCT_REVIEWS = gql`
  mutation UpdateProductReviews(
    $id: String!
    $version: Long!
    $actions: [ProductUpdateAction!]!
  ) {
    updateProduct(id: $id, version: $version, actions: $actions) {
      id
      version
    }
  }
`;

type StoredReview = {
  id: string;
  rating: number;
  author: string;
  title: string;
  content: string;
  createdAt: string;
  status?: ReviewStatus;
  media?: unknown;
};

type ProductReviewSource = {
  id: string;
  version: number;
  masterVariantId: number;
  reviews: StoredReview[];
};

type ProductReviewQuery = {
  products: {
    results: Array<{
      id: string;
      version: number;
      masterData: {
        current: {
          masterVariant: {
            id: number;
            attributesRaw: Array<{ name: string; value: unknown }>;
          };
        };
      };
    }>;
  };
};

type ProductReviewMutation = {
  updateProduct: { id: string; version: number };
};

function parseReviews(value: unknown): StoredReview[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item): StoredReview[] => {
      if (!item || typeof item !== 'object') return [];
      const review = item as Record<string, unknown>;
      const rating = Number(review.rating);
      if (
        typeof review.id !== 'string' ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5 ||
        typeof review.author !== 'string' ||
        typeof review.title !== 'string' ||
        typeof review.content !== 'string' ||
        typeof review.createdAt !== 'string'
      ) {
        return [];
      }
      const status = review.status;
      if (
        status !== undefined &&
        status !== 'pending' &&
        status !== 'approved' &&
        status !== 'rejected'
      ) {
        return [];
      }
      return [
        {
          id: review.id,
          rating,
          author: review.author,
          title: review.title,
          content: review.content,
          createdAt: review.createdAt,
          status: status as ReviewStatus | undefined,
          ...(review.media === undefined ? {} : { media: review.media }),
        },
      ];
    });
  } catch {
    return [];
  }
}

function toRecord(productId: string, review: StoredReview): ReviewRecord {
  return {
    id: review.id,
    productId,
    rating: review.rating,
    title: review.title,
    text: review.content,
    reviewDate: review.createdAt,
    reviewerName: review.author,
    status: review.status ?? 'approved',
  };
}

function toStoredReview(draft: ReviewDraft, id: string): StoredReview {
  return {
    id,
    rating: draft.rating,
    author: draft.reviewerName,
    title: draft.title,
    content: draft.text,
    createdAt: draft.reviewDate,
    status: draft.status,
  };
}

export const useProductReviews = () => {
  const { data, loading, error, refetch } = useMcQuery<ProductReviewQuery>(
    FETCH_PRODUCT_REVIEWS,
    {
      variables: { limit: 500, offset: 0 },
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    }
  );
  const [updateProduct] = useMcMutation<ProductReviewMutation>(
    UPDATE_PRODUCT_REVIEWS
  );

  const sources = useMemo<ProductReviewSource[]>(() => {
    const values: ProductReviewQuery['products']['results'] =
      data?.products.results ?? [];
    return values.map((product): ProductReviewSource => {
      const masterVariant = product.masterData.current.masterVariant;
      const reviewsValue = masterVariant.attributesRaw.find(
        (attribute) => attribute.name === 'reviews'
      )?.value;
      return {
        id: product.id,
        version: product.version,
        masterVariantId: masterVariant.id,
        reviews: parseReviews(reviewsValue),
      };
    });
  }, [data]);

  const records = useMemo<ReviewRecord[]>(
    () =>
      sources
        .flatMap((source) =>
          source.reviews.map((review) => toRecord(source.id, review))
        )
        .sort(
          (left, right) =>
            Date.parse(right.reviewDate) - Date.parse(left.reviewDate)
        ),
    [sources]
  );

  const persist = async (productId: string, reviews: StoredReview[]) => {
    const source = sources.find((item) => item.id === productId);
    if (!source) throw new Error('The selected product could not be found');

    await updateProduct({
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      variables: {
        id: source.id,
        version: source.version,
        actions: [
          {
            setAttribute: {
              variantId: source.masterVariantId,
              name: 'reviews',
              value: JSON.stringify(reviews),
            },
          },
        ],
      },
    });
    await refetch();
  };

  return {
    records,
    loading,
    error,
    create: async (draft: ReviewDraft) => {
      const source = sources.find((item) => item.id === draft.productId);
      if (!source) throw new Error('The selected product could not be found');
      await persist(draft.productId, [
        ...source.reviews,
        toStoredReview(draft, crypto.randomUUID()),
      ]);
    },
    update: async (record: ReviewRecord, draft: ReviewDraft) => {
      if (record.productId !== draft.productId) {
        throw new Error('A review cannot be moved to a different product');
      }
      const source = sources.find((item) => item.id === record.productId);
      if (!source) throw new Error('The selected product could not be found');
      await persist(
        record.productId,
        source.reviews.map((review) =>
          review.id === record.id ? toStoredReview(draft, record.id) : review
        )
      );
    },
    setStatus: async (record: ReviewRecord, status: ReviewStatus) => {
      const source = sources.find((item) => item.id === record.productId);
      if (!source) throw new Error('The selected product could not be found');
      await persist(
        record.productId,
        source.reviews.map((review) =>
          review.id === record.id ? { ...review, status } : review
        )
      );
    },
    remove: async (record: ReviewRecord) => {
      const source = sources.find((item) => item.id === record.productId);
      if (!source) throw new Error('The selected product could not be found');
      await persist(
        record.productId,
        source.reviews.filter((review) => review.id !== record.id)
      );
    },
  };
};
