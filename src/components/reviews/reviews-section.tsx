'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { StarRating } from './star-rating';
import { ReviewForm } from './review-form';
import { Review } from '@/src/db/schemas';
import { Edit2, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface ReviewStats {
  count: number;
  avgRating: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

interface ReviewsSectionProps {
  recipeId: number;
  userId?: string;
  hasPaidAccess: boolean;
}

export function ReviewsSection({ recipeId, userId, hasPaidAccess }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews/${recipeId}`);
      const data = await response.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setDeletingId(reviewId);
    try {
      const response = await fetch(`/api/reviews/edit/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const userReview = reviews.find((r) => r.userId === userId);
  const canWriteReview = hasPaidAccess && userId && !userReview && !showForm;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const avgRating = stats ? Number(stats.avgRating) : 0;

  return (
    <div className="space-y-8">
      {/* Review Stats */}
      {stats && stats.count > 0 && (
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Average Rating */}
            <div className="flex flex-col items-center md:items-start">
              <div className="text-5xl font-bold text-white mb-2">{avgRating.toFixed(1)}</div>
              <StarRating rating={Math.round(avgRating)} readonly size="lg" />
              <p className="text-sm text-gray-400 mt-2">{stats.count} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[
                { stars: 5, count: stats.fiveStars },
                { stars: 4, count: stats.fourStars },
                { stars: 3, count: stats.threeStars },
                { stars: 2, count: stats.twoStars },
                { stars: 1, count: stats.oneStar },
              ].map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-12">{stars} star</span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: stats.count > 0 ? `${(count / stats.count) * 100}%` : '0%',
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {canWriteReview && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {(showForm || editingReview) && (
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h3 className="text-xl font-semibold text-white mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <ReviewForm
            recipeId={recipeId}
            existingReview={editingReview || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingReview(null);
            }}
          />
        </div>
      )}

      {/* No Reviews Message */}
      {!isLoading && stats && stats.count === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No reviews yet. Be the first to review this recipe!</p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">Reviews</h3>
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {review.userImage && (
                    <div className="relative w-10 h-10">
                      <Image
                        src={review.userImage}
                        alt={review.userName}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">{review.userName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} readonly size="sm" />
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit/Delete Buttons */}
                {review.userId === userId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingReview(review)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      aria-label="Edit review"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      aria-label="Delete review"
                    >
                      {deletingId === review.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Review Text */}
              {review.reviewText && (
                <p className="text-gray-300 leading-relaxed">{review.reviewText}</p>
              )}

              {/* Review Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {review.photos.map((photo, index) => (
                    <div key={index} className="relative w-full h-32">
                      <Image
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
