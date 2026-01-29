import axios from "axios";
import { useDispatch } from "react-redux";
import { setAccessToken, setUser, AppInit } from "../app/authslice";
import type { AppUser } from "../app/authslice";

const useRefreshToken = () => {
  const dispatch = useDispatch();

  const refresh = async () => {
    try {
      // Get new access token using refresh token from cookie
      const tokenRes = await axios.post(
        "http://127.0.0.1:8000/api/token/refresh/",
        {},
        { withCredentials: true }
      );
      
      const accessToken = tokenRes.data.access;
      dispatch(setAccessToken(accessToken));

      // Fetch user data using the new access token
      try {
        const userRes = await axios.get(
          "http://127.0.0.1:8000/auth/me/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );
        
        const user: AppUser = {
          username: userRes.data.username,
          email: userRes.data.email,
          role: userRes.data.role,
        };
        dispatch(setUser(user));
      } catch (userError) {
        console.error("Failed to fetch user data:", userError);
        // If user fetch fails, we still have the token, so continue
      }

      // Mark auth as initialized 
      dispatch(AppInit());

      return accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // if refresh fails, stop loading so Protected can redirect properly(by chance fail hua)
      dispatch(AppInit());
      throw error;
    }
  };

  return refresh;
};

export default useRefreshToken;
