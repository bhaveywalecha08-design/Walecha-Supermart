/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Store, UserCheck, Shield, ShoppingBag, Eye, EyeOff, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthPage: React.FC = () => {
  const { login, register, users } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('retailer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Simulated password
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessType, setBusinessType] = useState('Supermarket');

  // Multi-step Auth state (OTP / verification simulation)
  const [authState, setAuthState] = useState<'form' | 'forgot_password' | 'otp_verification' | 'email_verification'>('form');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [tempUserData, setTempUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleQuickLogin = (userEmail: string, role: UserRole, userPassword?: string) => {
    setLoading(true);
    setTimeout(() => {
      const res = login(userEmail, role, userPassword);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 800);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      // Simulate verification for first-time or just redirect
      const res = login(email, selectedRole, password);
      setLoading(false);
      if (res.success) {
        // Trigger simulated OTP for additional security
        setTempUserData({ ...res.user, password });
        setAuthState('otp_verification');
      } else {
        setErrorMsg(res.message);
      }
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !businessName || !businessAddress) {
      setErrorMsg('All fields are required.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setTempUserData({
        name,
        email,
        role: selectedRole,
        businessName,
        businessAddress,
        businessType,
        phone,
      });
      // Move to email verification
      setAuthState('email_verification');
    }, 1200);
  };

  const handleVerifyEmail = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthState('otp_verification');
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      setErrorMsg('Please enter a 4-digit OTP.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (activeTab === 'login') {
        // Log in
        login(tempUserData.email, tempUserData.role, tempUserData.password);
      } else {
        // Complete registration
        const res = register(tempUserData);
        if (res.success) {
          setSuccessMsg(res.message);
          if (tempUserData.role === 'supplier') {
            // Supplier is unverified initially
            setAuthState('form');
            setActiveTab('login');
            setEmail(tempUserData.email);
            setOtp(['', '', '', '']);
            setTempUserData(null);
          } else {
            // Retailer logs in straight away
          }
        } else {
          setErrorMsg(res.message);
          setAuthState('form');
        }
      }
    }, 1000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(`Password reset link has been sent to ${email}.`);
      setTimeout(() => {
        setAuthState('form');
        setErrorMsg('');
        setSuccessMsg('');
      }, 3000);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-3 mb-6">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-200">
            <Store className="h-8 w-8" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            General<span className="text-indigo-600">Store</span>
          </span>
        </div>
        <h2 className="text-center text-xl font-medium text-slate-600">
          B2B Wholesale Marketplace
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-2xl sm:px-10">
          
          <AnimatePresence mode="wait">
            {authState === 'form' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                id="auth-form-container"
              >
                {/* Tabs */}
                <div className="flex border-b border-slate-100 pb-4 mb-6">
                  <button
                    id="login-tab-btn"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className={`flex-1 text-center pb-3 text-sm font-semibold transition-all ${
                      activeTab === 'login'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Account Login
                  </button>
                  <button
                    id="register-tab-btn"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className={`flex-1 text-center pb-3 text-sm font-semibold transition-all ${
                      activeTab === 'register'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Business Registration
                  </button>
                </div>

                {/* Role Switcher */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Select Your Business Role
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      id="role-retailer-btn"
                      type="button"
                      onClick={() => handleRoleChange('retailer')}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                        selectedRole === 'retailer'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <ShoppingBag className="h-5 w-5 mb-1.5" />
                      <span className="text-xs font-semibold">Retailer / Buyer</span>
                    </button>
                    <button
                      id="role-supplier-btn"
                      type="button"
                      onClick={() => handleRoleChange('supplier')}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                        selectedRole === 'supplier'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <UserCheck className="h-5 w-5 mb-1.5" />
                      <span className="text-xs font-semibold">Supplier / Seller</span>
                    </button>
                    <button
                      id="role-admin-btn"
                      type="button"
                      onClick={() => handleRoleChange('admin')}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                        selectedRole === 'admin'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Shield className="h-5 w-5 mb-1.5" />
                      <span className="text-xs font-semibold">Platform Admin</span>
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div id="auth-error-alert" className="mb-4 p-3.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div id="auth-success-alert" className="mb-4 p-3.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-medium">
                    {successMsg}
                  </div>
                )}

                {/* Form Body */}
                {activeTab === 'login' ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Business Email Address</label>
                      <input
                        id="login-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@business.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-500">Security Password</label>
                        <button
                          id="forgot-password-link"
                          type="button"
                          onClick={() => setAuthState('forgot_password')}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="login-password-input"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <button
                          id="toggle-password-btn"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="login-submit-btn"
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                    >
                      {loading ? <Loader className="animate-spin h-5 w-5 text-white" /> : 'Log In Securely'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
                        <input
                          id="reg-name-input"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Business Phone</label>
                        <input
                          id="reg-phone-input"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Business Email Address</label>
                      <input
                        id="reg-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@business.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Registered Business Name</label>
                        <input
                          id="reg-business-name-input"
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Walecha Retailers Ltd"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Business Type</label>
                        <select
                          id="reg-business-type-select"
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none"
                        >
                          <option value="Supermarket">Supermarket</option>
                          <option value="Grocery Store">Kirana / Grocery</option>
                          <option value="Restaurant">Restaurant / Hotel</option>
                          <option value="Distributor">Distributor / Wholesaler</option>
                          <option value="Manufacturer">Manufacturer</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Business Address</label>
                      <textarea
                        id="reg-address-input"
                        required
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="GST Registration Address"
                        rows={2}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none"
                      />
                    </div>

                    <button
                      id="reg-submit-btn"
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition-all"
                    >
                      {loading ? <Loader className="animate-spin h-5 w-5 text-white" /> : 'Proceed to OTP Verification'}
                    </button>
                  </form>
                )}

                {/* Quick login sandbox assistant */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Demo Account Profiles (Quick Access)
                  </span>
                  <div className="space-y-2">
                    <button
                      id="quick-login-retailer"
                      onClick={() => handleQuickLogin('bhaveywalecha08@gmail.com', 'retailer')}
                      className="w-full text-left flex items-center justify-between p-3 rounded-xl border border-dashed border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50/50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg text-xs font-bold">R</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Bhavey Walecha (Retailer)</p>
                          <p className="text-[10px] text-slate-400">bhaveywalecha08@gmail.com</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-100">
                        Quick Login
                      </span>
                    </button>

                    <button
                      id="quick-login-supplier"
                      onClick={() => handleQuickLogin('rajesh@apexdistributors.com', 'supplier')}
                      className="w-full text-left flex items-center justify-between p-3 rounded-xl border border-dashed border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg text-xs font-bold">S</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Rajesh Sharma (Supplier)</p>
                          <p className="text-[10px] text-slate-400">rajesh@apexdistributors.com</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-100">
                        Quick Login
                      </span>
                    </button>

                    <button
                      id="quick-login-admin"
                      onClick={() => handleQuickLogin('admin@generalstore.b2b', 'admin')}
                      className="w-full text-left flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-200 text-slate-700 p-1.5 rounded-lg text-xs font-bold">A</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Platform Admin (Admin)</p>
                          <p className="text-[10px] text-slate-400">admin@generalstore.b2b</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        Quick Login
                      </span>
                    </button>

                    <button
                      id="quick-login-bhavey-admin"
                      onClick={() => handleQuickLogin('bhaveywalecha08@gmail.com', 'admin', 'Bhavey08@#')}
                      className="w-full text-left flex items-center justify-between p-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/10 hover:bg-indigo-50/30 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg text-xs font-bold">A</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Bhavey Walecha (Admin)</p>
                          <p className="text-[10px] text-slate-400">bhaveywalecha08@gmail.com • Pass: Bhavey08@#</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-100">
                        Quick Login
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {authState === 'forgot_password' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-slate-800">Reset Your Business Account</h3>
                <p className="text-xs text-slate-400">
                  Enter your registered business email. We will send an OTP or direct recovery link to confirm your identity.
                </p>

                {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs">{errorMsg}</div>}
                {successMsg && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs">{successMsg}</div>}

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Business Email</label>
                    <input
                      id="forgot-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@business.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      id="forgot-cancel-btn"
                      type="button"
                      onClick={() => {
                        setAuthState('form');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 font-semibold text-sm transition-all"
                    >
                      Back to Login
                    </button>
                    <button
                      id="forgot-submit-btn"
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm transition-all flex justify-center items-center"
                    >
                      {loading ? <Loader className="animate-spin h-5.w-5 text-white" /> : 'Send Recovery'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {authState === 'email_verification' && (
              <motion.div
                key="email-verify"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="text-center space-y-5"
              >
                <div className="mx-auto bg-indigo-50 text-indigo-600 p-3 rounded-full w-14 h-14 flex items-center justify-center">
                  <Store className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Verify Your Business Email</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  An email containing a verification link was sent to{' '}
                  <span className="font-semibold text-indigo-600">{tempUserData?.email}</span>.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-sm mx-auto">
                  <p className="text-[11px] font-mono text-slate-500">
                    [Sandbox Mail Server Sim]: Click the button below to simulate confirming the link in your inbox.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    id="email-back-btn"
                    onClick={() => setAuthState('form')}
                    className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    id="email-verify-btn"
                    onClick={handleVerifyEmail}
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm flex justify-center items-center"
                  >
                    {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Simulate Confirm'}
                  </button>
                </div>
              </motion.div>
            )}

            {authState === 'otp_verification' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5 text-center"
              >
                <h3 className="text-lg font-bold text-slate-800">2FA Security OTP Verification</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Enter the secure 4-digit code sent to your registered phone number{' '}
                  <span className="font-semibold text-indigo-600">{tempUserData?.phone || '+91 *****-*****'}</span>.
                </p>

                {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs max-w-sm mx-auto">{errorMsg}</div>}

                <form onSubmit={handleOtpSubmit} className="max-w-sm mx-auto space-y-6">
                  <div className="flex justify-center space-x-4">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 rounded-xl outline-none transition-all"
                      />
                    ))}
                  </div>

                  <div className="bg-amber-50 text-amber-800 border border-amber-100 p-3 rounded-xl text-[10px] text-left">
                    <span className="font-bold">Sandbox Hint:</span> Enter any digits (e.g., <span className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200">1234</span>) to verify and proceed.
                  </div>

                  <div className="flex space-x-3">
                    <button
                      id="otp-cancel-btn"
                      type="button"
                      onClick={() => {
                        setAuthState('form');
                        setOtp(['', '', '', '']);
                        setErrorMsg('');
                      }}
                      className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 font-semibold text-sm"
                    >
                      Change Method
                    </button>
                    <button
                      id="otp-submit-btn"
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm flex justify-center items-center"
                    >
                      {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Verify & Enter'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
