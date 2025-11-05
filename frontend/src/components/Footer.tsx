import { Instagram, Facebook, Twitter, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onContactClick: () => void;
}

export default function Footer({ onContactClick }: FooterProps) {
  return (
    <footer className="bg-black border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1">
        {/* Main Footer Content */}
        <div className="py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-26">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-light tracking-widest text-white mb-6">
                Sai Naman Pearls
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Discover the elegance of handcrafted pearls with Sai Naman Pearls.
                Each piece tells a story of timeless beauty and exquisite craftsmanship.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-zinc-500 hover:text-white transition-colors duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Shop Section */}
            <div>
              <h4 className="text-white tracking-wider font-light mb-6">SHOP</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">
                    Collections
                  </a>
                </li>
                <li>
                  <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">
                    Reviews
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Section */}
            <div>
              <h4 className="text-white tracking-wider font-light mb-6">SUPPORT</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={onContactClick} className="text-zinc-400 hover:text-white transition-colors text-sm">
                    Contact Us
                  </button>
                </li>
                <li>
                  <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">
                    Shipping & Returns
                  </a>
                </li>
                <li>
                  <button onClick={onContactClick} className="text-zinc-400 hover:text-white transition-colors text-sm">              
                    FAQ
                    </button>
                </li>
              </ul>
            </div>

            {/* Contact Info Section */}
            <div>
              <h4 className="text-white tracking-wider font-light mb-6">GET IN TOUCH</h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-zinc-600 mt-1 flex-shrink-0" />
                  <span className="text-zinc-400 text-sm">+91 98494-72755</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-zinc-600 mt-1 flex-shrink-0" />
                  <a href="mailto:hello@noir.com" className="text-zinc-400 hover:text-white transition-colors text-sm">
                    sainamanpearls1@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Address Section */}
            <div>
              <h4 className="text-white tracking-wider font-light mb-6">VISIT US</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-zinc-600 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                     <p className="text-zinc-400">
                    Sai Naman Pearls
                    <br />
                    ESCI campus Gachibowli,
                    <br />
                    Hyderabad, Telangana 500032.
                  </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-zinc-900 py-8">
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-zinc-600 text-xs tracking-wider">
            © 2025 Sai Naman Pearls. ALL RIGHTS RESERVED.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 sm:justify-end">
              <a href="#" className="text-zinc-600 hover:text-zinc-400 transition-colors text-xs tracking-wide">
                Privacy Policy
              </a>
              <a href="#" className="text-zinc-600 hover:text-zinc-400 transition-colors text-xs tracking-wide">
                Terms & Conditions
              </a>
              <a href="#" className="text-zinc-600 hover:text-zinc-400 transition-colors text-xs tracking-wide">
                Cookie Settings
              </a>
            </div>
          </div>
          <div className="text-center pt-6 border-t border-zinc-900/50">
            <p className="text-zinc-700 text-xs tracking-wider">
              Crafted with precision. Worn with pride.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
