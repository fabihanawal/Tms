/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, CheckCircle, Search, QrCode, ArrowRight, ShieldCheck, MapPin, 
  Trash2, Phone, Star, Mail, ShoppingCart, Percent, Truck, HelpCircle, ChevronRight, X 
} from "lucide-react";
import { Product, User } from "../types";

interface EcommerceViewProps {
  language: "bn" | "en";
  user: User | null;
  onNavigate: (view: string) => void;
  onRefreshUser: () => void;
}

export default function EcommerceView({ language, user, onNavigate, onRefreshUser }: EcommerceViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Checkout states
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash on Delivery" | "bKash" | "Nagad" | "Bank Transfer">("Cash on Delivery");
  const [transactionId, setTransactionId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState<any | null>(null);

  // QR verification state
  const [qrInputCode, setQrInputCode] = useState("");
  const [qrResult, setQrResult] = useState<any | null>(null);
  const [qrError, setQrError] = useState("");

  // Load products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.log("Error loading products", e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity + qty > product.stock) {
          alert(language === "bn" ? `দুঃখিত, পর্যাপ্ত স্টক নেই। সর্বোচ্চ স্টক: ${product.stock} লিটার।` : `Sorry, insufficient stock. Available: ${product.stock} units.`);
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { product, quantity: qty }];
    });
    setShowCart(true);
  };

  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    const item = cart.find(i => i.product.id === productId);
    if (item && newQty > item.product.stock) {
      alert(language === "bn" ? `দুঃখিত, সর্বোচ্চ উপলব্ধ স্টক: ${item.product.stock}` : `Sorry, maximum stock is ${item.product.stock}`);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: newQty } : item));
  };

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "TMS10") {
      setCouponDiscount(0.10); // 10% discount
      setCouponMessage(language === "bn" ? "১০% ডিসকাউন্ট কুপন সক্রিয় হয়েছে!" : "10% Discount applied!");
    } else {
      setCouponDiscount(0);
      setCouponMessage(language === "bn" ? "অকার্যকর কুপন কোড!" : "Invalid coupon code!");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert(language === "bn" ? "অর্ডার করতে দয়া করে প্রথমে মেম্বার হিসেবে লগইন বা রেজিস্ট্রেশন করুন।" : "Please login or register as a member to checkout.");
      onNavigate("dashboard");
      return;
    }
    if (cart.length === 0) return;
    if (!shippingAddress.trim()) {
      alert(language === "bn" ? "শিপিং ঠিকানা আবশ্যক।" : "Shipping address is required.");
      return;
    }

    const orderPayload = {
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      paymentMethod,
      transactionId: paymentMethod !== "Cash on Delivery" ? transactionId : undefined,
      shippingAddress
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (res.ok) {
        setCheckoutSuccess(data.order);
        setCart([]);
        setShowCheckout(false);
        onRefreshUser();
        fetchProducts(); // refresh stock numbers
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.log("Checkout error:", err);
      alert("Error placing order");
    }
  };

  // QR Code Authenticator verification
  const handleVerifyQR = async () => {
    if (!qrInputCode.trim()) {
      setQrError(language === "bn" ? "দয়া করে কিউআর নম্বর লিখুন" : "Please input QR code");
      return;
    }
    setQrError("");
    setQrResult(null);

    try {
      const res = await fetch("/api/products/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: qrInputCode })
      });
      const data = await res.json();
      if (res.ok) {
        setQrResult(data);
      } else {
        setQrError(data.error || "Verification failed");
      }
    } catch (e) {
      setQrError("Error verifying product authentication");
    }
  };

  // Cart calculation
  const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  const discountAmount = subtotal * couponDiscount;
  const shippingCharge = 60; // Configured shipping
  const totalBill = subtotal - discountAmount + shippingCharge;

  // Language translation dict
  const t = {
    bn: {
      heroTitle: "টিএমএস প্রিমিয়াম সরিষার তেল",
      heroSubtitle: "নওগাঁর ঐতিহ্যবাহী বদলগাছী কাঠের ঘানির শতভাগ খাঁটি ও ঝাঁঝালো সরিষার তেল। সরাসরি কৃষকের সরিষা থেকে উৎপাদিত।",
      shopNow: "কিনুন এখনই",
      allSizes: "সব সাইজ",
      qrTitle: "আসল পণ্য ভেরিফিকেশন (QR কোড)",
      qrDesc: "পণ্য আসল কি না তা নিশ্চিত করতে বোতলের কিউআর কোড স্ক্যান করুন অথবা কোডটি নিচে ইনপুট দিন।",
      qrPlaceholder: "যেমন: TMS-OIL-5L-1150",
      verifyBtn: "যাচাই করুন",
      cartTitle: "শপিং কার্ট",
      checkoutBtn: "অর্ডার কনফার্ম করুন",
      emptyCart: "আপনার কার্ট বর্তমানে খালি আছে।",
      paymentDetails: "পেমেন্ট পদ্ধতি",
      shippingAdd: "শিপিং ঠিকানা (গ্রাম, ইউনিয়ন, জেলা)",
      addSuccess: "অর্ডারে যুক্ত করা হয়েছে!",
      faqTitle: "সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)",
      contactTitle: "যোগাযোগ এবং অফিস ঠিকানা",
      aboutTitle: "টিএমএস (TMS) কেন সেরা?",
      aboutDesc: "টিএমএস সরিষার তেল নওগাঁর বদলগাছীর বিখ্যাত সরিষা থেকে তৈরি। আমরা উন্নতমানের মেশিন ও ঘানির সমন্বয়ে সম্পূর্ণ প্রাকৃতিক উপায়ে তেল বোতলজাত করি। কোনো ক্ষতিকারক কেমিক্যাল বা কৃত্রিম সুবাস ব্যবহার করা হয় না।",
      features: [
        { title: "১০০% অর্গানিক সরিষা", desc: "উত্তরবঙ্গের মাঠ থেকে সরাসরি সংগৃহীত।" },
        { title: "কাঠের ঘানির ঝাঁঝ", desc: "প্রাকৃতিক কাঠের ঘানিতে পিষ্ট ঝাঁঝালো ও পুষ্টিকর।" },
        { title: "এমএলএম কমিশন", desc: "মেম্বার হয়ে প্রতি ক্রয়ে নিশ্চিত ৫ লেভেল পর্যন্ত বোনাস।" }
      ]
    },
    en: {
      heroTitle: "TMS Premium Mustard Oil",
      heroSubtitle: "100% pure and pungent wood-pressed mustard oil from Naogaon. Freshly sourced and chemical-free.",
      shopNow: "Shop Now",
      allSizes: "All Sizes",
      qrTitle: "Verify Genuine Product (QR Scanner)",
      qrDesc: "Scan bottle QR code or enter the code manually below to check authentication.",
      qrPlaceholder: "Example: TMS-OIL-5L-1150",
      verifyBtn: "Verify QR",
      cartTitle: "Shopping Cart",
      checkoutBtn: "Place Order Now",
      emptyCart: "Your cart is currently empty.",
      paymentDetails: "Payment Method",
      shippingAdd: "Shipping Address (Village, District)",
      addSuccess: "Added to cart!",
      faqTitle: "Frequently Asked Questions",
      contactTitle: "Contact & Head Office",
      aboutTitle: "Why TMS is the Best?",
      aboutDesc: "TMS Mustard Oil is produced from top-grade mustard seeds of Badalgachhi, Naogaon. We process it using absolute natural cold-pressed methods. No chemicals, preservatives or synthetic flavoring added.",
      features: [
        { title: "100% Organic Mustard", desc: "Sourced directly from local farmers." },
        { title: "Cold Wood-Pressed Pungency", desc: "Maintains natural vitamins and flavor." },
        { title: "5-Level MLM Referral", desc: "Become a member and earn commissions on every sales." }
      ]
    }
  }[language];

  return (
    <div className="animate-fade-in pb-20 bg-gray-50">
      
      {/* Premium Hero Section with Sliding Banner look */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0F7A39] to-[#0b5c2a] text-white py-12 md:py-20 px-4">
        <div className="absolute inset-0 bg-opacity-20 bg-[radial-gradient(#E7B416_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="md:col-span-7 space-y-5">
            <span className="bg-[#E7B416] text-[#1E293B] font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
              {language === "bn" ? "★ ১০০% খাঁটি ও গুণগত মান সম্পন্ন" : "★ 100% Pure & Pungent Wood-pressed"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-white tracking-tight">
              {t.heroTitle}
            </h2>
            <p className="text-sm md:text-base text-gray-100 max-w-xl font-light leading-relaxed">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a 
                href="#products-section" 
                className="bg-[#E7B416] hover:bg-yellow-500 text-[#1E293B] font-bold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition flex items-center space-x-2 border border-yellow-400"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.shopNow}</span>
              </a>
              <a 
                href="#qr-section" 
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-lg border border-white/20 transition flex items-center space-x-2"
              >
                <QrCode className="w-4 h-4 text-[#E7B416]" />
                <span>{language === "bn" ? "প্রোডাক্ট যাচাই" : "Verify Product"}</span>
              </a>
            </div>
          </div>

          {/* Featured Product Illustration */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white/5 rounded-full flex items-center justify-center p-4 border border-white/10 shadow-2xl animate-pulse">
              <img 
                src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80" 
                alt="Mustard Oil Bottle" 
                className="w-48 h-48 md:w-60 md:h-60 object-cover rounded-2xl shadow-2xl border-4 border-[#E7B416]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2 -right-2 bg-[#E7B416] text-[#1E293B] p-3 rounded-xl font-extrabold shadow-lg text-center leading-none border border-yellow-400">
                <span className="text-[10px] block uppercase">{language === "bn" ? "শুরু মাত্র" : "Starts at"}</span>
                <span className="text-lg font-mono">৳২৪০</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">

        {/* Brand Highlights Section */}
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
          <h3 className="text-xl font-bold text-[#0F7A39] text-center mb-6">
            {t.aboutTitle}
          </h3>
          <p className="text-center text-sm text-gray-600 max-w-3xl mx-auto mb-8">
            {t.aboutDesc}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.features.map((feat: any, idx: number) => (
              <div key={idx} className="p-5 rounded-xl bg-gray-50 border border-gray-100 flex space-x-4 items-start">
                <div className="p-2.5 bg-[#0F7A39]/10 text-[#0F7A39] rounded-lg">
                  <CheckCircle className="w-5 h-5 text-[#E7B416]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{feat.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* QR Authentic Verification Tool (Rural trust anchor) */}
        <section id="qr-section" className="bg-[#1E293B] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-700">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-7 space-y-3">
              <span className="text-[#E7B416] font-bold text-xs uppercase tracking-widest flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 mr-1 text-green-400" />
                <span>{language === "bn" ? "শতভাগ আসল তেলের গ্যারান্টি" : "100% Genuine Quality Guarantee"}</span>
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                {t.qrTitle}
              </h3>
              <p className="text-xs md:text-sm text-gray-300">
                {t.qrDesc}
              </p>
              
              {/* Simulator codes help list */}
              <div className="pt-2">
                <span className="text-[10px] text-[#E7B416] font-bold block mb-1">
                  {language === "bn" ? "লগইন ছাড়াই নিচের কোডগুলো টেস্ট করতে পারেন:" : "Test simulated product QR codes:"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {["TMS-OIL-1L-240", "TMS-OIL-2L-470", "TMS-OIL-5L-1150", "TMS-OIL-10L-2250"].map(c => (
                    <button 
                      key={c} 
                      onClick={() => setQrInputCode(c)} 
                      className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono border border-white/10 transition"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-3">
              <div className="relative">
                <QrCode className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  id="qr_code_verify_input"
                  type="text"
                  placeholder={t.qrPlaceholder}
                  value={qrInputCode}
                  onChange={(e) => setQrInputCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#E7B416]"
                />
              </div>
              <button 
                id="qr_code_verify_btn"
                onClick={handleVerifyQR}
                className="w-full bg-[#E7B416] hover:bg-yellow-500 text-[#1E293B] font-bold py-2.5 rounded-lg text-xs transition"
              >
                {t.verifyBtn}
              </button>

              {qrError && (
                <div className="p-3 bg-red-900/30 border border-red-500 text-red-300 text-xs rounded text-center">
                  ⚠️ {qrError}
                </div>
              )}

              {qrResult && qrResult.verified && (
                <div className="p-3 bg-green-900/30 border border-green-500 text-green-300 text-xs rounded space-y-2">
                  <div className="font-bold flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1.5 text-green-400" />
                    <span>{qrResult.message}</span>
                  </div>
                  <div className="text-[11px] text-gray-300 space-y-1 font-mono">
                    <p>পণ্য: {qrResult.product.name}</p>
                    <p>সাইজ: {qrResult.product.size}</p>
                    <p>মূল্য: ৳{qrResult.product.price}</p>
                    <p>ব্যাচ নম্বর: TMS-B-1192</p>
                    <p>উৎপাদন তারিখ: ২০২৬-০৭-১০</p>
                  </div>
                  <button 
                    id="verify_qr_add_to_cart_btn"
                    onClick={() => {
                      addToCart(qrResult.product, 1);
                      setQrResult(null);
                    }}
                    className="w-full mt-2 bg-[#0F7A39] text-white hover:bg-green-700 py-1.5 rounded text-[11px] font-bold transition"
                  >
                    🛒 {language === "bn" ? "কার্টে যোগ করুন ও একটিভ হোন" : "Add to Cart & Activate"}
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* E-Commerce Shop Section */}
        <section id="products-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-gray-800">
                {language === "bn" ? "আমাদের তেল কালেকশন" : "Our Products Catalog"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {language === "bn" ? "আপনার চাহিদামত প্রিমিয়াম সরিষার তেলের বোতল নির্বাচন করুন" : "Select premium mustard oil based on your container needs"}
              </p>
            </div>

            {/* Sizes Category Selector */}
            <div className="flex flex-wrap gap-1">
              {["all", "1 Liter", "2 Liter", "5 Liter", "10 Liter"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeCategory === cat 
                      ? "bg-[#0F7A39] text-white shadow" 
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {cat === "all" ? t.allSizes : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(p => activeCategory === "all" || p.size === activeCategory)
              .map(prod => (
                <div key={prod.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Image */}
                    <div className="h-44 bg-gray-100 relative overflow-hidden flex items-center justify-center p-3">
                      <img 
                        src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80" 
                        alt={prod.name} 
                        className="h-full object-cover rounded-xl shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 bg-[#0F7A39] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {prod.size}
                      </span>
                      {prod.stock <= 20 && (
                        <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {language === "bn" ? "অল্প স্টক!" : "Low Stock"}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-extrabold text-sm text-gray-800 leading-tight line-clamp-2 h-10">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="w-3.5 h-3.5 fill-yellow-500" />
                        <Star className="w-3.5 h-3.5 fill-yellow-500" />
                        <Star className="w-3.5 h-3.5 fill-yellow-500" />
                        <Star className="w-3.5 h-3.5 fill-yellow-500" />
                        <Star className="w-3.5 h-3.5 fill-yellow-500" />
                        <span className="text-[10px] text-gray-400 font-mono ml-1">(5.0)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-gray-50 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3 pt-2">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold leading-none">
                          {language === "bn" ? "খুচরা মূল্য" : "Retail Price"}
                        </span>
                        <span className="text-base font-extrabold text-gray-800 font-mono">
                          ৳{prod.price}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block leading-none">
                          {language === "bn" ? "স্টক" : "Stock"}
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-600">
                          {prod.stock} {language === "bn" ? "বোতল" : "Pcs"}
                        </span>
                      </div>
                    </div>

                    <button
                      id={`add_to_cart_btn_${prod.id}`}
                      onClick={() => addToCart(prod, 1)}
                      disabled={prod.stock <= 0}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                        prod.stock <= 0 
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                          : "bg-[#0F7A39] hover:bg-[#0b5c2a] text-white shadow-sm border border-green-600"
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{prod.stock <= 0 ? (language === "bn" ? "স্টক আউট" : "Out of Stock") : (language === "bn" ? "কার্টে যোগ করুন" : "Add to Cart")}</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Customer Testimonials & Offers */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-base text-gray-800 flex items-center">
              <Percent className="w-5 h-5 text-[#E7B416] mr-2" />
              <span>{language === "bn" ? "বিশেষ অফার ও ডিসকাউন্ট কুপন" : "Offers & Discounts"}</span>
            </h4>
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#E7B416] text-[#1E293B] font-mono text-[9px] font-bold px-2 py-0.5 rounded-bl">
                ACTIVE
              </div>
              <h5 className="font-extrabold text-sm text-[#1E293B]">{language === "bn" ? "প্রথম মেম্বারশিপ অফার!" : "First Purchase Bonus"}</h5>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {language === "bn" ? "কুপন কোড 'TMS10' ব্যবহার করে প্রথম কেনাকাটায় পান ফ্ল্যাট ১০% ডিসকাউন্ট এবং প্রথম ৫-স্তরের কমিশন অ্যাক্টিভেশন!" : "Apply coupon 'TMS10' to save 10% discount instantly."}
              </p>
              <div className="mt-3 inline-flex items-center space-x-1.5 bg-white border border-yellow-300 rounded px-2 py-0.5 font-mono text-xs font-bold text-yellow-700">
                <span>TMS10</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-base text-gray-800">{language === "bn" ? "আমাদের খুচরা ক্রেতাদের মতামত" : "Client Testimonials"}</h4>
            <div className="space-y-3">
              {[
                { name: "আজিমুল হক, নওগাঁ", review: "টিএমএস সরিষার তেলের ঝাঁঝ কাঠের ঘানির তেলের মতই দারুণ। তরকারিতে খুব চমৎকার ঘ্রাণ আসে।" },
                { name: "হাবিবা খাতুন, বদলগাছী", review: "বাচ্চাদের জন্য বাজারের তেল বিশ্বাস করা কঠিন। এই তেলের বিশুদ্ধতা নিশ্চিত পেয়ে আমি শান্তি পেয়েছি।" }
              ].map((test, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center text-yellow-500 mb-1">
                    <Star className="w-3 h-3 fill-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500" />
                  </div>
                  <p className="text-[11px] text-gray-600 italic">"{test.review}"</p>
                  <p className="text-[9px] font-bold text-gray-400 mt-1.5 text-right">— {test.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 border-b pb-3 mb-4 flex items-center">
            <HelpCircle className="w-5 h-5 text-[#0F7A39] mr-2" />
            <span>{t.faqTitle}</span>
          </h3>
          <div className="space-y-4">
            {[
              {
                q: language === "bn" ? "১. টিএমএস এমএলএম সিস্টেমে কিভাবে কমিশন পাওয়া যায়?" : "1. How does the MLM commission structure work?",
                a: language === "bn" 
                  ? "মেম্বার হিসেবে জয়েন করার পর, আপনার রেফারেল লিঙ্কের মাধ্যমে কেউ তেল কিনলে অথবা মেম্বার হলে আপনি সরাসরি লেভেল-১ কমিশন পাবেন। এবং তাদের রেফারেলে পর্যায়ক্রমে লেভেল-৫ পর্যন্ত কমিশন পাবেন।" 
                  : "Once joined, if anyone purchases oil or registers through your link, you earn Level 1 direct bonus, and subsequently up to 5 levels of downstream unilevel commissions."
              },
              {
                q: language === "bn" ? "২. তেলের বিশুদ্ধতা কিভাবে নিশ্চিত হব?" : "2. How do I verify oil purity?",
                a: language === "bn"
                  ? "আমরা প্রতি বোতলে কিউআর কোড সিল দেই। এটি আমাদের বদলগাছী নওগাঁ হেড কারখানার মূল ডেটাবেজের সাথে কিউআর কোড মেলাবে এবং আসল কি না তা নিশ্চিত করবে।"
                  : "We place a dedicated serialised QR code on every bottle. This authenticates the item directly from our local factory database."
              }
            ].map((faq, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="font-extrabold text-sm text-gray-800">{faq.q}</h4>
                <p className="text-xs text-gray-600 leading-relaxed pl-4 border-l border-gray-200">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact and Google Maps Section */}
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-4">
              <h3 className="text-lg font-black text-gray-800">{t.contactTitle}</h3>
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-[#0F7A39] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-800">টিএমএস (TMS) প্রধান কার্যালয়</p>
                    <p>বদলগাছী উপজেলা গেট সংলগ্ন, নওগাঁ, বাংলাদেশ</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#0F7A39] shrink-0" />
                  <p className="font-mono font-bold text-gray-800">01966-291176</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-[#0F7A39] shrink-0" />
                  <p className="font-mono">support@tmsbd.com</p>
                </div>
              </div>
            </div>

            {/* Google Map Simulator (Clean, illustrative high-contrast UI card) */}
            <div className="md:col-span-7 bg-gray-100 rounded-xl overflow-hidden min-h-[160px] relative border border-gray-200">
              <div className="absolute inset-0 bg-[radial-gradient(#ccc_1px,transparent_1px)] [background-size:12px_12px] flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <span className="bg-[#0F7A39] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    Google Maps Live
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono font-semibold">বদলগাছী, নওগাঁ</span>
                </div>

                <div className="text-center space-y-1 my-auto">
                  <MapPin className="w-8 h-8 text-red-500 mx-auto drop-shadow animate-bounce" />
                  <p className="text-xs font-bold text-gray-800">টিএমএস (TMS) সরিষার তেল কারখানা</p>
                  <p className="text-[10px] text-gray-500 font-light">Badalgachhi, Naogaon, Bangladesh</p>
                </div>

                <div className="text-[9px] text-gray-400 font-mono text-right">
                  Lat: 24.9667° N, Lon: 88.9333° E
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Cart Drawer Component */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-up">
            <div className="bg-[#0F7A39] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#E7B416]" />
                <span>{t.cartTitle}</span>
              </h3>
              <button 
                id="cart_drawer_close"
                onClick={() => setShowCart(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                  <p>{t.emptyCart}</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-[#0F7A39] border">
                        {item.product.size.split(" ")[0]}L
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{item.product.name}</h4>
                        <p className="text-[10px] text-gray-400 font-mono">৳{item.product.price} / বোতল</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-200 rounded bg-gray-50">
                        <button 
                          id={`cart_qty_dec_${item.product.id}`}
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-semibold">{item.quantity}</span>
                        <button 
                          id={`cart_qty_inc_${item.product.id}`}
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        id={`cart_qty_del_${item.product.id}`}
                        onClick={() => updateCartQty(item.product.id, 0)}
                        className="p-1 hover:text-red-500 text-gray-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-white space-y-3">
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>{language === "bn" ? "উপ-মোট বিল:" : "Subtotal:"}</span>
                    <span className="font-mono font-bold text-gray-800">৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "bn" ? "ডেলিভারি চার্জ (নওগাঁ / কুরিয়ার):" : "Delivery Charge:"}</span>
                    <span className="font-mono font-bold text-gray-800">৳{shippingCharge}</span>
                  </div>
                  <div className="flex justify-between text-[#0F7A39] font-semibold">
                    <span>{language === "bn" ? "ডিসকাউন্ট কুপন:" : "Discount:"}</span>
                    <span className="font-mono">-৳{discountAmount}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-black text-gray-800">
                    <span>{language === "bn" ? "সর্বমোট বিল:" : "Total Payable:"}</span>
                    <span className="font-mono text-[#0F7A39]">৳{totalBill}</span>
                  </div>
                </div>

                <button 
                  id="cart_checkout_open_btn"
                  onClick={() => {
                    if (!user) {
                      alert(language === "bn" ? "দয়া করে অর্ডার করতে মেম্বার অ্যাকাউন্টে সাইন ইন করুন।" : "Please sign in to order.");
                      setShowCart(false);
                      onNavigate("dashboard");
                    } else {
                      setShowCheckout(true);
                      setShowCart(false);
                    }
                  }}
                  className="w-full bg-[#E7B416] hover:bg-yellow-500 text-[#1E293B] font-extrabold py-3 rounded-xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{language === "bn" ? "অর্ডার করতে এগিয়ে যান" : "Proceed to Checkout"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal Dialog */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-[#0F7A39] text-white p-4 flex items-center justify-between">
              <h4 className="font-extrabold text-sm flex items-center space-x-1.5">
                <ShoppingBag className="w-4 h-4 text-[#E7B416]" />
                <span>{language === "bn" ? "TMS সরিষার তেল অর্ডার প্যানেল" : "TMS Checkout Panel"}</span>
              </h4>
              <button 
                id="checkout_modal_close"
                onClick={() => setShowCheckout(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckout} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Order summary list */}
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs space-y-1 text-gray-600">
                <p className="font-bold text-gray-800 border-b pb-1 mb-1.5">{language === "bn" ? "অর্ডার আইটেম তালিকা" : "Items Summary"}</p>
                {cart.map(i => (
                  <div key={i.product.id} className="flex justify-between">
                    <span>{i.product.size} x {i.quantity}</span>
                    <span className="font-mono font-semibold">৳{i.product.price * i.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon code input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 block">{language === "bn" ? "কুপন কোড (যদি থাকে)" : "Coupon Code (Optional)"}</label>
                <div className="flex space-x-2">
                  <input 
                    id="checkout_coupon_input"
                    type="text"
                    placeholder="যেমন: TMS10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded text-xs uppercase"
                  />
                  <button 
                    id="checkout_coupon_apply_btn"
                    type="button" 
                    onClick={applyCoupon}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-bold border border-gray-300"
                  >
                    {language === "bn" ? "প্রয়োগ" : "Apply"}
                  </button>
                </div>
                {couponMessage && (
                  <p className="text-[10px] text-[#0F7A39] font-bold mt-1">{couponMessage}</p>
                )}
              </div>

              {/* Shipping Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 block">
                  {t.shippingAdd} <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="checkout_shipping_address"
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder={language === "bn" ? "যেমন: গ্রাম: রামপুর, ডাকঘর: বদলগাছী, নওগাঁ" : "Example: Rampur, Badalgachhi, Naogaon"}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 block">
                  {t.paymentDetails} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "Cash on Delivery", label: "ক্যাশ অন ডেলিভারি" },
                    { val: "bKash", label: "বিকাশ (bKash)" },
                    { val: "Nagad", label: "নগদ (Nagad)" },
                    { val: "Bank Transfer", label: "ব্যাংক ট্রান্সফার" }
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPaymentMethod(p.val as any)}
                      className={`p-2.5 rounded border text-xs text-center font-bold transition ${
                        paymentMethod === p.val 
                          ? "border-[#0F7A39] bg-[#0F7A39]/10 text-[#0F7A39]" 
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {language === "bn" ? p.label : p.val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction ID for Mobile Banking */}
              {paymentMethod !== "Cash on Delivery" && (
                <div className="p-3 bg-yellow-50/50 border border-yellow-200 rounded-lg space-y-2">
                  <p className="text-[10px] text-gray-600 leading-normal font-semibold">
                    {paymentMethod === "bKash" || paymentMethod === "Nagad" ? (
                      language === "bn" 
                        ? `আমাদের মার্চেন্ট নাম্বারে (০১৯৬৬-২৯১১৭৬) 'সেন্ড মানি' করুন এবং নিচে ট্রানজেকশন আইডি লিখুন:` 
                        : `Send money to our number (01966-291176) and paste the Txn ID:`
                    ) : (
                      language === "bn"
                        ? `সোনালী ব্যাংক একাউন্ট নম্বর ২০০০১২৪৫৭৮১২২-এ পেমেন্ট করে রশিদ আপলোড বা ট্রানজেকশন নম্বর দিন:`
                        : `Pay to Sonali Bank A/C 2000124578122 and write reference ID:`
                    )}
                  </p>
                  <input 
                    id="checkout_transaction_id"
                    type="text"
                    required
                    placeholder="যেমন: BKASH83726A"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs font-mono font-bold"
                  />
                </div>
              )}

              {/* Bill breakdown */}
              <div className="pt-2 border-t text-xs font-medium space-y-1 text-gray-700">
                <div className="flex justify-between">
                  <span>{language === "bn" ? "তেলের মূল্য:" : "Mustard Oil Price:"}</span>
                  <span className="font-mono font-bold">৳{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === "bn" ? "ডেলিভারি চার্জ:" : "Delivery:"}</span>
                  <span className="font-mono font-bold">৳{shippingCharge}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-bold">
                    <span>{language === "bn" ? "কুপন ডিসকাউন্ট:" : "Discount:"}</span>
                    <span className="font-mono">-৳{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-gray-800 border-t pt-1.5">
                  <span>{language === "bn" ? "সর্বমোট প্রদেয় বিল:" : "Total Bill:"}</span>
                  <span className="font-mono text-[#0F7A39]">৳{totalBill}</span>
                </div>
              </div>

              <button
                id="checkout_confirm_action_btn"
                type="submit"
                className="w-full bg-[#0F7A39] hover:bg-green-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-lg transition"
              >
                {t.checkoutBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Success Feedback Dialog */}
      {checkoutSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-slide-up">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
            
            <div className="space-y-1">
              <h4 className="font-black text-lg text-gray-800">
                {language === "bn" ? "অর্ডারটি সফল হয়েছে!" : "Order Placed Successfully!"}
              </h4>
              <p className="text-xs text-[#0F7A39] font-mono font-bold">
                ID: {checkoutSuccess.id}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === "bn" 
                  ? "আপনার অর্ডারের জন্য ধন্যবাদ। আমাদের নওগাঁ অফিস আপনার ডেসটিনেশনটি ভেরিফাই করার সাথে সাথেই আপনার স্পন্সর ওয়ালেটে ৫ লেভেল পর্যন্ত বোনাস জমা হয়ে যাবে।" 
                  : "Thank you for shopping. Once verified, upstream member wallets receive instant MLM commissions."}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border text-left text-xs space-y-1 text-gray-600 font-mono">
              <p><span className="font-bold">গ্রাহক:</span> {checkoutSuccess.userName}</p>
              <p><span className="font-bold">বিল:</span> ৳{checkoutSuccess.totalAmount}</p>
              <p><span className="font-bold">পদ্ধতি:</span> {checkoutSuccess.paymentMethod}</p>
            </div>

            <button
              id="checkout_success_close_btn"
              onClick={() => {
                setCheckoutSuccess(null);
                onNavigate("orders"); // redirect to active orders tracking
              }}
              className="w-full bg-[#0F7A39] text-white hover:bg-green-700 font-bold py-2.5 rounded-lg text-xs transition"
            >
              {language === "bn" ? "আমার অর্ডার ট্র্যাকিং" : "Track My Orders"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
