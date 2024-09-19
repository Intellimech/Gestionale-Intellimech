import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import {
  XCircleIcon,
  CheckBadgeIcon,  
} from '@heroicons/react/24/outline'

const Logo = './assets/intellimech.svg';

const Login = () => {
  // Check if the user is already logged in
  const [loginSuccess, setLoginSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      window.location.href = '/app/home';
    }
    else {
      // remove token from cookies and clear local storage
      Cookies.remove('token');
      localStorage.clear();
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password, rememberMe: event.target['remember-me'].checked});

      // Save the token in cookies and set the duration to 7 days or at 15 days if the user checks the remember me checkbox
      const token = response.data.access_token;

      if (event.target['remember-me'].checked) {
        Cookies.set('token', token, { expires: 15 });
      } else {
        Cookies.set('token', token, { expires: 7 });
      }

      // Set login success state
      setLoginSuccess(true);


      // after 3 seconds redirect to homepage
      setTimeout(() => {
        window.location.href = '/app/home';
      }, 3000);
    } catch (error) {
      console.error('Error:', error);

      // Set login failure state and capture error messages
      setLoginSuccess(false);
      setErrorMessages(error.response?.data?.message || ['An unexpected error occurred']);
    }
  };
  return (
    <>
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-md w-full max-w-md">
        <img className="mx-auto h-10 w-auto mb-6" src={Logo} alt="Your Company" />
        <h2 className="text-center text-xl font-bold leading-9 text-gray-900 mb-2">
            Password dimenticata
        </h2>
        <p className="text-center text-sm leading-5 text-gray-600 pb-5">
            Inserisci la tua email e ti invieremo la tua nuova password, potrai cambiarla in seguito.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email 
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#7fb7d4] focus:border-[#7fb7d4] focus:outline-none sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center  bg-[#A7D0EB] py-2 px-4 border border-transparent rounded-md text-sm font-medium text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Recupera la password
            </button>
          </div>
        </form>

        {loginSuccess === true && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Login Successfully</h3>
              </div>
            </div>
          </div>
        )}

        {loginSuccess === false && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{errorMessages}</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Login;