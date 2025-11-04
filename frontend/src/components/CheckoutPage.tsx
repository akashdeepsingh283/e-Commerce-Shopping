import { useState, useEffect } from 'react';
import { CreditCard, Package, Check } from 'lucide-react';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CheckoutPageProps {
  items: Product[];
  onOrderComplete: (orderId: string) => void;
}

export default function CheckoutPage({ items, onOrderComplete }: CheckoutPageProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: user.name || '',
    customerEmail: user.email || '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    postalCode: '',
    country: 'India',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const cartItems = items.reduce((acc, item) => {
    const existing = acc.find((i) => i.id === item.id);
    if (existing) existing.quantity += 1;
    else acc.push({ ...item, quantity: 1 });
    return acc;
  }, [] as CartItem[]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 50;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/payment/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });

      const order = await res.json();

      const options = {
        key: 'rzp_test_RZe6IBiBhKc4iu',
        amount: order.amount,
        currency: order.currency,
        name: 'Your Shop Name',
        description: 'Order Payment',
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          const verifyJson = await verifyRes.json();

          if (verifyJson.success) {
            const orderBody = {
              ...formData,
              totalAmount: total,
              paymentMethod: 'razorpay',
              items: cartItems.map((item) => ({
                product_id: item.id,
                product_name: item.name,
                product_price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
              })),
            };

            const orderSaveRes = await fetch(`${API_URL}/api/orders/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(orderBody),
            });

            const savedOrder = await orderSaveRes.json();
            onOrderComplete(savedOrder.id || savedOrder._id);
          } else {
            alert('❌ Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone,
        },
        theme: { color: '#121212' },
        modal: {
          ondismiss: function () {
            alert('⚠️ Payment cancelled by user.');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-light tracking-widest text-white mb-12 text-center">
          CHECKOUT
        </h1>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-zinc-950 border border-zinc-800 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Package className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-light tracking-wider text-white">
                  SHIPPING INFORMATION
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {['customerName', 'customerEmail', 'customerPhone', 'shippingAddress', 'city', 'postalCode'].map(
                  (field) => (
                    <div key={field}>
                      <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                        {field.replace('customer', '').replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </label>
                      <input
                        type={field === 'customerEmail' ? 'email' : 'text'}
                        name={field}
                        value={(formData as any)[field]}
                        onChange={field === 'customerEmail' ? undefined : handleChange}
                        required
                        disabled={field === 'customerEmail'}
                        className={`w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors ${
                          field === 'customerEmail' ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  )
                )}

                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">COUNTRY</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                  >
                    <option value="India">India</option>
                  </select>
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white text-black py-4 tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>{isSubmitting ? 'PROCESSING...' : 'PLACE ORDER'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 p-8">
              <h2 className="text-2xl font-light tracking-wider text-white mb-6">ORDER SUMMARY</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-zinc-800">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover" />
                    <div className="flex-1">
                      <h3 className="text-white font-light">{item.name}</h3>
                      <p className="text-zinc-500 text-sm">Qty: {item.quantity}</p>
                      <p className="text-white mt-1">
                        ₹ {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹ {shipping}</span>
                </div>
                <div className="flex justify-between text-white text-xl pt-3 border-t border-zinc-800">
                  <span className="tracking-wider">TOTAL</span>
                  <span className="tracking-wider">₹ {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <div className="flex items-start space-x-3 text-sm text-zinc-400">
                <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <p>
                  All pieces are carefully packaged in our signature gift box
                  with authenticity certificate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
