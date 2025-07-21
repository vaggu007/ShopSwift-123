import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white py-10 mt-16">
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-8 mb-6 text-base font-medium">
          <Link to="/about" className="hover:underline">About Us</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/track-order" className="hover:underline">Track Order</Link>
          <Link to="/return-policy" className="hover:underline">Return Policy</Link>
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
        </div>
        {/* Copyright */}
        <div className="text-center text-lg font-normal">
          &copy; 2025 ShopSwift Team. All rights reserved.
        </div>
      </div>
    </footer>
  );
}