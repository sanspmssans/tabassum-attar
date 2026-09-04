'use client';

import { useState, useTransition } from 'react';
import { submitProductReview } from './actions';

export default function ProductReviews({
  productId,
  slug,
  reviews = [],
}: {
  productId: string;
  slug: string;
  reviews: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  return (
    <div className="border-t border-[#232731] pt-12 mt-12 space-y-8">
      {/* Header & Overall Rating */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
            Customer Reviews ({totalReviews})
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex text-amber-400 text-base">
              {'★'.repeat(Math.round(Number(averageRating)))}
              {'☆'.repeat(5 - Math.round(Number(averageRating)))}
            </div>
            <span className="text-xs font-bold text-[#d9b444]">{averageRating} out of 5</span>
            <span className="text-xs text-gray-500">• Based on verified purchases</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setIsSubmitted(false);
          }}
          className="bg-[#14161d] hover:bg-[#1a1e27] border border-[#c69e2a]/40 text-[#d9b444] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          {showForm ? 'Close Review Form' : '✍️ Write a Review'}
        </button>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
            Share Your Experience
          </h3>

          {isSubmitted ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-emerald-400 text-xs text-center font-medium">
              ✨ Thank you! Your review has been submitted successfully.
            </div>
          ) : (
            <form
              action={(formData) => {
                startTransition(async () => {
                  await submitProductReview(formData);
                  setIsSubmitted(true);
                  setShowForm(false);
                });
              }}
              className="space-y-4 text-xs"
            >
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="rating" value={rating} />

              {/* Star Rating Select */}
              <div>
                <label className="block text-gray-400 uppercase font-semibold mb-1.5">
                  Overall Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-125 cursor-pointer ${
                        star <= rating ? 'text-amber-400' : 'text-gray-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs text-gray-400 ml-2 self-center font-semibold">
                    {rating === 5 ? 'Exceptional' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : 'Below Average'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase font-semibold mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Suhail K."
                    className="w-full bg-[#0b0c10] border border-[#232731] rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:border-[#d9b444] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase font-semibold mb-1">
                    Headline / Summary
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Long-lasting & rich aroma!"
                    className="w-full bg-[#0b0c10] border border-[#232731] rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:border-[#d9b444] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase font-semibold mb-1">
                  Detailed Feedback *
                </label>
                <textarea
                  name="comment"
                  required
                  rows={3}
                  placeholder="How was the projection, longevity, and overall smell?"
                  className="w-full bg-[#0b0c10] border border-[#232731] rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:border-[#d9b444] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="bg-[#c69e2a] hover:bg-[#d9b444] disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow"
              >
                {isPending ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => {
            const author = rev.customer?.user?.name || 'Verified Customer';
            const dateStr = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Recent';

            return (
              <div
                key={rev.id}
                className="bg-[#14161d] border border-[#232731] rounded-2xl p-5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white text-xs block">{author}</span>
                    <span className="text-[10px] text-emerald-400 font-medium">✓ Verified Buyer</span>
                  </div>
                  <span className="text-[10px] text-gray-500">{dateStr}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-amber-400 text-xs">
                    {'★'.repeat(Number(rev.rating || 5))}
                    {'☆'.repeat(5 - Number(rev.rating || 5))}
                  </div>
                  {rev.title && (
                    <span className="text-xs font-bold text-gray-200">{rev.title}</span>
                  )}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed pt-1">
                  {rev.comment}
                </p>
              </div>
            );
          })
        ) : (
          <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-8 text-center text-gray-500 text-xs space-y-1">
            <p className="text-gray-400 font-medium">No customer reviews yet.</p>
            <p className="text-[11px]">Be the first to review this fragrance!</p>
          </div>
        )}
      </div>
    </div>
  );
}