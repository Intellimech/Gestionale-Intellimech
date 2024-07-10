import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './userContext';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated, isLoading, user } = useContext(UserContext);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div role="status" className="text-center">
          {/* <Logo className="h-20 w-auto shrink-0" /> */}
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? React.cloneElement(element) : <Navigate to="/login" />;
};

export default PrivateRoute;