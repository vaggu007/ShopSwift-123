import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// Main categories and subcategories mapping
const CATEGORY_MAP = {
  "Electronics": [
    "Mobiles & Tablets", "Laptops & Computers", "Gaming Consoles & Accessories",
    "Headphones & Earbuds", "TVs & Home Entertainment", "Cameras & Drones",
    "Power Banks & Chargers", "Computer Accessories"
  ],
  "Fashion": [
    "Men's Clothing", "Women's Clothing", "Kids & Baby Wear", "Footwear",
    "Watches", "Bags & Wallets", "Ethnic Wear", "Winter Wear"
  ],
  "Smart Home": [
    "Smart Lighting", "Smart Speakers", "Home Security", "Thermostats & HVAC",
    "Robot Vacuums", "Smart Plugs & Switches", "Smart Kitchen Appliances", "Voice Assistants & Hubs"
  ],
  "Accessories": [
    "Mobile Accessories", "Laptop Accessories", "Fashion Accessories",
    "Wearable Tech", "Camera Accessories", "Gaming Accessories",
    "Chargers & Power Adapters", "Bluetooth Devices & Dongles"
  ]
};

// product names for Electronics subcategories
const PRODUCT_NAMES = {
  "Mobiles & Tablets": [
    "iPhone 14 Pro Max",
    "Samsung Galaxy S23 Ultra",
    "Google Pixel 8 Pro",
    "OnePlus 12",
    "Xiaomi 13 Pro",
    "iPad Pro 12.9",
    "Samsung Galaxy Tab S9 Ultra",
    "Microsoft Surface Pro 9",
    "Lenovo Tab P12 Pro",
    "OnePlus Pad"
  ],
  "Laptops & Computers": [
    "MacBook Air M2",
    "Dell XPS 13",
    "HP Spectre x360",
    "ASUS Zenbook 14 OLED",
    "Lenovo ThinkPad X1 Carbon",
    "Apple iMac 24",
    "Dell Inspiron Desktop",
    "HP Pavilion Desktop",
    "Lenovo IdeaCentre AIO",
    "ASUS ROG Strix G15"
  ],
  "Gaming Consoles & Accessories": [
    "PlayStation 5",
    "Xbox Series X",
    "Nintendo Switch OLED",
    "Valve Steam Deck",
    "PlayStation 4 Pro",
    "Xbox Elite Wireless Controller",
    "PlayStation VR2",
    "Nintendo Switch Pro Controller",
    "Logitech G29 Racing Wheel",
    "Elgato Stream Deck"
  ],
  "Headphones & Earbuds": [
    "Sony WH-1000XM5",
    "Bose QuietComfort 45",
    "Sennheiser Momentum 4",
    "Apple AirPods Max",
    "JBL Live 660NC",
    "Apple AirPods Pro 2",
    "Samsung Galaxy Buds2 Pro",
    "Sony WF-1000XM5",
    "Jabra Elite 7 Pro",
    "OnePlus Buds Pro 2"
  ],
  "TVs & Home Entertainment": [
    "LG C3 OLED TV",
    "Samsung QN90C Neo QLED",
    "Sony Bravia XR A95K",
    "TCL 6-Series Mini-LED",
    "Hisense U8H",
    "Sonos Arc Soundbar",
    "Bose Smart Soundbar 900",
    "Apple TV 4K",
    "Amazon Fire TV Stick 4K",
    "Google Chromecast with Google TV"
  ],
  "Cameras & Drones": [
    "Canon EOS R8",
    "Sony Alpha a7 IV",
    "Nikon Z6 II",
    "Fujifilm X-T5",
    "Panasonic Lumix S5",
    "DJI Air 3",
    "DJI Mini 4 Pro",
    "Autel EVO Lite+",
    "Skydio 2+",
    "Parrot Anafi"
  ],
  "Power Banks & Chargers": [
    "Anker PowerCore 10000",
    "Xiaomi Mi Power Bank 3",
    "Samsung 25W Battery Pack",
    "Aukey Basix Pro Wireless",
    "Realme Power Bank 2",
    "Apple 20W USB-C Power Adapter",
    "Samsung Super Fast Charger",
    "Belkin BoostCharge Pro",
    "Anker Nano II 65W",
    "Spigen ArcStation Pro"
  ],
  "Computer Accessories": [
    "Logitech MX Keys S",
    "Apple Magic Keyboard",
    "Razer Huntsman Mini",
    "Corsair K95 RGB Platinum",
    "Microsoft Surface Keyboard",
    "Logitech MX Master 3S",
    "Razer DeathAdder V3",
    "Apple Magic Mouse 2",
    "SteelSeries Rival 5",
    "HP X500 Wired Mouse"
  ],
   // Fashion 
   "Men's Clothing": [
    "Levi's 511 Slim Jeans",
    "Nike Sportswear Club Fleece Hoodie",
    "H&M Cotton Shirt",
    "Adidas Tiro Track Pants",
    "Uniqlo Ultra Light Down Jacket",
    "Tommy Hilfiger Polo T-Shirt",
    "GAP Khaki Chinos",
    "Calvin Klein Classic Suit",
    "Allen Solly Casual Blazer",
    "Puma Essential Tee"
  ],
  "Women's Clothing": [
    "Zara Basic V-Neck Dress",
    "H&M Conscious Blouse",
    "Forever 21 High-Waist Jeans",
    "Mango Flowy Midi Skirt",
    "Levi's Ex-Boyfriend Trucker Jacket",
    "Vero Moda Ribbed Top",
    "Only Denim Shorts",
    "Global Desi Printed Kurta",
    "W for Women Straight Pants",
    "Biba Cotton Anarkali"
  ],
  "Kids & Baby Wear": [
    "Carter's Sleep & Play Bodysuit",
    "Mothercare Baby Romper",
    "Babyhug Cotton Frock",
    "H&M Kids Sweatshirt",
    "LuvLap Baby Sleepsuit",
    "UCB Boys' Polo Shirt",
    "FirstCry Baby Pyjamas",
    "Nike Kids Tracksuit",
    "GAP Kids Denim Jacket",
    "Disney Frozen T-shirt"
  ],
  "Footwear": [
    "Adidas Ultraboost 23",
    "Nike Air Max 270",
    "Puma Carina Sneakers",
    "Crocs Classic Clog",
    "Bata Comfit Sandals",
    "Woodland Leather Boots",
    "Skechers Go Walk 6",
    "Red Tape Formal Shoes",
    "Converse Chuck Taylor All Star",
    "Metro Slip-on Loafers"
  ],
  "Watches": [
    "Fossil Gen 6 Smartwatch",
    "Casio G-Shock GA-2100",
    "Timex Expedition Scout",
    "Daniel Wellington Petite",
    "Titan Neo Analog",
    "Apple Watch Series 9",
    "Fastrack Reflex Play+",
    "Michael Kors Parker",
    "Seiko 5 Sports Automatic",
    "Armani Exchange Cayde"
  ],
  "Bags & Wallets": [
    "American Tourister Urban Backpack",
    "Skybags Canvas Duffle",
    "Caprese Satchel Bag",
    "Wildcraft Laptop Backpack",
    "Tommy Hilfiger Leather Wallet",
    "Fossil RFID Bifold Wallet",
    "Baggit Women's Tote",
    "Samsonite Polycarbonate Luggage",
    "Lavie Sling Bag",
    "Puma Classic Gym Sack"
  ],
  "Ethnic Wear": [
    "Manyavar Silk Kurta Pajama",
    "Biba Printed Salwar Suit",
    "FabIndia Cotton Saree",
    "Soch Chanderi Kurta Set",
    "W for Women Straight Kurta",
    "Rangriti Rayon Anarkali",
    "Global Desi Printed Kurta",
    "Melange by Lifestyle Dupatta Set",
    "Aurelia Cotton Palazzo",
    "Neerus Embroidered Lehenga"
  ],
  "Winter Wear": [
    "North Face Thermoball Jacket",
    "Columbia Fleece Pullover",
    "H&M Wool-Blend Overcoat",
    "Decathlon Quechua Parka",
    "Uniqlo Heattech Top",
    "GAP Cable Knit Sweater",
    "Adidas Puffer Vest",
    "Allen Solly Cardigan",
    "Woodland Down Jacket",
    "Levi's Sherpa Trucker"
  ],

  //  Smart Home 
  "Smart Lighting": [
    "Philips Hue White & Color Bulb",
    "Syska Smart LED Bulb",
    "TP-Link Kasa Smart Light Strip",
    "Wipro Garnet Smart Batten",
    "Yeelight Ambiance Lamp",
    "Mi LED WiFi Smart Bulb",
    "Nanoleaf Essentials Lightstrip",
    "Lifx Color A19",
    "Halonix Prime Smart Bulb",
    "Wyze Bulb Color"
  ],
  "Smart Speakers": [
    "Amazon Echo Dot (5th Gen)",
    "Google Nest Mini",
    "Apple HomePod Mini",
    "Bose Home Speaker 300",
    "Sonos One SL",
    "Harman Kardon Citation One",
    "Marshall Uxbridge Voice",
    "Lenovo Smart Clock Essential",
    "Mi Smart Speaker IR Control",
    "Zebronics Smart Speaker"
  ],
  "Home Security": [
    "Arlo Pro 4 Wireless Camera",
    "Ring Video Doorbell 4",
    "Google Nest Cam (Battery)",
    "Wyze Cam v3",
    "TP-Link Tapo C200",
    "Hikvision Turbo HD DVR",
    "Mi 360 Home Security Camera",
    "Eufy Indoor Cam 2K",
    "Godrej Spotlight Camera",
    "D-Link WiFi Motion Sensor"
  ],
  "Thermostats & HVAC": [
    "Google Nest Learning Thermostat",
    "Ecobee SmartThermostat",
    "Honeywell T9 Smart",
    "Emerson Sensi Touch",
    "Mysa Smart Thermostat",
    "Bosch Connected Control",
    "Amazon Smart Thermostat",
    "Tado Smart AC Control",
    "Sensibo Sky Controller",
    "Wyze Smart WiFi Thermostat"
  ],
  "Robot Vacuums": [
    "iRobot Roomba i7+",
    "Ecovacs Deebot N8 Pro",
    "Roborock S7 MaxV",
    "Mi Robot Vacuum Mop 2 Pro",
    "Eufy RoboVac G30",
    "Dreame D9 Max",
    "ILIFE V9e Pro",
    "Shark IQ Robot",
    "Viomi SE Vacuum",
    "Realme TechLife Robot"
  ],
  "Smart Plugs & Switches": [
    "Wipro 16A WiFi Smart Plug",
    "TP-Link HS100 Smart Plug",
    "Amazon Smart Plug",
    "Sonoff Basic WiFi Switch",
    "Philips Hue Smart Plug",
    "Syska Wi-Fi Smart Plug",
    "D-Link DSP-W118",
    "Zebronics Smart Switch",
    "Oakter Mini Plug",
    "Portronics Power Plate 7"
  ],
  "Smart Kitchen Appliances": [
    "Instant Pot Duo 7-in-1",
    "Xiaomi Smart Air Fryer",
    "Philips Viva Collection Juicer",
    "NutriBullet Pro Blender",
    "Kent OTG Oven",
    "Preethi Zodiac Mixer Grinder",
    "Mi Smart Kettle Pro",
    "Hamilton Beach Toaster",
    "Wonderchef Nutri-Pot",
    "Bajaj Smart Rice Cooker"
  ],
  "Voice Assistants & Hubs": [
    "Google Nest Hub (2nd Gen)",
    "Amazon Echo Show 8",
    "Apple iPad Mini (Hub Mode)",
    "Lenovo Smart Tab M10",
    "Samsung SmartThings Hub",
    "Xiaomi Smart Home Hub",
    "Sonos Move (Assistant)",
    "Facebook Portal Mini",
    "Echo Flex Voice Module",
    "JBL Link View"
  ],

  // Accessories 
  "Mobile Accessories": [
    "Spigen Ultra Hybrid Phone Case",
    "Anker PowerLine USB-C Cable",
    "Portronics Powerbank 20000mAh",
    "Boat Rockerz 255 Neckband",
    "Samsung Wireless Charger Duo",
    "Otterbox Defender Case",
    "Ringke Fusion-X Case",
    "ESR Camera Lens Protector",
    "MI Car Charger Pro",
    "Urban Armor Gear Plyo Case"
  ],
  "Laptop Accessories": [
    "Logitech M350 Pebble Mouse",
    "HP K500F Wired Keyboard",
    "Targus Classic Laptop Sleeve",
    "Lapcare Adjustable Stand",
    "Dell Pro Backpack",
    "Lenovo 65W USB-C Adapter",
    "Portronics Cooling Pad",
    "Macally USB-C Hub",
    "AmazonBasics Wireless Mouse",
    "Kensington Laptop Lock"
  ],
  "Fashion Accessories": [
    "Ray-Ban Aviator Sunglasses",
    "Tommy Hilfiger Leather Belt",
    "Fossil Carlie Bracelet",
    "Calvin Klein Scarf",
    "Titan Raga Watch",
    "Gucci GG Marmont Wallet",
    "Hidesign Leather Keychain",
    "Michael Kors Rose Gold Earrings",
    "Daniel Wellington Cuff",
    "Puma Essential Cap"
  ],
  "Wearable Tech": [
    "Apple Watch SE 2nd Gen",
    "Fitbit Charge 6",
    "Garmin Vivosmart 5",
    "Mi Band 7",
    "Samsung Galaxy Watch 6",
    "Amazfit GTS 4 Mini",
    "Realme Band 2",
    "Honor Band 7",
    "Noise ColorFit Pro 4",
    "Boat Xtend Smartwatch"
  ],
  "Camera Accessories": [
    "SanDisk Extreme 128GB SD Card",
    "Lowepro Fastpack Camera Bag",
    "AmazonBasics Tripod 60-inch",
    "Godox TT685 Flash",
    "Joby GorillaPod 3K Kit",
    "Manfrotto Mini Tripod",
    "Hoya 58mm UV Filter",
    "Neewer Camera Cleaning Kit",
    "Peak Design Slide Lite Strap",
    "DJI Osmo Pocket Extension Rod"
  ],
  "Gaming Accessories": [
    "Logitech G502 HERO Mouse",
    "Razer BlackWidow V4 Keyboard",
    "SteelSeries QcK Gaming Mousepad",
    "Corsair HS50 PRO Headset",
    "Xbox Wireless Controller",
    "HyperX Cloud Stinger",
    "Nintendo Switch Pro Controller",
    "MSI Force GC30 Gamepad",
    "Redgear Pro Wireless Controller",
    "Turtle Beach Recon 70 Headset"
  ],
  "Chargers & Power Adapters": [
    "Anker Nano II 65W Charger",
    "Apple 30W USB-C Power Adapter",
    "Belkin 3-in-1 Charger Stand",
    "MI 27W SonicCharge Adapter",
    "Samsung 45W Super Fast Charger",
    "Aukey Omnia 100W Adapter",
    "Portronics Adapto 22",
    "Realme 65W SuperDart Charger",
    "Ambrane Multi-Port Charger",
    "Stuffcool 20W PD Charger"
  ],
  "Bluetooth Devices & Dongles": [
    "TP-Link UB500 Bluetooth Adapter",
    "Logitech Bluetooth Audio Receiver",
    "Portronics Harmonics Twins S6",
    "MI Bluetooth Receiver",
    "Jabra Link 370 USB Adapter",
    "HP Bluetooth 5.0 Dongle",
    "Zebronics BT4444 USB Dongle",
    "Boat Stone 350 Bluetooth Speaker",
    "AmazonBasics USB Bluetooth Adapter",
    "Creative BT-W3 Audio Transmitter"
  ]
};


function productNameToImage(name) {
  
  return name.toLowerCase().replace(/[^a-z0-9]/g, '') + ".jpg";
}

const PRODUCTS = [];
let productId = 1;
Object.entries(CATEGORY_MAP).forEach(([mainCat, subcats]) => {
  subcats.forEach(subcat => {
    if (mainCat === "Electronics" && PRODUCT_NAMES[subcat]) {
      
      PRODUCT_NAMES[subcat].forEach(productName => {
        PRODUCTS.push({
          id: productId++,
          name: productName,
          price: (10 + Math.random() * 190).toFixed(2),
          image: `http://localhost:5050/assets/${productNameToImage(productName)}`,
          description: `High quality ${productName}.`,
          mainCategory: mainCat,
          subCategory: subcat,
          inStock: Math.random() > 0.1,
          rating: (3 + Math.random() * 2).toFixed(1)
        });
      });
    } else {
      
      let [typeA, typeB] = subcat.split(' & ');
      if (!typeB) {
        const words = subcat.split(' ');
        typeA = words[0];
        typeB = words.length > 1 ? words.slice(1).join(' ') : words[0];
      }
      
      for (let i = 1; i <= 5; i++) {
        PRODUCTS.push({
          id: productId++,
          name: `${typeA} Product ${i}`,
          price: (10 + Math.random() * 190).toFixed(2),
          image: `http://localhost:5050/assets/${typeA.toLowerCase().replace(/[^a-z0-9]/g, '')}${i}.jpg`,
          description: `High quality ${typeA} item #${i}.`,
          mainCategory: mainCat,
          subCategory: subcat,
          inStock: Math.random() > 0.1,
          rating: (3 + Math.random() * 2).toFixed(1)
        });
      }
      
      for (let i = 1; i <= 5; i++) {
        PRODUCTS.push({
          id: productId++,
          name: `${typeB} Product ${i}`,
          price: (10 + Math.random() * 190).toFixed(2),
          image: `http://localhost:5050/assets/${typeB.toLowerCase().replace(/[^a-z0-9]/g, '')}${i}.jpg`,
          description: `High quality ${typeB} item #${i}.`,
          mainCategory: mainCat,
          subCategory: subcat,
          inStock: Math.random() > 0.1,
          rating: (3 + Math.random() * 2).toFixed(1)
        });
      }
    }
  });
});

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name_asc", label: "Name: A → Z" },
  { value: "name_desc", label: "Name: Z → A" },
];

export { PRODUCTS }; // <-- Add this line
export default function ProductsPage() {
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("price_asc");
  const [showBanner, setShowBanner] = useState(true);
  const [showProducts, setShowProducts] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(null); // "top", "mid", "low" or null

  const navigate = useNavigate();

  // Breadcrumbs
  const breadcrumbs = (
    <div className="mb-4 text-[#6B7280] text-sm font-sans">
      <Link to="/" className="hover:underline text-[#274690]">Home</Link>
      <span className="mx-2">/</span>
      <span>Products</span>
      {selectedMainCategory && (
        <>
          <span className="mx-2">/</span>
          <span>{selectedMainCategory}</span>
        </>
      )}
      {selectedSubCategory && (
        <>
          <span className="mx-2">/</span>
          <span>{selectedSubCategory}</span>
        </>
      )}
    </div>
  );

  
  const canShowProducts = !!(selectedMainCategory && selectedSubCategory && showProducts);

  // Filtered Products
  let filtered = [];
  if (canShowProducts) {
    filtered = PRODUCTS.filter(
      p =>
        p.mainCategory === selectedMainCategory &&
        p.subCategory === selectedSubCategory &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Apply rating filter if any
    if (ratingFilter === "top") {
      filtered = filtered.filter(p => parseFloat(p.rating) >= 4.5);
    } else if (ratingFilter === "mid") {
      filtered = filtered.filter(p => parseFloat(p.rating) >= 3.5 && parseFloat(p.rating) < 4.5);
    } else if (ratingFilter === "low") {
      filtered = filtered.filter(p => parseFloat(p.rating) < 3.5);
    }

    // Sort products
    if (sortOption === "price_asc") filtered.sort((a, b) => a.price - b.price);
    if (sortOption === "price_desc") filtered.sort((a, b) => b.price - a.price);
    if (sortOption === "name_asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOption === "name_desc") filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  // Curated "Staff Picks" (first 4 Electronics products)
  const staffPicks = PRODUCTS.filter(p => p.mainCategory === "Electronics").slice(0, 4);
  const trendingFashion = PRODUCTS.filter(p => p.mainCategory === "Fashion").slice(0, 4);

  // Handler for "Back to Collection"
  function handleBackToCollection() {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setShowProducts(false);
    setRatingFilter(null);
    setSearchQuery("");
    setSortOption("price_asc");
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 font-sans bg-[#F8F9FA] min-h-screen">
      {/* Sidebar */}
      <aside className="w-44 md:w-52 mr-0 md:mr-2 flex flex-col items-start">
        {/* Back to Collection button */}
        {canShowProducts && (
          <button
            onClick={handleBackToCollection}
            className="w-full mb-4 px-4 py-2 bg-[#F7C948] rounded-md hover:bg-[#ffe59c] font-semibold text-left text-[#22223B] border border-[#E5E7EB] shadow-md"
          >
            &larr; Back to Collection
          </button>
        )}
        {/* Main Category Dropdown */}
        <div className="mb-4 w-full">
          <label htmlFor="main-category-select" className="block text-sm font-semibold text-[#274690] mb-1">
            Select Category
          </label>
          <select
            id="main-category-select"
            value={selectedMainCategory || ""}
            onChange={e => {
              const value = e.target.value || null;
              setSelectedMainCategory(value);
              setSelectedSubCategory(null);
              setShowProducts(false);
              setRatingFilter(null);
            }}
            className="w-full px-3 py-2 rounded border border-[#E5E7EB] text-[#274690] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
          >
            <option value="">--</option>
            {Object.keys(CATEGORY_MAP).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {/* Subcategory Dropdown */}
        {selectedMainCategory && (
          <div className="mb-4 w-full">
            <label htmlFor="subcategory-select" className="block text-sm font-semibold text-[#6C63FF] mb-1">
              Select Subcategory
            </label>
            <select
              id="subcategory-select"
              value={selectedSubCategory || ""}
              onChange={e => {
                const value = e.target.value || null;
                setSelectedSubCategory(value);
                setShowProducts(!!value);
                setRatingFilter(null);
              }}
              className="w-full px-3 py-2 rounded border border-[#E5E7EB] text-[#6C63FF] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            >
              <option value="">--</option>
              {CATEGORY_MAP[selectedMainCategory].map(subcat => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>
        )}
        {/* Show by Ratings */}
        {canShowProducts && (
          <div className="mb-6 w-full">
            <h4 className="font-semibold text-[#6C63FF] mb-2">Show by Ratings</h4>
            <div className="flex md:flex-col gap-2">
              <button
                onClick={() => setRatingFilter("top")}
                className={`px-3 py-1 rounded-full font-medium border text-base text-left
                  ${ratingFilter === "top"
                    ? "bg-[#6C63FF] text-white shadow-md"
                    : "bg-white text-[#274690] border-[#E5E7EB] hover:bg-[#F8F9FA]"
                  } transition`}
              >
                <span className="mr-1 text-[#F7C948]" aria-label="5 stars" title="5 stars">★★★★★</span>
                Top Rated
              </button>
              <button
                onClick={() => setRatingFilter("mid")}
                className={`px-3 py-1 rounded-full font-medium border text-base text-left
                  ${ratingFilter === "mid"
                    ? "bg-[#6C63FF] text-white shadow-md"
                    : "bg-white text-[#274690] border-[#E5E7EB] hover:bg-[#F8F9FA]"
                  } transition`}
              >
                <span className="mr-1 text-[#F7C948]" aria-label="4 stars" title="3–5 stars">★★★★☆</span>
                Mid Rated
              </button>
              <button
                onClick={() => setRatingFilter("low")}
                className={`px-3 py-1 rounded-full font-medium border text-base text-left
                  ${ratingFilter === "low"
                    ? "bg-[#6C63FF] text-white shadow-md"
                    : "bg-white text-[#274690] border-[#E5E7EB] hover:bg-[#F8F9FA]"
                  } transition`}
              >
                <span className="mr-1 text-[#F7C948]" aria-label="2 stars" title="1–3 stars">★★☆☆☆</span>
                Low Rated
              </button>
            </div>
            {ratingFilter && (
              <button
                onClick={() => setRatingFilter(null)}
                className="mt-3 px-3 py-1 rounded-full font-semibold border border-[#F7C948] text-[#274690] hover:bg-[#F8F9FA] transition"
              >
                Clear Rating Filter
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main content area */}
      <main className="flex-1">
        {/* Breadcrumbs */}
        {breadcrumbs}

        {!selectedMainCategory ? (
          <>
            {/* Intro Header */}
            <section className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#274690] mb-2 font-sans">Explore Our Full Collection</h1>
              <p className="text-lg text-[#22223B]">
                From cutting-edge electronics to the latest fashion trends, everything you need is just a scroll away.
                Use the filters to narrow down your perfect find.
              </p>
            </section>

            {/* Flash Deal Banner */}
            {showBanner && (
              <div className="mb-6 flex items-center bg-[#F7C948] text-[#22223B] border-l-4 border-[#E5E7EB] p-4 rounded shadow-md relative font-sans">
                <span className="font-bold text-lg mr-4">⚡ Flash Deal:</span>
                <span className="font-semibold">
                  Get 20% off Smart Home Devices — Today Only!
                </span>
                <button
                  onClick={() => setShowBanner(false)}
                  className="absolute right-4 top-4 text-[#274690] hover:text-[#6C63FF] font-bold text-lg"
                  aria-label="Dismiss"
                >&times;</button>
              </div>
            )}

            {/* Featured Collections / Top Picks */}
            <section className="mb-10 grid md:grid-cols-2 gap-8">
              {/* Staff Picks in Electronics */}
              <div className="bg-white p-5 rounded-lg shadow-md flex-1 border border-[#E5E7EB]">
                <div className="flex items-center mb-4">
                  <span className="text-xl mr-2">🎧</span>
                  <h2 className="text-lg font-bold text-[#274690]">Staff Picks in Electronics</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {staffPicks.map(product => (
                    <div
                      key={product.id}
                      className="flex flex-col items-center bg-[#F8F9FA] rounded-lg p-3 hover:shadow-lg border border-[#E5E7EB]"
                    >
                      <img src={product.image} alt={product.name} className="w-20 h-20 object-contain mb-1" />
                      <div className="font-medium text-[#22223B]">{product.name}</div>
                      <div className="text-[#6C63FF] font-bold">${product.price}</div>
                    </div>
                  ))}
                </div>
                <Link to="/products?category=Electronics" className="text-[#6C63FF] hover:underline text-sm mt-3 block">See More &rarr;</Link>
              </div>
              {/* Trending in Fashion */}
              <div className="bg-white p-5 rounded-lg shadow-md flex-1 border border-[#E5E7EB]">
                <div className="flex items-center mb-4">
                  <span className="text-xl mr-2">🛍️</span>
                  <h2 className="text-lg font-bold text-[#6C63FF]">Trending in Fashion</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {trendingFashion.map(product => (
                    <div
                      key={product.id}
                      className="flex flex-col items-center bg-[#F8F9FA] rounded-lg p-3 hover:shadow-lg border border-[#E5E7EB]"
                    >
                      <img src={product.image} alt={product.name} className="w-20 h-20 object-contain mb-1" />
                      <div className="font-medium text-[#22223B]">{product.name}</div>
                      <div className="text-[#6C63FF] font-bold">${product.price}</div>
                    </div>
                  ))}
                </div>
                <Link to="/products?category=Fashion" className="text-[#6C63FF] hover:underline text-sm mt-3 block">See More &rarr;</Link>
              </div>
            </section>

            {/* SEO-Optimized Description */}
            <section className="mt-16 mb-6 p-6 bg-[#F8F9FA] rounded-lg shadow-md border border-[#E5E7EB]">
              <h3 className="text-xl font-bold text-[#274690] mb-2">About Our Products</h3>
              <p className="text-[#22223B]">
                At ShopSwift, we curate only the highest quality electronics, fashion, smart home devices, and lifestyle accessories.
                Every product is vetted for performance, style, and value. Explore our ever-growing inventory and enjoy seamless shopping.
              </p>
            </section>
          </>
        ) : canShowProducts ? (
          <>
            {/* New search and sort bar */}
            <div className="flex justify-end items-center gap-4 mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-[#E5E7EB] px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] w-52 bg-white text-[#22223B] placeholder-[#274690] font-sans"
              />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-[#E5E7EB] px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] w-44 bg-white text-[#22223B] font-sans"
              >
                {SORT_OPTIONS.map(opt => (
                  <option value={opt.value} key={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Product Count */}
            <div className="mb-4 text-[#6B7280] text-sm font-sans">
              Showing <span className="font-bold text-[#274690]">{filtered.length}</span> products in <span className="font-bold text-[#274690]">{selectedSubCategory}</span>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all flex flex-col items-center p-6 border border-[#E5E7EB] group hover:-translate-y-1"
                  onClick={() => navigate(`/products/${product.id}`)}
                  tabIndex={0}
                  onKeyPress={e => (e.key === 'Enter') && navigate(`/products/${product.id}`)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-44 h-44 object-contain mb-4 rounded-lg shadow"
                    loading="lazy"
                  />
                  <h3 className="font-semibold text-xl mb-2 text-[#274690] group-hover:text-[#6C63FF]">{product.name}</h3>
                  <p className="text-[#6B7280] mb-2 text-center line-clamp-1">{product.description}</p>
                  <span className="text-[#6C63FF] text-lg font-bold mb-3">${product.price}</span>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="text-xs bg-[#F8F9FA] text-[#274690] px-3 py-1 rounded-full shadow hover:bg-[#6C63FF] hover:text-white transition border border-[#E5E7EB]"
                      onClick={e => { e.stopPropagation(); /* Quick View */ }}
                    >
                      Quick View
                    </button>
                    <button
                      className="text-xs bg-[#6C63FF] text-white px-3 py-1 rounded-full shadow-md hover:bg-[#274690] transition"
                      onClick={e => { e.stopPropagation(); /* addToCart(product) */ }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-[#6B7280] py-10 text-center">No products found.</div>
            )}
          </>
        ) : (
          <>
            {/* Nothing selected yet, or only main category is selected*/}
            <div className="text-[#A0AEC0] py-8 text-center font-sans">
              {selectedMainCategory && !selectedSubCategory
                ? "Please select a subcategory to view products."
                : "Please select a category to begin."}
            </div>
          </>
        )}
      </main>
    </div>
  );
}