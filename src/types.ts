/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'supplier' | 'retailer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessName: string;
  businessAddress: string;
  businessType: string; // e.g., 'Grocery Store', 'Restaurant', 'Wholesaler'
  isVerified: boolean;
  phone: string;
  loyaltyPoints?: number;
  avatar?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  sku: string;
  barcode: string;
  stock: number;
  moq: number; // Minimum Order Quantity
  wholesalePrice: number;
  retailPrice: number;
  category: string;
  image: string;
  supplierId: string;
  supplierName: string;
  brand: string;
  location: string;
  rating: number;
  salesCount: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  date: string;
  retailerId: string;
  retailerName: string;
  retailerBusinessName: string;
  items: {
    productId: string;
    productTitle: string;
    wholesalePrice: number;
    retailPrice: number;
    quantity: number;
    image: string;
    sku: string;
    supplierId: string;
    supplierName: string;
  }[];
  subtotal: number;
  gst: number;
  shipping: number;
  discount: number;
  couponApplied?: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'cod';
  orderStatus: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  contactPhone: string;
  invoiceNumber: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  description: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}
