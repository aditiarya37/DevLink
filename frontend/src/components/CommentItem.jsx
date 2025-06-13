import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EditCommentModal from './EditCommentModal';

const MAX_COMMENT_DEPTH = 5; 

const CommentItem = ({ comment: initialComment, postId, onDeleteComment, onReplyToComment }) => {
  const { user: currentUser, isAuthenticated, token } = useAuth();
  
  const [comment, setComment] = useState(initialComment);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [isEditingComment, setIsEditingComment] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setComment(initialComment);
  }, [initialComment]);

  const isAuthor = isAuthenticated && currentUser && currentUser._id === comment.user?._id;
  const isDeletedPlaceholder = comment.status === 'deleted';

  const formatDate = (dateString) => { 
    try { return new Date(dateString).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'}); } catch (error) { return "Invalid date"; }
  };

  const handleDelete = () => { 
    if (window.confirm('Are you sure you want to delete this comment?')) { 
        if (onDeleteComment) {
            onDeleteComment(comment._id, postId); 
        }
    }
  };

  const fetchReplies = useCallback(async () => {
    if (!comment?._id || !postId) return;
    setLoadingReplies(true);
    setReplyError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments/${comment._id}/replies`);
      setReplies(response.data.replies || []);
    } catch (err) {
      console.error("Error fetching replies:", err.response ? err.response.data : err.message);
      setReplyError(err.response?.data?.message || "Could not load replies.");
    } finally {
      setLoadingReplies(false);
    }
  }, [comment?._id, postId, API_BASE_URL]);

  useEffect(() => {
    if (showReplies && comment.replyCount > 0 && replies.length === 0 && !loadingReplies) {
      fetchReplies();
    }
  }, [showReplies, comment?.replyCount, replies.length, loadingReplies, fetchReplies]);


  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
  };
  
  const handleOpenEditCommentModal = () => {
    setIsEditingComment(true);
  };
  const handleCloseEditCommentModal = () => {
    setIsEditingComment(false);
  };
  const handleCommentUpdated = (updatedComment) => {
    setComment(updatedComment);
  };

  const handleDeleteChildReply = (replyId) => {
    setReplies(prevReplies => prevReplies.filter(r => r._id !== replyId));
    setComment(prev => ({ ...prev, replyCount: Math.max(0, (prev.replyCount || 1) - 1) }));
  };

  const handleEditChildReply = (replyToEdit) => {
    console.log("Edit child reply trigger - needs specific modal instance or bubbling", replyToEdit)
  };
  
  const handleNewReplyAddedToThisComment = (newReply) => {
    setReplies(prevReplies => [newReply, ...prevReplies]);
    setComment(prev => ({ ...prev, replyCount: (prev.replyCount || 0) + 1 }));
    setShowReplies(true);
  };


  if (!comment) {
    return <div className="text-sm text-gray-400 animate-pulse">Loading comment...</div>;
  }
  
  const authorDisplayName = comment.user ? (comment.user.displayName || comment.user.username) : '[deleted user]';
  const authorUsername = comment.user ? comment.user.username.toLowerCase() : 'deleted';
  const authorProfilePic = comment.user ? (comment.user.profilePicture || `https://ui-avatars.com/api/?name=${comment.user.username.charAt(0).toUpperCase()}&background=random&color=fff&size=80&font-size=0.33&length=1`) : `https://ui-avatars.com/api/?name=X&background=gray&color=fff&size=80&font-size=0.33&length=1`;


  return (
    <>
      <div className={`py-3 ${comment.depth > 0 ? `ml-${Math.min(comment.depth * 2, 10)} pl-2 md:ml-${Math.min(comment.depth * 3, 12)} md:pl-3 border-l-2 border-gray-700` : ''}`}> 
        <div className="flex items-start space-x-2 md:space-x-3">
          {!isDeletedPlaceholder && comment.user && (
            <Link to={`/profile/${authorUsername}`}>
              <img
                src={authorProfilePic}
                alt={authorDisplayName}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-gray-600"
              />
            </Link>
          )}
          {isDeletedPlaceholder && (
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-600 flex items-center justify-center text-gray-400 text-sm flex-shrink-0">X</div>
          )}

          <div className="flex-1 min-w-0"> 
            <div className="flex items-center justify-between flex-wrap">
                <div className="flex items-center flex-wrap mr-2">
                  {!isDeletedPlaceholder && comment.user ? (
                      <Link to={`/profile/${authorUsername}`} className="text-xs font-semibold text-sky-400 hover:underline break-all">
                          {authorDisplayName}
                      </Link>
                  ) : (
                      <span className="text-xs font-semibold text-gray-500">{authorDisplayName}</span>
                  )}
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{formatDate(comment.createdAt)}</span>
                </div>
                {!isDeletedPlaceholder && isAuthor && (
                <div className="flex space-x-2 flex-shrink-0">
                    <button onClick={handleOpenEditCommentModal} className="text-xs text-gray-400 hover:text-sky-300">Edit</button>
                    <button onClick={handleDelete} className="text-xs text-gray-400 hover:text-red-400">Delete</button>
                </div>
                )}
            </div>
            <p className={`text-sm mt-1 whitespace-pre-wrap break-words ${isDeletedPlaceholder ? 'text-gray-500 italic' : 'text-gray-200'}`}>
              {comment.text}
            </p>
            
            <div className="mt-1">
                {!isDeletedPlaceholder && isAuthenticated && comment.depth < MAX_COMMENT_DEPTH && (
                    <button 
                    onClick={() => onReplyToComment(comment)}
                    className="text-xs text-sky-400 hover:text-sky-300 mr-2"
                    >
                    Reply
                    </button>
                )}
                {comment.replyCount > 0 && (
                    <button 
                        onClick={handleToggleReplies} 
                        className="text-xs text-gray-400 hover:text-gray-200"
                    >
                        {showReplies ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                    </button>
                )}
            </div>
          </div>
        </div>

        {showReplies && (
          <div className="mt-2">
            {loadingReplies && <p className="text-xs text-gray-400 ml-8">Loading replies...</p>}
            {replyError && <p className="text-xs text-red-400 ml-8">{replyError}</p>}
            {!loadingReplies && replies.length > 0 && (
              replies.map(reply => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  onDeleteComment={handleDeleteChildReply}
                  onReplyToComment={onReplyToComment} 
                />
              ))
            )}
          </div>
        )}
      </div>

      {isEditingComment && (
        <EditCommentModal
          commentToEdit={comment}
          postId={postId}
          onClose={handleCloseEditCommentModal}
          onCommentUpdated={handleCommentUpdated}
        />
      )}
    </>
  );
};

export default CommentItem;