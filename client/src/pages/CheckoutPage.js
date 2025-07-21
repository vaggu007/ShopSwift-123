import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock cart items - in real app this would come from context/state management
const mockCartItems = [
  {
    id: 1,
    name: "Smart Watch",
    price: 79.99,
    quantity: 2,
    image: "http://localhost:5050/assets/smartwatch.jpg"
  },
  {
    id: 3,
    name: "Fitness Tracker",
    price: 45.99,
    quantity: 1,
    image: "http://localhost:5050/assets/fitnesstracker.jpg"
  }
];

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems] = useState(mockCartItems);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: 'same'
  });

  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, name: 'Shipping', icon: '🚚' },
    { id: 2, name: 'Payment', icon: '💳' },
    { id: 3, name: 'Review', icon: '📋' }
  ];

  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', price: 0, time: '5-7 business days' },
    { id: 'express', name: 'Express Shipping', price: 9.99, time: '2-3 business days' },
    { id: 'overnight', name: 'Overnight Shipping', price: 19.99, time: 'Next business day' }
  ];

  const handleInputChange = (section, field, value) => {
    if (section === 'shipping') {
      setShippingInfo(prev => ({ ...prev, [field]: value }));
    } else if (section === 'payment') {
      setPaymentInfo(prev => ({ ...prev, [field]: value }));
    } else if (section === 'billing') {
      setBillingInfo(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Validate shipping info
      if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) newErrors.email = 'Email is invalid';
      if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone is required';
      if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
      if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
      if (!shippingInfo.state.trim()) newErrors.state = 'State is required';
      if (!shippingInfo.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    } else if (step === 2) {
      // Validate payment info
      if (paymentMethod === 'card') {
        if (!paymentInfo.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
        if (!paymentInfo.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
        if (!paymentInfo.cvv.trim()) newErrors.cvv = 'CVV is required';
        if (!paymentInfo.nameOnCard.trim()) newErrors.nameOnCard = 'Name on card is required';
        
        if (paymentInfo.billingAddress === 'different') {
          if (!billingInfo.firstName.trim()) newErrors.billingFirstName = 'First name is required';
          if (!billingInfo.lastName.trim()) newErrors.billingLastName = 'Last name is required';
          if (!billingInfo.address.trim()) newErrors.billingAddress = 'Address is required';
          if (!billingInfo.city.trim()) newErrors.billingCity = 'City is required';
          if (!billingInfo.state.trim()) newErrors.billingState = 'State is required';
          if (!billingInfo.zipCode.trim()) newErrors.billingZipCode = 'ZIP code is required';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const option = shippingOptions.find(opt => opt.id === shippingMethod);
    return option ? option.price : 0;
  };

  const calculateTax = () => {
    return (calculateSubtotal() + calculateShipping()) * 0.08;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Order placed successfully! (This is a demo)');
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/cart" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to Cart
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="John"
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Doe"
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="123 Main St"
                      />
                      {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.apartment}
                        onChange={(e) => handleInputChange('shipping', 'apartment', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Apt 4B"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="New York"
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <select
                        value={shippingInfo.state}
                        onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.state ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select State</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        {/* Add more states as needed */}
                      </select>
                      {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.zipCode}
                        onChange={(e) => handleInputChange('shipping', 'zipCode', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.zipCode ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="10001"
                      />
                      {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                    </div>
                  </div>

                  {/* Shipping Methods */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h3>
                    <div className="space-y-3">
                      {shippingOptions.map((option) => (
                        <label key={option.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            checked={shippingMethod === option.id}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-900">{option.name}</span>
                              <span className="font-medium text-gray-900">
                                {option.price === 0 ? 'Free' : `$${option.price.toFixed(2)}`}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{option.time}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Information */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
                  
                  {/* Payment Methods */}
                  <div className="mb-6">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">PayPal</span>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.cardNumber}
                            onChange={(e) => handleInputChange('payment', 'cardNumber', formatCardNumber(e.target.value))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                          />
                          {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => handleInputChange('payment', 'expiryDate', formatExpiryDate(e.target.value))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.cvv}
                            onChange={(e) => handleInputChange('payment', 'cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.cvv ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="123"
                            maxLength="4"
                          />
                          {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name on Card
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.nameOnCard}
                            onChange={(e) => handleInputChange('payment', 'nameOnCard', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.nameOnCard ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="John Doe"
                          />
                          {errors.nameOnCard && <p className="mt-1 text-sm text-red-600">{errors.nameOnCard}</p>}
                        </div>
                      </div>

                      {/* Billing Address */}
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="billingAddress"
                              value="same"
                              checked={paymentInfo.billingAddress === 'same'}
                              onChange={(e) => handleInputChange('payment', 'billingAddress', e.target.value)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">Same as shipping address</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="billingAddress"
                              value="different"
                              checked={paymentInfo.billingAddress === 'different'}
                              onChange={(e) => handleInputChange('payment', 'billingAddress', e.target.value)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">Use a different billing address</span>
                          </label>
                        </div>

                        {paymentInfo.billingAddress === 'different' && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Billing address fields - similar to shipping */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                              </label>
                              <input
                                type="text"
                                value={billingInfo.firstName}
                                onChange={(e) => handleInputChange('billing', 'firstName', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors.billingFirstName ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="John"
                              />
                              {errors.billingFirstName && <p className="mt-1 text-sm text-red-600">{errors.billingFirstName}</p>}
                            </div>
                            {/* Add other billing fields as needed */}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="text-center py-8">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">PayPal Payment</h3>
                        <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment.</p>
                        <button className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-yellow-500">
                          Continue with PayPal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>
                  
                  {/* Order Items */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64x64?text=Product';
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <span className="font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info Summary */}
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipping Address</h3>
                    <p className="text-gray-700">
                      {shippingInfo.firstName} {shippingInfo.lastName}<br />
                      {shippingInfo.address}<br />
                      {shippingInfo.apartment && `${shippingInfo.apartment}<br />`}
                      {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                      {shippingInfo.country}
                    </p>
                  </div>

                  {/* Payment Info Summary */}
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Method</h3>
                    {paymentMethod === 'card' ? (
                      <p className="text-gray-700">
                        Card ending in {paymentInfo.cardNumber.slice(-4)}<br />
                        {paymentInfo.nameOnCard}
                      </p>
                    ) : (
                      <p className="text-gray-700">PayPal</p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="px-8 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Place Order'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>🔒 Your payment information is secure and encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;