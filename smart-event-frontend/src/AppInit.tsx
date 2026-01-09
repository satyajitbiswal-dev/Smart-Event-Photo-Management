import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppInit, guest } from "./app/authslice";
import type { AppDispatch } from "./app/store";

export default function AppInitX() {
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    const isGuest = localStorage.getItem("guest_user");
    // const persist = JSON.parse(localStorage.getItem("persist") || "false");

    if (isGuest) {
      dispatch(guest());
    } else {
      dispatch(AppInit());
    }
  }, [dispatch]);

  return null;
}
