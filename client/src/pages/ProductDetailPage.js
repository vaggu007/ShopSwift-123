import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from './ProductsPage';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const prod = PRODUCTS.find(p => String(p.id) === String(id));
      setProduct(prod || null);
      
      if (prod) {
        // Get related products from same category
        const related = PRODUCTS.filter(p => 
          p.category === prod.category && p.id !== prod.id
        ).slice(0, 4);
        setRelatedProducts(related);
      }
      
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleAddToCart = () => {
    // For now, just show an alert. Later this will integrate with cart state
    alert(`Added ${quantity} ${product.name}(s) to cart!`);
  };

  const handleQuantityChange = (increment) => {
    setQuantity(prev => Math.max(1, prev + increment));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-96 rounded-lg mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-20 rounded"></div>
                ))}
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-3/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Product not found</h3>
          <p className="mt-1 text-sm text-gray-500">The product you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Mock additional images for gallery
  const productImages = [
    product.image,
    product.image, // In real app, these would be different angles
    product.image,
    product.image
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/products" className="ml-1 text-gray-500 hover:text-gray-700 md:ml-2">
                  Products
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            <div className="mb-4">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg cursor-pointer"
                onClick={() => setShowImageModal(true)}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Product+Image';
                }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className={`h-20 object-cover rounded cursor-pointer border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x100?text=Img';
                  }}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderStars(product.rating)}
                <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
              </div>
              <span className="mx-3 text-gray-300">|</span>
              <span className="text-sm text-gray-600">
                {product.reviews?.length || 0} reviews
              </span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.originalPrice && (
                <span className="ml-3 text-lg text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                product.inStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 border-l border-r border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  +
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Add to Cart
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-4 mb-8">
              <button className="flex items-center text-gray-600 hover:text-red-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Add to Wishlist
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            </div>

            {/* Product Features */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Product Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free shipping on orders over $50
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  30-day return policy
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1-year warranty included
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {['description', 'reviews', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-8 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-8">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                <p className="text-gray-600 leading-relaxed">
                  This high-quality product is designed to meet your needs with exceptional performance and reliability. 
                  Crafted with attention to detail and built to last, it represents excellent value for your investment.
                </p>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center mb-2">
                          <span className="font-semibold text-gray-900">{review.user}</span>
                          <div className="ml-4 flex">
                            {renderStars(review.stars)}
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                <div className="space-y-3 text-gray-600">
                  <p><strong>Standard Shipping:</strong> 5-7 business days - Free on orders over $50</p>
                  <p><strong>Express Shipping:</strong> 2-3 business days - $9.99</p>
                  <p><strong>Overnight Shipping:</strong> Next business day - $19.99</p>
                  <p><strong>International Shipping:</strong> 10-15 business days - Starting at $25</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Product';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{relatedProduct.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">${relatedProduct.price}</p>
                    <div className="flex items-center">
                      {renderStars(relatedProduct.rating)}
                      <span className="ml-2 text-sm text-gray-500">({relatedProduct.rating})</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={productImages[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
