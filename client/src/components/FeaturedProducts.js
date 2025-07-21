import React from "react";

// Sample dummy products
const products = [
  { id: 1, name: "Wireless Headphones", price: "$59.99" },
  { id: 2, name: "Smartwatch", price: "$99.99" },
  { id: 3, name: "Bluetooth Speaker", price: "$29.99" },
];

function FeaturedProducts() {
  return (
    <section>
      <h2>Featured Products</h2>
      <div style={{ display: "flex", gap: "2rem", margin: "1rem 0" }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: "1px solid #aaa", padding: "1rem", borderRadius: "8px" }}>
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;
