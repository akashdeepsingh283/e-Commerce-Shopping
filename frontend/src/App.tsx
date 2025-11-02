import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReviewPopup from './components/ReviewPopup';
import ProductGrid from './components/ProductGrid';
import FeaturedCollections from './components/FeaturedCollections';
import About from './components/About';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import AuthModal from './components/AuthModal';
import ContactPage from './components/ContactPage';
import ProductsPage from './components/ProductsPage';
import ProductDetailPage from './components/ProductDetailPage';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmation from './components/OrderConfirmation';
import LoadingScreen from './components/LoadingScreen';
import AdminProductForm from './components/AdminProductForm';
import AdminCollectionForm from './components/AdminCollectionForm';
import UserOrdersPage from './components/UserOrdersPage';
import AdminDashboard from './components/AdminDashboard';
import ReviewsPage from './components/ReviewsPage';
import AdminReviewApproval from './components/AdminReviewApproval';
import { useAuth } from './context/AuthContext';

type View =
  | 'home'
  | 'contact'
  | 'products'
  | 'product-detail'
  | 'checkout'
  | 'order-confirmation'
  | 'orders'
  | 'admin-dashboard'
  | 'reviews'
  | 'admin-reviews'
  | 'collections'
  | 'about';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  in_stock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

function App() {
  const { user, logout } = useAuth();

  const [currentView, setCurrentView] = useState<View>('home');
  const [history, setHistory] = useState<View[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminProductFormOpen, setIsAdminProductFormOpen] = useState(false);
  const [isAdminCollectionFormOpen, setIsAdminCollectionFormOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  // Sync Cart on Login
  useEffect(() => {
    if (user) syncCartWithBackend();
  }, [user]);

  const syncCartWithBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5001/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const items = data.reduce((acc: CartItem[], item: any) => {
          const existing = acc.find((i) => i.id === item.id);
          if (existing) existing.quantity += item.quantity || 1;
          else acc.push({ ...item, quantity: item.quantity || 1 });
          return acc;
        }, []);
        setCartItems(items);
      }
    } catch (err) {
      console.error('Failed to sync cart', err);
    }
  };

  // Review Popup Timer
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => setShowReviewPopup(true), 30000);
    return () => clearTimeout(timer);
  }, [user]);

  // Navigation
  const switchView = (newView: View) => {
    setHistory((prev) => [...prev, currentView]);
    setCurrentView(newView);
  };

  const handleBack = () => {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const newHistory = [...prev];
      const lastView = newHistory.pop()!;
      setCurrentView(lastView);
      return newHistory;
    });
  };

  // Cart Controls…
  const handleAddToCart = async (product: Product) => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
         
        await syncCartWithBackend();
      } catch (err) {
        console.error('Failed to add', err);
      }
    } else {
      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing)
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        return [...prev, { ...product, quantity: 1 }];
      });
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5001/api/cart/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId, quantity }),
        });
        await syncCartWithBackend();
      } catch (err) {}
    } else {
      if (quantity === 0)
        return setCartItems((prev) => prev.filter((item) => item.id !== productId));

      setCartItems((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const handleRemoveItem = (productId: string) =>
    user
      ? fetch('http://localhost:5001/api/cart/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ productId }),
        }).then(syncCartWithBackend)
      : setCartItems((prev) => prev.filter((item) => item.id !== productId));

  const handleCheckout = () => {
    if (!user) return setIsAuthModalOpen(true);
    switchView('checkout');
    setIsCartOpen(false);
  };

  const handleOrderComplete = async (newOrderId: string) => {
    setOrderId(newOrderId);
    switchView('order-confirmation');
    setCartItems([]);
    setHistory([]);
    if (user) {
      try {
        await fetch('http://localhost:5001/api/cart/clear', {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } catch {}
    }
  };

  // Navigation helpers
  const handleViewProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    switchView('product-detail');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProductSlug(null);
    setSelectedCategory(null);
    setOrderId(null);
    setHistory([]);
  };

  const handleCollectionsClick = () => switchView('collections');
  const handleAboutClick = () => switchView('about');
  const handleCollectionCategoryClick = (category: string) => {
    setSelectedCategory(category);
    switchView('products');
  };

  const handleLogout = () => {
    logout();
    setCartItems([]);
    setCurrentView('home');
    setHistory([]);
  };

  if (showLoading) return <LoadingScreen onComplete={() => setShowLoading(false)} />;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onContactClick={() => switchView('contact')}
        onProductsClick={() => { setSelectedCategory(null); switchView('products'); }}
        onCollectionsClick={handleCollectionsClick}
        onAboutClick={handleAboutClick}
        onAdminAddProduct={() => setIsAdminProductFormOpen(true)}
        onAdminDashboardClick={() => switchView('admin-dashboard')}
        onOrdersClick={() => switchView('orders')}
        onHomeClick={handleBackToHome}
        onAdminAddCollection={() => setIsAdminCollectionFormOpen(true)}
        onAdminReviewsClick={() => switchView('admin-reviews')}
        user={user}
        onLogout={handleLogout}
      />

      {currentView === 'home' && (
        <>
          <Hero />
          <FeaturedCollections onCollectionClick={handleCollectionCategoryClick} />
          <ProductGrid onAddToCart={handleAddToCart} onViewProduct={handleViewProduct} />
          <About onReviewsClick={() => switchView('reviews')} />
          <Footer onContactClick={() => switchView('contact')} />
        </>
      )}

      {currentView === 'contact' && <ContactPage onBack={handleBack} />}

      {currentView === 'products' && (
        <ProductsPage
          onBack={handleBack}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          initialCategory={selectedCategory}
          user={user}
        />
      )}

      {currentView === 'collections' && (
        <FeaturedCollections onCollectionClick={handleCollectionCategoryClick} />
      )}

      {currentView === 'about' && (
        <About onReviewsClick={() => switchView('reviews')} />
      )}

      {currentView === 'product-detail' && selectedProductSlug && (
        <ProductDetailPage productSlug={selectedProductSlug} onBack={handleBack} onAddToCart={handleAddToCart} />
      )}

      {currentView === 'checkout' && (
        <CheckoutPage
          items={cartItems.flatMap((item) => Array(item.quantity).fill({ ...item, quantity: 1 }))}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {currentView === 'order-confirmation' && orderId && (
        <OrderConfirmation orderId={orderId} onBackToHome={handleBackToHome} />
      )}

      {currentView === 'orders' && <UserOrdersPage onBack={handleBack} />}

      {currentView === 'admin-dashboard' && <AdminDashboard onClose={handleBack} />}

      {currentView === 'reviews' && <ReviewsPage onBack={handleBack} />}

      {currentView === 'admin-reviews' && <AdminReviewApproval onClose={handleBack} />}

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onCheckout={handleCheckout}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode="login" />

      <AdminProductForm isOpen={isAdminProductFormOpen} onClose={() => setIsAdminProductFormOpen(false)} />

      <AdminCollectionForm isOpen={isAdminCollectionFormOpen} onClose={() => setIsAdminCollectionFormOpen(false)} />

      {showReviewPopup && <ReviewPopup isOpen={showReviewPopup} onClose={() => setShowReviewPopup(false)} />}
    </div>
  );
}

export default App;
