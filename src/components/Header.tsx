/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Store, ShoppingCart, LogOut, ShieldAlert, Award, RefreshCw, X, Trash2, ShieldCheck, Check } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenCart: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, activeView, setActiveView }) => {
  const { currentUser, logout, login, cart, users } = useApp();
  const [showRoleSwapping, setShowRoleSwapping] = useState(false);

  const handleRoleSwap = (role: UserRole) => {
    // Find the first user in the mock list with that role and swap to them
    const matchingUser = users.find((u) => u.role === role && (role !== 'supplier' || u.isVerified));
    // If we want to simulate unverified, we could find any, but let's default to verified suppliers for smooth demo testing.
    const userToSwap = matchingUser || users.find((u) => u.role === role);
    
    if (userToSwap) {
      login(userToSwap.email, role);
      // Reset view based on role
      if (role === 'admin') setActiveView('analytics');
      else if (role === 'supplier') setActiveView('products');
      else setActiveView('browse');
      setShowRoleSwapping(false);
    }
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => {
            if (currentUser?.role === 'retailer') setActiveView('browse');
            else if (currentUser?.role === 'supplier') setActiveView('products');
            else setActiveView('analytics');
          }}>
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              General<span className="text-indigo-600">Store</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5 ml-2 uppercase tracking-wide">
              B2B Wholesale
            </span>
          </div>

          {/* Quick Simulation Panel (Role Switcher Trigger) */}
          <div className="hidden md:flex items-center bg-slate-50 border border-slate-200/60 rounded-xl p-1 pr-3 space-x-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">Role Switcher:</span>
            <div className="flex space-x-1">
              <button
                id="header-role-retailer"
                onClick={() => handleRoleSwap('retailer')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  currentUser?.role === 'retailer'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Retailer
              </button>
              <button
                id="header-role-supplier"
                onClick={() => handleRoleSwap('supplier')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  currentUser?.role === 'supplier'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Supplier
              </button>
              <button
                id="header-role-admin"
                onClick={() => handleRoleSwap('admin')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  currentUser?.role === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Right Navigation & User Controls */}
          <div className="flex items-center space-x-4">
            {currentUser && (
              <>
                {/* Mobile Quick Role Swap Toggle */}
                <button
                  id="mobile-role-swap-btn"
                  onClick={() => setShowRoleSwapping(!showRoleSwapping)}
                  className="md:hidden flex items-center bg-slate-100 hover:bg-slate-200 p-2 rounded-xl text-slate-600 transition-all"
                  title="Switch Role"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                {/* Retailer Loyalty & Cart */}
                {currentUser.role === 'retailer' && (
                  <>
                    <div id="retailer-loyalty-badge" className="hidden sm:flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl px-2.5 py-1 text-xs font-semibold">
                      <Award className="h-4 w-4 text-amber-600" />
                      <span>{currentUser.loyaltyPoints || 0} Points</span>
                    </div>

                    <button
                      id="header-cart-btn"
                      onClick={onOpenCart}
                      className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl transition-all"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {totalCartItems > 0 && (
                        <span id="cart-count-badge" className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                          {totalCartItems}
                        </span>
                      )}
                    </button>
                  </>
                )}

                {/* Profile Widget */}
                <div className="flex items-center space-x-3 pl-2 border-l border-slate-100">
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-bold text-slate-800">{currentUser.businessName}</p>
                    <p className="text-[10px] text-slate-400 font-medium capitalize flex items-center justify-end space-x-1">
                      {currentUser.role === 'admin' && (
                        <span className="inline-flex items-center px-1.5 py-0.25 rounded bg-purple-50 text-purple-700 font-bold border border-purple-100">
                          <ShieldCheck className="h-2.5 w-2.5 mr-0.5" /> Admin
                        </span>
                      )}
                      {currentUser.role === 'supplier' && (
                        <span className="inline-flex items-center px-1.5 py-0.25 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                          <Check className="h-2.5 w-2.5 mr-0.5" /> Supplier
                        </span>
                      )}
                      {currentUser.role === 'retailer' && (
                        <span className="inline-flex items-center px-1.5 py-0.25 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100">
                          Retailer
                        </span>
                      )}
                    </p>
                  </div>
                  <img
                    id="user-profile-avatar"
                    className="h-9 w-9 rounded-xl object-cover ring-2 ring-slate-100"
                    src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
                    alt={currentUser.name}
                  />
                  <button
                    id="header-logout-btn"
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                    title="Log Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Role Swapping Panel Dropdown */}
      {showRoleSwapping && (
        <div id="mobile-role-swapper" className="md:hidden bg-slate-50 border-b border-slate-200 p-4 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Change Active Business Role:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleRoleSwap('retailer')}
              className={`py-2 text-xs font-semibold rounded-lg text-center ${
                currentUser?.role === 'retailer' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Retailer / Buyer
            </button>
            <button
              onClick={() => handleRoleSwap('supplier')}
              className={`py-2 text-xs font-semibold rounded-lg text-center ${
                currentUser?.role === 'supplier' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Supplier / Seller
            </button>
            <button
              onClick={() => handleRoleSwap('admin')}
              className={`py-2 text-xs font-semibold rounded-lg text-center ${
                currentUser?.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Platform Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
