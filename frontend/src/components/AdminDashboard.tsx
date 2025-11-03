import { useState, useEffect } from 'react';
import { Clock, CheckCircle, X, ChevronDown, ChevronUp, User, Mail, Phone, MapPin, Calendar, Package } from 'lucide-react';

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

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'current' | 'past'>('all');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersRes = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setAllOrders(ordersData);
        
        const current = ordersData.filter((o: Order) => 
          o.status === 'pending' || o.status === 'processing' || o.status === 'shipped'
        );
        const past = ordersData.filter((o: Order) => 
          o.status === 'delivered' || o.status === 'cancelled'
        );
        
        setCurrentOrders(current);
        setPastOrders(past);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) {
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrderItems(prev => ({ ...prev, [orderId]: data.items || [] }));
        setExpandedOrder(orderId);
      }
    } catch (err) {
      console.error('Failed to fetch order items', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchOrders();
        alert('Order status updated successfully');
      }
    } catch (err) {
      console.error('Failed to update order status', err);
      alert('Failed to update order status');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
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
              <h3 className="text-xl text-white font-light">
                Order #{order._id.slice(-8).toUpperCase()}
              </h3>
              <span
                className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider border ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-zinc-300">
                  <User className="w-4 h-4 text-zinc-500" />
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex items-center space-x-2 text-zinc-400 text-sm">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <span>{order.customer_email}</span>
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

            {/* Order Info */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-zinc-400 text-sm">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span>{formatDate(order.createdAt)} at {formatTime(order.createdAt)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs mb-1">Total Amount</p>
                <p className="text-white text-2xl font-light">
                  ₹{order.total_amount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          <div className="ml-6 flex flex-col items-end space-y-3">
            <select
              value={order.status}
              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 text-white border border-zinc-700 px-4 py-2 rounded text-sm hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
                      Quantity: {item.quantity} × ₹{item.product_price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <p className="text-white text-lg font-light">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading orders...</div>
      </div>
    );
  }

  const displayOrders = activeTab === 'all' ? allOrders : activeTab === 'current' ? currentOrders : pastOrders;

  return (
    <div className="min-h-screen bg-black px-4 py-12 pt-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-light tracking-widest text-white mb-2">
              ADMIN DASHBOARD
            </h1>
            <p className="text-zinc-500 tracking-wide">Manage all customer orders</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-900 rounded"
          >
            <X className="w-8 h-8" />
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
            <p className="text-zinc-500 text-sm mb-2 tracking-wider">COMPLETED ORDERS</p>
            <p className="text-white text-4xl font-light">{pastOrders.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 px-6 tracking-wider transition-all ${
              activeTab === 'all'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            ALL ORDERS ({allOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-4 px-6 tracking-wider transition-all ${
              activeTab === 'current'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Clock className="w-5 h-5 inline mr-2" />
            CURRENT ({currentOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-4 px-6 tracking-wider transition-all ${
              activeTab === 'past'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CheckCircle className="w-5 h-5 inline mr-2" />
            COMPLETED ({pastOrders.length})
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {displayOrders.length === 0 ? (
            <div className="text-center text-zinc-400 py-12 bg-zinc-950 border border-zinc-800 rounded">
              <Package className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
              <p className="text-lg">No orders found</p>
            </div>
          ) : (
            displayOrders.map((order) => <OrderCard key={order._id} order={order} />)
          )}
        </div>
      </div>
    </div>
  );
}