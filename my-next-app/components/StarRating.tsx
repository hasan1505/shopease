'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  numReviews?: number;
  size?: 'sm' | 'md';
}

export default function StarRating({ rating, numReviews, size = 'sm' }: StarRatingProps) {
  const starSize = size === 'sm' ? 14 : 18;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={starSize}
            className={
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-200'
            }
          />
        ))}
      </div>
      {numReviews !== undefined && (
        <span className="text-xs text-slate-500">
          {rating.toFixed(1)} ({numReviews.toLocaleString()})
        </span>
      )}
    </div>
  );
}
