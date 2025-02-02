import { Coupon } from "../../types.ts";
import { useState } from "react";

export const useCoupons = (initialCoupons: Coupon[]) => {
  
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const addCoupon = (newCoupon) => {
    setCoupons(prev => {
      return [
        ...prev,
        newCoupon
      ]
    })
  }
  
  return {
    coupons,
    addCoupon
  };
};
