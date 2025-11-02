import { X, Star } from "lucide-react";
import { useState } from "react";

interface ReviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

export default function ReviewPopup({ isOpen, onClose, onSubmit}: ReviewPopupProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!rating) return alert("Please select a rating ⭐");

    onSubmit(rating, review.trim());
    setReview("");
    setRating(0);
    onClose();
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

        {/* Stars */}
        <div className="flex gap-1 mb-4">
          {[1,2,3,4,5].map((star) => (
            <Star
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`w-8 h-8 cursor-pointer transition-all ${
                (hoverRating || rating) >= star ? "text-yellow-400" : "text-zinc-600"
              }`}
            />
          ))}
        </div>

        {/* Input */}
        <textarea
          className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 h-28 tracking-wide placeholder:text-zinc-500 mb-4"
          placeholder="Share your experience with the product..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-600 text-zinc-400 hover:text-white hover:border-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 transition"
          >
            Submit Review
          </button>
        </div>

      </div>
    </div>
  );
}
