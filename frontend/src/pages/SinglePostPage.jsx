import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostItem from '../components/PostItem'; 
import CommentItem from '../components/CommentItem';
import EditPostModal from '../components/EditPostModal';

const SinglePostPage = () => {
  const { postId } = useParams();
  const { user: currentUser, isAuthenticated, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState('');

  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState(null); 

  const [editingPost, setEditingPost] = useState(null);


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchPostAndComments = useCallback(async () => {
    if (!postId) return;
    setLoadingPost(true);
    setLoadingComments(true); 
    setError('');
    try {
      const postRes = await axios.get(`${API_BASE_URL}/posts/${postId}`);
      setPost(postRes.data);

      const commentsRes = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`);
      setComments(commentsRes.data.comments || []);

    } catch (err) {
      console.error("Error fetching post or comments:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Could not load post details.');
      setPost(null);
      setComments([]);
    } finally {
      setLoadingPost(false);
      setLoadingComments(false);
    }
  }, [postId, API_BASE_URL]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]); 

  const handlePostDelete = async (idOfPostToDelete) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_BASE_URL}/posts/${idOfPostToDelete}`, config);
            navigate('/'); 
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete post.");
        }
    }
  };
  const handleOpenEditModal = (postToEdit) => setEditingPost(postToEdit);
  const handleCloseEditModal = () => setEditingPost(null);
  const handlePostUpdated = (updatedPostData) => {
    setPost(updatedPostData); 
  };

  const handleAddCommentOrReply = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !isAuthenticated || !token) return;
    setIsSubmittingComment(true);
    setError(''); 
    try {
      const payload = { text: newCommentText };
      if (replyingToComment) {
        payload.parentCommentId = replyingToComment._id;
      }
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      const response = await axios.post(`${API_BASE_URL}/posts/${postId}/comments`, payload, config);
      
      if (replyingToComment) {
         setComments(prevTopLevelComments => prevTopLevelComments.map(c => {
            if (replyingToComment.parentComment === null && c._id === replyingToComment._id) {
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
      setError(err.response?.data?.message || "Failed to post comment/reply.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSetReplyToComment = (parentComment) => {
    setReplyingToComment(parentComment);
    setNewCommentText('');
    document.getElementById(`single-post-comment-textarea-${postId}`)?.focus();
  };

  const handleDeleteCommentForPost = async (commentId) => {
    if (!isAuthenticated || !token) return;
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, config);
        fetchPostAndComments(); 
    } catch (err) {
        alert(err.response?.data?.message || "Failed to delete comment.");
    }
  };

  const handleEditCommentTrigger = (commentToEdit) => {
    alert("Edit comment functionality on single post page coming soon!");
  };


  if (loadingPost || authLoading) {
    return <div className="text-center text-sky-400 p-10">Loading post...</div>;
  }
  if (error && !post) { 
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }
  if (!post) {
    return <div className="text-center text-gray-400 p-10">Post not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <PostItem
        post={post}
        onEdit={isAuthenticated && currentUser?._id === post.user?._id ? handleOpenEditModal : undefined}
        onDelete={isAuthenticated && currentUser?._id === post.user?._id ? handlePostDelete : undefined}
      />

      <div className="mt-8 pt-6 border-t border-gray-700">
        <h2 className="text-2xl font-semibold text-sky-300 mb-4">
          Comments ({post.commentCount || 0})
        </h2>

        {isAuthenticated && (
          <form onSubmit={handleAddCommentOrReply} className="mb-6 flex items-start space-x-3">
            <img
              src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.username.charAt(0).toUpperCase()}&background=random&color=fff&size=80&font-size=0.33&length=1`}
              alt={currentUser.displayName || currentUser.username}
              className="w-10 h-10 rounded-full object-cover border border-gray-600"
            />
            <div className="flex-1">
              <textarea
                id={`single-post-comment-textarea-${postId}`}
                name="newCommentText"
                rows="3"
                className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
                placeholder={replyingToComment ? `Replying to @${replyingToComment.user.username}...` : "Add a public comment..."}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                required
              ></textarea>
              {replyingToComment && (
                  <button type="button" onClick={() => { setReplyingToComment(null); setNewCommentText(''); }} className="text-xs text-gray-400 hover:text-red-400 mt-1">
                      Cancel Reply
                  </button>
              )}
              {error && !loadingPost && <p className="mt-1 text-xs text-red-400">{error}</p>} 
              <button
                type="submit"
                disabled={isSubmittingComment || !newCommentText.trim()}
                className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none disabled:opacity-50"
              >
                {isSubmittingComment ? 'Submitting...' : (replyingToComment ? 'Post Reply' : 'Post Comment')}
              </button>
            </div>
          </form>
        )}

        {loadingComments && <p className="text-gray-400">Loading comments...</p>}
        {!loadingComments && comments.length === 0 && !error && (
          <p className="text-gray-500 italic">No comments on this post yet.</p>
        )}
        {!loadingComments && error && comments.length === 0 && (
             <p className="text-red-400">{error.includes("comment") ? error : "Could not load comments."}</p>
        )}
        
        <div className="space-y-2">
          {comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              onDeleteComment={handleDeleteCommentForPost}
              onEditComment={handleEditCommentTrigger} 
              onReplyToComment={handleSetReplyToComment}
            />
          ))}
        </div>
      </div>
      
      {editingPost && (
        <EditPostModal
          postToEdit={editingPost}
          onClose={handleCloseEditModal}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
};

export default SinglePostPage;