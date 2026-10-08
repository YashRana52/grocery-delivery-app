"use client";

import { AppDispatch } from "@/redux/store";
import { clearUserData, setUserData } from "@/redux/userSlice";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function useGetMe() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;

  // login / logout / role change hone par user data dobara laao
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      dispatch(clearUserData());
      return;
    }

    const getMe = async () => {
      try {
        const res = await axios.get("/api/me");
        dispatch(setUserData(res.data));
      } catch (error) {
        console.log(error);
      }
    };
    getMe();
  }, [status, userId, role, dispatch]);
}

export default useGetMe;
