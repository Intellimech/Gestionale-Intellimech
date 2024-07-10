import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = Cookie.get('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${process.env.REACT_APP_API_URL}/auth/verify`)
        .then((response) => {
          console.log(response.data.user);
          setIsAuthenticated(true);
          response.data.user.propic = "https://api.dicebear.com/8.x/lorelei/svg?seed=" + response.data.user.id_user
          setUser(response.data.user);
        })
        .catch(() => {
          setIsAuthenticated(false);
          Cookie.remove('token');
          window.location.href = '/';
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
      Cookie.remove('token');
    }
  }, []);

  return (
    <UserContext.Provider value={{ isAuthenticated, isLoading, user }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };