import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';

const HomePage = () => {

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try{
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/test`)
                setMessage(response.data.message);
                setError(null);
            }
            catch(err){
                console.error("Error fetching data:",err);
                setError(err.message || 'Faileld tp fetch data from backend.');
                setMessage('');
            }
            finally{
                setLoading(false);
            }
        };

        if(!API_BASE_URL){
            setError("API_BASE_URL is not defined. Check your .env file.");
            setLoading(false);
            return;
        }

        fetchData();
    },[API_BASE_URL]);

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-5xl font-bold text-cyan-400 mb-4">
                DevLink
            </h1>
            <p className="text-xl text-gray-300 mb-6">
                Connecting Developers, One Line of Code at a Time.
            </p>

            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl text-sky-400 mb-3">Backend API Test:</h2>
                {loading && <p className="text-yellow-400">Loading message from backend...</p>}
                {error && <p className="text-red-500">Error: {error}</p>}
                {message && <p className="text-green-400 text-lg font-semibold">{message}</p>}
                {!loading && !error && !message && !API_BASE_URL && (
                <p className="text-orange-400">Waiting for API configuration...</p>
                )}
                {!loading && !error && !message && API_BASE_URL && (
                <p className="text-orange-400">No message received, or API is not responding as expected.</p>
                )}
            </div>
        </div>
    );
};

export default HomePage;