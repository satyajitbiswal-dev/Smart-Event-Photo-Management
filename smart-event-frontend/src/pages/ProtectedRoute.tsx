// import React from 'react';
// import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../app/store';
import { selectIsAuthenticated, selectIsGuest } from '../app/authslice';

// export const Protected = ({ children, authentication = true }) => {
//     const navigate = useNavigate()
//     const loading = useSelector((state: RootState) => state.auth.loading)
//     const isauthenticated = useSelector(selectIsAuthenticated)
//     const isGuest = useSelector(selectIsGuest)

//     const allowed = isauthenticated || isGuest;
// // 
//     useEffect(() => {
//         if (!loading) {
//             if (authentication && !allowed) navigate("/signin")
//             if (!authentication && allowed) navigate("/")
//         }
//     }, [allowed, authentication, loading, navigate])

//     if (loading) return <h1>Loading...</h1>
//     return <>{children}</>
// }


export const Protected = ({ children, authentication = true }) => {
  const loading = useSelector((state: RootState) => state.auth.loading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isGuest = useSelector(selectIsGuest);
  const accessToken = useSelector((state: RootState) => state.auth.access_token);

  if (loading) return <h1>Loading...</h1>;

  // Allow access if authenticated, guest, or has access token (user data might be loading)
  const allowed = isAuthenticated || isGuest || !!accessToken;

  if (authentication && !allowed) {
    return <Navigate to="/signin" replace />;
  }

  if (!authentication && allowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
