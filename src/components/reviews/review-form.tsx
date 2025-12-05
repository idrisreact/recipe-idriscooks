'use client';

import { useState } from 'react';
import Image from 'next/image';
import { StarRating } from './star-rating';
import { Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Review } from '@/src/db/schemas';

interface ReviewFormProps {
  recipeId: number;
  existingReview?: Review;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ recipeId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [photos, setPhotos] = useState<string[]>(existingReview?.photos || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const photoArray = photos.filter((p) => p.trim() !== '');

      const url = existingReview ? `/api/reviews/edit/${existingReview.id}` : '/api/reviews';

      const method = existingReview ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId,
          rating,
          reviewText: reviewText.trim() || null,
          photos: photoArray.length > 0 ? photoArray : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      toast.success(existingReview ? 'Review updated!' : 'Review submitted!');
      onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPhoto = () => {
    if (photoUrls.trim()) {
      const urls = photoUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url !== '');
      setPhotos([...photos, ...urls]);
      setPhotoUrls('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-sm text-gray-400 mt-1">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <label htmlFor="reviewText" className="block text-sm font-medium text-gray-200 mb-2">
          Your Review
        </label>
        <textarea
          id="reviewText"
          rows={4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this recipe... What did you love? Any tips or modifications?"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 mt-1">{reviewText.length}/1000 characters</p>
      </div>

      {/* Photo URLs */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          <Upload className="inline-block w-4 h-4 mr-1" />
          Add Photos (Optional)
        </label>
        <div className="space-y-2">
          <textarea
            rows={2}
            value={photoUrls}
            onChange={(e) => setPhotoUrls(e.target.value)}
            placeholder="Paste image URLs (one per line)"
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none text-sm"
          />
          <button
            type="button"
            onClick={handleAddPhoto}
            disabled={!photoUrls.trim()}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Add Photos
          </button>
        </div>

        {/* Photo Preview */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group h-24">
                <Image
                  src={photo}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex-1 px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {existingReview ? 'Update Review' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
