import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock wishlist data
const mockWishlistItems = [
  {
    id: 1,
    name: "Smart Watch",
    price: 79.99,
    originalPrice: 99.99,
    image: "http://localhost:5050/assets/smartwatch.jpg",
    category: "Electronics",
    rating: 4.7,
    inStock: true,
    discount: 20,
    dateAdded: '2024-01-15'
  },
  {
    id: 2,
    name: "Wireless Earbuds",
    price: 59.99,
    originalPrice: 79.99,
    image: "http://localhost:5050/assets/earbuds.jpg",
    category: "Electronics",
    rating: 4.5,
    inStock: false,
    discount: 25,
    dateAdded: '2024-01-12'
  },
  {
    id: 3,
    name: "Fitness Tracker",
    price: 45.99,
    originalPrice: 55.99,
    image: "http://localhost:5050/assets/fitnesstracker.jpg",
    category: "Electronics",
    rating: 4.3,
    inStock: true,
    discount: 18,
    dateAdded: '2024-01-10'
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: 39.99,
    originalPrice: 49.99,
    image: "http://localhost:5050/assets/bluetoothspeaker.jpg",
    category: "Electronics",
    rating: 4.6,
    inStock: true,
    discount: 20,
    dateAdded: '2024-01-08'
  }
];

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterBy, setFilterBy] = useState('all');

  const handleRemoveItem = (itemId) => {
    setWishlistItems(items => items.filter(item => item.id !== itemId));
    setSelectedItems(selected => selected.filter(id => id !== itemId));
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.id));
    }
  };

  const handleRemoveSelected = () => {
    setWishlistItems(items => items.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const handleAddToCart = (item) => {
    if (item.inStock) {
      alert(`Added ${item.name} to cart!`);
    }
  };

  const handleMoveAllToCart = () => {
    const inStockItems = selectedItems.filter(id => {
      const item = wishlistItems.find(item => item.id === id);
      return item && item.inStock;
    });
    
    if (inStockItems.length > 0) {
      alert(`Added ${inStockItems.length} items to cart!`);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getSortedAndFilteredItems = () => {
    let filteredItems = [...wishlistItems];

    // Apply filters
    if (filterBy === 'inStock') {
      filteredItems = filteredItems.filter(item => item.inStock);
    } else if (filterBy === 'outOfStock') {
      filteredItems = filteredItems.filter(item => !item.inStock);
    } else if (filterBy === 'onSale') {
      filteredItems = filteredItems.filter(item => item.discount > 0);
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filteredItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_low':
        filteredItems.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filteredItems.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredItems.sort((a, b) => b.rating - a.rating);
        break;
      case 'dateAdded':
      default:
        filteredItems.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
    }

    return filteredItems;
  };

  const sortedAndFilteredItems = getSortedAndFilteredItems();

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
          <p className="mt-2 text-sm text-gray-500">Start adding products you love to your wishlist.</p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Start Shopping
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="mt-2 text-gray-600">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Selection Controls */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.length === wishlistItems.length && wishlistItems.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Select All ({selectedItems.length})
                </span>
              </label>

              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMoveAllToCart}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                  >
                    Add to Cart ({selectedItems.length})
                  </button>
                  <button
                    onClick={handleRemoveSelected}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Selected
                  </button>
                </div>
              )}
            </div>

            {/* Sort and Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Filter:</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Items</option>
                  <option value="inStock">In Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                  <option value="onSale">On Sale</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dateAdded">Date Added</option>
                  <option value="name">Name A-Z</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAndFilteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group">
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white"
                />
              </div>

              {/* Remove Button */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Image */}
              <div className="relative">
                <Link to={`/products/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Product';
                    }}
                  />
                </Link>

                {/* Discount Badge */}
                {item.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                    -{item.discount}%
                  </div>
                )}

                {/* Stock Status */}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <Link
                    to={`/products/${item.id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {renderStars(item.rating)}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">({item.rating})</span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">${item.price}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${item.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.inStock}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                  >
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${item.id}`}
                      className="flex-1 text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm"
                    >
                      View Details
                    </Link>
                    <button className="flex-1 text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm">
                      Share
                    </button>
                  </div>
                </div>

                {/* Date Added */}
                <div className="mt-3 text-xs text-gray-500">
                  Added {new Date(item.dateAdded).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for Filtered Results */}
        {sortedAndFilteredItems.length === 0 && wishlistItems.length > 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No items match your filter</h3>
            <p className="mt-2 text-sm text-gray-500">Try adjusting your filter criteria.</p>
            <button
              onClick={() => setFilterBy('all')}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Summary Card */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wishlist Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{wishlistItems.length}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {wishlistItems.filter(item => item.inStock).length}
                </div>
                <div className="text-sm text-gray-600">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${wishlistItems.reduce((total, item) => total + item.price, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;