// App.tsx - Complete Implementation with Collections and About views
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
import CollectionsPage from './components/FeaturedCollections';
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminProductFormOpen, setIsAdminProductFormOpen] = useState(false);
  const [isAdminCollectionFormOpen, setIsAdminCollectionFormOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  // Sync cart with backend when user logs in
  useEffect(() => {
    if (user) {
      syncCartWithBackend();
    }
  }, [user]);

  const syncCartWithBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5001/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const items = data.reduce((acc: CartItem[], item: any) => {
          const existing = acc.find((i) => i.id === item.id);
          if (existing) {
            existing.quantity += item.quantity || 1;
          } else {
            acc.push({ ...item, quantity: item.quantity || 1 });
          }
          return acc;
        }, []);
        setCartItems(items);
      }
    } catch (err) {
      console.error('Failed to sync cart', err);
    }
  };

  // Automatically show Review Popup after 30s of login
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setShowReviewPopup(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleAddToCart = async (product: Product) => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            name: product.name,
            price: product.price,
            images: product.images,
            description: product.description,
            slug: product.slug,
            quantity: 1,
          }),
        });

        if (res.ok) await syncCartWithBackend();
      } catch (err) {
        console.error('Failed to add to cart', err);
      }
    } else {
      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/cart/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity }),
        });
        if (res.ok) await syncCartWithBackend();
      } catch (err) {
        console.error('Failed to update cart', err);
      }
    } else {
      if (quantity === 0) {
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
      } else {
        setCartItems((prev) =>
          prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
        );
      }
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/cart/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) await syncCartWithBackend();
      } catch (err) {
        console.error('Failed to remove item', err);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView('checkout');
    setIsCartOpen(false);
  };

  const handleOrderComplete = async (newOrderId: string) => {
    setOrderId(newOrderId);
    setCurrentView('order-confirmation');
    setCartItems([]);
    if (user) {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5001/api/cart/clear', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error('Failed to clear cart', err);
      }
    }
  };

  const handleViewProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    setCurrentView('product-detail');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProductSlug(null);
    setOrderId(null);
  };

  const handleCollectionsClick = () => {
    setCurrentView('collections');
  };

  const handleAboutClick = () => {
    setCurrentView('about');
  };

  const handleLogout = () => {
    logout();
    setCartItems([]);
    setCurrentView('home');
  };

  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onContactClick={() => setCurrentView('contact')}
        onProductsClick={() => setCurrentView('products')}
        onCollectionsClick={handleCollectionsClick}
        onAboutClick={handleAboutClick}
        onAdminAddProduct={() => setIsAdminProductFormOpen(true)}
        onAdminDashboardClick={() => setCurrentView('admin-dashboard')}
        onOrdersClick={() => setCurrentView('orders')}
        onHomeClick={handleBackToHome}
        onAdminAddCollection={() => setIsAdminCollectionFormOpen(true)}
        onAdminReviewsClick={() => setCurrentView('admin-reviews')}
        user={user}
        onLogout={handleLogout}
      />

      {currentView === 'home' && (
        <>
          <Hero />
          <FeaturedCollections />
          <ProductGrid onAddToCart={handleAddToCart} onViewProduct={handleViewProduct} />
          <About onReviewsClick={() => setCurrentView('reviews')} />
          <Footer onContactClick={() => setCurrentView('contact')} />
        </>
      )}

      {currentView === 'contact' && <ContactPage onBack={handleBackToHome} />}

      {currentView === 'products' && (
        <ProductsPage
          onBack={handleBackToHome}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          user={user}
        />
      )}

      {currentView === 'collections' && (
        <CollectionsPage onBack={handleBackToHome} />
      )}

      {currentView === 'about' && (
        <About onReviewsClick={() => setCurrentView('reviews')} />
      )}

      {currentView === 'product-detail' && selectedProductSlug && (
        <ProductDetailPage
          productSlug={selectedProductSlug}
          onBack={handleBackToHome}
          onAddToCart={handleAddToCart}
        />
      )}

      {currentView === 'checkout' && (
        <CheckoutPage
          items={cartItems.flatMap((item) =>
            Array(item.quantity).fill({ ...item, quantity: 1 })
          )}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {currentView === 'order-confirmation' && orderId && (
        <OrderConfirmation orderId={orderId} onBackToHome={handleBackToHome} />
      )}

      {currentView === 'orders' && <UserOrdersPage onBack={handleBackToHome} />}

      {currentView === 'admin-dashboard' && (
        <AdminDashboard onClose={handleBackToHome} />
      )}

      {currentView === 'reviews' && (
        <ReviewsPage onBack={handleBackToHome} />
      )}

      {currentView === 'admin-reviews' && (
        <AdminReviewApproval onClose={handleBackToHome} />
      )}

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onCheckout={handleCheckout}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />

      <AdminProductForm
        isOpen={isAdminProductFormOpen}
        onClose={() => setIsAdminProductFormOpen(false)}
      />

      <AdminCollectionForm
        isOpen={isAdminCollectionFormOpen}
        onClose={() => setIsAdminCollectionFormOpen(false)}
      />

      {showReviewPopup && (
        <ReviewPopup
          isOpen={showReviewPopup}
          onClose={() => setShowReviewPopup(false)}
        />
      )}
    </div>
  );
}

export default App;