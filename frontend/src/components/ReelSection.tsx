import { useEffect, useRef, useState } from 'react';
import { localSocialPosts } from '../data/reviewsAndSocialPosts';
import { Instagram, Tv2, Youtube, VolumeX, Volume2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReelSection() {
  const navigate = useNavigate();
  const reels = localSocialPosts.filter(p => p.post_type === 'reel' || p.post_type === 'video');
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isMuted, setIsMuted] = useState<{ [key: number]: boolean }>({});
  const [isPlaying, setIsPlaying] = useState<{ [key: number]: boolean }>({});

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'tiktok': return <Tv2 className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      default: return null;
    }
  };

  // 🧠 Smart autoplay / pause when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          const index = videoRefs.current.indexOf(video);
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setIsPlaying(prev => ({ ...prev, [index]: true }));
          } else {
            video.pause();
            setIsPlaying(prev => ({ ...prev, [index]: false }));
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach(video => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  // 🎬 Tap to play/pause a reel
  const togglePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(prev => ({ ...prev, [index]: true }));
    } else {
      video.pause();
      setIsPlaying(prev => ({ ...prev, [index]: false }));
    }
  };

  // 🔇 Toggle mute for a specific reel
  const toggleMute = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(prev => ({ ...prev, [index]: newMuted }));
  };

  if (reels.length === 0) return null;

  return (
    <section className="py-12 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light tracking-widest text-white">LATEST REELS</h2>
          <button
            onClick={() => navigate('/reviews')}
            className="text-white border border-white px-4 py-2 tracking-widest hover:bg-white hover:text-black transition-all"
          >
            VIEW ALL
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 py-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          {reels.map((reel, index) => (
            <div
  key={reel._id}
  className="flex-shrink-0 w-40 sm:w-56 md:w-64 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-300 relative"
>

              {/* Video Container */}
              <div
                className="relative w-full cursor-pointer"
                style={{ paddingTop: '177.78%' }}
                onClick={() => togglePlay(index)}
              >
                <video
                  ref={el => (videoRefs.current[index] = el)}
                  src={reel.media_url}
                  muted={isMuted[index] ?? true}
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute top-0 left-0 w-full h-full object-cover opacity-0 transition-opacity duration-700"
                  onLoadedData={e => (e.currentTarget.style.opacity = '1')}
                />

                {/* Overlay: Play Icon */}
                {!isPlaying[index] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="w-10 h-10 text-white opacity-90" />
                  </div>
                )}

                {/* Overlay: Mute/Unmute Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleMute(index);
                  }}
                  className="absolute bottom-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-white/20 transition"
                >
                  {isMuted[index] ?? true ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Caption / Info */}
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>{getPlatformIcon(reel.platform)}</span>
                  <span>{reel.platform.toUpperCase()}</span>
                </div>
                <p className="text-white text-sm line-clamp-2">{reel.caption}</p>
                <div className="flex items-center gap-4 text-zinc-500 text-xs">
                  <span>❤️ {reel.likes}</span>
                  <span>💬 {reel.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
