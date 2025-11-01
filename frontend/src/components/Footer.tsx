import { Instagram, Facebook, Twitter } from 'lucide-react';

interface FooterProps {
  onContactClick: () => void;
}

export default function Footer({ onContactClick }: FooterProps) {
  return (
    <footer className="bg-black border-t border-zinc-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-light tracking-widest text-white mb-6">
              SAI NAMAN PEARLS
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Discover the elegance of handcrafted pearls with Sai Naman Pearls.
              Each piece tells a story of timeless beauty and exquisite craftsmanship.
            </p>
          </div>

          <div>
            <h4 className="text-white tracking-wider mb-4">SHOP</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Collections
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Best Sellers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white tracking-wider mb-4">SUPPORT</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onContactClick} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Contact Us
                </button>
              </li>
              <li>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Care Guide
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white tracking-wider mb-4">FOLLOW US</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 text-center">
          <p className="text-zinc-600 text-sm tracking-wider">
            © 2025 Sai Naman Pearls. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
