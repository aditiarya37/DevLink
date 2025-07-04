import React, { useEffect, useContext, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Finalizing login...");

  useEffect(() => {
    const token = searchParams.get("token");
    const userString = searchParams.get("user");

    if (token && userString && dispatch) {
      try {
        const user = JSON.parse(decodeURIComponent(userString));

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { token, ...user },
        });

        setStatus("Success! Redirecting you now...");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } catch (error) {
        setStatus("Error: Could not process login data. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
      }
    } else {
      setStatus("Error: Invalid login attempt. No token found.");
      setTimeout(() => navigate("/login"), 3000);
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
