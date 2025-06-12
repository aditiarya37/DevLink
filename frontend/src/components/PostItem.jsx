import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CommentItem from './CommentItem';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const PostItem = ({ post: initialPost, onEdit, onDelete }) => {
  const { user: currentUser, isAuthenticated, token } = useAuth();
  
  const [post, setPost] = useState(initialPost);
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeInProgress, setLikeInProgress] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState(null); 

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (initialPost) {
        setPost(initialPost);
        if (isAuthenticated && currentUser && initialPost.likes && Array.isArray(initialPost.likes)) {
            setIsLikedByCurrentUser(initialPost.likes.some(like => like === currentUser._id || (like && typeof like === 'object' && like._id === currentUser._id)));
        } else {
            setIsLikedByCurrentUser(false);
        }
        setLikeCount(initialPost.likeCount || 0);
    }
  }, [initialPost, isAuthenticated, currentUser]);

  const fetchTopLevelComments = useCallback(async () => {
    if (!post?._id) return;
    setLoadingComments(true);
    setCommentError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/${post._id}/comments`);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error("Error fetching top-level comments:", err.response ? err.response.data : err.message);
      setCommentError(err.response?.data?.message || "Could not load comments.");
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [post?._id, API_BASE_URL]);

  useEffect(() => {
    if (showComments && post?._id && comments.length === 0) { 
      fetchTopLevelComments();
    }
  }, [showComments, post?._id, comments.length, fetchTopLevelComments]);

  const handleToggleComments = () => {
    setShowComments(prevShow => !prevShow);
  };

  const handleAddCommentOrReply = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !isAuthenticated || !token) return;
    setIsSubmittingComment(true);
    setCommentError('');
    try {
      const payload = { text: newCommentText };
      if (replyingToComment) {
        payload.parentCommentId = replyingToComment._id;
      }

      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      const response = await axios.post(`${API_BASE_URL}/posts/${post._id}/comments`, payload, config);
      
      if (replyingToComment) {
        setComments(prevTopLevelComments => prevTopLevelComments.map(c => {
            if (c._id === replyingToComment._id) {
                return { ...c, replyCount: (c.replyCount || 0) + 1 };
            }
            return c; 
        }));
      } else {
        setComments(prevComments => [response.data, ...prevComments]); 
      }
      
      setNewCommentText('');
      setReplyingToComment(null);
      setPost(prevPost => ({...prevPost, commentCount: (prevPost.commentCount || 0) + 1}));
    } catch (err) {
      console.error("Error adding comment/reply:", err.response ? err.response.data : err.message);
      setCommentError(err.response?.data?.message || "Failed to post.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSetReplyToComment = (parentComment) => {
    setReplyingToComment(parentComment);
    setNewCommentText('');
    const textarea = document.getElementById(`comment-textarea-${post._id}`);
    if (textarea) textarea.focus();
  };

  const handleDeleteCommentForPostItem = async (commentId, postIdToDeleteFrom) => {
    if (!isAuthenticated || !token) return;
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_BASE_URL}/posts/${postIdToDeleteFrom}/comments/${commentId}`, config);
        
        setComments(prevComments => prevComments.filter(c => c._id !== commentId));
        setPost(prevPost => ({...prevPost, commentCount: Math.max(0, (prevPost.commentCount || 1) - 1)}));
    } catch (err) {
        console.error("Error deleting comment from PostItem:", err.response ? err.response.data : err.message);
        alert(err.response?.data?.message || "Failed to delete comment.");
    }
  };

  const handleEditCommentTrigger = (commentToEdit, postIdOfComment) => {
    console.log("Trigger edit for comment:", commentToEdit, "from post:", postIdOfComment);
    alert("Edit comment functionality (modal) coming soon!");
  };

  const isAuthor = isAuthenticated && currentUser && currentUser._id === post.user._id;
  const formatDate = (dateString) => { try { return new Date(dateString).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'}); } catch (error) { return "Invalid date"; } };
  const handleDeleteClick = () => { if (window.confirm('Are you sure you want to delete this post?')) { if (onDelete) { onDelete(post._id); } } };
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
      setPost(prevPost => ({ ...prevPost, likes: response.data.likes, likeCount: response.data.likeCount }));
    } catch (err) {
      console.error('Error toggling like:', err.response ? err.response.data : err.message);
      setIsLikedByCurrentUser(originallyLiked);
      setLikeCount(originalLikeCount);
      alert(err.response?.data?.message || 'Failed to update like status.');
    } finally {
      setLikeInProgress(false);
    }
  };

  if (!post || !post.user) {
    return <div className="bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">Loading post data...</div>;
  }

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

      {post.content && (
        <div className="text-gray-200 mb-4 whitespace-pre-wrap break-words">
          {post.content}
        </div>
      )}

      {post.codeSnippet && post.codeSnippet.code && (
        <div className="my-4 rounded-md overflow-hidden bg-gray-900">
          {post.codeSnippet.language && 
            <div className="bg-gray-700 px-3 py-1">
                <span className="text-xs text-gray-400">
                    {post.codeSnippet.language.charAt(0).toUpperCase() + post.codeSnippet.language.slice(1)}
                </span>
            </div>
          }
          <SyntaxHighlighter
            language={post.codeSnippet.language || 'plaintext'}
            style={dracula}
            customStyle={{ margin: 0, padding: '1rem', fontSize: '0.875rem', borderRadius: '0 0 0.375rem 0.375rem' }}
            wrapLongLines={true}
            showLineNumbers={post.codeSnippet.code.split('\n').length > 1}
          >
            {String(post.codeSnippet.code).trimEnd()}
          </SyntaxHighlighter>
        </div>
      )}

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

      <div className="border-t border-gray-700 pt-3 flex items-center space-x-6 text-gray-400">
        <button
          onClick={handleLikeToggle}
          disabled={!isAuthenticated || likeInProgress}
          className={`flex items-center transition-colors duration-150 ease-in-out text-sm
            ${isLikedByCurrentUser ? 'text-red-500 hover:text-red-400' : 'hover:text-red-500'}
            ${!isAuthenticated ? 'cursor-not-allowed opacity-60' : ''}
          `}
          aria-pressed={isLikedByCurrentUser}
          title={isAuthenticated ? (isLikedByCurrentUser ? "Unlike" : "Like") : "Login to like"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${isLikedByCurrentUser ? 'text-red-500 fill-current' : 'text-gray-400 fill-none stroke-current'}`} viewBox="0 0 20 20" strokeWidth="1.5">
             <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          {isLikedByCurrentUser ? 'Liked' : 'Like'} ({likeCount})
        </button>
        <button
          onClick={handleToggleComments}
          className={`flex items-center hover:text-sky-400 text-sm ${!isAuthenticated && post.commentCount === 0 ? 'cursor-not-allowed opacity-60' : ''}`}
          title="View Comments"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
          </svg>
          Comments ({post.commentCount || 0})
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          {isAuthenticated && (
            <form onSubmit={handleAddCommentOrReply} className="mb-4 flex items-start space-x-3">
              <img
                src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.username.charAt(0).toUpperCase()}&background=random&color=fff&size=80&font-size=0.33&length=1`}
                alt={currentUser.displayName || currentUser.username}
                className="w-9 h-9 rounded-full object-cover border border-gray-600"
              />
              <div className="flex-1">
                <textarea
                  id={`comment-textarea-${post._id}`}
                  name="newCommentText"
                  rows="2"
                  className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
                  placeholder={replyingToComment ? `Replying to @${replyingToComment.user.username}...` : "Write a comment..."}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  required
                ></textarea>
                {replyingToComment && (
                    <button type="button" onClick={() => { setReplyingToComment(null); setNewCommentText(''); }} className="text-xs text-gray-400 hover:text-red-400 mt-1">
                        Cancel Reply
                    </button>
                )}
                {commentError && <p className="mt-1 text-xs text-red-400">{commentError}</p>}
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newCommentText.trim()}
                  className="mt-2 px-4 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none disabled:opacity-50"
                >
                  {isSubmittingComment ? 'Posting...' : (replyingToComment ? 'Post Reply' : 'Post Comment')}
                </button>
              </div>
            </form>
          )}
          {loadingComments && <p className="text-sm text-gray-400">Loading comments...</p>}
          {!loadingComments && comments.length === 0 && !commentError && (
            <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
          )}
          {!loadingComments && commentError && !comments.length && (
             <p className="text-sm text-red-400">{commentError}</p>
          )}
          {!loadingComments && comments.length > 0 && (
            <div className="space-y-1">
              {comments.map(topLevelComment => (
                <CommentItem
                    key={topLevelComment._id}
                    comment={topLevelComment}
                    postId={post._id}
                    onDeleteComment={handleDeleteCommentForPostItem}
                    onEditComment={handleEditCommentTrigger}
                    onReplyToComment={handleSetReplyToComment}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostItem;