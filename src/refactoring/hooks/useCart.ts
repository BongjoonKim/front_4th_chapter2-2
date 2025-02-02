// useCart.ts
import { useState } from "react";
import { CartItem, Coupon, Product } from "../../types";
import { calculateCartTotal, updateCartItemQuantity } from "../models/cart";
import {useSessionStorage} from "./useSessionStorage.ts";

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  // const [cart, setCart] = useSessionStorage();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const addToCart = (product: Product) => {
    const remainingStock = getRemainingStock(product);
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart(prevCart => updateCartItemQuantity(prevCart, productId, newQuantity));
  };

  const applyCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
  };

  const calculateTotal = () => {
    let totalBeforeDiscount = 0;
    let totalAfterDiscount = 0;
    
    cart.forEach(item => {
      const { price } = item.product;
      const { quantity } = item;
      totalBeforeDiscount += price * quantity;
      
      const discount = item.product.discounts.reduce((maxDiscount, d) => {
        return quantity >= d.quantity && d.rate > maxDiscount ? d.rate : maxDiscount;
      }, 0);
      
      totalAfterDiscount += price * quantity * (1 - discount);
    });
    
    let totalDiscount = totalBeforeDiscount - totalAfterDiscount;
    
    // 쿠폰 적용
    if (selectedCoupon) {
      if (selectedCoupon.discountType === 'amount') {
        totalAfterDiscount = Math.max(0, totalAfterDiscount - selectedCoupon.discountValue);
      } else {
        totalAfterDiscount *= (1 - selectedCoupon.discountValue / 100);
      }
      totalDiscount = totalBeforeDiscount - totalAfterDiscount;
    }
    
    return {
      totalBeforeDiscount: Math.round(totalBeforeDiscount),
      totalAfterDiscount: Math.round(totalAfterDiscount),
      totalDiscount: Math.round(totalDiscount)
    };
  };
  
  const getRemainingStock = (product: Product) => {
    const cartItem = cart.find((item : CartItem) => item.product.id === product.id);
    return product.stock - (cartItem?.quantity || 0);
  }

  return {
    cart,
    setCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    calculateTotal,
    selectedCoupon,
    setSelectedCoupon,
  };
};
