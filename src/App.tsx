/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { AdminDashboard } from './components/AdminDashboard';
import { SupplierDashboard } from './components/SupplierDashboard';
import { RetailerDashboard } from './components/RetailerDashboard';
import { ShoppingBag, FileText, LayoutDashboard, Settings, AlertCircle, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser } = useApp();
  
  // Tab states for Retailer / Supplier / Admin
  const [activeView, setActiveView] = useState('browse');

  // Sync default view when user switches role
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      setActiveView('analytics');
    } else if (currentUser.role === 'supplier') {
      setActiveView('products');
    } else {
      setActiveView('browse');
    }
  }, [currentUser?.role]);

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with Nav & Cart controls */}
      <Header
        onOpenCart={() => setActiveView('cart')}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Primary Content Window */}
      <main className="flex-1 pb-16">
        {currentUser.role === 'admin' && (
          <AdminDashboard />
        )}

        {currentUser.role === 'supplier' && (
          <SupplierDashboard />
        )}

        {currentUser.role === 'retailer' && (
          <RetailerDashboard
            onOpenCart={() => setActiveView('cart')}
            activeView={activeView}
            setActiveView={setActiveView}
          />
        )}
      </main>

      {/* Sticky Mobile Sub-navigation Bar (for Retailer role) */}
      {currentUser.role === 'retailer' && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-250 border-slate-200 shadow-lg px-6 py-2.5 flex justify-around items-center md:hidden z-30">
          <button
            id="mobile-nav-browse"
            onClick={() => setActiveView('browse')}
            className={`flex flex-col items-center space-y-1 ${
              activeView === 'browse' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[10px] tracking-tight">Browse</span>
          </button>

          <button
            id="mobile-nav-cart"
            onClick={() => setActiveView('cart')}
            className={`flex flex-col items-center space-y-1 ${
              activeView === 'cart' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] tracking-tight">Cart</span>
          </button>

          <button
            id="mobile-nav-orders"
            onClick={() => setActiveView('orders')}
            className={`flex flex-col items-center space-y-1 ${
              activeView === 'orders' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-[10px] tracking-tight">Orders</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
