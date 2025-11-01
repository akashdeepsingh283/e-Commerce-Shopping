import { ShoppingBag, Menu, X, User, LogOut, Plus, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';

interface User {
  name?: string;
  email?: string;
}

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
  onHomeClick: () => void;
  onContactClick: () => void;
  onProductsClick: () => void;
  onAdminAddProduct?: () => void;
  onAdminAddCollection?: () => void;
  onAdminDashboardClick?: () => void;
  onOrdersClick?: () => void;
  user?: User | null;
  onLogout: () => void;
  onAdminAddProduct?: () => void;      
  onAdminAddCollection?: () => void;   
}

export default function Navbar({
  cartCount,
  user,
  onLogout,
  onCartClick,
  onAdminAddProduct,
  onAdminAddCollection,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "bg-black/95 backdrop-blur-sm py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-light tracking-widest text-white hover:text-zinc-300 transition-colors"
          >
            SAI NAMAN PEARLS
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            <Link
              to="/#collections"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
            >
              COLLECTIONS
            </Link>
            <Link
              to="/products"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
            >
              PRODUCTS
            </Link>
            {user && (
              <Link
                to="/orders"
                className="text-zinc-400 hover:text-white transition-colors tracking-wide"
              >
                ORDERS
              </Link>
            )}
            <Link
              to="/contact"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
            >
              CONTACT
            </Link>
            <Link
              to="/#about"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
            >
              ABOUT
            </Link>

            {/* ✅ Optional Admin Buttons */}
            {user?.isAdmin && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={onAdminAddProduct}
                  className="text-zinc-400 hover:text-white transition-colors text-sm tracking-wide"
                >
                  + PRODUCT
                </button>
                <button
                  onClick={onAdminAddCollection}
                  className="text-zinc-400 hover:text-white transition-colors text-sm tracking-wide"
                >
                  + COLLECTION
                </button>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-zinc-400" />
                  <span className="text-zinc-400 text-sm font-medium">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-zinc-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm tracking-wide">LOGIN</span>
              </Link>
            )}

          
            <button onClick={onCartClick} className="relative group">
              <ShoppingBag className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-sm border-t border-zinc-800">
          <div className="flex flex-col space-y-6 p-6">
            <Link
              to="/#collections"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              COLLECTIONS
            </Link>
            <Link
              to="/products"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              PRODUCTS
            </Link>
            <Link
              to="/contact"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              CONTACT
            </Link>
            {user && (
              <Link
                to="/orders"
                className="text-zinc-400 hover:text-white transition-colors tracking-wide"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ORDERS
              </Link>
            )}
            <Link
              to="/#about"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ABOUT
            </Link>

            {user?.isAdmin && (
              <>
                <button
                  onClick={() => {
                    onAdminAddProduct?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors tracking-wide text-left"
                >
                  + PRODUCT
                </button>
                <button
                  onClick={() => {
                    onAdminAddCollection?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors tracking-wide text-left"
                >
                  + COLLECTION
                </button>
              </>
            )}

            {user ? (
              <>
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-zinc-600 text-xs tracking-wider mb-2">
                    LOGGED IN AS
                  </p>
                  <p className="text-white text-sm mb-4">{user.name}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors tracking-wide text-left"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors tracking-wide text-left"
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
