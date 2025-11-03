// AdminReviewApproval.tsx - Fixed counts issue
import { useEffect, useState } from 'react';
import { Star, Check, X, Eye, Trash2, RefreshCw } from 'lucide-react';

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
  createdAt: string;
}

interface AdminReviewApprovalProps {
  onClose: () => void;
}

export default function AdminReviewApproval({ onClose }: AdminReviewApprovalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]); // Store all reviews for counts
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/reviews?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
        
        // If we're fetching all reviews, update the allReviews state
        if (filter === 'all') {
          setAllReviews(data);
        } else if (allReviews.length === 0) {
          // If allReviews is empty, fetch all reviews separately for counts
          const allResponse = await fetch(`${API_URL}/api/admin/reviews?filter=all`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (allResponse.ok) {
            const allData = await allResponse.json();
            setAllReviews(allData);
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to fetch reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    setProcessingIds(prev => new Set(prev).add(reviewId));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update both reviews and allReviews
        setReviews(prev => prev.map(review => 
          review._id === reviewId ? { ...review, is_approved: true } : review
        ));
        setAllReviews(prev => prev.map(review => 
          review._id === reviewId ? { ...review, is_approved: true } : review
        ));
        
        if (filter === 'pending') {
          setReviews(prev => prev.filter(review => review._id !== reviewId));
        }
        
        const reviewName = reviews.find(r => r._id === reviewId)?.author_name;
        alert(` Review from ${reviewName} approved successfully!`);
      } else {
        const errorData = await response.json();
        alert(` Failed to approve review: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert(' Error approving review. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm('Are you sure you want to reject this review? It will remain in the system but won\'t be shown publicly.')) {
      return;
    }

    setProcessingIds(prev => new Set(prev).add(reviewId));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/reviews/${reviewId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update both reviews and allReviews
        setReviews(prev => prev.map(review => 
          review._id === reviewId ? { ...review, is_approved: false } : review
        ));
        setAllReviews(prev => prev.map(review => 
          review._id === reviewId ? { ...review, is_approved: false } : review
        ));
        
        if (filter === 'pending') {
          setReviews(prev => prev.filter(review => review._id !== reviewId));
        }
        
        alert(' Review rejected successfully!');
      } else {
        const errorData = await response.json();
        alert(` Failed to reject review: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert(' Error rejecting review. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this review? This action cannot be undone.')) {
      return;
    }

    setProcessingIds(prev => new Set(prev).add(reviewId));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        setAllReviews(prev => prev.filter(review => review._id !== reviewId));
        alert(' Review deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(` Failed to delete review: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(' Error deleting review. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  // Calculate counts from allReviews instead of filtered reviews
  const totalCount = allReviews.length;
  const pendingCount = allReviews.filter(r => !r.is_approved).length;
  const approvedCount = allReviews.filter(r => r.is_approved).length;

  return (
    <div className="min-h-screen bg-black py-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors mb-6 tracking-wider"
          >
            ← BACK TO HOME
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-light tracking-widest text-white mb-4">
                REVIEW MANAGEMENT
              </h1>
              <p className="text-zinc-400 text-lg tracking-wide">
                Approve, reject, or delete customer reviews.
              </p>
            </div>
            <button
              onClick={fetchReviews}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white border border-zinc-800 hover:border-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900 text-red-400">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="text-3xl font-light text-white mb-2">
              {totalCount}
            </div>
            <p className="text-zinc-400">Total Reviews</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="text-3xl font-light text-yellow-400 mb-2">
              {pendingCount}
            </div>
            <p className="text-zinc-400">Pending Approval</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="text-3xl font-light text-green-400 mb-2">
              {approvedCount}
            </div>
            <p className="text-zinc-400">Approved</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setFilter('pending')}
            className={`pb-4 tracking-wider transition-colors ${
              filter === 'pending'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            PENDING ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`pb-4 tracking-wider transition-colors ${
              filter === 'approved'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            APPROVED ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`pb-4 tracking-wider transition-colors ${
              filter === 'all'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ALL ({totalCount})
          </button>
        </div>

        {loading ? (
          <div className="text-center text-zinc-400 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4"></div>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">
              {filter === 'pending' ? 'No pending reviews' : 
               filter === 'approved' ? 'No approved reviews' : 'No reviews yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className={`bg-zinc-950 border p-6 transition-all ${
                  review.is_approved 
                    ? 'border-green-900/50' 
                    : 'border-yellow-900/50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
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
                    <div>
                      <h3 className="text-white font-light text-lg mb-1">
                        {review.author_name}
                      </h3>
                      <p className="text-zinc-500 text-sm mb-2">
                        {review.author_email}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
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
                        {review.verified_purchase && (
                          <span className="text-xs text-green-400 tracking-wider">
                            VERIFIED PURCHASE
                          </span>
                        )}
                        <span className={`text-xs tracking-wider ${
                          review.is_approved ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {review.is_approved ? 'APPROVED' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-zinc-300 leading-relaxed">
                    {review.review_text}
                  </p>
                </div>

                <div className="flex gap-3">
                  {!review.is_approved && (
                    <button
                      onClick={() => handleApprove(review._id)}
                      disabled={processingIds.has(review._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  
                  {review.is_approved && (
                    <button
                      onClick={() => handleReject(review._id)}
                      disabled={processingIds.has(review._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      Unapprove
                    </button>
                  )}

                  {!review.is_approved && (
                    <button
                      onClick={() => handleReject(review._id)}
                      disabled={processingIds.has(review._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(review._id)}
                    disabled={processingIds.has(review._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}