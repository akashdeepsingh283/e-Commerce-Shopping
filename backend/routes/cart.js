const express = require('express');
const jwt = require('jsonwebtoken');
const Cart = require('../models/cart');
const router = express.Router();

// 🔐 Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Helper function to format cart response
const formatCartResponse = (cart) => {
  if (!cart || !cart.items) return [];
  
  return cart.items.map(item => ({
    id: item.productId,
    name: item.name,
    price: item.price,
    images: item.images || [],
    description: item.description || '',
    materials: item.materials || [],
    slug: item.slug || '',
    quantity: item.quantity,
    in_stock: item.in_stock !== false, // default to true
  }));
};

// 🛒 Get cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    res.json(formatCartResponse(cart));
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ➕ Add to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const productData = req.body;
    
    console.log('Received product data:', productData); // Debug log

    // Validate required fields
    if (!productData.productId || !productData.name || productData.price === undefined) {
      return res.status(400).json({ 
        message: 'Product ID, name, and price are required',
        received: productData
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    const cartItem = {
      productId: productData.productId,
      name: productData.name,
      price: productData.price,
      images: productData.images || [],
      description: productData.description || '',
      materials: productData.materials || [],
      slug: productData.slug || productData.productId,
      quantity: productData.quantity || 1,
    };

    if (!cart) {
      // Create new cart with the product
      cart = await Cart.create({
        user: req.user.id,
        items: [cartItem],
      });
      console.log('Created new cart for user:', req.user.id);
    } else {
      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productData.productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += (productData.quantity || 1);
        console.log('Updated quantity for product:', productData.productId);
      } else {
        // Add new item
        cart.items.push(cartItem);
        console.log('Added new product to cart:', productData.productId);
      }

      await cart.save();
    }

    res.json(formatCartResponse(cart));
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// ❌ Remove from cart
router.post('/remove', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId !== productId);
    await cart.save();

    res.json(formatCartResponse(cart));
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔄 Update quantity
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items = cart.items.filter(item => item.productId !== productId);
    } else {
      // Update quantity
      const item = cart.items.find(item => item.productId === productId);
      if (item) {
        item.quantity = quantity;
      }
    }

    await cart.save();
    res.json(formatCartResponse(cart));
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🧹 Clear cart
router.post('/clear', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json([]);
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;