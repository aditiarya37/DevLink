import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const CommentItem = ({ comment, postId, onDeleteComment, onEditComment }) => {
  const { user: currentUser, isAuthenticated } = useAuth();

  if (!comment || !comment.user) {
    return <div className="text-sm text-gray-400 animate-pulse">Loading comment...</div>;
  }

  const isAuthor = isAuthenticated && currentUser && currentUser._id === comment.user._id;

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (error) { return "Invalid date"; }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDeleteComment(comment._id, postId);
    }
  };

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-700 last:border-b-0">
      <Link to={`/profile/${comment.user.username.toLowerCase()}`}>
        <img
          src={comment.user.profilePicture || `https://ui-avatars.com/api/?name=${comment.user.username.charAt(0).toUpperCase()}&background=random&color=fff&size=80&font-size=0.33&length=1`}
          alt={comment.user.displayName || comment.user.username}
          className="w-9 h-9 rounded-full object-cover border border-gray-600"
        />
      </Link>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <div>
                <Link to={`/profile/${comment.user.username.toLowerCase()}`} className="text-sm font-semibold text-sky-400 hover:underline">
                    {comment.user.displayName || comment.user.username}
                </Link>
                <span className="text-xs text-gray-500 ml-2">{formatDate(comment.createdAt)}</span>
            </div>
            {isAuthor && (
            <div className="flex space-x-2">
                <button
                    onClick={() => onEditComment && onEditComment(comment, postId)}
                    className="text-xs text-gray-400 hover:text-sky-300"
                    aria-label="Edit comment"
                >
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="text-xs text-gray-400 hover:text-red-400"
                    aria-label="Delete comment"
                >
                    Delete
                </button>
            </div>
            )}
        </div>
        <p className="text-sm text-gray-200 mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
      </div>
    </div>
  );
};

export default CommentItem;