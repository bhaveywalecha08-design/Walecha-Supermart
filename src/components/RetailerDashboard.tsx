/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order } from '../types';
import { CATEGORIES } from '../data/mockData';
import {
  Search,
  Filter,
  ShoppingCart,
  CheckCircle,
  Truck,
  Award,
  Star,
  ChevronRight,
  Sparkles,
  Ticket,
  Maximize2,
  X,
  CreditCard,
  Building,
  MapPin,
  Clock,
  Loader,
  AlertCircle,
  Undo2,
  ThumbsUp,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';

interface RetailerDashboardProps {
  onOpenCart: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({ onOpenCart, activeView, setActiveView }) => {
  const {
    currentUser,
    products,
    orders,
    addToCart,
    cart,
    coupons,
    checkout,
    reviews,
    addReview,
  } = useApp();

  // Local view controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [selectedMoq, setSelectedMoq] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeReviewProdId, setActiveReviewProdId] = useState<string | null>(null);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Checkout states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(currentUser?.businessAddress || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Order viewing
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSupplier = selectedSupplier === 'All' || p.supplierName === selectedSupplier;
    const matchesMoq = selectedMoq === 'All' ||
                       (selectedMoq === 'low' && p.moq <= 5) ||
                       (selectedMoq === 'medium' && p.moq > 5 && p.moq <= 12) ||
                       (selectedMoq === 'high' && p.moq > 12);

    return matchesSearch && matchesCategory && matchesSupplier && matchesMoq;
  });

  // Unique suppliers list for filter dropdown
  const uniqueSuppliers = Array.from(new Set(products.map((p) => p.supplierName)));

  // My placed orders
  const myOrders = orders.filter((o) => o.retailerId === currentUser?.id);

  // Quantity selected states for cards
  const [qtys, setQtys] = useState<{ [key: string]: number }>({});

  const handleQtyChange = (prodId: string, val: number, moq: number, stock: number) => {
    const currentVal = qtys[prodId] || moq;
    const newVal = Math.max(moq, Math.min(stock, currentVal + val));
    setQtys((prev) => ({ ...prev, [prodId]: newVal }));
  };

  const triggerAddToCart = (product: Product) => {
    const qty = qtys[product.id] || product.moq;
    const res = addToCart(product, qty);
    if (res.success) {
      alert(res.message);
      // Reset card selection to MOQ
      setQtys((prev) => ({ ...prev, [product.id]: product.moq }));
    } else {
      alert(res.message);
    }
  };

  // Checkout financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.wholesalePrice * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const shipping = subtotal > 15000 ? 0 : 450;
  
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode) return;

    const coupon = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
    if (!coupon) {
      setCouponError('Invalid coupon code.');
      setAppliedDiscount(0);
      return;
    }

    if (subtotal < coupon.minOrderValue) {
      setCouponError(`Min order value to apply this coupon is ₹${coupon.minOrderValue.toLocaleString('en-IN')}.`);
      setAppliedDiscount(0);
      return;
    }

    let discountAmt = 0;
    if (coupon.discountType === 'percentage') {
      discountAmt = Math.round((subtotal * (coupon.value / 100)) * 100) / 100;
    } else {
      discountAmt = coupon.value;
    }

    setAppliedDiscount(discountAmt);
    setCouponSuccess(`Coupon code '${coupon.code}' applied! You saved ₹${discountAmt.toLocaleString('en-IN')}.`);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress || !contactPhone) {
      alert('Please fill out shipping details.');
      return;
    }

    const res = checkout(paymentMethod, shippingAddress, contactPhone, couponCode || undefined);
    if (res.success) {
      alert(res.message);
      setShowCheckoutModal(false);
      setCouponCode('');
      setAppliedDiscount(0);
      setCouponSuccess('');
      setActiveView('orders'); // Jump to placed orders tab
    } else {
      alert(res.message);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewProdId) return;
    if (!reviewComment.trim()) {
      alert('Please write a feedback comment.');
      return;
    }

    addReview(activeReviewProdId, reviewRating, reviewComment);
    alert('Thank you! Your verified business review has been published.');
    setReviewComment('');
    setActiveReviewProdId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Pills Header Carousel */}
      {activeView === 'browse' && (
        <div id="retailer-browse-catalog">
          {/* Welcome Intro Banner */}
          <div className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white rounded-3xl p-6 md:p-8 shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 bg-white/10 h-64 w-64 rounded-full blur-2xl pointer-events-none" />
            <div className="z-10">
              <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full border border-white/20">
                Walecha Member Account Verified
              </span>
              <h1 className="text-2xl md:text-3xl font-black mt-3">Welcome, {currentUser?.businessName}</h1>
              <p className="text-xs md:text-sm text-indigo-100 mt-1 max-w-xl">
                Browse premium catalogs directly from audited manufactures. Place bulk orders with minimum order quantity discounts and customized GST invoicing.
              </p>
            </div>
            <div className="mt-4 md:mt-0 z-10 bg-white/15 border border-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center space-x-3">
              <Award className="h-6 w-6 text-amber-300" />
              <div>
                <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wide">Loyalty Benefits</p>
                <p className="text-sm font-black text-white">{currentUser?.loyaltyPoints || 0} Club Points</p>
              </div>
            </div>
          </div>

          {/* Search and Collapsible Filters Panel */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="catalog-search-input"
                  type="text"
                  placeholder="Search products by brand, title, SKU or specification..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-sm focus:outline-none transition-all text-slate-800"
                />
              </div>

              {/* Advanced Filter select cards */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Filters:</span>
                </div>
                
                <select
                  id="filter-supplier-select"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none"
                >
                  <option value="All">All Suppliers</option>
                  {uniqueSuppliers.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  id="filter-moq-select"
                  value={selectedMoq}
                  onChange={(e) => setSelectedMoq(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none"
                >
                  <option value="All">All MOQ Thresholds</option>
                  <option value="low">Micro MOQ (≤ 5 units)</option>
                  <option value="medium">Standard MOQ (6-12 units)</option>
                  <option value="high">High Volume MOQ (&gt; 12 units)</option>
                </select>

                {(searchQuery || selectedCategory !== 'All' || selectedSupplier !== 'All' || selectedMoq !== 'All') && (
                  <button
                    id="clear-filters-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedSupplier('All');
                      setSelectedMoq('All');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Category horizontal bar */}
            <div className="border-t border-slate-100 pt-4 overflow-x-auto flex space-x-2 scrollbar-none pb-1">
              <button
                id="category-pill-all"
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  id={`category-pill-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div id="products-catalog-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => {
              const cardQty = qtys[p.id] || p.moq;
              const discountPercent = Math.round(((p.retailPrice - p.wholesalePrice) / p.retailPrice) * 100);

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition-all overflow-hidden flex flex-col justify-between group">
                  <div>
                    {/* Image block */}
                    <div className="relative h-48 bg-slate-50 overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        src={p.image}
                        alt={p.title}
                      />
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-extrabold tracking-wider uppercase">
                        Save {discountPercent}% Wholsesale
                      </span>
                      {p.stock <= p.moq && (
                        <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-extrabold animate-pulse">
                          LOW STOCK
                        </span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-5 pb-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{p.brand}</span>
                        <span className="text-[10px] font-semibold text-slate-400 capitalize">{p.category}</span>
                      </div>
                      <h3
                        onClick={() => setSelectedProduct(p)}
                        className="text-sm font-bold text-slate-800 hover:text-indigo-600 cursor-pointer line-clamp-2 transition-all min-h-10"
                      >
                        {p.title}
                      </h3>
                      
                      {/* Price Matrix */}
                      <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-2 text-center">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Wholesale Price</p>
                          <p className="text-sm font-black text-slate-800">₹{p.wholesalePrice}/unit</p>
                        </div>
                        <div className="border-l border-slate-200">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Market Retail (MRP)</p>
                          <p className="text-xs font-semibold text-slate-400 line-through">₹{p.retailPrice}/unit</p>
                        </div>
                      </div>

                      {/* Stock & MOQ indicators */}
                      <div className="flex justify-between items-center mt-3 text-[10px] font-bold">
                        <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                          Min. Order (MOQ): {p.moq} units
                        </span>
                        <span className={`${p.stock > p.moq * 3 ? 'text-slate-400' : 'text-red-500'}`}>
                          Stock: {p.stock} units
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Selector controls */}
                  <div className="p-5 pt-4 border-t border-slate-50 bg-slate-50/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-slate-400">SELECT QUANTITY:</span>
                      <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-1">
                        <button
                          onClick={() => handleQtyChange(p.id, -1, p.moq, p.stock)}
                          disabled={cardQty <= p.moq}
                          className="w-6 h-6 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 rounded disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-slate-800 w-8 text-center">{cardQty}</span>
                        <button
                          onClick={() => handleQtyChange(p.id, 1, p.moq, p.stock)}
                          disabled={cardQty >= p.stock}
                          className="w-6 h-6 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 rounded disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      id={`add-to-cart-btn-${p.id}`}
                      onClick={() => triggerAddToCart(p)}
                      disabled={p.stock < p.moq}
                      className="w-full flex items-center justify-center space-x-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer shadow-xs"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{p.stock < p.moq ? 'Stock Out' : `Add To Cart • ₹${(p.wholesalePrice * cardQty).toLocaleString('en-IN')}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-xs max-w-md mx-auto mt-6">
                <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-600">No Wholesale Products Found</p>
                <p className="text-xs text-slate-400 mt-1">Try relaxing your advanced filter specifications or change search terms.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer & Checkout overview */}
      {activeView === 'cart' && (
        <div id="retailer-cart-section" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 md:p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800">Your Business Shopping Cart</h3>
              <p className="text-xs text-slate-400 font-semibold">Review bulk quantities, adjust wholesale items, and apply tax coupons.</p>
            </div>
            <span className="text-xs font-bold text-slate-400">{cart.length} items cataloged</span>
          </div>

          {cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => {
                  const rawItemAmount = item.product.wholesalePrice * item.quantity;
                  const moqAlert = item.quantity < item.product.moq;
                  return (
                    <div key={item.productId} className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      moqAlert ? 'bg-red-50/50 border-red-200' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      <div className="flex items-center space-x-3 flex-1">
                        <img src={item.product.image} className="h-14 w-14 object-cover rounded-xl border border-slate-150" alt={item.product.title} />
                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.title}</p>
                          <p className="text-[10px] text-slate-400">Supplier: {item.product.supplierName}</p>
                          <p className="text-[10px] text-indigo-600 font-bold mt-1">₹{item.product.wholesalePrice}/unit • MOQ: {item.product.moq}</p>
                        </div>
                      </div>

                      {/* Controls and prices */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center space-x-1 bg-white border border-slate-250 border-slate-200 rounded-lg p-1">
                            <button
                              onClick={() => {
                                const { updateCartQuantity, removeFromCart } = useApp();
                                if (item.quantity === item.product.moq) {
                                  removeFromCart(item.productId);
                                } else {
                                  updateCartQuantity(item.productId, item.quantity - 1);
                                }
                              }}
                              className="w-5 h-5 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 rounded"
                            >
                              -
                            </button>
                            <span className="text-xs font-black text-slate-800 w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => {
                                const { updateCartQuantity } = useApp();
                                updateCartQuantity(item.productId, item.quantity + 1);
                              }}
                              className="w-5 h-5 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 rounded"
                            >
                              +
                            </button>
                          </div>
                          {moqAlert && (
                            <span className="text-[9px] font-bold text-red-600 mt-1">Below MOQ!</span>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-800">₹{rawItemAmount.toLocaleString('en-IN')}</p>
                          <button
                            onClick={() => {
                              const { removeFromCart } = useApp();
                              removeFromCart(item.productId);
                            }}
                            className="text-[10px] text-red-500 hover:text-red-700 font-bold mt-1 inline-block cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial checkout summary */}
              <div className="lg:col-span-1 bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Checkout Breakdown</h4>
                
                {/* Coupon widget */}
                <form onSubmit={handleApplyCoupon} className="space-y-2 border-b border-slate-200 pb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">APPLY WHOLESALE COUPON</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg text-xs hover:bg-slate-900 transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] font-semibold text-red-600">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] font-semibold text-emerald-600">{couponSuccess}</p>}

                  {/* Suggest standard coupons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {coupons.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCouponCode(c.code);
                          setCouponError('');
                        }}
                        className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:border-indigo-300 px-1.5 py-0.5 rounded-md flex items-center space-x-0.5 transition-all"
                      >
                        <Ticket className="h-2.5 w-2.5" />
                        <span>{c.code}</span>
                      </button>
                    ))}
                  </div>
                </form>

                {/* Sub-totals list */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-700">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Integrated GST (18%):</span>
                    <span className="font-semibold text-slate-700 font-mono">₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Logistics Delivery Charge:</span>
                    <span className="font-semibold text-slate-700">
                      {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shipping}`}
                    </span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount Coupon Applied:</span>
                      <span>- ₹{appliedDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-800">
                    <span>Grand Total:</span>
                    <span className="text-indigo-600">₹{(subtotal + gst + shipping - appliedDiscount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  id="checkout-proceed-btn"
                  onClick={() => setShowCheckoutModal(true)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex justify-center items-center shadow-md shadow-indigo-100 cursor-pointer"
                >
                  <CreditCard className="h-4 w-4 mr-1.5" />
                  <span>Proceed to Payment</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 max-w-sm mx-auto">
              <ShoppingCart className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-600">Your Shopping Cart is Empty</p>
              <p className="text-xs text-slate-400 mt-1">Browse our wholesales product lists and fulfill your retail inventories.</p>
              <button
                id="cart-back-to-browse-btn"
                onClick={() => setActiveView('browse')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Start Browsing
              </button>
            </div>
          )}
        </div>
      )}

      {/* Placed Orders View tab */}
      {activeView === 'orders' && (
        <div id="retailer-orders-ledger" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 md:p-8 max-w-5xl mx-auto">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <h3 className="text-lg font-black text-slate-800">Your Business Purchase History</h3>
            <p className="text-xs text-slate-400 font-semibold">Trace nationwide bulk shipping, view GST receipts, and write verified reviews.</p>
          </div>

          <div className="space-y-6">
            {myOrders.map((order) => {
              const statusSteps = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
              const currentStepIdx = statusSteps.indexOf(order.orderStatus);

              return (
                <div key={order.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                  {/* Order header row */}
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold">
                    <div className="flex space-x-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">ORDER PLACED</p>
                        <p className="text-slate-700">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">TOTAL VALUE</p>
                        <p className="text-indigo-600 font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">GST TAX INVOICE</p>
                        <p className="text-slate-700 font-mono font-bold">{order.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        id={`retailer-view-invoice-${order.id}`}
                        onClick={() => setSelectedInvoice(order)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>View GST Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Items list */}
                  <div className="p-5 flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3 text-xs">
                          <img src={item.image} className="h-10 w-10 object-cover rounded-lg border" alt={item.productTitle} />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{item.productTitle}</p>
                            <p className="text-[10px] text-slate-400">Qty: <span className="text-indigo-600 font-bold">{item.quantity}</span> units • Price: ₹{item.wholesalePrice}</p>
                            
                            {/* Review action trigger */}
                            {order.orderStatus === 'delivered' && (
                              <button
                                id={`leave-review-btn-${item.productId}`}
                                onClick={() => setActiveReviewProdId(item.productId)}
                                className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold mt-1 flex items-center space-x-0.5 cursor-pointer"
                              >
                                <Star className="h-3 w-3 fill-amber-400 stroke-amber-400 mr-0.5" />
                                <span>Leave Feedback Review</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Step indicator pipeline */}
                    <div className="md:w-72 bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 text-center">BULK SHIPPING STATUS</p>
                      
                      <div className="flex items-center justify-between relative">
                        {statusSteps.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          return (
                            <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isDone ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}>
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span className="text-[9px] font-bold capitalize mt-1.5 text-slate-500 scale-90">{step}</span>
                            </div>
                          );
                        })}
                        {/* Connecting line */}
                        <div className="absolute left-3 right-3 top-3 h-0.5 bg-slate-200 -z-10" />
                        <div
                          style={{ width: `${(currentStepIdx / (statusSteps.length - 1)) * 90}%` }}
                          className="absolute left-3 top-3 h-0.5 bg-indigo-600 -z-10 transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {myOrders.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-medium">
                <p className="font-bold">No Purchase Orders Placed Yet</p>
                <p className="text-xs text-slate-400">Your bulk orders will show here with real-time shipping tracking.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div id="product-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="text-slate-800 font-bold text-sm">Product Specifications Spec-sheet</span>
              <button
                id="close-product-detail-btn"
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <img src={selectedProduct.image} className="h-56 w-full object-cover rounded-xl border" alt={selectedProduct.title} />
              <div className="space-y-3">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{selectedProduct.brand}</span>
                <h3 className="text-base font-black text-slate-800 leading-tight">{selectedProduct.title}</h3>
                <p className="text-xs text-slate-400 font-bold capitalize">Category: {selectedProduct.category} • SKU: {selectedProduct.sku}</p>
                
                {/* Rating summary */}
                <div className="flex items-center space-x-1 text-xs font-semibold text-slate-600">
                  <Star className="h-4 w-4 fill-amber-400 stroke-amber-400 text-amber-500" />
                  <span>{selectedProduct.rating} / 5.0 Rating</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed min-h-16">{selectedProduct.description}</p>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Wholesale Price (₹):</span>
                    <span className="text-slate-800">₹{selectedProduct.wholesalePrice}/unit</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Min Order Quantity (MOQ):</span>
                    <span className="text-indigo-600">{selectedProduct.moq} units</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Origin / Warehouse Location:</span>
                    <span className="text-slate-800 flex items-center"><MapPin className="h-3.5 w-3.5 mr-0.5 text-slate-400" /> {selectedProduct.location}</span>
                  </div>
                </div>
              </div>

              {/* Reviews subsection */}
              <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  <span>Verified Retailer reviews</span>
                </h4>
                <div className="space-y-3">
                  {reviews
                    .filter((r) => r.productId === selectedProduct.id)
                    .map((r) => (
                      <div key={r.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <div className="flex justify-between items-center mb-1 font-bold">
                          <span className="text-slate-700">{r.userName}</span>
                          <div className="flex items-center space-x-0.5">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 stroke-amber-400 text-amber-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-500 mt-1 leading-relaxed">{r.comment}</p>
                        <span className="text-[9px] text-slate-400 block mt-1.5">{r.date} • Verified Purchase</span>
                      </div>
                    ))}
                  {reviews.filter((r) => r.productId === selectedProduct.id).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No reviews published yet for this batch product.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Feedback overlay drawer */}
      {activeReviewProdId && (
        <div id="review-feedback-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="text-slate-800 font-bold text-xs flex items-center space-x-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>Write Verified Product Review</span>
              </span>
              <button
                id="close-review-form-btn"
                onClick={() => setActiveReviewProdId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rating Rating Stars</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-all outline-none"
                    >
                      <Star className={`h-7 w-7 ${
                        star <= reviewRating ? 'fill-amber-400 stroke-amber-400 text-amber-500' : 'text-slate-200 stroke-slate-300'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Verified Feedback Comment</label>
                <textarea
                  id="review-comment-input"
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the quality, packaging, delivery condition or customer response..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  id="cancel-review-btn"
                  type="button"
                  onClick={() => setActiveReviewProdId(null)}
                  className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  id="submit-review-btn"
                  type="submit"
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-xs transition-all"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout details Modal */}
      {showCheckoutModal && (
        <div id="checkout-form-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="text-slate-800 font-bold text-xs flex items-center space-x-1.5">
                <Building className="h-4.5 w-4.5 text-indigo-600" />
                <span>Consolidated Wholesale checkout details</span>
              </span>
              <button
                id="close-checkout-form-btn"
                onClick={() => setShowCheckoutModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Shipping Address (GST Registered Place)</label>
                <textarea
                  id="checkout-address-input"
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Recipient Contact Phone Number</label>
                <input
                  id="checkout-phone-input"
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Select Wholesale Payment Gateway</label>
                <select
                  id="checkout-payment-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="UPI">Corporate UPI (Instant Settle)</option>
                  <option value="Credit Card">Business Credit Card / NetBanking</option>
                  <option value="Bank Transfer">RTGS / NEFT Direct Bank Transfer</option>
                  <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                </select>
              </div>

              {/* Total Summary */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2 text-xs font-semibold text-slate-600">
                <p className="text-[10px] text-indigo-700 font-extrabold uppercase">ORDER VALUE SUMMARY</p>
                <div className="flex justify-between">
                  <span>Gross Value:</span>
                  <span>₹{(subtotal + gst + shipping - appliedDiscount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-indigo-700 font-bold">
                  <span>Loyalty Points Gained:</span>
                  <span>+ {Math.floor((subtotal + gst + shipping - appliedDiscount) / 500)} Points</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  id="cancel-checkout-btn"
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  id="confirm-checkout-btn"
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition-all flex justify-center items-center shadow-md shadow-indigo-100"
                >
                  <span>Authorize & Settle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {selectedInvoice && (
        <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};
