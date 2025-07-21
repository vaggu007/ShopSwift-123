import React from "react";

// Sample dummy data
const categories = ["Electronics", "Fashion", "Books", "Home", "Toys"];

function Categories() {
  return (
    <section>
      <h2>Categories</h2>
      <div style={{ display: "flex", gap: "1.5rem", margin: "1rem 0" }}>
        {categories.map((cat, i) => (
          <div key={i} style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
            {cat}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
