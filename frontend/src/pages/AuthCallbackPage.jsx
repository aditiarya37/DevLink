import React, { useEffect, useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { dispatch } = useContext(AuthContext);
  const [status, setStatus] = useState('Finalizing login...');

  useEffect(() => {
    const token = searchParams.get('token');
    const userString = searchParams.get('user');

    if (token && userString && dispatch) {
      try {
        const user = JSON.parse(decodeURIComponent(userString));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, ...user }
        });
        
        setStatus('Success! Redirecting you now...');

      } catch (error) {
        setStatus('Error: Could not process login data. Please try again.');
      }
    } else {
      setStatus('Error: Invalid login attempt. No token found.');
    }
  }, [searchParams, dispatch]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-xl text-sky-400">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;