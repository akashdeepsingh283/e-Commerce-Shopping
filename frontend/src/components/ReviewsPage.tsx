// ReviewsPage.tsx (Enhanced with backend + frontend data merging)
import { useEffect, useState } from 'react';
import { Star, Heart, MessageCircle, Instagram, Tv2, Youtube, Play } from 'lucide-react';
import { localReviews, localSocialPosts } from '../data/reviewsAndSocialPosts';


interface Review {
  _id: string;
  product_id?: string;
  author_name: string;
  author_email: string;
  author_image?: string;
  rating: number;
  review_text: string;
  verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  image_url?: string;
}

interface SocialPost {
  _id: string;
  platform: string;
  post_type: string;
  embed_url: string;
  embed_code: string;
  caption: string;
  media_url: string;
  likes: number;
  comments: number;
  is_active: boolean;
  display_order: number;
}

interface ReviewsPageProps {
  onBack: () => void;
}

export default function ReviewsPage({ onBack }: ReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'social'>('reviews');
  const [sortBy, setSortBy] = useState<'latest' | 'highest' | 'lowest'>('latest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    rating: 5,
    review_text: '',
    image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Fetch and merge reviews from both backend and frontend
  const fetchAndMergeReviews = async () => {
    try {
      setLoading(true);
      let backendReviews: Review[] = [];
      
      // Try to fetch from backend
      try {
        const response = await fetch(`http://localhost:5001/api/reviews?sortBy=${sortBy}`);
        if (response.ok) {
          const data = await response.json();
          backendReviews = data.filter((r: Review) => r.is_approved);
        }
      } catch (error) {
        console.log('Backend not available, using local data only');
      }

      // Merge backend and local reviews (remove duplicates by _id)
      const mergedReviews = [...localReviews];
      backendReviews.forEach(backendReview => {
        if (!mergedReviews.some(r => r._id === backendReview._id)) {
          mergedReviews.push(backendReview);
        }
      });

      // Apply sorting
      let sortedReviews = [...mergedReviews];
      if (sortBy === 'highest') {
        sortedReviews.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'lowest') {
        sortedReviews.sort((a, b) => a.rating - b.rating);
      } else {
        sortedReviews.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      setReviews(sortedReviews);
    } catch (error) {
      console.error('Error merging reviews:', error);
      setReviews(localReviews);
    } finally {
      setLoading(false);
    }
  };

  // Fetch and merge social posts from both backend and frontend
  const fetchAndMergeSocialPosts = async () => {
    try {
      let backendPosts: SocialPost[] = [];
      
      // Try to fetch from backend
      try {
        const response = await fetch('http://localhost:5001/api/social-posts');
        if (response.ok) {
          const data = await response.json();
          backendPosts = data.filter((p: SocialPost) => p.is_active);
        }
      } catch (error) {
        console.log('Backend not available for social posts, using local data only');
      }

      // Merge backend and local social posts (remove duplicates by _id)
      const mergedPosts = [...localSocialPosts];
      backendPosts.forEach(backendPost => {
        if (!mergedPosts.some(p => p._id === backendPost._id)) {
          mergedPosts.push(backendPost);
        }
      });

      // Sort by display_order
      mergedPosts.sort((a, b) => a.display_order - b.display_order);

      setSocialPosts(mergedPosts);
    } catch (error) {
      console.error('Error merging social posts:', error);
      setSocialPosts(localSocialPosts);
    }
  };

  useEffect(() => {
    fetchAndMergeReviews();
    fetchAndMergeSocialPosts();
    window.scrollTo(0, 0);
  }, [sortBy]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitMessage('Thank you! Your review has been submitted and is pending approval.');
        setFormData({
          author_name: '',
          author_email: '',
          rating: 5,
          review_text: '',
          image_url: '',
        });
        setShowReviewForm(false);
        // Refresh reviews after submission
        fetchAndMergeReviews();
        setTimeout(() => setSubmitMessage(''), 5000);
      } else {
        setSubmitMessage('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitMessage('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'tiktok':
        return <Tv2 className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const renderSocialEmbed = (post: SocialPost) => {
    // For Instagram Reels and TikTok videos
    if (post.post_type === 'reel' || post.post_type === 'video') {
      return (
        <div key={post._id} className="bg-zinc-950 border border-zinc-800 overflow-hidden">
          {post.embed_url ? (
            <div className="aspect-[9/16] relative ">
              <iframe
                width="100%"
                height="100%"
                src={post.embed_url}
                title={post.caption}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : post.media_url ? (
            <div className="aspect-[9/16] relative group cursor-pointer">
              <img
                src={post.media_url}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-16 h-16 text-white" />
              </div>
            </div>
          ) : null}
          <div className="p-4">
            <p className="text-white text-sm mb-3 line-clamp-2">
              {post.caption}
            </p>
            <div className="flex items-center space-x-4 text-zinc-500 text-sm">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{post.likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For Instagram images
    if (post.platform.toLowerCase() === 'instagram' && post.post_type === 'image') {
      return (
        <div key={post._id} className="bg-zinc-950 border border-zinc-800 overflow-hidden">
          {post.media_url && (
            <div className="aspect-square">
              <img
                src={post.media_url}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <p className="text-white text-sm mb-3 line-clamp-2">
              {post.caption}
            </p>
            <div className="flex items-center space-x-4 text-zinc-500 text-sm">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{post.likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For YouTube videos
    if (post.platform.toLowerCase() === 'youtube') {
      return (
        <div key={post._id} className="bg-zinc-950 border border-zinc-800 overflow-hidden">
          {post.embed_url && (
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={post.embed_url}
                title={post.caption}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
          <div className="p-4">
            <p className="text-white text-sm mb-3 line-clamp-2">
              {post.caption}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0';

  return (
    <div className="min-h-screen bg-black px-4 py-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 animate-fade-in">
          <button
            onClick={onBack}
            className="text-zinc-400 hover:text-white transition-colors mb-6 tracking-wider"
          >
            ← BACK TO HOME
          </button>
          <h1 className="text-5xl font-light tracking-widest text-white mb-4">
            CUSTOMER LOVE
          </h1>
          <p className="text-zinc-400 text-lg tracking-wide">
            Discover what our customers are saying about products.
          </p>
        </div>

        {submitMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500 text-green-400 rounded">
            {submitMessage}
          </div>
        )}

        <div className="flex gap-6 mb-12 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 tracking-wider transition-colors ${
              activeTab === 'reviews'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            REVIEWS ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`pb-4 tracking-wider transition-colors ${
              activeTab === 'social'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            SOCIAL MEDIA ({socialPosts.length})
          </button>
        </div>

        {activeTab === 'reviews' && (
          <div>
            {reviews.length > 0 && (
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="bg-zinc-950 border border-zinc-800 p-8 text-center">
                  <div className="text-5xl font-light text-white mb-2">
                    {averageRating}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
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
                  <p className="text-zinc-500 text-sm">Out of 5 stars</p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-8">
                  <div className="text-3xl font-light text-white mb-2">
                    {reviews.length}
                  </div>
                  <p className="text-zinc-400">
                    {reviews.length === 1 ? 'Review' : 'Reviews'}
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-8">
                  <div className="text-3xl font-light text-white mb-2">
                    {reviews.filter((r) => r.verified_purchase).length}
                  </div>
                  <p className="text-zinc-400">Verified Purchases</p>
                </div>
              </div>
            )}

            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <p className="text-zinc-400">Sort by:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`px-4 py-2 tracking-wider transition-colors ${
                      sortBy === 'latest'
                        ? 'bg-white text-black'
                        : 'bg-zinc-950 border border-zinc-800 text-white hover:border-white'
                    }`}
                  >
                    LATEST
                  </button>
                  <button
                    onClick={() => setSortBy('highest')}
                    className={`px-4 py-2 tracking-wider transition-colors ${
                      sortBy === 'highest'
                        ? 'bg-white text-black'
                        : 'bg-zinc-950 border border-zinc-800 text-white hover:border-white'
                    }`}
                  >
                    HIGHEST RATED
                  </button>
                  <button
                    onClick={() => setSortBy('lowest')}
                    className={`px-4 py-2 tracking-wider transition-colors ${
                      sortBy === 'lowest'
                        ? 'bg-white text-black'
                        : 'bg-zinc-950 border border-zinc-800 text-white hover:border-white'
                    }`}
                  >
                    LOWEST RATED
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-6 py-2 bg-white text-black tracking-wider hover:bg-zinc-200 transition-colors"
              >
                {showReviewForm ? 'CANCEL' : 'WRITE A REVIEW'}
              </button>
            </div>

            {showReviewForm && (
              <div className="mb-12 bg-zinc-950 border border-zinc-800 p-8">
                <h2 className="text-2xl font-light tracking-wider text-white mb-6">
                  WRITE YOUR REVIEW
                </h2>
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <label className="block text-zinc-400 mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.author_name}
                      onChange={(e) =>
                        setFormData({ ...formData, author_name: e.target.value })
                      }
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-2">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.author_email}
                      onChange={(e) =>
                        setFormData({ ...formData, author_email: e.target.value })
                      }
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-2">Rating *</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              rating <= formData.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-zinc-700'
                            } hover:text-yellow-400 transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-2">Your Review *</label>
                    <textarea
                      required
                      value={formData.review_text}
                      onChange={(e) =>
                        setFormData({ ...formData, review_text: e.target.value })
                      }
                      rows={4}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-2">
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <p className="text-xs text-zinc-600 mt-1">
                      Add a photo to your review (optional)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-white text-black tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                  </button>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center text-zinc-400 py-12">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-lg">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review, index) => (
                  <div
                    key={review._id}
                    className="bg-zinc-950 border border-zinc-800 p-6 hover:border-zinc-600 transition-all"
                    style={{
                      animation: `fade-in-up 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      {review.author_image ? (
                        <img
                          src={review.author_image}
                          alt={review.author_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                          <span className="text-white text-lg">
                            {review.author_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
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

                    <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                      {review.review_text}
                    </p>

                    {review.image_url && (
                      <div className="mb-3 overflow-hidden rounded border border-zinc-800">
                        <img
                          src={review.image_url}
                          alt={`Review by ${review.author_name}`}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

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
            )}
          </div>
        )}

        {activeTab === 'social' && (
          <div>
            {socialPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-lg">
                  No social media posts yet
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {socialPosts.map((post, index) => (
                  <div
                    key={post._id}
                    className="relative overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all"
                    style={{
                      animation: `fade-in-up 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-sm border border-zinc-700 rounded-full p-2 flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="text-white text-xs font-medium tracking-wider pr-2">
                        {post.platform.toUpperCase()}
                      </span>
                    </div>

                    {renderSocialEmbed(post)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}