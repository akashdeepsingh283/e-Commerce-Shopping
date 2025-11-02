import { ShoppingBag, Menu, X, User, LogOut, Plus, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link , useNavigate , useLocation } from 'react-router-dom'; // ✅ Import Link

interface User {
  name?: string;
  email?: string;
}

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
  onHomeClick?: () => void;
  onContactClick: () => void;
  onProductsClick: () => void;
  onAdminAddProduct?: () => void;
  onAdminAddCollection?: () => void;
  onAdminDashboardClick?: () => void;
  onOrdersClick?: () => void;
  user?: User | null;
  onLogout: () => void;
}

export default function Navbar({
  
  cartCount,
  onCartClick,
  onAuthClick,
  //onHomeClick,
  //onContactClick,
  //onProductsClick,
  onAdminAddProduct,
  onAdminAddCollection,
  onAdminDashboardClick,
  onOrdersClick,
  user,
  onLogout,

}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
 


  const ADMIN_EMAIL = 'akash@gmail.com';
  const isAdmin = user && user.email === ADMIN_EMAIL;

   const handleScrollNavigation = (sectionId: string) => {
  if (location.pathname === "/") {
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: "smooth" });
  } else {
    // Save the section id temporarily before navigating
    sessionStorage.setItem("scrollToSection", sectionId);
    navigate("/");
  }
};


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showAdminDropdown && !(e.target as Element).closest('.admin-dropdown-container')) {
        setShowAdminDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAdminDropdown]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-black/95 backdrop-blur-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* ✅ Brand now uses Link */}
          <Link
            to="/"
            className="text-2xl font-light tracking-widest text-white hover:text-zinc-300 transition-colors"
          >
            SAI NAMAN PEARLS
          </Link>

          {/* Desktop Menu */}
         <div className="hidden md:flex items-center space-x-12">
            <button
              onClick={() => handleScrollNavigation("collections")}
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
            >
              COLLECTIONS
            </button>
            <Link
              to="/products"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
            >
              PRODUCTS
            </Link>
            {user && onOrdersClick && (
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
             <button
              onClick={() => handleScrollNavigation("about")}
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
            >
              ABOUT
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-zinc-400" />
                  <span className="text-zinc-400 text-sm font-medium">{user.name}</span>
                </div>

             
                {isAdmin && (
                  <div className="relative admin-dropdown-container">
                    <button
                      onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                      className="flex items-center space-x-2 bg-zinc-900 text-white px-4 py-2 rounded hover:bg-zinc-800 transition-colors border border-zinc-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm tracking-wide">ADMIN</span>
                    </button>

                    {showAdminDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded shadow-lg overflow-hidden animate-fade-in">
                        <button
                          onClick={() => {
                            onAdminDashboardClick?.();
                            setShowAdminDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-2"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span className="text-sm tracking-wide">Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            onAdminAddProduct?.();
                            setShowAdminDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-2 border-t border-zinc-800"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm tracking-wide">Add Product</span>
                        </button>
                        <button
                          onClick={() => {
                            onAdminAddCollection?.();
                            setShowAdminDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-2 border-t border-zinc-800"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm tracking-wide">Add Collection</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={onLogout}
                  className="text-zinc-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="hidden md:flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm tracking-wide">LOGIN</span>
              </button>
            )}

            {/* Cart */}
            <button onClick={onCartClick} className="relative group">
              <ShoppingBag className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Menu with Links */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-sm border-t border-zinc-800">
          <div className="flex flex-col space-y-6 p-6">
            <Link
              to="/collections"
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
              to="/about"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ABOUT
            </Link>
            <Link
              to="/contact"
              className="text-zinc-400 hover:text-white transition-colors tracking-wide"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              CONTACT
            </Link>
            {user && onOrdersClick && (
              <Link
                to="/orders"
                className="text-zinc-400 hover:text-white transition-colors tracking-wide"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ORDERS
              </Link>
            )}

            {/* ✅ Admin (unchanged) */}
            {user && isAdmin && (
              <div className="border-t border-zinc-800 pt-4">
                <p className="text-zinc-600 text-xs tracking-wider mb-3">ADMIN</p>
                <button
                  onClick={() => {
                    onAdminDashboardClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wide flex items-center space-x-2 mb-3"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    onAdminAddProduct?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wide flex items-center space-x-2 mb-3"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
                <button
                  onClick={() => {
                    onAdminAddCollection?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wide flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Collection</span>
                </button>
              </div>
            )}

            {user ? (
              <>
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-zinc-600 text-xs tracking-wider mb-2">LOGGED IN AS</p>
                  <p className="text-white text-sm mb-4">{user.name}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="text-zinc-400 hover:text-white transition-colors tracking-wide text-left"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="text-zinc-400 hover:text-white transition-colors tracking-wide text-left"
              >
                LOGIN
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
