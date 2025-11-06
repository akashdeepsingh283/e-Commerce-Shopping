import { ShoppingBag, Menu, X, User, LogOut, Package, LayoutDashboard, Plus, Folder, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 

interface User {
  name: string;
  email: string;
}

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
  onContactClick: () => void;
  onProductsClick: () => void;
  onAdminAddProduct: () => void;
  onAdminDashboardClick: () => void;
  onOrdersClick: () => void;
  onHomeClick: () => void;
  onAdminAddCollection: () => void;
  onAdminReviewsClick: () => void;
  onCollectionsClick: () => void;
  onAboutClick: () => void;
  user: User | null;
  onLogout: () => void;
}

export default function Navbar(props: NavbarProps) {
  const {
    cartCount,
    onCartClick,
    onAuthClick,
    onHomeClick,
    onAdminAddProduct,
    onAdminDashboardClick,
    onOrdersClick,
   
    onAdminAddCollection,
    onAdminReviewsClick,

    user,
    onLogout,
  } = props;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = user?.email === 'akash@gmail.com' || user?.email === 'admin@sainamanpearls.com';

   return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-black/95 backdrop-blur-sm py-4' : 'bg-transparent py-6'
      }`}

    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between ">
          {/* Logo */}
          <button onClick={onHomeClick} className="flex items-center space-x-3">
            <div className="text-base sm:text-lg md:text-2xl font-light tracking-widest text-white">
  SAI NAMAN PEARLS
</div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <Link to="/" className="text-zinc-400 hover:text-white transition-colors tracking-wide">HOME</Link>
            <Link to="/collections" className="text-zinc-400 hover:text-white transition-colors tracking-wide">COLLECTIONS</Link>
            <Link to="/products" className="text-zinc-400 hover:text-white transition-colors tracking-wide">PRODUCTS</Link>
            <Link to="/contact" className="text-zinc-400 hover:text-white transition-colors tracking-wide">CONTACT</Link>
            <Link to="/about" className="text-zinc-400 hover:text-white transition-colors tracking-wide">ABOUT</Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            {/* Cart */}
            <button onClick={onCartClick} className="relative text-zinc-400 hover:text-white transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                  <span className="hidden lg:block text-sm tracking-wider">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 shadow-xl z-50">
                      <div className="p-4 border-b border-zinc-800">
                        <p className="text-white font-light tracking-wider">{user.name}</p>
                        <p className="text-zinc-500 text-sm">{user.email}</p>
                      </div>

                      <div className="py-2">
                        <button onClick={() => { onOrdersClick(); setIsUserMenuOpen(false); }} className="w-full px-4 py-3 text-left text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-3">
                          <Package className="w-4 h-4" />
                          <span className="tracking-wider text-sm">MY ORDERS</span>
                        </button>

                        {isAdmin && (
                          <>
                            <div className="border-t border-zinc-800 my-2" />
                            <div className="px-4 py-2 text-zinc-600 text-xs tracking-wider">ADMIN</div>

                            <button onClick={() => { onAdminDashboardClick(); setIsUserMenuOpen(false); }}
                              className="w-full px-4 py-3 flex items-center space-x-3 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                              <LayoutDashboard className="w-4 h-4" /><span className="tracking-wider text-sm">ORDER MANAGEMENT</span>
                            </button>
                            
                            <button onClick={() => { onAdminReviewsClick(); setIsUserMenuOpen(false); }}
                              className="w-full px-4 py-3 flex items-center space-x-3 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                              <Star className="w-4 h-4" /><span className="tracking-wider text-sm">REVIEW MANAGEMENT</span>
                            </button>

                            <button onClick={() => { onAdminAddProduct(); setIsUserMenuOpen(false); }}
                              className="w-full px-4 py-3 flex items-center space-x-3 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                              <Plus className="w-4 h-4" /><span className="tracking-wider text-sm">ADD PRODUCT</span>
                            </button>

                            <button onClick={() => { onAdminAddCollection(); setIsUserMenuOpen(false); }}
                              className="w-full px-4 py-3 flex items-center space-x-3 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                              <Folder className="w-4 h-4" /><span className="tracking-wider text-sm">ADD COLLECTION</span>
                            </button>
                          </>
                        )}

                        <div className="border-t border-zinc-800 my-2" />
                        <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-zinc-900 transition-colors flex items-center space-x-3">
                          <LogOut className="w-4 h-4" />
                          <span className="tracking-wider text-sm">LOGOUT</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button onClick={onAuthClick} className="text-zinc-400 hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-zinc-400 hover:text-white transition-colors">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-900">
          <div className="px-4 py-6 space-y-4">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wider text-sm">HOME</Link>
            <Link to="/collections" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wider text-sm">COLLECTIONS</Link>
            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wider text-sm">PRODUCTS</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wider text-sm">CONTACT</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wider text-sm">ABOUT</Link>
            <Link to="/reviews" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wider text-sm">REVIEWS</Link>
          </div>
        </div>
      )}
    </nav>
  );
}