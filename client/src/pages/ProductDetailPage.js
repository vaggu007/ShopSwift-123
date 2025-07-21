import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Use named import for PRODUCTS from ProductsPage.js
import { PRODUCTS } from './ProductsPage'; // Adjust path if needed

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Find product by id from PRODUCTS array
    const prod = PRODUCTS.find(p => String(p.id) === String(id));
    setProduct(prod || null);
  }, [id]);

  if (!product) return <div>Product not found.</div>;

  return (
    <div className="product-detail">
      <h2>{product.name}</h2>
      <img src={product.image} alt={product.name} style={{maxWidth: '300px'}} />
      <p>{product.description}</p>
      <p><strong>Price:</strong> ${product.price}</p>
      {/* Add more product details as needed */}
    </div>
  );
};

export default ProductDetailPage;
