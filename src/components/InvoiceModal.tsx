/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Order } from '../types';
import { X, Printer, Download, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current?.innerHTML;
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { background: white; color: black; padding: 20px; }
        .no-print { display: none !important; }
        .print-shadow-none { box-shadow: none !important; border: none !important; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Clean up
    style.remove();
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div id="invoice-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
      >
        {/* Action Panel Header */}
        <div className="no-print bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-800 font-bold">
            <FileText className="h-5 w-5 text-indigo-600" />
            <span>Tax Invoice ({order.invoiceNumber})</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="invoice-print-btn"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              id="invoice-close-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div ref={invoiceRef} className="p-8 md:p-10 bg-white print-shadow-none" id="invoice-sheet">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  General<span className="text-indigo-600">Store</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">General Store B2B Platform Operator</p>
              <p className="text-xs text-slate-400 font-medium">Connaught Place, New Delhi, India</p>
              <p className="text-xs text-slate-400 font-medium font-mono">GSTIN: 07AAAAA1111A1Z1</p>
            </div>
            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 mb-2">
                {order.paymentStatus === 'paid' ? 'PAID IN FULL' : 'CASH ON DELIVERY'}
              </span>
              <p className="text-xs text-slate-400 font-medium">Invoice No: <span className="text-slate-800 font-bold font-mono">{order.invoiceNumber}</span></p>
              <p className="text-xs text-slate-400 font-medium">Order ID: <span className="text-slate-800 font-bold font-mono">{order.id}</span></p>
              <p className="text-xs text-slate-400 font-medium">Date: <span className="text-slate-800 font-semibold">{formatDate(order.date)}</span></p>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">BILL TO (RETAILER)</h4>
              <p className="text-sm font-bold text-slate-800">{order.retailerName}</p>
              <p className="text-xs font-semibold text-indigo-600">{order.retailerBusinessName}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{order.shippingAddress}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Phone: {order.contactPhone}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">BILL FROM (SUPPLIERS)</h4>
              {/* Combine suppliers from items */}
              {Array.from(new Set(order.items.map((i) => i.supplierName))).map((supName, idx) => {
                const itemOfSup = order.items.find((i) => i.supplierName === supName);
                return (
                  <div key={idx} className="mb-2 last:mb-0">
                    <p className="text-xs font-bold text-slate-700">{supName}</p>
                    <p className="text-[10px] text-slate-400">GST Registration Verified</p>
                  </div>
                );
              })}
              <p className="text-[10px] text-slate-400 mt-3 italic">Multiple supply chains consolidated via General Store Logistics.</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-1">Product Description</th>
                  <th className="py-3 px-1 text-center">SKU</th>
                  <th className="py-3 px-1 text-right">Rate (₹)</th>
                  <th className="py-3 px-1 text-center">Qty</th>
                  <th className="py-3 px-1 text-right">Tax (18% GST)</th>
                  <th className="py-3 px-1 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => {
                  const rawAmount = item.wholesalePrice * item.quantity;
                  const itemGst = Math.round((rawAmount * 0.18) * 100) / 100;
                  return (
                    <tr key={idx} className="border-b border-slate-100 text-xs">
                      <td className="py-3.5 px-1">
                        <p className="font-bold text-slate-800">{item.productTitle}</p>
                        <p className="text-[10px] text-slate-400">Supplier: {item.supplierName}</p>
                      </td>
                      <td className="py-3.5 px-1 text-center font-mono text-[10px] text-slate-500">{item.sku}</td>
                      <td className="py-3.5 px-1 text-right font-medium text-slate-600">₹{item.wholesalePrice.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-1 text-center font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-3.5 px-1 text-right font-medium text-slate-500">₹{itemGst.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-1 text-right font-bold text-slate-800">₹{rawAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div className="mb-4 sm:mb-0 text-slate-400 text-[10px] leading-relaxed max-w-xs">
              <p className="font-bold mb-1 uppercase tracking-wider text-slate-500">Terms & Declarations</p>
              <p>1. Certified that the items specified above are supplied according to wholesale compliance guidelines.</p>
              <p className="mt-1">2. All taxes and regulatory surcharges are declared directly to the GST department.</p>
              <p className="mt-1 font-bold text-indigo-600 font-sans">Thank you for business with General Store!</p>
            </div>
            <div className="w-full sm:w-64 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal (Net):</span>
                <span className="font-semibold text-slate-700">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Integrated GST (18%):</span>
                <span className="font-semibold text-slate-700">₹{order.gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Logistics & Freight:</span>
                <span className="font-semibold text-slate-700">
                  {order.shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${order.shipping}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied ({order.couponApplied}):</span>
                  <span>- ₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-950">
                <span>Grand Total (Gross):</span>
                <span className="text-indigo-600">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Electronically verified B2B Invoice. No physical signature required.</span>
            </div>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
