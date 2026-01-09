import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useRefreshToken from "../../hooks/useRefreshToken";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const persist = useSelector((state: RootState) => state.auth.persist);
  const accessToken = useSelector(
    (state: RootState) => state.auth.access_token
  );
  const effectRan = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Prevent double execution in React 18 StrictMode
    if (effectRan.current === true) {
      setIsLoading(false);
      return;
    }

    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error("Refresh token failed:", err);
        // If refresh fails, user is not authenticated
        // Don't redirect here, let ProtectedRoute handle it
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Check if we need to refresh token on mount
    if (!accessToken && persist) {
      effectRan.current = true;
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [accessToken, persist, refresh]);

  useEffect(() => {
    // console.log("isLoading:", isLoading);
    // console.log("accessToken:", accessToken);
  }, [isLoading, accessToken]);

  return(
    <> 
    {!persist ? (
        <Outlet />
      ) : isLoading ? (
        <p>Loading...</p>
      ) : (
        <Outlet />
      )}
    </>
  )

};

export default PersistLogin;
