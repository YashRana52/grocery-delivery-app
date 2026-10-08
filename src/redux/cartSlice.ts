import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDeliveryFee } from "@/lib/pricing";

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
  deliveryFee: 0,
  finalTotal: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<IGrocery>) => {
      const existing = state.cartData.find((i) => i._id == action.payload._id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.cartData.push(action.payload);
      }
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

      // delivery logic (server bhi yahi function use karta hai)
      state.deliveryFee = getDeliveryFee(state.subTotal);

      state.finalTotal = state.subTotal + state.deliveryFee;
    },
    clearCart: (state) => {
      state.cartData = [];
      cartSlice.caseReducers.calculateTotals(state);
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
