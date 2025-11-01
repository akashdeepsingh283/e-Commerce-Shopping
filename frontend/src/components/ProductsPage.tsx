import { useEffect, useState } from 'react';
import { ShoppingBag, SlidersHorizontal, X, Trash2 } from 'lucide-react';
import { localProducts } from '../data/products';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  in_stock: boolean;
  category?: string;
  category_id?: any;
}

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'earrings', name: 'Earrings' },
  { id: 'rings', name: 'Rings' },
  { id: 'necklaces', name: 'Necklaces' },
  { id: 'bracelets', name: 'Bracelets' },
  { id: 'pearls malas', name: 'Pearls Malas' },
  { id: 'pearls bracelets', name: 'Pearls Bracelets' },
];

interface ProductsPageProps {
  onBack: () => void;
  onViewProduct: (productSlug: string) => void;
  onAddToCart: (product: Product) => void;
  user?: any;
}

export default function ProductsPage({
  onBack,
  onViewProduct,
  onAddToCart,
  user,
}: ProductsPageProps) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); //  NEW STATE

  // Admin
  const ADMIN_EMAIL = 'akash@gmail.com';
  const isAdmin = user && user.email === ADMIN_EMAIL;

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    applyCategoryFilter();
  }, [selectedCategory, allProducts, searchQuery]); //  Search included

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/admin/products');
      let backendProducts: Product[] = [];

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) backendProducts = data;
        else if (data.products) backendProducts = data.products;

        backendProducts = backendProducts.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          price: p.price,
          images: p.images || [],
          in_stock: p.in_stock !== undefined ? p.in_stock : true,
          category: (p.category || p.category_id?.name || p.category_id?.slug || '').toLowerCase(),
          category_id: p.category_id,
        }));
      }

      const combined = [...backendProducts, ...localProducts];
      const deduped = Array.from(new Map(combined.map((p) => [p.slug, p])).values());
      setAllProducts(deduped);
    } catch {
      setAllProducts(localProducts);
    } finally {
      setLoading(false);
    }
  };

  const applyCategoryFilter = () => {
    let filtered = selectedCategory === 'all'
      ? allProducts
      : allProducts.filter((p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    setProducts(filtered);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsMobileFilterOpen(false);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!isAdmin) return alert('Not allowed');

    if (deleteConfirm !== productId) return setDeleteConfirm(productId);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert(`${productName} deleted`);
        setDeleteConfirm(null);
        fetchProducts();
      }
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <center className="mb-12 animate-fade-in">
          <h1 className="text-6xl font-light tracking-widest text-white mb-4">
            ALL PRODUCTS
          </h1>
          <p className="text-zinc-400 text-lg tracking-wide">
            Explore our complete collection of fine jewelry
          </p>
        </center>
           <button
              onClick={onBack}
              className="text-zinc-400 hover:text-white transition-colors mb-6 tracking-wider"
            >
              ← BACK TO HOME
            </button>


        <div className="flex gap-8">

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-zinc-950 border border-zinc-800 p-6 sticky top-24">
              <h2 className="text-xl font-light tracking-wider text-white mb-6">CATEGORIES</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full text-left px-4 py-3 transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-white text-black'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid Section */}
          <div className="flex-1">

            {/* Search Bar + Count */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-zinc-400">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>

              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 bg-zinc-900 border border-zinc-700 focus:border-white text-white px-4 py-2 tracking-wide placeholder:text-zinc-500 transition-colors"
              />
            </div>

            {loading ? (
              <div className="text-center text-zinc-400 py-20">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-400 text-lg mb-4">No products found</p>
                <button onClick={() => handleCategoryClick('all')} className="text-white hover:underline">
                  View all
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all"
                    style={{ animation: `fade-in-up 0.5s ease-out ${index * 0.05}s both` }}
                  >
                    <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => onViewProduct(product.slug)}>
                      <img src={product.images[0] || ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black px-6 py-3 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ShoppingBag className="w-4 h-4 inline mr-2" /> ADD TO BAG
                      </button>

                      {isAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id, product.name); }}
                          className={`absolute top-4 left-4 p-2 ${deleteConfirm === product.id ? 'bg-red-600 text-white' : 'bg-zinc-900/80 text-zinc-400 hover:bg-red-600 hover:text-white'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="p-6 cursor-pointer" onClick={() => onViewProduct(product.slug)}>
                      <h3 className="text-lg text-white mb-2">{product.name}</h3>
                      <p className="text-sm text-zinc-500 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between mt-3">
                        <span className="text-xl text-white">₹ {product.price.toLocaleString()}</span>
                        <span className="text-xs text-zinc-600 uppercase">{product.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
