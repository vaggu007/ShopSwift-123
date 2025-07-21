import React from "react";
import { Link } from "react-router-dom";
// Only import if using a local React asset, not needed for Express asset below
// import logo from "../assets/shopswift.png";

export default function Navbar() {
  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {/* Main logo served by Express static assets */}
          <img
            src="http://localhost:5050/assets/shopswift.svg"
            alt="ShopSwift Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="text-xl font-bold text-blue-600">ShopSwift</span>
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-blue-600 font-medium">Home</Link>
          <Link to="/products" className="hover:text-blue-600 font-medium">Products</Link>
          <Link to="/categories" className="hover:text-blue-600 font-medium">Categories</Link>
        </div>
      </div>
    </nav>
  );
}