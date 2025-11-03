// App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  // Show review popup after login
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => setShowReviewPopup(true), 30000);
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
      setCartItems((prev) =>
        quantity === 0
          ? prev.filter((item) => item.id !== productId)
          : prev.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            )
      );
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
    if (!user) return setIsAuthModalOpen(true);
    navigate('/checkout');
    setIsCartOpen(false);
  };

  const handleOrderComplete = (newOrderId: string) => {
    setOrderId(newOrderId);
    setCartItems([]);
    navigate('/order-confirmation');
  };

  const handleViewProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    navigate('/product-detail');
  };

  if (showLoading) return <LoadingScreen onComplete={() => setShowLoading(false)} />;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onContactClick={() => navigate('/contact')}
        onProductsClick={() => navigate('/products')}
        onCollectionsClick={() => navigate('/collections')}
        onAboutClick={() => navigate('/about')}
        onAdminAddProduct={() => setIsAdminProductFormOpen(true)}
        onAdminDashboardClick={() => navigate('/admin-dashboard')}
        onOrdersClick={() => navigate('/orders')}
        onHomeClick={() => navigate('/')}
        onAdminAddCollection={() => setIsAdminCollectionFormOpen(true)}
        onAdminReviewsClick={() => navigate('/admin-reviews')}
        user={user}
        onLogout={() => {
          logout();
          setCartItems([]);
          navigate('/');
        }}
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <FeaturedCollections onCollectionClick={() => navigate('/products')} />
              <ProductGrid onAddToCart={handleAddToCart} onViewProduct={handleViewProduct} />
              <About onReviewsClick={() => navigate('/reviews')} />
              <Footer onContactClick={() => navigate('/contact')} />
            </>
          }
        />

        <Route path="/contact" element={<ContactPage onBack={() => navigate('/')} />} />
        <Route
          path="/products"
          element={
            <ProductsPage
              onBack={() => navigate('/')}
              onViewProduct={handleViewProduct}
              onAddToCart={handleAddToCart}
              user={user}
            />
          }
        />
        <Route path="/collections" element={<FeaturedCollections onCollectionClick={() => navigate('/products')} />} />
        <Route path="/about" element={<About onReviewsClick={() => navigate('/reviews')} />} />
        <Route
          path="/product-detail"
          element={
            selectedProductSlug ? (
              <ProductDetailPage
                productSlug={selectedProductSlug}
                onBack={() => navigate('/')}
                onAddToCart={handleAddToCart}
              />
            ) : (
              <div className="p-8 text-center">Product not found</div>
            )
          }
        />
        <Route
          path="/checkout"
          element={
            <CheckoutPage
              items={cartItems.flatMap((item) =>
                Array(item.quantity).fill({ ...item, quantity: 1 })
              )}
              onOrderComplete={handleOrderComplete}
            />
          }
        />
        <Route
          path="/order-confirmation"
          element={<OrderConfirmation orderId={orderId as string} onBackToHome={() => navigate('/')} />}
        />
        <Route path="/orders" element={<UserOrdersPage onBack={() => navigate('/')} />} />
        <Route path="/admin-dashboard" element={<AdminDashboard onClose={() => navigate('/')} />} />
        <Route path="/reviews" element={<ReviewsPage onBack={() => navigate('/')} />} />
        <Route path="/admin-reviews" element={<AdminReviewApproval onClose={() => navigate('/')} />} />
      </Routes>

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

      {showReviewPopup && (
        <ReviewPopup isOpen={showReviewPopup} onClose={() => setShowReviewPopup(false)} />
      )}
    </div>
  );
}

export default App;
