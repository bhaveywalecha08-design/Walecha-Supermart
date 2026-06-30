/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, Product, User } from '../types';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Store,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Trash2,
  Check,
  AlertCircle,
  Shield,
  FileSpreadsheet,
  FileText,
  Clock,
  Briefcase,
  Layers,
  MapPin,
  Search,
  Filter,
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    products,
    orders,
    approveSupplier,
    suspendSupplier,
    deleteProduct,
    updateOrderStatus,
  } = useApp();

  const [adminTab, setAdminTab] = useState<'analytics' | 'suppliers' | 'retailers' | 'products' | 'orders'>('analytics');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calculations for KPI Cards
  const totalGrossSales = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalCompletedOrders = orders.filter((o) => o.orderStatus === 'delivered').length;
  const totalPendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
  const totalSuppliersCount = users.filter((u) => u.role === 'supplier').length;
  const pendingVerificationSuppliers = users.filter((u) => u.role === 'supplier' && !u.isVerified);
  const totalRetailersCount = users.filter((u) => u.role === 'retailer').length;

  // Render beautiful visual mini chart (SVG bar/line)
  const renderRevenueGraph = () => {
    // Generate simulated monthly data based on actual orders + mock historical points
    const dataPoints = [
      { month: 'Jan', amount: 85000 },
      { month: 'Feb', amount: 125000 },
      { month: 'Mar', amount: 190000 },
      { month: 'Apr', amount: 155000 },
      { month: 'May', amount: 240000 },
      { month: 'Jun', amount: totalGrossSales + 210000 }, // June gets current order total
    ];

    const maxVal = Math.max(...dataPoints.map((d) => d.amount));

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Revenue Growth Trend</h3>
            <p className="text-2xl font-black text-slate-800">₹{(totalGrossSales + 210000).toLocaleString('en-IN')}</p>
          </div>
          <span className="flex items-center space-x-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+18.4% MoM</span>
          </span>
        </div>

        <div className="h-52 flex items-end space-x-4 pt-4 border-b border-slate-100">
          {dataPoints.map((d, idx) => {
            const heightPercent = (d.amount / maxVal) * 80; // keep max at 80% to avoid clipping labels
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                <div className="w-full relative flex justify-center">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none z-10 whitespace-nowrap">
                    ₹{Math.round(d.amount).toLocaleString('en-IN')}
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-10 rounded-t-lg transition-all duration-500 ${
                      idx === dataPoints.length - 1
                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100'
                        : 'bg-slate-200 group-hover:bg-indigo-300'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Top-Selling Products table
  const renderTopProducts = () => {
    const sortedProducts = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Top Performing Products</h3>
          <div className="space-y-3">
            {sortedProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center space-x-3">
                  <img src={p.image} className="h-10 w-10 object-cover rounded-lg border border-slate-100" alt={p.title} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</h4>
                    <span className="text-[10px] font-semibold text-slate-400 capitalize">{p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">₹{p.wholesalePrice}/unit</p>
                  <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.25 rounded">{p.salesCount} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 bg-indigo-600/10 h-64 w-64 rounded-full blur-2xl" />
        <div className="z-10">
          <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
            System Headquarters
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-3">Platform Control Center</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Monitor wholesale listings, approve verified manufacturers, trace corporate ledgers, and manage B2B marketplace relationships nationwide.
          </p>
        </div>
        <div className="mt-4 md:mt-0 z-10 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
          <div className="bg-purple-500/15 text-purple-400 p-2.5 rounded-xl">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Active Administration</p>
            <p className="text-sm font-bold text-white">System Admin Live</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 pb-3 mb-8 space-x-1 overflow-x-auto scrollbar-none">
        <button
          id="admin-tab-analytics"
          onClick={() => setAdminTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            adminTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Analytics Hub</span>
        </button>

        <button
          id="admin-tab-suppliers"
          onClick={() => setAdminTab('suppliers')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all relative ${
            adminTab === 'suppliers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Suppliers Directory</span>
          {pendingVerificationSuppliers.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center ring-2 ring-white">
              {pendingVerificationSuppliers.length}
            </span>
          )}
        </button>

        <button
          id="admin-tab-retailers"
          onClick={() => setAdminTab('retailers')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            adminTab === 'retailers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Retailers database</span>
        </button>

        <button
          id="admin-tab-products"
          onClick={() => setAdminTab('products')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            adminTab === 'products'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Master Catalog</span>
        </button>

        <button
          id="admin-tab-orders"
          onClick={() => setAdminTab('orders')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all relative ${
            adminTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>System Orders</span>
          {totalPendingOrders > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center ring-2 ring-white">
              {totalPendingOrders}
            </span>
          )}
        </button>
      </div>

      {/* Dynamic Tab Body */}
      {adminTab === 'analytics' && (
        <div id="analytics-section" className="space-y-8">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Platform Trade (GPT)</span>
              <p className="text-2xl font-black text-slate-800 mt-2">₹{totalGrossSales.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">↑ +12.5% this week</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Active Orders</span>
              <p className="text-2xl font-black text-slate-800 mt-2">{orders.length}</p>
              <div className="flex space-x-2 text-[10px] font-bold text-slate-400 mt-1">
                <span className="text-indigo-600">{totalPendingOrders} pending</span>
                <span>•</span>
                <span className="text-emerald-600">{totalCompletedOrders} delivered</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Suppliers</span>
              <p className="text-2xl font-black text-slate-800 mt-2">{totalSuppliersCount}</p>
              <span className={`text-[10px] font-bold mt-1 block ${pendingVerificationSuppliers.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {pendingVerificationSuppliers.length > 0 ? `⚠ ${pendingVerificationSuppliers.length} pending approval` : '✓ All verified'}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Retailers</span>
              <p className="text-2xl font-black text-slate-800 mt-2">{totalRetailersCount}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Spanning 14 states in India</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">{renderRevenueGraph()}</div>
            <div className="lg:col-span-1 flex flex-col">{renderTopProducts()}</div>
          </div>
        </div>
      )}

      {adminTab === 'suppliers' && (
        <div id="suppliers-section" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h3 className="text-lg font-black text-slate-800">Manufacturers & Wholesalers Registry</h3>
              <p className="text-xs text-slate-400 font-semibold">Verify corporate identities, credentials, and activate/suspend supply lines.</p>
            </div>
            {pendingVerificationSuppliers.length > 0 && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-bold animate-pulse">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>{pendingVerificationSuppliers.length} Actions Required</span>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Company / Representative</th>
                  <th className="py-4 px-6">Business Structure</th>
                  <th className="py-4 px-6">Warehouse Address</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Verification Controls</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) => u.role === 'supplier')
                  .map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 text-xs">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img src={u.avatar} className="h-10 w-10 object-cover rounded-xl border border-slate-100" alt={u.name} />
                          <div>
                            <p className="font-bold text-slate-800">{u.businessName}</p>
                            <p className="text-[10px] text-slate-400">{u.name} • {u.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">
                          {u.businessType}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium max-w-xs truncate">{u.businessAddress}</td>
                      <td className="py-4 px-6">
                        {u.isVerified ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 text-[10px]">
                            <CheckCircle className="h-3 w-3 mr-1" /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-100 text-[10px]">
                            <Clock className="h-3 w-3 mr-1" /> Pending Admin Approval
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!u.isVerified ? (
                          <button
                            id={`approve-supplier-${u.id}`}
                            onClick={() => approveSupplier(u.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold shadow-xs transition-all"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Verify Company</span>
                          </button>
                        ) : (
                          <button
                            id={`suspend-supplier-${u.id}`}
                            onClick={() => suspendSupplier(u.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-all"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Suspend Supplier</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'retailers' && (
        <div id="retailers-section" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800">Retailers Database</h3>
            <p className="text-xs text-slate-400 font-semibold">Track retailer registrations, business categories, and loyalty statistics.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Store Name / Representative</th>
                  <th className="py-4 px-6">Niche Type</th>
                  <th className="py-4 px-6">Shipping Destination</th>
                  <th className="py-4 px-6">Loyalty Score</th>
                  <th className="py-4 px-6">Active Status</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) => u.role === 'retailer')
                  .map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 text-xs">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img src={u.avatar} className="h-10 w-10 object-cover rounded-xl border border-slate-100" alt={u.name} />
                          <div>
                            <p className="font-bold text-slate-800">{u.businessName}</p>
                            <p className="text-[10px] text-slate-400">{u.name} • {u.phone} • {u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                          {u.businessType}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium max-w-xs truncate">{u.businessAddress}</td>
                      <td className="py-4 px-6 font-bold text-indigo-600 font-mono">
                        {u.loyaltyPoints || 0} PTS
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 text-[10px]">
                          ✓ Verified Buyer
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'products' && (
        <div id="catalog-section" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-black text-slate-800">Master Platform Catalog</h3>
              <p className="text-xs text-slate-400 font-semibold">Audit entire listings of wholesale offerings uploaded by different approved suppliers.</p>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalog SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none w-48 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Item details</th>
                  <th className="py-4 px-6 text-center">SKU</th>
                  <th className="py-4 px-6">Assigned Supplier</th>
                  <th className="py-4 px-6 text-right">Wholesale Rate</th>
                  <th className="py-4 px-6 text-center">In Stock</th>
                  <th className="py-4 px-6 text-center">MOQ</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) =>
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((p) => (
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
                      <td className="py-4 px-6 text-slate-600 font-semibold">{p.supplierName}</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-800">₹{p.wholesalePrice}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.stock <= p.moq ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-indigo-600">{p.moq} units</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          id={`delete-product-${p.id}`}
                          onClick={() => {
                            if (confirm(`Remove product ${p.title} from platform database?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'orders' && (
        <div id="orders-ledger-section" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-black text-slate-800">Master Platform Orders Ledger</h3>
              <p className="text-xs text-slate-400 font-semibold">Monitor nationwide shipments, payments status, and view tax invoices.</p>
            </div>
            <div className="flex space-x-2">
              <select
                id="order-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">ID & Date</th>
                  <th className="py-4 px-6">Business Retailer</th>
                  <th className="py-4 px-6 text-center">Items count</th>
                  <th className="py-4 px-6 text-right">Invoice Value</th>
                  <th className="py-4 px-6">Fulfillment Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((o) => statusFilter === 'all' || o.orderStatus === statusFilter)
                  .map((o) => (
                    <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50 text-xs">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800 font-mono">{o.id}</p>
                        <p className="text-[10px] text-slate-400">{new Date(o.date).toLocaleDateString()}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{o.retailerBusinessName}</p>
                        <p className="text-[10px] text-slate-400">{o.retailerName}</p>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-700">{o.items.length} items</td>
                      <td className="py-4 px-6 text-right font-bold text-indigo-600">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          <select
                            id={`admin-order-status-select-${o.id}`}
                            value={o.orderStatus}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                            className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border focus:outline-none cursor-pointer ${
                              o.orderStatus === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : o.orderStatus === 'confirmed'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : o.orderStatus === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          id={`view-invoice-${o.id}`}
                          onClick={() => setSelectedOrder(o)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {selectedOrder && (
        <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};
