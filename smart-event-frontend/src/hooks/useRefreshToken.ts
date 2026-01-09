import axios from "axios";
import { useDispatch } from "react-redux";
import { setAccessToken, setUser } from "../app/authslice";
import type { AppUser } from "../app/authslice";

const useRefreshToken = () => {
  const dispatch = useDispatch();

  const refresh = async () => {
    try {
      // Step 1: Get new access token using refresh token from cookie
      const tokenRes = await axios.post(
        "http://127.0.0.1:8000/api/token/refresh/",
        {},
        { withCredentials: true }
      );
      
      const accessToken = tokenRes.data.access;
      dispatch(setAccessToken(accessToken));

      // Step 2: Fetch user data using the new access token
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

      return accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  };

  return refresh;
};

export default useRefreshToken;
