import { Play, Pause, RotateCcw, RotateCw, Maximize, Share2, Sparkles, Award, Package, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";

interface AboutProps {
  onReviewsClick?: () => void;
}

export default function About({ onReviewsClick }: AboutProps) {
  const features = [
    {
      icon: Sparkles,
      title: "31 Years of Legacy",
      description: "Establishing a legacy of excellence since 1994.",
    },
    {
      icon: Package,
      title: "Free Delivery All Over India",
      description:
        "Experience the joy of free shipping across India on all orders.",
    },
    {
      icon: Award,
      title: "Guarantee Certificate",
      description:
        "Every creation is backed by our commitment to excellence.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-black ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <h2 className="text-5xl font-light tracking-widest text-white mb-6">
              OUR BRAND STORY.
            </h2>

            <p className="text-zinc-400 text-lg leading-relaxed">
              Discover the timeless elegance of Sai Naman Pearls, a revered name in the world of pearl jewelry for over 31 years. Our brand stands as a beacon of quality and craftsmanship, offering exquisite pieces that enchant and inspire. Proudly registered with both KVIC and MSME, we blend tradition with innovation, ensuring each creation tells a story of heritage and beauty.
            </p>

            <p className="text-zinc-400 text-lg leading-relaxed">
              From classic strands to contemporary designs, Sai Naman Pearls celebrates the essence of femininity and sophistication, making every piece a cherished treasure for generations to come.
            </p>

            {/* FEATURES */}
            <div className="flex flex-col sm:flex-row gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex-1 group bg-zinc-950 border border-zinc-800 p-6 transition-all duration-500 hover:border-zinc-600"
                    style={{
                      animation: `fade-in-left 0.8s ease-out ${index * 0.2}s both`,
                    }}
                  >
                    <Icon className="w-10 h-10 text-zinc-600 mb-4 group-hover:text-white transition-colors duration-500" />
                    <h3 className="text-lg font-light tracking-wide text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-500 text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            {/* ENHANCED REVIEWS BUTTON */}
            {onReviewsClick && (
              <div className="pt-4">
                <button
                  onClick={onReviewsClick}
                  className="group flex items-center gap-3 px-8 py-4 bg-zinc-950 border border-zinc-800 hover:border-white transition-all duration-300 hover:bg-zinc-900"
                >
                  <div className="flex-1">
                    <p className="text-white text-lg font-light tracking-wider text-left">
                      REVIEWS & TESTIMONIALS
                    </p>
                    <p className="text-zinc-500 text-sm text-left mt-1">
                      See what our customers are saying
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="space-y-10">
            <div className="relative group flex justify-center">
              <img
                src="/certificate.png"
                alt="Certification"
                className="w-full max-w-md rounded-xl shadow-xl object-cover border border-zinc-700 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Video Section */}
        <AboutVideo />
      </div>
    </section>
  );
}

function AboutVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += seconds;
  };

  const fullscreen = () => {
    const video = videoRef.current;
    if (video?.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const shareVideo = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Sai Naman Pearls — Brand Story",
        url: window.location.href,
      });
    } else {
      alert("Sharing not supported on your device.");
    }
  };

  return (
    <div className="relative group flex flex-col items-center mt-10">
      <video
        ref={videoRef}
        src="/review/about.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full max-w-xl rounded-xl shadow-xl object-cover border border-zinc-700"
      />

      {/* Custom Controls */}
      <div className="flex items-center justify-between w-full max-w-xl mt-4 bg-zinc-900/80 backdrop-blur-sm p-3 rounded-xl border border-zinc-700 text-white">
        {/* Back 10s */}
        <button onClick={() => skip(-10)} className="hover:text-zinc-300">
          <RotateCcw size={22} />
        </button>

        <button onClick={togglePlay} className="hover:text-zinc-300">
          {isPlaying ? <Pause size={26} /> : <Play size={26} />}
        </button>

        {/* Forward 10s */}
        <button onClick={() => skip(10)} className="hover:text-zinc-300">
          <RotateCw size={22} />
        </button>

        <button onClick={fullscreen} className="hover:text-zinc-300">
          <Maximize size={22} />
        </button>

        <button onClick={shareVideo} className="hover:text-zinc-300">
          <Share2 size={22} />
        </button>
      </div>
    </div>
  );
}