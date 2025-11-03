import { useState, useEffect } from 'react';
import { Clock, CheckCircle, X, ChevronDown, ChevronUp, Package, MapPin, Calendar,  Phone, Truck } from 'lucide-react';

interface Order {
  _id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  city?: string;
  postal_code?: string;
  country?: string;
  total_amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  _id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

interface UserOrdersPageProps {
  onBack: () => void;
}



export default function UserOrdersPage({ onBack }: UserOrdersPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'current' | 'completed'>('all');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your orders');
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5001/api/user/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await res.json();
      setAllOrders(data);
      
      // Filter orders by status
      const current = data.filter((o: Order) => 
        o.status === 'pending' || o.status === 'processing' || o.status === 'shipped'
      );
      const completed = data.filter((o: Order) => 
        o.status === 'delivered' || o.status === 'cancelled'
      );
      
      setCurrentOrders(current);
      setCompletedOrders(completed);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

 const fetchOrderItems = async (orderId: string) => {
    // If already expanded, just toggle
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    // If items already loaded, just expand
    if (orderItems[orderId]) {
      setExpandedOrder(orderId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/user/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrderItems(prev => ({ ...prev, [orderId]: data.items || [] }));
        setExpandedOrder(orderId);
      }
    } catch (err) {
      console.error('Failed to fetch order items', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'processing': return 'bg-blue-900 text-blue-200 border-blue-700';
      case 'shipped': return 'bg-purple-900 text-purple-200 border-purple-700';
      case 'delivered': return 'bg-green-900 text-green-200 border-green-700';
      case 'cancelled': return 'bg-red-900 text-red-200 border-red-700';
      default: return 'bg-zinc-800 text-zinc-300 border-zinc-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'processing': return <Package className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <X className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-zinc-950 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
      <div
        className="p-6 cursor-pointer"
        onClick={() => fetchOrderItems(order._id)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <h3 className="text-xl text-white font-light tracking-wider">
                Order #{order._id.slice(-8).toUpperCase()}
              </h3>
              <span
                className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider border flex items-center space-x-1 ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                <span>{order.status}</span>
              </span>
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-zinc-400 text-sm">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span>Ordered: {formatDate(order.createdAt)} at {formatTime(order.createdAt)}</span>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center space-x-2 text-zinc-400 text-sm">
                    <Phone className="w-4 h-4 text-zinc-500" />
                    <span>{order.customer_phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-zinc-400 text-sm">
                  <MapPin className="w-4 h-4 text-zinc-500 mt-1 flex-shrink-0" />
                  <div>
                    <p>{order.shipping_address}</p>
                    {order.city && <p>{order.city} {order.postal_code}</p>}
                    {order.country && <p>{order.country}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div className="text-zinc-400 text-sm">
                {expandedOrder === order._id ? 'Click to collapse' : 'Click to view items'}
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs mb-1">Total Amount</p>
                <p className="text-white text-2xl font-light">
                  ${order.total_amount.toLocaleString('en-US')}
                </p>
              </div>
            </div>
          </div>

          <div className="ml-6">
            {expandedOrder === order._id ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      {expandedOrder === order._id && orderItems[order._id] && (
        <div className="border-t border-zinc-800 bg-black">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-zinc-500" />
              <h4 className="text-white font-light tracking-wider">ORDER ITEMS</h4>
            </div>
            <div className="space-y-3">
              {orderItems[order._id].map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center bg-zinc-950 p-4 rounded border border-zinc-800"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">{item.product_name}</p>
                    <p className="text-zinc-500 text-sm">
                      Quantity: {item.quantity} × ${item.product_price.toLocaleString('en-US')}
                    </p>
                  </div>
                  <p className="text-white text-lg font-light">
                    ${item.subtotal.toLocaleString('en-US')}
                  </p>
                </div>
              ))}
            </div>

            {/* Track Order Button */}
            {(order.status === 'processing' || order.status === 'shipped') && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <button className="w-full bg-zinc-900 text-white py-3 px-4 border border-zinc-700 hover:bg-zinc-800 transition-colors flex items-center justify-center space-x-2">
                  <Truck className="w-4 h-4" />
                  <span className="tracking-wider text-sm">TRACK ORDER</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-32">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="bg-white text-black px-6 py-3 tracking-wider hover:bg-zinc-200 transition-colors"
          >
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  const displayOrders = activeTab === 'all' ? allOrders : activeTab === 'current' ? currentOrders : completedOrders;

  return (
    <div className="min-h-screen bg-black px-4 py-12 pt-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-light tracking-widest text-white mb-2">
              MY ORDERS
            </h1>
            <p className="text-zinc-500 tracking-wide">Track and manage your orders</p>
          </div>
          <button
            onClick={onBack}
            className="text-zinc-400 hover:text-white transition-colors tracking-wider"
          >
            ← BACK TO HOME
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <p className="text-zinc-500 text-sm mb-2 tracking-wider">TOTAL ORDERS</p>
            <p className="text-white text-4xl font-light">{allOrders.length}</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <p className="text-zinc-500 text-sm mb-2 tracking-wider">CURRENT ORDERS</p>
            <p className="text-white text-4xl font-light">{currentOrders.length}</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <p className="text-zinc-500 text-sm mb-2 tracking-wider">COMPLETED</p>
            <p className="text-white text-4xl font-light">{completedOrders.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 px-6 tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            ALL ({allOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-4 px-6 tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'current'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Clock className="w-5 h-5 inline mr-2" />
            CURRENT ({currentOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-4 px-6 tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'completed'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CheckCircle className="w-5 h-5 inline mr-2" />
            COMPLETED ({completedOrders.length})
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {displayOrders.length === 0 ? (
            <div className="text-center text-zinc-400 py-12 bg-zinc-950 border border-zinc-800 rounded">
              <Package className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
              <p className="text-lg mb-2">No orders found</p>
              <p className="text-sm text-zinc-600">
                {activeTab === 'current' 
                  ? 'You don\'t have any active orders' 
                  : activeTab === 'completed'
                  ? 'You haven\'t completed any orders yet'
                  : 'Start shopping to see your orders here'}
              </p>
            </div>
          ) : (
            displayOrders.map((order) => <OrderCard key={order._id} order={order} />)
          )}
        </div>
      </div>
    </div>
  );
}