import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { localProducts } from '../data/products';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  in_stock: boolean;
  featured?: boolean;
}

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  onViewProduct: (productSlug: string) => void;
}

export default function ProductGrid({ onAddToCart, onViewProduct }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products?featured=true`);
      let backendProducts: Product[] = [];

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          backendProducts = data;
        } else if (data.products && Array.isArray(data.products)) {
          backendProducts = data.products;
        }

        backendProducts = backendProducts.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          price: p.price,
          images: p.images || [],
          in_stock: p.in_stock !== undefined ? p.in_stock : true,
          featured: p.featured || false,
        }));
      }

      const combined = [...backendProducts, ...localProducts];
      const featured = combined.filter((p) => p.featured);
      const deduped = Array.from(new Map(featured.map((p) => [p.slug, p])).values());

      setProducts(deduped);
    } catch (err) {
      setProducts(localProducts.filter((p) => p.featured));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);

    toast.success(`${product.name} added to your bag!`, {
      position: 'top-right',
      autoClose: 2000,
      theme: 'dark',
    });
  };

  if (loading) {
    return (
      <section className="py-24 bg-zinc-950">
        <div className="text-center text-zinc-400">Loading products...</div>
      </section>
    );
  }

  return (
    <section id="products" className="py-24 bg-zinc-950">
      <ToastContainer />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-light tracking-widest text-white mb-4">
            FEATURED PIECES
          </h2>
          <p className="text-zinc-400 tracking-wide">
            Check Out Our Customer Favorites- Best Sellers!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group relative bg-black border border-zinc-800 overflow-hidden hover:border-zinc-600 transition-all duration-500"
              style={{
                animation: `fade-in-up 0.8s ease-out ${index * 0.1}s both`,
              }}
            >
              <div
                className="relative aspect-square overflow-hidden cursor-pointer"
                onClick={() => onViewProduct(product.slug)}
              >
                <img
                  src={product.images[0] || ''}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black 
                  px-3 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm flex items-center space-x-1 sm:space-x-2 
                  opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-500"
                >
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="tracking-wider">ADD TO BAG</span>
                </button>
              </div>

              <div className="p-4 sm:p-6 cursor-pointer" onClick={() => onViewProduct(product.slug)}>
                <h3 className="text-base sm:text-xl font-light tracking-wide text-white mb-1 sm:mb-2">
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg sm:text-2xl text-white tracking-wider">
                    ₹ {product.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/*  VIEW MORE BUTTON */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate("/products")}
            className="inline-block px-10 py-3 border border-zinc-700 text-white tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            View More
          </button>
        </div>

      </div>
    </section>
  );
}
