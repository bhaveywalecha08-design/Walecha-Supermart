/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order } from '../types';
import { CATEGORIES } from '../data/mockData';
import {
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Edit2,
  Trash2,
  X,
  FileText,
  BadgeAlert,
  Loader,
  Layers,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';

export const SupplierDashboard: React.FC = () => {
  const { currentUser, products, orders, addProduct, updateProduct, deleteProduct, updateOrderStatus } = useApp();

  const [supplierTab, setSupplierTab] = useState<'products' | 'orders' | 'analytics'>('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Form states for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formStock, setFormStock] = useState(100);
  const [formMoq, setFormMoq] = useState(10);
  const [formWholesale, setFormWholesale] = useState(500);
  const [formRetail, setFormRetail] = useState(750);
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formImage, setFormImage] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formLocation, setFormLocation] = useState('');

  const [loading, setLoading] = useState(false);

  // Filter products owned by this supplier
  const supplierProducts = products.filter((p) => p.supplierId === currentUser?.id);

  // Filter orders containing items from this supplier
  const supplierOrders = orders.filter((o) =>
    o.items.some((item) => item.supplierId === currentUser?.id)
  );

  // Calculations
  const totalEarnings = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => {
      // sum up value of items belonging to this supplier
      const supplierItemsVal = o.items
        .filter((item) => item.supplierId === currentUser?.id)
        .reduce((s, item) => s + item.wholesalePrice * item.quantity, 0);
      return sum + supplierItemsVal;
    }, 0);

  const lowStockProducts = supplierProducts.filter((p) => p.stock <= p.moq);
  const pendingShipments = supplierOrders.filter((o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled');

  const openAddModal = () => {
    setFormTitle('');
    setFormDesc('');
    setFormSku(`SKU-${Math.floor(10000 + Math.random() * 90000)}`);
    setFormBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormStock(150);
    setFormMoq(15);
    setFormWholesale(350);
    setFormRetail(550);
    setFormCategory(CATEGORIES[0]);
    // Choose beautiful random category matching splash unsplash image
    setFormImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80');
    setFormBrand('');
    setFormLocation(currentUser?.businessAddress.split(',')[1]?.trim() || 'India');
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormDesc(p.description);
    setFormSku(p.sku);
    setFormBarcode(p.barcode);
    setFormStock(p.stock);
    setFormMoq(p.moq);
    setFormWholesale(p.wholesalePrice);
    setFormRetail(p.retailPrice);
    setFormCategory(p.category);
    setFormImage(p.image);
    setFormBrand(p.brand);
    setFormLocation(p.location);
    setShowAddModal(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const productPayload = {
        title: formTitle,
        description: formDesc,
        sku: formSku,
        barcode: formBarcode,
        stock: Number(formStock),
        moq: Number(formMoq),
        wholesalePrice: Number(formWholesale),
        retailPrice: Number(formRetail),
        category: formCategory,
        image: formImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
        brand: formBrand || 'Generic Brand',
        location: formLocation || 'Delhi',
      };

      if (editingProduct) {
        updateProduct(editingProduct.id, productPayload);
      } else {
        addProduct(productPayload);
      }

      setLoading(false);
      setShowAddModal(false);
    }, 1000);
  };

  const handleRestock = (productId: string, currentStock: number, moq: number) => {
    // Instantly add stock to double MOQ or top it up
    const addedAmt = moq * 5;
    updateProduct(productId, { stock: currentStock + addedAmt });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Heading Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 bg-emerald-600/10 h-64 w-64 rounded-full blur-2xl" />
        <div className="z-10">
          <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
            Supplier Operations
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-3">{currentUser?.businessName}</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Settle wholesale invoices, manage real-time inventory alerts, dispatch bulk cargo shipments, and trace gross earnings.
          </p>
        </div>
        <button
          id="supplier-add-product-banner-btn"
          onClick={openAddModal}
          className="mt-4 md:mt-0 z-10 flex items-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Upload Bulk Product</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 pb-3 mb-8 space-x-1 overflow-x-auto scrollbar-none">
        <button
          id="supplier-tab-inventory"
          onClick={() => setSupplierTab('products')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            supplierTab === 'products'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Product Catalog ({supplierProducts.length})</span>
        </button>

        <button
          id="supplier-tab-shipments"
          onClick={() => setSupplierTab('orders')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all relative ${
            supplierTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Corporate Orders ({supplierOrders.length})</span>
          {pendingShipments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center ring-2 ring-white">
              {pendingShipments.length}
            </span>
          )}
        </button>

        <button
          id="supplier-tab-analytics"
          onClick={() => setSupplierTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            supplierTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Earnings Analytics</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
          <p className="text-2xl font-black text-slate-800 mt-2">₹{totalEarnings.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">↑ +8.2% vs previous period</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Shipments</span>
          <p className="text-2xl font-black text-slate-800 mt-2">{pendingShipments.length}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Awaiting packaging or transit</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
          <p className="text-2xl font-black text-slate-800 mt-2">{lowStockProducts.length}</p>
          <span className={`text-[10px] font-bold mt-1 block ${lowStockProducts.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            {lowStockProducts.length > 0 ? '⚠ Requires urgent restock' : '✓ All lines robust'}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Dispatched Items</span>
          <p className="text-2xl font-black text-slate-800 mt-2">
            {supplierProducts.reduce((sum, p) => sum + p.salesCount, 0)}
          </p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Consolidated units sold</span>
        </div>
      </div>

      {/* Tab Contents */}
      {supplierTab === 'products' && (
        <div id="supplier-products-section" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h3 className="text-lg font-black text-slate-800">Your Product Inventory</h3>
              <p className="text-xs text-slate-400 font-semibold">Monitor wholesale batches, stock depths, and minimum order compliance thresholds.</p>
            </div>
            <button
              id="supplier-add-product-btn"
              onClick={openAddModal}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Listing</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6 text-center">SKU</th>
                  <th className="py-4 px-6 text-right">Wholesale Rate</th>
                  <th className="py-4 px-6 text-right">Retail Price</th>
                  <th className="py-4 px-6 text-center">In Stock</th>
                  <th className="py-4 px-6 text-center">Min Order (MOQ)</th>
                  <th className="py-4 px-6 text-right">Controls</th>
                </tr>
              </thead>
              <tbody>
                {supplierProducts.map((p) => {
                  const isLow = p.stock <= p.moq;
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 text-xs">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img src={p.image} className="h-12 w-12 object-cover rounded-xl border border-slate-100" alt={p.title} />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{p.title}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{p.category} • Brand: {p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-[10px] text-slate-500 font-bold">{p.sku}</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-800">₹{p.wholesalePrice}</td>
                      <td className="py-4 px-6 text-right text-slate-500 font-medium">₹{p.retailPrice}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center space-x-1 ${
                            isLow ? 'bg-red-50 text-red-700 border border-red-100 animate-pulse' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isLow && <BadgeAlert className="h-3 w-3 mr-0.5" />}
                            <span>{p.stock} units</span>
                          </span>
                          {isLow && (
                            <button
                              id={`restock-${p.id}`}
                              onClick={() => handleRestock(p.id, p.stock, p.moq)}
                              className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold mt-1.5 flex items-center space-x-0.5 border border-dashed border-indigo-200 hover:border-indigo-400 px-1.5 py-0.5 rounded-md bg-indigo-50/20 cursor-pointer"
                            >
                              <RefreshCcw className="h-2.5 w-2.5" />
                              <span>Restock</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-indigo-600">{p.moq} units</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end space-x-1">
                          <button
                            id={`edit-product-${p.id}`}
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                            title="Edit Listing"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            id={`delete-product-${p.id}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${p.title} from your catalog?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Delete Listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {supplierProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                      <div className="max-w-xs mx-auto">
                        <p className="font-bold text-slate-600">No Wholesale Products Yet</p>
                        <p className="text-xs text-slate-400 mt-1">Upload your manufacturer catalog to start receiving wholesale orders.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {supplierTab === 'orders' && (
        <div id="supplier-orders-section" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800">Corporate Orders Fulfillment</h3>
            <p className="text-xs text-slate-400 font-semibold">Track bulk batches ordered, update delivery progress, and generate tax receipts.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">ID & Date</th>
                  <th className="py-4 px-6">Purchasing Retailer</th>
                  <th className="py-4 px-6">Your ordered items</th>
                  <th className="py-4 px-6 text-right">Wholesale Amount</th>
                  <th className="py-4 px-6">Shipment Progress</th>
                  <th className="py-4 px-6 text-right">Tax invoice</th>
                </tr>
              </thead>
              <tbody>
                {supplierOrders.map((o) => {
                  // Get items belonging to this supplier
                  const myItems = o.items.filter((item) => item.supplierId === currentUser?.id);
                  const myTotalWholesalePrice = myItems.reduce((sum, i) => sum + i.wholesalePrice * i.quantity, 0);

                  return (
                    <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50 text-xs">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800 font-mono">{o.id}</p>
                        <p className="text-[10px] text-slate-400">{new Date(o.date).toLocaleDateString()}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{o.retailerBusinessName}</p>
                        <p className="text-[10px] text-slate-400">Buyer: {o.retailerName}</p>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="space-y-1">
                          {myItems.map((item, idx) => (
                            <p key={idx} className="font-semibold text-slate-700 truncate text-[11px]">
                              {item.productTitle} <span className="text-indigo-600 font-bold">x{item.quantity}</span>
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-slate-800">
                        ₹{myTotalWholesalePrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          id={`supplier-order-status-select-${o.id}`}
                          value={o.orderStatus}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                          className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border cursor-pointer focus:outline-none ${
                            o.orderStatus === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : o.orderStatus === 'confirmed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : o.orderStatus === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="pending">Awaiting Confirm</option>
                          <option value="confirmed">Confirm Order</option>
                          <option value="packed">Packed & Sealed</option>
                          <option value="shipped">Shipped Transit</option>
                          <option value="delivered">Delivered Bulk</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          id={`supplier-view-invoice-${o.id}`}
                          onClick={() => setSelectedInvoice(o)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {supplierOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                      <p className="font-bold">No Orders Placed Yet</p>
                      <p className="text-xs text-slate-400">Retailers will see your products once approved and place bulk orders.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {supplierTab === 'analytics' && (
        <div id="supplier-analytics-section" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Stock Utilization Depth</h3>
            <div className="space-y-4">
              {supplierProducts.slice(0, 5).map((p) => {
                const percent = Math.min(100, (p.stock / (p.moq * 10)) * 100);
                return (
                  <div key={p.id}>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span className="truncate">{p.title}</span>
                      <span>{p.stock} units left</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${
                          percent <= 20 ? 'bg-red-500' : percent <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
              {supplierProducts.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No products uploaded to display stock utilization.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Batch Item sales</h3>
            <div className="space-y-3">
              {[...supplierProducts]
                .sort((a, b) => b.salesCount - a.salesCount)
                .slice(0, 4)
                .map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <img src={p.image} className="h-8 w-8 object-cover rounded-md" alt={p.title} />
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{p.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-100">
                        {p.salesCount} units
                      </span>
                    </div>
                  </div>
                ))}
              {supplierProducts.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No sales recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div id="product-form-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="text-slate-800 font-bold flex items-center space-x-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                <span>{editingProduct ? `Edit ${editingProduct.title}` : 'Upload New Wholesale Listing'}</span>
              </span>
              <button
                id="close-product-form-btn"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Product Title</label>
                  <input
                    id="form-title-input"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Organic Sugar Cane Bulk Bags (25kg)"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                  <select
                    id="form-category-select"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Brand Name</label>
                  <input
                    id="form-brand-input"
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. PureFoods"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SKU Code</label>
                  <input
                    id="form-sku-input"
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="RIC-BAS-10"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Barcode (EAN-13)</label>
                  <input
                    id="form-barcode-input"
                    type="text"
                    required
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="8901234567"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Wholesale Price (₹)</label>
                  <input
                    id="form-wholesale-input"
                    type="number"
                    required
                    min={1}
                    value={formWholesale}
                    onChange={(e) => setFormWholesale(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Retail Price (₹)</label>
                  <input
                    id="form-retail-input"
                    type="number"
                    required
                    min={1}
                    value={formRetail}
                    onChange={(e) => setFormRetail(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Starting Stock Quantity</label>
                  <input
                    id="form-stock-input"
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Minimum Order Qty (MOQ)</label>
                  <input
                    id="form-moq-input"
                    type="number"
                    required
                    min={1}
                    value={formMoq}
                    onChange={(e) => setFormMoq(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold text-indigo-600"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Image URL</label>
                  <input
                    id="form-image-input"
                    type="text"
                    required
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Product Description</label>
                  <textarea
                    id="form-desc-input"
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Full wholesale specification sheet, certifications, shelf life details..."
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  id="cancel-product-form"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  id="submit-product-form"
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-xs flex justify-center items-center"
                >
                  {loading ? <Loader className="animate-spin h-4 w-4" /> : editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Viewer Overlay */}
      {selectedInvoice && (
        <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};
