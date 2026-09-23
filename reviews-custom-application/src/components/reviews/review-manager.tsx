import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { FormModalPage } from '@commercetools-frontend/application-components';
import { ApplicationPageTitle } from '@commercetools-frontend/application-shell';
import Constraints from '@commercetools-uikit/constraints';
import DataTable from '@commercetools-uikit/data-table';
import FlatButton from '@commercetools-uikit/flat-button';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SelectField from '@commercetools-uikit/select-field';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import { ContentNotification } from '@commercetools-uikit/notifications';
import {
  REVIEW_STATUSES,
  type ReviewDraft,
  type ReviewRecord,
  type ReviewStatus,
} from '../../types';
import { useProductReviews } from '../../hooks/use-product-reviews';

const columns = [
  { key: 'reviewerName', label: 'Reviewer' },
  { key: 'productId', label: 'Product ID' },
  { key: 'rating', label: 'Rating' },
  { key: 'title', label: 'Title' },
  { key: 'reviewDate', label: 'Review date' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

const statusOptions = [
  { value: '', label: 'All statuses' },
  ...REVIEW_STATUSES.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  })),
];

const emptyDraft = (): ReviewDraft => ({
  productId: '',
  rating: 5,
  title: '',
  text: '',
  reviewDate: new Date().toISOString(),
  reviewerName: '',
  status: 'pending',
});

const toDateTimeLocal = (date: string) => date.slice(0, 16);

const ReviewEditor = ({
  review,
  onClose,
  onSave,
}: {
  review?: ReviewRecord;
  onClose: () => void;
  onSave: (draft: ReviewDraft) => Promise<void>;
}) => {
  const formik = useFormik<ReviewDraft>({
    initialValues: review ? { ...review } : emptyDraft(),
    enableReinitialize: true,
    validate: (values) => {
      const errors: Partial<Record<keyof ReviewDraft, string>> = {};
      if (!values.productId.trim()) errors.productId = 'Product ID is required';
      if (
        !Number.isInteger(values.rating) ||
        values.rating < 1 ||
        values.rating > 5
      ) {
        errors.rating = 'Rating must be an integer from 1 to 5';
      }
      if (!values.title.trim()) errors.title = 'Review title is required';
      if (!values.text.trim()) errors.text = 'Review text is required';
      if (!values.reviewerName.trim()) {
        errors.reviewerName = 'Reviewer name is required';
      }
      if (!values.reviewDate || Number.isNaN(Date.parse(values.reviewDate))) {
        errors.reviewDate = 'A valid ISO 8601 review date is required';
      }
      return errors;
    },
    onSubmit: async (values) => {
      await onSave({
        ...values,
        productId: values.productId.trim(),
        title: values.title.trim(),
        text: values.text.trim(),
        reviewerName: values.reviewerName.trim(),
        reviewDate: new Date(values.reviewDate).toISOString(),
      });
    },
  });

  return (
    <FormModalPage
      title={review ? 'Edit review' : 'Create review'}
      isOpen
      onClose={onClose}
      onPrimaryButtonClick={formik.submitForm}
      onSecondaryButtonClick={onClose}
      isPrimaryButtonDisabled={!formik.isValid || formik.isSubmitting}
      labelPrimaryButton={review ? 'Save review' : 'Create review'}
      labelSecondaryButton="Cancel"
    >
      <Spacings.Stack scale="l">
        <TextField
          name="productId"
          title="Product ID"
          value={formik.values.productId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errors={TextField.toFieldErrors<ReviewDraft>(formik.errors).productId}
          touched={formik.touched.productId}
          isRequired
        />
        <TextField
          name="reviewerName"
          title="Reviewer name"
          value={formik.values.reviewerName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errors={
            TextField.toFieldErrors<ReviewDraft>(formik.errors).reviewerName
          }
          touched={formik.touched.reviewerName}
          isRequired
        />
        <TextField
          name="rating"
          title="Rating (1–5)"
          value={String(formik.values.rating)}
          onChange={(event) =>
            formik.setFieldValue('rating', Number(event.target.value))
          }
          onBlur={formik.handleBlur}
          errors={TextField.toFieldErrors<ReviewDraft>(formik.errors).rating}
          touched={formik.touched.rating}
          isRequired
        />
        <TextField
          name="title"
          title="Review title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errors={TextField.toFieldErrors<ReviewDraft>(formik.errors).title}
          touched={formik.touched.title}
          isRequired
        />
        <TextField
          name="text"
          title="Review text"
          value={formik.values.text}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errors={TextField.toFieldErrors<ReviewDraft>(formik.errors).text}
          touched={formik.touched.text}
          isRequired
        />
        <TextField
          name="reviewDate"
          title="Review date (ISO 8601)"
          value={toDateTimeLocal(formik.values.reviewDate)}
          onChange={(event) =>
            formik.setFieldValue(
              'reviewDate',
              new Date(event.target.value).toISOString()
            )
          }
          onBlur={formik.handleBlur}
          errors={
            TextField.toFieldErrors<ReviewDraft>(formik.errors).reviewDate
          }
          touched={formik.touched.reviewDate}
          isRequired
        />
        <SelectField
          name="status"
          title="Status"
          value={formik.values.status}
          options={statusOptions.slice(1)}
          onChange={(event) =>
            formik.setFieldValue('status', event.target.value)
          }
          isRequired
        />
      </Spacings.Stack>
    </FormModalPage>
  );
};

const ReviewManager = () => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | undefined>();
  const [editingReview, setEditingReview] = useState<
    ReviewRecord | null | undefined
  >(undefined);
  const [operationError, setOperationError] = useState<string | null>(null);
  const {
    records,
    loading: isLoading,
    error,
    create,
    update,
    setStatus,
    remove,
  } = useProductReviews();

  useEffect(() => {
    setReviews(
      records.filter(
        (review) => !statusFilter || review.status === statusFilter
      )
    );
  }, [records, statusFilter]);

  const saveReview = async (draft: ReviewDraft) => {
    setOperationError(null);
    try {
      if (editingReview) {
        await update(editingReview, draft);
      } else {
        await create(draft);
      }
      setEditingReview(undefined);
    } catch (saveError) {
      setOperationError(
        saveError instanceof Error ? saveError.message : 'Unable to save review'
      );
    }
  };

  const changeStatus = async (review: ReviewRecord, status: ReviewStatus) => {
    setOperationError(null);
    try {
      await setStatus(review, status);
    } catch (statusError) {
      setOperationError(
        statusError instanceof Error
          ? statusError.message
          : 'Unable to update review status'
      );
    }
  };

  const deleteReview = async (review: ReviewRecord) => {
    if (!window.confirm('Delete this review permanently?')) return;
    setOperationError(null);
    try {
      await remove(review);
    } catch (deleteError) {
      setOperationError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete review'
      );
    }
  };

  return (
    <>
      <ApplicationPageTitle additionalParts={['Reviews']} />
      <Spacings.Stack scale="xl">
        <Spacings.Inline alignItems="center" justifyContent="space-between">
          <Spacings.Stack scale="xs">
            <Text.Headline as="h1">Reviews</Text.Headline>
            <Text.Body>
              Manage product reviews before they are published.
            </Text.Body>
          </Spacings.Stack>
          <PrimaryButton
            label="Create review"
            onClick={() => setEditingReview(null)}
          />
        </Spacings.Inline>
        <Constraints.Horizontal max={13}>
          <SelectField
            name="status-filter"
            title="Filter by status"
            value={statusFilter ?? ''}
            options={statusOptions}
            onChange={(event) =>
              setStatusFilter(
                (event.target.value || undefined) as ReviewStatus | undefined
              )
            }
            horizontalConstraint={5}
          />
        </Constraints.Horizontal>
        {error && (
          <ContentNotification type="error">
            <Text.Body>
              Unable to load product reviews. Please refresh and try again.
            </Text.Body>
          </ContentNotification>
        )}
        {operationError && (
          <ContentNotification type="error">
            <Text.Body>{operationError}</Text.Body>
          </ContentNotification>
        )}
        {isLoading ? (
          <Text.Body>Loading reviews…</Text.Body>
        ) : (
          <DataTable<ReviewRecord>
            isCondensed
            columns={columns}
            rows={reviews}
            itemRenderer={(review, column) => {
              switch (column.key) {
                case 'reviewerName':
                case 'productId':
                case 'title':
                case 'status':
                  return review[column.key];
                case 'rating':
                  return `${review.rating} / 5`;
                case 'reviewDate':
                  return new Date(review.reviewDate).toLocaleDateString();
                case 'actions':
                  return (
                    <Spacings.Inline scale="s">
                      <FlatButton
                        label="Edit"
                        onClick={() => setEditingReview(review)}
                      />
                      {review.status !== 'approved' && (
                        <FlatButton
                          label="Approve"
                          onClick={() => void changeStatus(review, 'approved')}
                        />
                      )}
                      {review.status !== 'rejected' && (
                        <FlatButton
                          label="Reject"
                          onClick={() => void changeStatus(review, 'rejected')}
                        />
                      )}
                      <FlatButton
                        label="Delete"
                        onClick={() => void deleteReview(review)}
                      />
                    </Spacings.Inline>
                  );
                default:
                  return null;
              }
            }}
          />
        )}
      </Spacings.Stack>
      {editingReview !== undefined && (
        <ReviewEditor
          review={editingReview ?? undefined}
          onClose={() => setEditingReview(undefined)}
          onSave={saveReview}
        />
      )}
    </>
  );
};

ReviewManager.displayName = 'ReviewManager';

export default ReviewManager;
