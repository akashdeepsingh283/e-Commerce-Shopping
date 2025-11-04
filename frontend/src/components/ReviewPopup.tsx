import { X, Star } from "lucide-react";
import { useState } from "react";

interface ReviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewPopup({ isOpen, onClose }: ReviewPopupProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    review_text: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!rating) {
      setMessage("Please select a rating ⭐");
      return;
    }

    if (!formData.author_name || !formData.author_email || !formData.review_text) {
      setMessage("Please fill in all fields");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author_name: formData.author_name,
          author_email: formData.author_email,
          rating: rating,
          review_text: formData.review_text.trim(),
        }),
      });

      if (response.ok) {
        setMessage('✅ Thank you! Your review has been submitted and is pending approval.');
        setTimeout(() => {
          setFormData({ author_name: '', author_email: '', review_text: '' });
          setRating(0);
          onClose();
        }, 2000);
      } else {
        setMessage('❌ Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage('❌ An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl w-full max-w-md animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white tracking-wider">Leave a Review</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 text-sm ${
            message.includes('✅') 
              ? 'bg-green-900/20 border border-green-900 text-green-400' 
              : 'bg-red-900/20 border border-red-900 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Stars */}
        <div className="mb-4">
          <label className="block text-zinc-400 text-sm mb-2">Your Rating *</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`w-8 h-8 cursor-pointer transition-all ${
                  (hoverRating || rating) >= star 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-zinc-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-zinc-400 text-sm mb-2">Your Name *</label>
          <input
            type="text"
            value={formData.author_name}
            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 tracking-wide placeholder:text-zinc-500"
            placeholder="Your Name"
            required
          />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-zinc-400 text-sm mb-2">Your Email *</label>
          <input
            type="email"
            value={formData.author_email}
            onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 tracking-wide placeholder:text-zinc-500"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Review Text */}
        <div className="mb-4">
          <label className="block text-zinc-400 text-sm mb-2">Your Review *</label>
          <textarea
            className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 h-28 tracking-wide placeholder:text-zinc-500 resize-none"
            placeholder="Share your experience with our products..."
            value={formData.review_text}
            onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-600 text-zinc-400 hover:text-white hover:border-white transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>

      </div>
    </div>
  );
}