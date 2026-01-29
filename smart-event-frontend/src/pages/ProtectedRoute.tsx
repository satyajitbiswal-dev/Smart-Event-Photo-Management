// import React from 'react';
// import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../app/store.ts';
import { selectIsAuthenticated, selectIsGuest } from '../app/authslice.ts';

export const Protected = ({ children, authentication = true, allowedRole = ['P','M','A'] }) => {
  const loading = useSelector((state: RootState) => state.auth.loading);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isGuest = useSelector(selectIsGuest);
  const accessToken = useSelector((state: RootState) => state.auth.access_token);

  if (loading) return <h1>Loading...</h1>;

  // Allow access if authenticated, guest, or has access token (user data might still be loading)
  const allowed = isAuthenticated || isGuest || !!accessToken;
    
  if (authentication && !allowed) {
    return <Navigate to="/signin" replace />;
  }

  if (!authentication && allowed) {
    return <Navigate to="/" replace />;
  }

  if (authentication && authUser && !allowedRole.includes(authUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
