import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PostItem = ({ post: initialPost, onEdit, onDelete }) => { 
  const { user: currentUser, isAuthenticated, token } = useAuth();
  
  const [post, setPost] = useState(initialPost);
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeInProgress, setLikeInProgress] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (initialPost) {
        setPost(initialPost);
        if (isAuthenticated && currentUser && initialPost.likes) {
            setIsLikedByCurrentUser(initialPost.likes.some(like => like === currentUser._id || like._id === currentUser._id));
        } else {
            setIsLikedByCurrentUser(false);
        }
        setLikeCount(initialPost.likeCount || 0);
    }
  }, [initialPost, isAuthenticated, currentUser]);


  if (!post || !post.user) {
    return <div className="bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">Loading post data...</div>;
  }

  const isAuthor = isAuthenticated && currentUser && currentUser._id === post.user._id;

  const formatDate = (dateString) => { 
    try {
      return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleDeleteClick = () => { 
    if (window.confirm('Are you sure you want to delete this post?')) {
      if (onDelete) {
        onDelete(post._id);
      }
    }
  };

  const userInitial = post.user.username ? post.user.username.charAt(0).toUpperCase() : 'X';


  const handleLikeToggle = async () => {
    if (!isAuthenticated || !token || likeInProgress) return;

    setLikeInProgress(true);

    const originallyLiked = isLikedByCurrentUser;
    const originalLikeCount = likeCount;

    setIsLikedByCurrentUser(!originallyLiked);
    setLikeCount(originallyLiked ? originalLikeCount - 1 : originalLikeCount + 1);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_BASE_URL}/posts/${post._id}/like`, {}, config);

      setIsLikedByCurrentUser(response.data.isLikedByCurrentUser);
      setLikeCount(response.data.likeCount);
      setPost(prevPost => ({
          ...prevPost,
          likes: response.data.likes,
          likeCount: response.data.likeCount
      }));

    } catch (err) {
      console.error('Error toggling like:', err.response ? err.response.data : err.message);
      setIsLikedByCurrentUser(originallyLiked);
      setLikeCount(originalLikeCount);
      alert(err.response?.data?.message || 'Failed to update like status.');
    } finally {
      setLikeInProgress(false);
    }
  };


  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-xl mb-6">
      <div className="flex items-start mb-3">
        <Link to={`/profile/${post.user.username.toLowerCase()}`}>
          <img
            src={post.user.profilePicture || `https://ui-avatars.com/api/?name=${userInitial}&background=random&color=fff&size=100&font-size=0.33&length=1`}
            alt={post.user.displayName || post.user.username}
            className="w-12 h-12 rounded-full mr-4 border-2 border-sky-500 object-cover"
          />
        </Link>
        <div className="flex-grow">
          <Link to={`/profile/${post.user.username.toLowerCase()}`} className="font-semibold text-sky-400 hover:text-sky-300 text-lg">
            {post.user.displayName || post.user.username}
          </Link>
          <p className="text-gray-500 text-xs">
            @{post.user.username.toLowerCase()} · {formatDate(post.createdAt)}
          </p>
        </div>
        {isAuthor && ( 
            <div className="relative">
            <button
                onClick={() => onEdit && onEdit(post)}
                className="text-xs text-sky-400 hover:text-sky-300 px-2 py-1 rounded hover:bg-gray-700 mr-2"
                aria-label="Edit post"
            >
                Edit
            </button>
            <button
                onClick={handleDeleteClick}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-700"
                aria-label="Delete post"
            >
                Delete
            </button>
          </div>
        )}
      </div>

      <div className="text-gray-200 mb-4 whitespace-pre-wrap break-words">
        {post.content}
      </div>

      {post.tags && post.tags.length > 0 && ( 
         <div className="mb-3">
         {post.tags.map((tag, index) => (
           <Link
             key={index}
             to={`/tags/${tag}`}
             className="inline-block bg-gray-700 hover:bg-gray-600 text-sky-300 text-xs font-semibold mr-2 px-2.5 py-1 rounded-full mb-1"
           >
             #{tag}
           </Link>
         ))}
       </div>
      )}

      <div className="border-t border-gray-700 pt-3 flex items-center space-x-4 text-gray-500">
        <button
          onClick={handleLikeToggle}
          disabled={!isAuthenticated || likeInProgress} 
          className={`flex items-center transition-colors duration-150 ease-in-out
            ${isLikedByCurrentUser ? 'text-red-500 hover:text-red-400' : 'hover:text-red-500'}
            ${!isAuthenticated ? 'cursor-not-allowed opacity-60' : ''}
          `}
          aria-pressed={isLikedByCurrentUser}
          title={isAuthenticated ? (isLikedByCurrentUser ? "Unlike" : "Like") : "Login to like"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${isLikedByCurrentUser ? 'fill-current' : 'fill-transparent stroke-current stroke-2'}`} viewBox="0 0 20 20" fill="currentColor" stroke={isLikedByCurrentUser ? "none" : "currentColor"}>
             {isLikedByCurrentUser ? ( 
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
             ) : (
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
             )}
          </svg>
          {isLikedByCurrentUser ? 'Liked' : 'Like'} ({likeCount})
        </button>
        <button className={`hover:text-sky-400 flex items-center ${!isAuthenticated ? 'cursor-not-allowed opacity-60' : ''}`} disabled={!isAuthenticated} title={isAuthenticated ? "Comment" : "Login to comment"}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
          </svg>
          Comment (0)
        </button>
      </div>
    </div>
  );
};

export default PostItem;