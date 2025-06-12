import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/CreatePost'; 

const HomePage = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth(); 

  const handlePostCreated = (newPost) => {
    console.log('New post created in HomePage:', newPost);
  };


  if (authLoading && isAuthenticated === null) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-sky-400">Loading DevLink...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4"> 
      {isAuthenticated && user ? (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
              Welcome back, {user.displayName || user.username}!
            </h1>
            <p className="text-gray-400">Share your thoughts or see what's new.</p>
          </div>

          <CreatePost onPostCreated={handlePostCreated} />

          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-sky-300 mb-4 text-center md:text-left">Recent Posts</h2>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                <p className="text-gray-500 italic text-center">
                    (Posts from the community will appear here soon!)
                </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center">
            <div className="bg-gray-800 shadow-xl rounded-lg p-8 md:p-12 max-w-2xl mx-auto mt-10">
                <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-6">
                Welcome to DevLink!
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8">
                The premier social network for developers to connect, share, and grow.
                </p>
                <div className="space-y-6">
                    <p className="text-gray-400">
                    Join our vibrant community to showcase your projects, collaborate with peers,
                    and stay updated with the latest in tech.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link
                        to="/login"
                        className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out text-lg"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out text-lg"
                    >
                        Create Account
                    </Link>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;