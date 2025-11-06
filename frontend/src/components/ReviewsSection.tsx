import { useEffect, useState, useRef } from 'react';
import { Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  _id: string;
  author_name: string;
  author_image?: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews?limit=3&sortBy=latest`);
      if (response.ok) {
        const data: Review[] = await response.json();
        setReviews(data);
      } else {
        console.error('Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // width of one card + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-16 bg-black relative">
      <hr className="my-16 border-zinc-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight tracking-widest text-white mb-2">
             CUSTOMER REVIEWS
              </h2>

          <p className="text-zinc-400 tracking-wide">
            Loved by jewelry enthusiasts worldwide
          </p>
          {reviews.length > 0 && (
            <div className="mt-4 flex justify-center items-center gap-2">
              <span className="text-3xl font-light text-white">{averageRating}</span>
              <div className="flex gap-1">
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
              <span className="text-zinc-500 text-sm">({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-zinc-400 py-12">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">No reviews yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-zinc-900 text-white p-2 rounded-full shadow hover:bg-zinc-800 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Reviews Scroll Container */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto no-scrollbar pb-4 scroll-smooth"
            >
              {reviews.map((review, index) => (
                <div
                  key={review._id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 min-w-[280px] sm:min-w-[320px] flex-shrink-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  style={{ animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {review.author_image ? (
                      <img
                        src={review.author_image}
                        alt={review.author_name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white font-semibold text-lg">
                        {review.author_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-medium">{review.author_name}</h3>
                      {review.verified_purchase && (
                        <p className="text-xs text-green-400 tracking-wider">VERIFIED PURCHASE</p>
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

                  <p className="text-zinc-300 text-sm leading-relaxed mb-4 line-clamp-5">
                    {review.review_text}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-zinc-900 text-white p-2 rounded-full shadow hover:bg-zinc-800 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* View All */}
            <div className="flex justify-center mt-6">
              <button
                onClick={onViewAllClick}
                className="group flex items-center space-x-2 px-8 py-3 border border-white text-white hover:bg-white hover:text-black rounded-full transition-all duration-300 font-light tracking-widest"
              >
                <span>VIEW ALL REVIEWS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
          }
          `}</style>
    </section>
  );
}
