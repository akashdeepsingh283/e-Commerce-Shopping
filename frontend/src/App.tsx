import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ReviewPopup from "./components/ReviewPopup";
import ProductGrid from "./components/ProductGrid";
import FeaturedCollections from "./components/FeaturedCollections";
import About from "./components/About";
import Footer from "./components/Footer";
import CartSidebar from "./components/CartSidebar";
import AuthModal from "./components/AuthModal";
import ContactPage from "./components/ContactPage";
import ProductsPage from "./components/ProductsPage";
import ProductDetailPage from "./components/ProductDetailPage";
import CheckoutPage from "./components/CheckoutPage";
import OrderConfirmation from "./components/OrderConfirmation";
import LoadingScreen from "./components/LoadingScreen";
import AdminProductForm from "./components/AdminProductForm";
import AdminCollectionForm from "./components/AdminCollectionForm";
import UserOrdersPage from "./components/UserOrdersPage";
import { useAuth } from "./context/AuthContext";
import ReviewsPage from "./components/ReviewsPage";

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

function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminProductFormOpen, setIsAdminProductFormOpen] = useState(false);
  const [isAdminCollectionFormOpen, setIsAdminCollectionFormOpen] =
    useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  // --- Fetch Cart ---
  const syncCartWithBackend = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/cart", {
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
      console.error("Failed to sync cart", err);
    }
  };

  useEffect(() => {
    if (user) syncCartWithBackend();
  }, [user]);

  // --- Review Popup ---
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => setShowReviewPopup(true), 30000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // --- Cart Handlers ---
  const handleAddToCart = async (product: Product) => {
    if (user) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
        if (res.ok) await syncCartWithBackend();
      } catch (err) {
        console.error("Failed to add to cart", err);
      }
    } else {
      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (user) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/cart/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity }),
        });
        if (res.ok) await syncCartWithBackend();
      } catch (err) {
        console.error("Failed to update cart", err);
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
        const token = localStorage.getItem("token");
        const res = await fetch("/api/cart/remove", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) await syncCartWithBackend();
      } catch (err) {
        console.error("Failed to remove item", err);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    }
  };

  const handleCheckout = () => {
    if (!user) return setIsAuthModalOpen(true);
    navigate("/checkout");
    setIsCartOpen(false);
  };

  const handleOrderComplete = (newOrderId: string) => {
    setOrderId(newOrderId);
    setCartItems([]);
    navigate("/order-confirmation");
  };

  const handleLogout = () => {
    logout();
    setCartItems([]);
    navigate("/");
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
        onContactClick={() => navigate("/contact")}
        onProductsClick={() => navigate("/products")}
        onHomeClick={() => navigate("/")}
        onOrdersClick={() => navigate("/orders")}
        user={user}
        onLogout={handleLogout}
        onAdminAddProduct={() => setIsAdminProductFormOpen(true)}
        onAdminAddCollection={() => setIsAdminCollectionFormOpen(true)}
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <FeaturedCollections />
              <ProductGrid
                onAddToCart={handleAddToCart}
                onViewProduct={(slug) => navigate(`/product/${slug}`)}
              />
              <About />
              <Footer onContactClick={() => navigate("/contact")} />
            </>
          }
        />

        <Route
          path="/contact"
          element={<ContactPage onBack={() => navigate("/")} />}
        />

        <Route
          path="/products"
          element={
            <ProductsPage
              onAddToCart={handleAddToCart}
              onViewProduct={(slug) => navigate(`/product/${slug}`)}
              user={user}
              onBack={() => navigate("/")}
            />
          }
        />

        <Route
          path="/product/:slug"
          element={
            <ProductDetailPage
              onAddToCart={handleAddToCart}
              onBack={() => navigate("/products")}
              productSlug=""
            />
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
          element={
            <OrderConfirmation
              orderId={orderId ?? ""}
              onBackToHome={() => navigate("/")}
            />
          }
        />

        <Route
          path="/orders"
          element={<UserOrdersPage onBack={() => navigate("/")} />}
        />

        <Route
          path="/reviews"
          element={<ReviewsPage onBack={() => navigate("/")} />}
        />

        {/* Fix: Placeholder for login route */}
        <Route
          path="/login"
          element={
            <AuthModal
              isOpen={true}
              onClose={() => navigate("/")}
              initialMode="login"
            />
          }
        />
      </Routes>

      {/* Admin Modals */}
      <AdminProductForm
        isOpen={isAdminProductFormOpen}
        onClose={() => setIsAdminProductFormOpen(false)}
      />
      <AdminCollectionForm
        isOpen={isAdminCollectionFormOpen}
        onClose={() => setIsAdminCollectionFormOpen(false)}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onCheckout={handleCheckout}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />

      {/* Review Popup */}
      <ReviewPopup
        isOpen={showReviewPopup}
        onClose={() => setShowReviewPopup(false)}
        onSubmit={() => setShowReviewPopup(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    
      <AppContent />
    
  );
}
