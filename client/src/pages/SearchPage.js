import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PRODUCTS } from './ProductsPage';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories from products
  const categories = [...new Set(PRODUCTS.map(p => p.category))];

  useEffect(() => {
    // Simulate search API call
    setIsLoading(true);
    setTimeout(() => {
      if (query.trim()) {
        const results = PRODUCTS.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
        setFilteredResults(results);
      } else {
        setSearchResults([]);
        setFilteredResults([]);
      }
      setIsLoading(false);
    }, 500);
  }, [query]);

  useEffect(() => {
    let results = [...searchResults];

    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory);
    }

    // Apply price range filter
    results = results.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // relevance
        // Keep original order (could implement relevance scoring here)
        break;
    }

    setFilteredResults(results);
  }, [searchResults, selectedCategory, priceRange, sortBy]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-64"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 w-48"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          {query && (
            <p className="text-gray-600">
              {filteredResults.length} results for "<span className="font-semibold">{query}</span>"
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {showFilters ? 'Hide' : 'Show'}
                </button>
              </div>
              
              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value="all"
                        checked={selectedCategory === 'all'}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">All Categories</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">${priceRange[0]}</span>
                      <span className="text-sm text-gray-600">${priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPriceRange([0, 50])}
                      className="block w-full text-left text-sm text-gray-700 hover:text-blue-600"
                    >
                      Under $50
                    </button>
                    <button
                      onClick={() => setPriceRange([50, 100])}
                      className="block w-full text-left text-sm text-gray-700 hover:text-blue-600"
                    >
                      $50 - $100
                    </button>
                    <button
                      onClick={() => setPriceRange([100, 500])}
                      className="block w-full text-left text-sm text-gray-700 hover:text-blue-600"
                    >
                      $100 - $500
                    </button>
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange([0, 1000]);
                    setSortBy('relevance');
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredResults.length} of {searchResults.length} results
              </p>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {/* No Results */}
            {filteredResults.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {query ? `No products match "${query}".` : 'Try searching for something.'}
                </p>
                <div className="mt-6">
                  <Link
                    to="/products"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Browse All Products
                  </Link>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {filteredResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group"
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Product';
                        }}
                      />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {renderStars(product.rating)}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          ({product.rating})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Load More Button (for pagination) */}
            {filteredResults.length > 0 && filteredResults.length >= 12 && (
              <div className="text-center mt-12">
                <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors duration-200">
                  Load More Results
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;