import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Heart, MessageCircle, Instagram, Tv2, Youtube } from 'lucide-react';

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

interface SocialPost {
  id: string;
  platform: string;
  post_type: string;
  embed_url: string;
  embed_code: string;
  caption: string;
  media_url: string;
  likes: number;
  comments: number;
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

  useEffect(() => {
    fetchReviews();
    fetchSocialPosts();
    window.scrollTo(0, 0);
  }, []);

  const fetchReviews = async () => {
    let query = supabase
      .from('reviews')
      .select('*');

    if (sortBy === 'highest') {
      query = query.order('rating', { ascending: false });
    } else if (sortBy === 'lowest') {
      query = query.order('rating', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const fetchSocialPosts = async () => {
    const { data, error } = await supabase
      .from('social_media_posts')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setSocialPosts(data);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sortBy]);

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
    if (post.platform.toLowerCase() === 'instagram') {
      return (
        <div key={post.id} className="bg-zinc-950 border border-zinc-800 overflow-hidden">
          {post.embed_code ? (
            <div
              className="instagram-embed"
              dangerouslySetInnerHTML={{ __html: post.embed_code }}
            />
          ) : post.media_url ? (
            <div className="aspect-square">
              <img
                src={post.media_url}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
          <div className="p-4">
            <p className="text-white text-sm mb-3 line-clamp-2">
              {post.caption}
            </p>
            <div className="flex items-center space-x-4 text-zinc-500 text-sm">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{post.likes}</span>
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

    if (post.platform.toLowerCase() === 'tiktok') {
      return (
        <div key={post.id} className="bg-zinc-950 border border-zinc-800 overflow-hidden">
          {post.embed_code ? (
            <div dangerouslySetInnerHTML={{ __html: post.embed_code }} />
          ) : post.media_url ? (
            <div className="aspect-video">
              <video
                src={post.media_url}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
          <div className="p-4">
            <p className="text-white text-sm mb-3 line-clamp-2">
              {post.caption}
            </p>
          </div>
        </div>
      );
    }

    if (post.platform.toLowerCase() === 'youtube') {
      return (
        <div key={post.id} className="bg-zinc-950 border border-zinc-800 overflow-hidden">
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
      : 0;

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
          <h1 className="text-6xl font-light tracking-widest text-white mb-4">
            CUSTOMER LOVE
          </h1>
          <p className="text-zinc-400 text-lg tracking-wide">
            Discover what our customers are saying about Sai Naman products and their experiences.
          </p>
        </div>

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

            <div className="mb-8 flex items-center justify-between">
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

            {loading ? (
              <div className="text-center text-zinc-400 py-12">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-lg">No reviews yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review, index) => (
                  <div
                    key={review.id}
                    className="bg-zinc-950 border border-zinc-800 p-6 hover:border-zinc-600 transition-all"
                    style={{
                      animation: `fade-in-up 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      {review.author_image && (
                        <img
                          src={review.author_image}
                          alt={review.author_name}
                          className="w-12 h-12 rounded-full object-cover"
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

                    <p className="text-zinc-300 text-sm leading-relaxed mb-3">
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
            )}
          </div>
        )}

        {/* Social Media Tab */}
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
                    key={post.id}
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
    </div>
  );
}
