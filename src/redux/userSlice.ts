import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IUser {
  _id?: string;
  name: string;
  email: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}

interface IUserResponse {
  user: IUser;
}
interface IUserSlice {
  userData: IUserResponse | null;
}

const initialState: IUserSlice = {
  userData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<IUserResponse>) => {
      state.userData = action.payload;
    },
  },
});

export const { setUserData } = userSlice.actions;

export default userSlice.reducer;
