import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";

interface IGrocery {
  _id: string;
  name: string;
  category: string;
  unit: string;
  price: string;
  quantity: number;

  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ICartSlice {
  cartData: IGrocery[];
  subTotal: number;
  deliveryFee: number;
  finalTotal: number;
}

const initialState: ICartSlice = {
  cartData: [],
  subTotal: 0,
  deliveryFee: 40,
  finalTotal: 40,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<IGrocery>) => {
      state.cartData?.push(action.payload);
      cartSlice.caseReducers.calculateTotals(state);
    },
    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cartData.find((i) => i._id == action.payload);
      if (item) {
        item.quantity = item.quantity + 1;
      }
      cartSlice.caseReducers.calculateTotals(state);
    },
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cartData.find((i) => i._id == action.payload);
      if (item?.quantity && item?.quantity > 1) {
        item.quantity = item.quantity - 1;
      } else {
        state.cartData = state.cartData.filter((i) => i._id !== action.payload);
      }
      cartSlice.caseReducers.calculateTotals(state);
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      state.cartData = state.cartData.filter((i) => i._id !== action.payload);
      cartSlice.caseReducers.calculateTotals(state);
    },
    calculateTotals: (state) => {
      state.subTotal = state.cartData.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );

      // delivery logic
      if (state.subTotal === 0) {
        state.deliveryFee = 0;
      } else if (state.subTotal < 200) {
        state.deliveryFee = 40;
      } else if (state.subTotal < 400) {
        state.deliveryFee = 25;
      } else if (state.subTotal < 500) {
        state.deliveryFee = 10;
      } else {
        state.deliveryFee = 0;
      }

      state.finalTotal = state.subTotal + state.deliveryFee;
    },
    clearCart: (state) => {
      state.cartData = [];
    },
  },
});

export const {
  addToCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
  removeItemFromCart,
  calculateTotals,
} = cartSlice.actions;
export default cartSlice.reducer;
