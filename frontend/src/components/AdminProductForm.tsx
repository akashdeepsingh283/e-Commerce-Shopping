import { useState, useEffect } from 'react';
import { X, Upload, Plus, Minus } from 'lucide-react';

interface AdminProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001';

export default function AdminProductForm({ isOpen, onClose, onSuccess }: AdminProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category_id: '',
    collection_id: '',
    images: [''],
    materials: [''],
    in_stock: true,
    featured: false,
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/collections`);
      if (res.ok) {
        const data = await res.json();
        setCollections(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch collections', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleArrayChange = (index: number, value: string, field: 'images' | 'materials') => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: 'images' | 'materials') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (index: number, field: 'images' | 'materials') => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData({ ...formData, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Clean up data
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        collection_id: formData.collection_id || null,
        images: formData.images.filter(img => img.trim() !== ''),
        materials: formData.materials.filter(mat => mat.trim() !== ''),
        in_stock: formData.in_stock,
        featured: formData.featured,
      };

      const res = await fetch(`${API_BASE}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      setSuccess('Product created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        category_id: '',
        collection_id: '',
        images: [''],
        materials: [''],
        in_stock: true,
        featured: false,
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-50">
        <div className="bg-zinc-950 border border-zinc-800 p-8 m-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-light tracking-widest text-white">
              ADD PRODUCT
            </h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-900 text-green-400 px-4 py-3 mb-6 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                PRODUCT NAME *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                placeholder="Diamond Necklace"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                SLUG * (URL-friendly name)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="flex-1 bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                  placeholder="diamond-necklace"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="bg-zinc-900 text-white px-4 py-3 border border-zinc-800 hover:border-white transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                DESCRIPTION
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors resize-none"
                placeholder="Product description..."
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                PRICE * (INR)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                placeholder="299.99"
              />
            </div>

            {/* Category & Collection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                  CATEGORY
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                  COLLECTION
                </label>
                <select
                  name="collection_id"
                  value={formData.collection_id}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                >
                  <option value="">Select Collection</option>
                  {collections.map((col) => (
                    <option key={col.id || col._id} value={col.id || col._id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                IMAGE URLS
              </label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'images')}
                    className="flex-1 bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'images')}
                      className="bg-red-900/20 text-red-400 px-4 py-3 border border-red-900 hover:bg-red-900/30 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('images')}
                className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Image</span>
              </button>
            </div>

            {/* Materials */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                MATERIALS
              </label>
              {formData.materials.map((material, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'materials')}
                    className="flex-1 bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                    placeholder="18K Gold, Diamond, etc."
                  />
                  {formData.materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'materials')}
                      className="bg-red-900/20 text-red-400 px-4 py-3 border border-red-900 hover:bg-red-900/30 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('materials')}
                className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Material</span>
              </button>
            </div>

            {/* Checkboxes */}
            <div className="flex gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="in_stock"
                  checked={formData.in_stock}
                  onChange={handleChange}
                  className="w-5 h-5 bg-black border border-zinc-800 text-white focus:ring-0"
                />
                <span className="text-zinc-400 text-sm tracking-wider">IN STOCK</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 bg-black border border-zinc-800 text-white focus:ring-0"
                />
                <span className="text-zinc-400 text-sm tracking-wider">FEATURED</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'CREATING...' : 'CREATE PRODUCT'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}