import { ShoppingBag, Menu, X, UserCircle, LogOut, Package, LayoutDashboard, Plus, Folder, Star } from 'lucide-react';
import { useState } from 'react';

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
  user: any;
  onLogout: () => void;
}

export default function Navbar({
  cartCount,
  onCartClick,
  onAuthClick,
  onContactClick,
  onProductsClick,
  onAdminAddProduct,
  onAdminDashboardClick,
  onOrdersClick,
  onHomeClick,
  onAdminAddCollection,
  onAdminReviewsClick,
  user,
  onLogout,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAdmin = user?.email === 'akash@gmail.com' || user?.email === 'admin@sainamanpearls.com';

  return (
    <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm border-b border-zinc-900 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button onClick={onHomeClick} className="flex items-center space-x-3">
            <div className="text-2xl font-light tracking-widest text-white">
              SAI NAMAN PEARLS
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={onHomeClick}
              className="text-zinc-400 hover:text-white transition-colors tracking-wider text-sm"
            >
              HOME
            </button>
            <button
              onClick={onProductsClick}
              className="text-zinc-400 hover:text-white transition-colors tracking-wider text-sm"
            >
              PRODUCTS
            </button>
            <button
              onClick={onContactClick}
              className="text-zinc-400 hover:text-white transition-colors tracking-wider text-sm"
            >
              CONTACT
            </button>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative text-zinc-400 hover:text-white transition-colors"
            >
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
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <UserCircle className="w-6 h-6" />
                  <span className="hidden lg:block text-sm tracking-wider">
                    {user.name}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 shadow-xl z-50">
                      <div className="p-4 border-b border-zinc-800">
                        <p className="text-white font-light tracking-wider">
                          {user.name}
                        </p>
                        <p className="text-zinc-500 text-sm">{user.email}</p>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            onOrdersClick();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-3"
                        >
                          <Package className="w-4 h-4" />
                          <span className="tracking-wider text-sm">MY ORDERS</span>
                        </button>

                        {isAdmin && (
                          <>
                            <div className="border-t border-zinc-800 my-2" />
                            <div className="px-4 py-2">
                              <p className="text-zinc-600 text-xs tracking-wider">
                                ADMIN
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                onAdminDashboardClick();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-3"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              <span className="tracking-wider text-sm">
                                ORDER MANAGEMENT
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                onAdminReviewsClick();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-3"
                            >
                              <Star className="w-4 h-4" />
                              <span className="tracking-wider text-sm">
                                REVIEW MANAGEMENT
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                onAdminAddProduct();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-3"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="tracking-wider text-sm">
                                ADD PRODUCT
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                onAdminAddCollection();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-3"
                            >
                              <Folder className="w-4 h-4" />
                              <span className="tracking-wider text-sm">
                                ADD COLLECTION
                              </span>
                            </button>
                          </>
                        )}

                        <div className="border-t border-zinc-800 my-2" />
                        <button
                          onClick={() => {
                            onLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-zinc-900 transition-colors flex items-center space-x-3"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="tracking-wider text-sm">LOGOUT</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <UserCircle className="w-6 h-6" />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-white transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-900">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => {
                onHomeClick();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wider text-sm"
            >
              HOME
            </button>
            <button
              onClick={() => {
                onProductsClick();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wider text-sm"
            >
              PRODUCTS
            </button>
            <button
              onClick={() => {
                onContactClick();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-zinc-400 hover:text-white transition-colors tracking-wider text-sm"
            >
              CONTACT
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}