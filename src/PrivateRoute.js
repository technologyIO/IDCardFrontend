import React from 'react';
import { Navigate, Route } from 'react-router-dom';

// PrivateRoute component to handle authentication
const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem('token'); // Get token from localStorage

  if (rest.path === '/' && token) {
    // Redirect authenticated users from login page to /event
    return <Navigate to="/event" />;
  }

  if (!token) {
    // Redirect unauthenticated users to login page for protected routes
    return <Navigate to="/" />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;
