import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const verifyUser = useCallback(async (token) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/verify`);
      const userData = response.data.user;
      userData.propic = `https://api.dicebear.com/8.x/notionists-neutral/svg?seed=${userData.id_user}`;
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: userData,
      });
    } catch (error) {
      console.error('Errore di autenticazione:', error);
      handleLogout();
    }
  }, []);

  const handleLogout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    Cookie.remove('token');
    window.location.href = '/';
  }, []);

  useEffect(() => {
    const token = Cookie.get('token');
    if (token) {
      verifyUser(token);
    } else {
      setAuthState(prevState => ({ ...prevState, isLoading: false }));
    }
  }, [verifyUser]);

  return (
    <UserContext.Provider value={authState}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };