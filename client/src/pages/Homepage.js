import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const deals = [
  { id: 101, name: "Noise Cancelling Headphones", image: "http://localhost:5050/assets/wirelessheadphones.jpg", price: 129.99, discount: "30% OFF" },
  { id: 102, name: "4K Smart TV", image: "http://localhost:5050/assets/4ksmarttv.jpg", price: 349.99, discount: "25% OFF" },
  { id: 103, name: "Gaming Mouse", image: "http://localhost:5050/assets/gamingmouse.jpg", price: 29.99, discount: "50% OFF" },
];

const reviews = [
  { name: "Priya S.", text: "Best online shopping experience. Loved the quick delivery!", rating: 5 },
  { name: "Daniel W.", text: "Top quality electronics at great prices!", rating: 5 },
  { name: "Alicia K.", text: "Superb support, my favorite e-commerce site!", rating: 5 },
];

const featured = [
  { id: 1, name: "Smart Watch", price: 79.99, image: "http://localhost:5050/assets/smartwatch.jpg", description: "Feature-rich smart watch for fitness and notifications." },
  { id: 2, name: "Wireless Earbuds", price: 59.99, image: "http://localhost:5050/assets/earbuds.jpg", description: "High-quality sound with true wireless freedom." },
  { id: 3, name: "Fitness Tracker", price: 45.99, image: "http://localhost:5050/assets/fitnesstracker.jpg", description: "Track your daily activity and health metrics." },
  { id: 4, name: "Bluetooth Speaker", price: 39.99, image: "http://localhost:5050/assets/bluetoothspeaker.jpg", description: "Portable speaker with amazing sound quality." },
  { id: 5, name: "Smart Bulb", price: 19.99, image: "http://localhost:5050/assets/smartbulb.jpg", description: "Control your lighting from your phone." },
  { id: 6, name: "Portable Charger", price: 25.99, image: "http://localhost:5050/assets/portablecharger.jpg", description: "Keep your devices charged on the go." },
  { id: 7, name: "Action Camera", price: 99.99, image: "http://localhost:5050/assets/actioncamera.jpg", description: "Capture your adventures in HD." },
  { id: 8, name: "VR Headset", price: 129.99, image: "http://localhost:5050/assets/VRheadset.jpg", description: "Experience virtual reality like never before." },
];

const categories = [
  { name: "Electronics", image: "http://localhost:5050/assets/electronics.jpg" },
  { name: "Fashion", image: "http://localhost:5050/assets/fashion.jpg" },
  { name: "Smart Home", image: "http://localhost:5050/assets/smarthome.jpg" },
  { name: "Accessories", image: "http://localhost:5050/assets/accessories.jpg" }
];

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function StarIcon({ filled }) {
  return (
    <svg
      className={`w-6 h-6 ${filled ? "text-yellow-400" : "text-gray-300"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.07 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
    </svg>
  );
}

export default function HomePage() {
  const [reviewIdx, setReviewIdx] = useState(0);
  const [dealsCountdown, setDealsCountdown] = useState(4 * 3600 + 22 * 60 + 10);
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);

  // Deals countdown timer
  useEffect(() => {
    if (dealsCountdown <= 0) return;
    const timerId = setInterval(() => {
      setDealsCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [dealsCountdown]);

  // Newsletter modal logic:  
  useEffect(() => {
    if (modalDismissed) return;
    let shown = false;
    let timerId = setTimeout(() => {
      if (!shown) {
        setShowModal(true);
        shown = true;
      }
    }, 5000);

    function onScroll() {
      if (!shown && window.scrollY >= 300) {
        setShowModal(true);
        shown = true;
        clearTimeout(timerId);
      }
    }
    window.addEventListener("scroll", onScroll);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener("scroll", onScroll);
    };
    // Only rerun if modalDismissed changes
  }, [modalDismissed]);

  // Auto-scroll customer reviews every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setReviewIdx(prev => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">

      {/* ANNOUNCEMENT BAR */}
      <div className="w-full bg-[#E5E5E5] text-[#181818] font-semibold text-center py-2 rounded-b-md mb-4 tracking-wide shadow">
        🚚 Free shipping on orders over $50! | Shop now
      </div>

      {/* HOMEPAGE SHOWCASE VIDEO (Hi-Res, Accessible, Responsive) */}
      <section className="w-full flex justify-center mb-8">
        <div className="relative w-full max-w-3xl aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg border border-[#E5E7EB]">
          <video
            src="http://localhost:5050/assets/showcase.mp4"
            className="w-full h-full min-h-[300px] rounded-xl object-cover"
            controls
            autoPlay
            muted
            loop
            poster="http://localhost:5050/assets/showcase-poster.jpg"
            aria-label="ShopSwift Product Showcase video"
            tabIndex="0"
            playsInline
            style={{ backgroundColor: "#E5E5E5" }}
          >
           <a href="http://localhost:5050/assets/showcase.mp4"></a>.
          </video>
        </div>
      </section>

      {/* HERO BANNER */}
      <section className="relative rounded-2xl overflow-hidden mb-12 shadow-md bg-[#B1D0CE] border border-[#E5E5E5]">
        <div className="relative z-10 flex flex-col items-center justify-center py-16 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#181818] drop-shadow mb-2">
            Shop Swiftly, <span className="text-[#2471F4]">Anywhere</span>
          </h1>
          <p className="text-lg md:text-xl text-[#181818] mb-6 font-medium max-w-xl">
            Experience seamless shopping with fast delivery and personalized recommendations.
          </p>
          <div className="flex gap-8 mb-6 text-3xl text-[#181818] justify-center">
            <span title="Mail" role="img" aria-label="mail">📧</span>
            <span title="Notification" role="img" aria-label="notification">🔔</span>
            <span title="Cart" role="img" aria-label="cart">🛒</span>
          </div>
          <Link
            to="/products"
            className="inline-block bg-[#B1D0CE] text-[#181818] text-lg px-8 py-3 rounded-full font-semibold shadow hover:brightness-90 transition"
          >
            Shop Now
          </Link>
        </div>
        
      </section>
      

      {/* HOT DEALS */}
      <section className="mb-14 relative">
        <h2 className="text-2xl md:text-3xl font-bold text-[#181818] mb-2 flex items-center gap-2">
          <span role="img" aria-label="fire">🔥</span> Hot Deals Just for You
        </h2>
        <p className="text-[#181818] mb-6">Limited-time offers on top-rated products.</p>
        <div className="absolute top-0 right-0 bg-[#2471F4] text-white px-3 py-1 rounded-bl-md font-mono font-semibold text-sm select-none">
          {formatTime(dealsCountdown)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {deals.map(deal => (
            <div
              key={deal.id}
              className="bg-[#F4F4F4] rounded-xl shadow-md border border-[#E5E5E5] p-5 flex flex-col items-center relative group transform transition duration-300 hover:scale-105 hover:shadow-lg animate-fadeInUp"
              style={{ animationDuration: "0.5s" }}
            >
              <span className="absolute top-3 left-3 bg-[#2471F4] text-white px-3 py-1 rounded-full text-xs font-bold">{deal.discount}</span>
              <img src={deal.image} alt={deal.name} className="w-32 h-32 object-contain mb-3 rounded-lg" />
              <h3 className="font-semibold text-lg mb-1 text-[#181818]">{deal.name}</h3>
              <span className="text-[#2471F4] font-bold mb-2 text-lg">${deal.price}</span>
              <button className="bg-[#B1D0CE] text-[#181818] px-4 py-2 rounded-full font-medium shadow hover:brightness-90 transition">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Shopby CATEGORY */}
      <section className="mb-16 relative">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-8 bg-[#2471F4] rounded"></span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#181818] tracking-tight">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map(cat => (
            <Link
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              key={cat.name}
              className="bg-[#F4F4F4] rounded-2xl flex flex-col items-center p-6 border border-[#E5E5E5] shadow-sm hover:shadow-md hover:scale-105 transition group"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-48 h-48 mb-2 object-contain rounded-lg shadow group-hover:ring-4 group-hover:ring-[#2471F4] transition"
              />
              <span className="font-semibold text-[#181818] group-hover:text-[#2471F4]">{cat.name}</span>
            </Link>
          ))}
        </div>
        <div className="absolute bottom-0 right-0 mb-2 mr-2">
          <Link
            to="/products"
            className="text-[#2471F4] font-semibold hover:underline"
          >
            View All
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mb-16 relative">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-8 bg-[#2471F4] rounded"></span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#181818] tracking-tight">Featured Products</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center p-6 border border-[#E5E5E5] group"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-44 h-44 object-contain mb-4 rounded-lg shadow"
              />
              <h3 className="font-semibold text-xl mb-2 group-hover:text-[#181818]">{product.name}</h3>
              <p className="text-[#555555] mb-4 text-center">{product.description}</p>
              <span className="text-[#2471F4] text-lg font-bold mb-3">${product.price}</span>
              <Link
                to={`/products/${product.id}`}
                className="text-sm bg-[#B1D0CE] text-[#181818] px-4 py-2 rounded-full shadow hover:brightness-90 transition"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 right-0 mb-2 mr-2">
          <Link
            to="/products"
            className="text-[#2471F4] font-semibold hover:underline"
          >
            View All
          </Link>
        </div>
      </section>

      {/* INSTALL APP / PWA PROMO */}
      <section className="mb-14 flex flex-col md:flex-row items-center justify-between gap-8 bg-[#F4F4F4] rounded-2xl p-8 shadow-md border border-[#E5E5E5]">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-[#181818]">Install Our App, Shop Anywhere</h2>
          <p className="text-[#181818] mb-2">Add us to your home screen for instant access – no download needed!</p>
        </div>
        <button className="bg-[#B1D0CE] text-[#181818] font-semibold rounded-full px-8 py-3 shadow hover:brightness-90 transition">Install Now</button>
      </section>

      {/* NEWSLETTER SIGNUP */}
      {!showModal && !modalDismissed && (
        <section className="mb-14 bg-[#F4F4F4] rounded-2xl p-8 shadow-md border border-[#E5E5E5] flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-[#181818]">Get Exclusive Offers in Your Inbox</h2>
            <p className="text-[#555555] mb-2">No spam. Just the good stuff.</p>
          </div>
          <form className="flex items-center gap-3">
            <input
              type="email"
              placeholder="Your email"
              className="rounded-full px-4 py-2 border border-[#E5E5E5] focus:ring-2 focus:ring-[#2471F4] outline-none text-[#181818]"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="submit" className="bg-[#B1D0CE] text-[#181818] font-medium rounded-full px-6 py-2 shadow hover:brightness-90 transition">Subscribe Now</button>
          </form>
        </section>
      )}

      {/* Newsletter Modal */}
      {showModal && !modalDismissed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-lg border border-[#E5E5E5]">
            <button
              aria-label="Close"
              onClick={() => {
                setShowModal(false);
                setModalDismissed(true);
              }}
              className="absolute top-3 right-3 text-[#555555] hover:text-[#2471F4] text-2xl font-bold leading-none"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-[#181818] text-center">Get Exclusive Offers in Your Inbox</h2>
            <p className="text-[#555555] mb-6 text-center">No spam. Just the good stuff.</p>
            <form className="flex items-center gap-3 justify-center">
              <input
                type="email"
                placeholder="Your email"
                className="rounded-full px-4 py-2 border border-[#E5E5E5] focus:ring-2 focus:ring-[#2471F4] outline-none text-[#181818] w-full max-w-xs"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button type="submit" className="bg-[#B1D0CE] text-[#181818] font-medium rounded-full px-6 py-2 shadow hover:brightness-90 transition">Subscribe Now</button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER REVIEWS CAROUSEL */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-8 bg-[#2471F4] rounded"></span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#181818] tracking-tight">Trusted by Thousands</h2>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center max-w-2xl mx-auto border border-[#E5E5E5] relative overflow-hidden h-48">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-opacity duration-700 ${
                idx === reviewIdx ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={idx !== reviewIdx}
            >
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <StarIcon key={i} filled={i <= review.rating} />
                ))}
              </div>
              <blockquote className="text-lg text-[#555555] italic mb-2">"{review.text}"</blockquote>
              <div className="text-[#181818] font-semibold mb-2">— {review.name}</div>
              {/* Move navigation arrows below the review text with extra spacing */}
              <div className="flex gap-3 mt-6 z-20">
                <button
                  aria-label="Previous review"
                  className="text-[#181818] hover:text-[#2471F4]"
                  onClick={() => setReviewIdx((reviewIdx - 1 + reviews.length) % reviews.length)}
                >&larr;</button>
                <button
                  aria-label="Next review"
                  className="text-[#181818] hover:text-[#2471F4]"
                  onClick={() => setReviewIdx((reviewIdx + 1) % reviews.length)}
                >&rarr;</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY SHOP WITH US */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-[#181818] mb-8 text-center">What Makes Us Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-[#E5E5E5]">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-bold text-lg mb-1 text-[#181818]">Fast & Free Delivery</h3>
            <p className="text-[#555555] text-center">On all orders above $50</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-[#E5E5E5]">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-bold text-lg mb-1 text-[#181818]">100% Secure Checkout</h3>
            <p className="text-[#555555] text-center">SSL Encryption & trusted payment gateways</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-[#E5E5E5]">
            <div className="text-4xl mb-2">💬</div>
            <h3 className="font-bold text-lg mb-1 text-[#181818]">24/7 Customer Support</h3>
            <p className="text-[#555555] text-center">We're here whenever you need us</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-[#E5E5E5]">
            <div className="text-4xl mb-2">💡</div>
            <h3 className="font-bold text-lg mb-1 text-[#181818]">Smart Recommendations</h3>
            <p className="text-[#555555] text-center">Personalized picks just for you.</p>
          </div>
        </div>
      </section>
    </div>
  );
}