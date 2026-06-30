/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Order, Coupon, Review, CartItem, UserRole } from '../types';
import { MOCK_USERS, MOCK_COUPONS, INITIAL_PRODUCTS, MOCK_REVIEWS, INITIAL_ORDERS } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  cart: CartItem[];
  setCurrentUser: (user: User | null) => void;
  login: (email: string, role: UserRole, password?: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
  register: (data: {
    name: string;
    email: string;
    role: UserRole;
    businessName: string;
    businessAddress: string;
    businessType: string;
    phone: string;
  }) => { success: boolean; message: string; user?: User };
  addProduct: (product: Omit<Product, 'id' | 'supplierId' | 'supplierName' | 'rating' | 'salesCount'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addToCart: (product: Product, quantity: number) => { success: boolean; message: string };
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (
    paymentMethod: string,
    address: string,
    phone: string,
    couponCode?: string
  ) => { success: boolean; orderId?: string; invoiceNumber?: string; message: string };
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  approveSupplier: (supplierId: string) => void;
  suspendSupplier: (supplierId: string) => void;
  addReview: (productId: string, rating: number, comment: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage, otherwise fallback to mock constants
  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('gs_users');
    const list: User[] = local ? JSON.parse(local) : MOCK_USERS;
    const hasBhaveyAdmin = list.some(u => u.email.toLowerCase() === 'bhaveywalecha08@gmail.com' && u.role === 'admin');
    if (!hasBhaveyAdmin) {
      const newAdmin: User = {
        id: 'usr_admin_bhavey',
        name: 'Bhavey Walecha (Admin)',
        email: 'bhaveywalecha08@gmail.com',
        role: 'admin',
        businessName: 'Walecha Admin Headquarters',
        businessAddress: 'Sector 15, Block C-4, New Delhi, India',
        businessType: 'B2B Platform Operator',
        isVerified: true,
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80',
      };
      return [...list, newAdmin];
    }
    return list;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const local = localStorage.getItem('gs_products');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const hasBrand = parsed.some((p: any) => p.brand === "Haldiram's" || p.brand === "Parle");
        if (hasBrand) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const local = localStorage.getItem('gs_orders');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const hasNewOrder = parsed.some((o: any) => o.items?.some((item: any) => item.productTitle?.includes("Haldiram") || item.productTitle?.includes("Parle")));
        if (hasNewOrder) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const local = localStorage.getItem('gs_reviews');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const hasNewReview = parsed.some((r: any) => r.comment?.includes("Haldiram") || r.comment?.includes("Parle"));
        if (hasNewReview) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_REVIEWS;
  });

  const [coupons] = useState<Coupon[]>(MOCK_COUPONS);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const local = localStorage.getItem('gs_current_user');
    return local ? JSON.parse(local) : MOCK_USERS[0]; // default to first retailer
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const local = localStorage.getItem('gs_cart');
    return local ? JSON.parse(local) : [];
  });

  // Sync states with localStorage
  useEffect(() => {
    localStorage.setItem('gs_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('gs_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gs_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('gs_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('gs_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gs_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gs_current_user');
    }
  }, [currentUser]);

  // Auth functions
  const login = (email: string, role: UserRole, password?: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validate password for the requested admin account
    if (normalizedEmail === 'bhaveywalecha08@gmail.com' && role === 'admin') {
      if (!password) {
        return {
          success: false,
          message: 'Password is required to access Admin Mode for this account.',
        };
      }
      if (password !== 'Bhavey08@#') {
        return {
          success: false,
          message: 'Incorrect password for admin mode of Bhavey Walecha.',
        };
      }
    }

    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail && u.role === role);

    if (!found) {
      return {
        success: false,
        message: `Account with email '${email}' and role '${role}' not found. Please register first.`,
      };
    }

    if (role === 'supplier' && !found.isVerified) {
      return {
        success: false,
        message: 'Your supplier account is pending administrator approval. Please wait for verification.',
      };
    }

    setCurrentUser(found);
    setCart([]); // Clear cart on login
    return { success: true, message: 'Logged in successfully!', user: found };
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  const register = (data: {
    name: string;
    email: string;
    role: UserRole;
    businessName: string;
    businessAddress: string;
    businessType: string;
    phone: string;
  }) => {
    const normalizedEmail = data.email.toLowerCase().trim();
    const exists = users.find((u) => u.email.toLowerCase() === normalizedEmail && u.role === data.role);

    if (exists) {
      return {
        success: false,
        message: `An account with this email already exists for role: ${data.role}.`,
      };
    }

    const newUser: User = {
      id: `usr_${data.role}_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      businessName: data.businessName,
      businessAddress: data.businessAddress,
      businessType: data.businessType,
      isVerified: data.role === 'supplier' ? false : true, // suppliers require admin approval
      phone: data.phone,
      loyaltyPoints: data.role === 'retailer' ? 100 : undefined, // starter points
      avatar: `https://images.unsplash.com/photo-${data.role === 'retailer' ? '1534528741775-53994a69daeb' : '1507003211169-0a1dd7228f2d'}?auto=format&fit=crop&w=150&h=150&q=80`,
    };

    setUsers((prev) => [...prev, newUser]);

    if (data.role === 'supplier') {
      return {
        success: true,
        message: 'Registration successful! Your supplier profile has been submitted for Admin verification.',
        user: newUser,
      };
    }

    setCurrentUser(newUser);
    setCart([]);
    return { success: true, message: 'Registered and logged in successfully!', user: newUser };
  };

  // Product Management
  const addProduct = (p: Omit<Product, 'id' | 'supplierId' | 'supplierName' | 'rating' | 'salesCount'>) => {
    if (!currentUser || currentUser.role !== 'supplier') return;

    const newProduct: Product = {
      ...p,
      id: `prod_${Date.now()}`,
      supplierId: currentUser.id,
      supplierName: currentUser.businessName,
      rating: 5.0,
      salesCount: 0,
    };

    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    // Remove from cart if deleted from catalog
    setCart((prev) => prev.filter((item) => item.productId !== id));
  };

  // Cart Operations
  const addToCart = (product: Product, quantity: number) => {
    if (!currentUser || currentUser.role !== 'retailer') {
      return { success: false, message: 'Only Retailers can place orders.' };
    }

    if (quantity < product.moq) {
      return {
        success: false,
        message: `Cannot add product. Minimum order quantity (MOQ) is ${product.moq} units.`,
      };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        message: `Insufficient stock. Only ${product.stock} units are currently available.`,
      };
    }

    let successMsg = '';
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === product.id);
      if (idx > -1) {
        const newQty = prev[idx].quantity + quantity;
        if (newQty > product.stock) {
          successMsg = `Adjusted quantity. Stock limit is ${product.stock}. Added ${product.stock - prev[idx].quantity} more.`;
          const newCart = [...prev];
          newCart[idx].quantity = product.stock;
          return newCart;
        } else {
          successMsg = `Updated quantity of ${product.title} in your cart.`;
          const newCart = [...prev];
          newCart[idx].quantity = newQty;
          return newCart;
        }
      } else {
        successMsg = `Added ${quantity} units of ${product.title} to your cart.`;
        return [...prev, { productId: product.id, quantity, product }];
      }
    });

    return { success: true, message: successMsg };
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const item = cart.find((c) => c.productId === productId);
    if (!item) return { success: false, message: 'Item not in cart' };

    const product = item.product;

    if (quantity < product.moq) {
      return {
        success: false,
        message: `Quantity cannot be less than Minimum Order Quantity (MOQ) of ${product.moq} units.`,
      };
    }

    if (quantity > product.stock) {
      return {
        success: false,
        message: `Insufficient stock available. Only ${product.stock} units are in stock.`,
      };
    }

    setCart((prev) =>
      prev.map((c) => (c.productId === productId ? { ...c, quantity } : c))
    );

    return { success: true, message: 'Cart quantity updated.' };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout and Order Placement
  const checkout = (
    paymentMethod: string,
    address: string,
    phone: string,
    couponCode?: string
  ) => {
    if (!currentUser || currentUser.role !== 'retailer') {
      return { success: false, message: 'Only logged-in retailers can checkout.' };
    }

    if (cart.length === 0) {
      return { success: false, message: 'Your shopping cart is empty.' };
    }

    // Verify MOQ and stocks for all items
    for (const item of cart) {
      if (item.quantity < item.product.moq) {
        return {
          success: false,
          message: `Item "${item.product.title}" does not meet its MOQ of ${item.product.moq} units.`,
        };
      }
      if (item.product.stock < item.quantity) {
        return {
          success: false,
          message: `Item "${item.product.title}" does not have enough stock (${item.product.stock} left).`,
        };
      }
    }

    // Calculate financials
    const subtotal = cart.reduce((sum, item) => sum + item.product.wholesalePrice * item.quantity, 0);
    const gst = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const shipping = subtotal > 15000 ? 0 : 450; // Free shipping over 15,000

    let discount = 0;
    if (couponCode) {
      const coupon = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discount = Math.round((subtotal * (coupon.value / 100)) * 100) / 100;
        } else {
          discount = coupon.value;
        }
      }
    }

    const totalAmount = Math.round((subtotal + gst + shipping - discount) * 100) / 100;

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString(),
      retailerId: currentUser.id,
      retailerName: currentUser.name,
      retailerBusinessName: currentUser.businessName,
      items: cart.map((item) => ({
        productId: item.productId,
        productTitle: item.product.title,
        wholesalePrice: item.product.wholesalePrice,
        retailPrice: item.product.retailPrice,
        quantity: item.quantity,
        image: item.product.image,
        sku: item.product.sku,
        supplierId: item.product.supplierId,
        supplierName: item.product.supplierName,
      })),
      subtotal,
      gst,
      shipping,
      discount,
      couponApplied: discount > 0 ? couponCode : undefined,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'cod' : 'paid',
      orderStatus: 'pending',
      shippingAddress: address,
      contactPhone: phone,
      invoiceNumber,
    };

    // Deduct stock and increment salesCount
    setProducts((prev) =>
      prev.map((p) => {
        const purchased = cart.find((c) => c.productId === p.id);
        if (purchased) {
          return {
            ...p,
            stock: Math.max(0, p.stock - purchased.quantity),
            salesCount: p.salesCount + purchased.quantity,
          };
        }
        return p;
      })
    );

    // Increment loyalty points for retailer (1 point per ₹500 spent)
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const addedPoints = Math.floor(totalAmount / 500);
          return {
            ...u,
            loyaltyPoints: (u.loyaltyPoints || 0) + addedPoints,
          };
        }
        return u;
      })
    );

    // Add order to orders list
    setOrders((prev) => [newOrder, ...prev]);

    // Clear cart
    setCart([]);

    // Update active current user loyalty points in local state as well
    setCurrentUser((prev) => {
      if (!prev) return null;
      const addedPoints = Math.floor(totalAmount / 500);
      return {
        ...prev,
        loyaltyPoints: (prev.loyaltyPoints || 0) + addedPoints,
      };
    });

    return {
      success: true,
      orderId,
      invoiceNumber,
      message: `Order ${orderId} has been successfully placed!`,
    };
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
  };

  // Supplier Controls (Admin)
  const approveSupplier = (supplierId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === supplierId ? { ...u, isVerified: true } : u))
    );
  };

  const suspendSupplier = (supplierId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === supplierId ? { ...u, isVerified: false } : u))
    );
    // If the suspended supplier is the current user, log them out
    if (currentUser && currentUser.id === supplierId) {
      setCurrentUser(null);
    }
  };

  // Reviews
  const addReview = (productId: string, rating: number, comment: string) => {
    if (!currentUser) return;

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId,
      userName: `${currentUser.name} (${currentUser.businessName})`,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews((prev) => [newReview, ...prev]);

    // Recalculate product rating
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const prodReviews = [...reviews, newReview].filter((r) => r.productId === productId);
          const totalRating = prodReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = Math.round((totalRating / prodReviews.length) * 10) / 10;
          return { ...p, rating: avgRating };
        }
        return p;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        products,
        orders,
        coupons,
        reviews,
        cart,
        setCurrentUser,
        login,
        logout,
        register,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        checkout,
        updateOrderStatus,
        approveSupplier,
        suspendSupplier,
        addReview,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
