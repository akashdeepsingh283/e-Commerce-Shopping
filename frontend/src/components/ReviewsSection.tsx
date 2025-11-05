import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, ArrowRight } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  author_name: string;
  author_image: string;
  rating: number;
  review_text: string;
  verified_purchase: boolean;
  created_at: string;
}

interface ReviewsSectionProps {
  onViewAllClick: () => void;
}

export default function ReviewsSection({ onViewAllClick }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-5xl font-light tracking-widest text-white mb-4">
              CUSTOMER REVIEWS
            </h2>
            <p className="text-zinc-400 tracking-wide">
              Loved by jewelry enthusiasts worldwide
            </p>
          </div>
          {reviews.length > 0 && (
            <div className="hidden sm:block text-right">
              <div className="text-4xl font-light text-white mb-2">
                {averageRating}
              </div>
              <div className="flex items-center justify-end gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(Number(averageRating))
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-zinc-500 text-sm">Based on {reviews.length} reviews</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-zinc-400 py-12">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">No reviews yet</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className="bg-zinc-950 border border-zinc-800 p-8 hover:border-zinc-600 transition-all"
                  style={{
                    animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {review.author_image && (
                      <img
                        src={review.author_image}
                        alt={review.author_name}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-light mb-1">
                        {review.author_name}
                      </h3>
                      {review.verified_purchase && (
                        <p className="text-xs text-green-400 tracking-wider">
                          VERIFIED PURCHASE
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed mb-4 line-clamp-4">
                    {review.review_text}
                  </p>

                  <p className="text-xs text-zinc-600">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={onViewAllClick}
                className="group flex items-center space-x-2 px-8 py-4 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 tracking-widest font-light"
              >
                <span>VIEW ALL REVIEWS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
