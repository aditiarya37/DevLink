import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import PostItem from '../components/PostItem'; 

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchResults = useCallback(async () => {
    if (!query || query.trim() === '') {
      setUserResults([]);
      setPostResults([]);
      setError('Please enter a search term.');
      return;
    }

    setLoadingUsers(true);
    setLoadingPosts(true);
    setError('');

    try {
      const userRes = await axios.get(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}&limit=5`);
      setUserResults(userRes.data.users || []);
    } catch (err) {
      console.error("Error fetching user search results:", err);
      setError(prev => prev + '\nFailed to fetch user results.');
    } finally {
      setLoadingUsers(false);
    }

    try {
      const postRes = await axios.get(`${API_BASE_URL}/posts/search?q=${encodeURIComponent(query)}&limit=10`);
      setPostResults(postRes.data.posts || []);
    } catch (err) {
      console.error("Error fetching post search results:", err);
      setError(prev => prev + '\nFailed to fetch post results.');
    } finally {
      setLoadingPosts(false);
    }
  }, [query, API_BASE_URL]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]); 

  const isLoading = loadingUsers || loadingPosts;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-sky-400 mb-6">
        Search Results for: <span className="text-white">"{query}"</span>
      </h1>

      {isLoading && <p className="text-sky-300 text-center">Searching...</p>}
      {error && <p className="text-red-500 bg-red-900 p-3 rounded text-center">{error}</p>}

      {!loadingUsers && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-sky-300 mb-4">Users</h2>
          {userResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userResults.map(user => (
                <div key={user._id} className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-sky-700/50 transition-shadow">
                  <Link to={`/profile/${user.username.toLowerCase()}`} className="flex flex-col items-center text-center">
                    <img
                      src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username.charAt(0).toUpperCase()}&background=random&color=fff&size=100`}
                      alt={user.displayName || user.username}
                      className="w-20 h-20 rounded-full mb-3 object-cover border-2 border-gray-700"
                    />
                    <h3 className="font-semibold text-sky-400 text-lg">{user.displayName || user.username}</h3>
                    <p className="text-xs text-gray-500">@{user.username.toLowerCase()}</p>
                    {user.bio && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{user.bio}</p>}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            !error && !loadingUsers && <p className="text-gray-500 italic">No users found matching your query.</p>
          )}
        </section>
      )}

      {!loadingPosts && (
        <section>
          <h2 className="text-2xl font-semibold text-sky-300 mb-4">Posts</h2>
          {postResults.length > 0 ? (
            <div className="space-y-6">
              {postResults.map(post => (
                <PostItem
                  key={post._id}
                  post={post}
                />
              ))}
            </div>
          ) : (
            !error && !loadingPosts && <p className="text-gray-500 italic">No posts found matching your query.</p>
          )}
        </section>
      )}
    </div>
  );
};

export default SearchResultsPage;