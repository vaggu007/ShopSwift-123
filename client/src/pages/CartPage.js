import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock cart data - in real app this would come from context/state management
const mockCartItems = [
  {
    id: 1,
    name: "Smart Watch",
    price: 79.99,
    quantity: 2,
    image: "http://localhost:5050/assets/smartwatch.jpg",
    category: "Electronics",
    inStock: true
  },
  {
    id: 2,
    name: "Wireless Earbuds",
    price: 59.99,
    quantity: 1,
    image: "http://localhost:5050/assets/earbuds.jpg",
    category: "Electronics",
    inStock: false
  },
  {
    id: 3,
    name: "Fitness Tracker",
    price: 45.99,
    quantity: 1,
    image: "http://localhost:5050/assets/fitnesstracker.jpg",
    category: "Electronics",
    inStock: true
  }
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    // Simulate loading cart data
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    const validCodes = {
      'SAVE10': { discount: 0.1, description: '10% off' },
      'WELCOME20': { discount: 0.2, description: '20% off first order' },
      'FREESHIP': { discount: 0, description: 'Free shipping', freeShipping: true }
    };

    if (validCodes[promoCode.toUpperCase()]) {
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        ...validCodes[promoCode.toUpperCase()]
      });
      setPromoCode('');
    } else {
      alert('Invalid promo code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedPromo || !appliedPromo.discount) return 0;
    return calculateSubtotal() * appliedPromo.discount;
  };

  const calculateShipping = () => {
    if (appliedPromo && appliedPromo.freeShipping) return 0;
    if (calculateSubtotal() > 50) return 0; // Free shipping over $50
    return 9.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateShipping();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-24 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0l-.4-2M7 13h10M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
          <p className="mt-2 text-sm text-gray-500">Start shopping to add items to your cart.</p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Items ({cartItems.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                        }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              <Link
                                to={`/products/${item.id}`}
                                className="hover:text-blue-600"
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                            <div className="mt-2">
                              {item.inStock ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  In Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <label htmlFor={`quantity-${item.id}`} className="sr-only">
                              Quantity
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800"
                                disabled={item.quantity <= 1}
                              >
                                −
                              </button>
                              <span className="px-4 py-1 border-l border-r border-gray-300 min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <button className="text-sm text-gray-600 hover:text-blue-600">
                              Save for Later
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Promo Code</h3>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                  <div>
                    <span className="font-medium text-green-800">{appliedPromo.code}</span>
                    <p className="text-sm text-green-600">{appliedPromo.description}</p>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-green-600 hover:text-green-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {appliedPromo && appliedPromo.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.description})</span>
                    <span>-${calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(calculateTotal() * 0.08).toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">
                      ${(calculateTotal() + calculateTotal() * 0.08).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 text-center block font-medium"
                >
                  Proceed to Checkout
                </Link>
                
                <button className="w-full bg-yellow-400 text-gray-900 py-3 px-4 rounded-md hover:bg-yellow-500 font-medium">
                  Pay with PayPal
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Secure checkout powered by SSL encryption
                </p>
              </div>
            </div>

            {/* Security & Trust */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Shop With Us?</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Secure Payment</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Money-back Guarantee</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <span className="text-sm text-gray-600">Fast & Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;