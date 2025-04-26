'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NotificationSound from '../components/NotificationSound';

// API URL - Defined outside component to avoid dependency issues
const API_URL = 'http://localhost:3003';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  author: User;
  parent: Comment | null;
  replies: Comment[];
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [showNotificationAlert, setShowNotificationAlert] = useState<boolean>(false);
  const [lastNotificationCheck, setLastNotificationCheck] = useState<number>(Date.now());
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    console.log('Stored token:', storedToken ? `${storedToken.substring(0, 10)}...` : 'none');
    console.log('Stored user:', storedUser);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('User authenticated:', JSON.parse(storedUser).username);
      } catch (err) {
        console.error('Error parsing user data:', err);
        // Redirect to login if data is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
      }
    } else {
      console.log('No authentication data found, redirecting to login');
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
    
    // Clear cache if timestamp is too old (more than 5 minutes)
    const cachedTimestamp = localStorage.getItem('cachedCommentsTimestamp');
    if (cachedTimestamp && (Date.now() - parseInt(cachedTimestamp)) > 300000) {
      localStorage.removeItem('cachedComments');
      localStorage.removeItem('cachedCommentsTimestamp');
    }
    
    // Cleanup function - create a beforeunload event listener to clean up localStorage 
    // when navigating away from the app completely
    const handleBeforeUnload = () => {
      const currentTimestamp = localStorage.getItem('cachedCommentsTimestamp');
      // Mark cache as potentially stale by updating the timestamp to be older
      if (currentTimestamp) {
        localStorage.setItem('cachedCommentsTimestamp', 
          (parseInt(currentTimestamp) - 100000).toString());
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Try to get cached comments from localStorage first
        const cachedComments = localStorage.getItem('cachedComments');
        
        // If we have cached comments and they're relatively fresh (less than 30 seconds old)
        const cachedTimestamp = localStorage.getItem('cachedCommentsTimestamp');
        const isCacheFresh = cachedTimestamp && 
                            (Date.now() - parseInt(cachedTimestamp)) < 30000;
                            
        if (cachedComments && isCacheFresh) {
          const parsedComments = JSON.parse(cachedComments);
          setComments(parsedComments);
          setLoading(false);
          console.log('Using cached comments');
          return;
        }
        
        // Otherwise fetch from API
        const response = await fetch(`${API_URL}/comments`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        // Ensure all comments have a replies array
        const safeComments = data.map(comment => ({
          ...comment,
          replies: Array.isArray(comment.replies) ? comment.replies : []
        }));
        
        // Cache the comments in localStorage
        localStorage.setItem('cachedComments', JSON.stringify(safeComments));
        localStorage.setItem('cachedCommentsTimestamp', Date.now().toString());
        
        setComments(safeComments);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  // Update localStorage whenever comments change
  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem('cachedComments', JSON.stringify(comments));
      localStorage.setItem('cachedCommentsTimestamp', Date.now().toString());
    }
  }, [comments]);

  // Fetch unread notification count
  useEffect(() => {
    if (!token) return;

    const fetchUnreadNotifications = async () => {
      try {
        // Try to fetch all notifications
        const response = await fetch(`${API_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          // Silently handle error without console error
          setUnreadNotifications(0);
          return;
        }
        
        const notifications = await response.json();
        // Count unread notifications
        const unreadCount = Array.isArray(notifications) 
          ? notifications.filter(notification => !notification.isRead).length
          : 0;
        
        // Check if there are new notifications since last check
        if (unreadCount > 0) {
          // Find the most recent notification
          const sortedNotifications = [...notifications].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          if (sortedNotifications.length > 0) {
            const latestNotification = sortedNotifications[0];
            const latestTimestamp = new Date(latestNotification.createdAt).getTime();
            
            // If there's a new notification since last check, show an alert
            if (latestTimestamp > lastNotificationCheck) {
              setShowNotificationAlert(true);
              // Auto-hide the alert after 5 seconds
              setTimeout(() => setShowNotificationAlert(false), 5000);
            }
          }
        }
        
        setUnreadNotifications(unreadCount);
        setLastNotificationCheck(Date.now());
      } catch (err) {
        // Silently set to 0 instead of logging to console
        setUnreadNotifications(0);
      }
    };

    // Initial fetch
    fetchUnreadNotifications();
    
    // Set up polling every 60 seconds to check for new notifications
    const intervalId = setInterval(fetchUnreadNotifications, 60000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [token, lastNotificationCheck]);

  // Add a new comment
  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !token) return;
    
    try {
      console.log('Submitting comment with token:', token);
      console.log('Comment content:', newComment);
      console.log('Parent ID:', replyingTo);
      
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment,
          parentId: replyingTo,
        }),
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      if (!response.ok) {
        // Check if it's a user not found error
        if (response.status === 404 && responseText.includes('User with id')) {
          console.log('User ID in token not found in database, logging out...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/auth/login?expired=true');
          return;
        }
        throw new Error(`Failed to add comment: ${responseText}`);
      }
      
      const addedComment = JSON.parse(responseText);
      
      // Ensure proper styling for the newly added comment
      if (!addedComment.replies && user) {
        addedComment.replies = [];
      }
      
      // Update state based on whether it's a reply or root comment
      if (replyingTo) {
        // Use a recursive function to find the parent comment at any nesting level
        const updateReplies = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            // If this is the parent comment we're replying to
            if (comment.id === replyingTo) {
              return {
                ...comment,
                replies: Array.isArray(comment.replies) 
                  ? [...comment.replies, addedComment]
                  : [addedComment]
              };
            }
            
            // Check if the parent is in this comment's replies
            if (Array.isArray(comment.replies) && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateReplies(comment.replies)
              };
            }
            
            return comment;
          });
        };
        
        setComments(prevComments => updateReplies(prevComments));
        setReplyingTo(null);
      } else {
        setComments(prevComments => [...prevComments, addedComment]);
      }
      
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    }
  };

  // Delete a comment
  const deleteComment = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      // Update the UI to show comment as deleted using recursive function
      const markAsDeleted = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          // If this is the comment to delete
          if (comment.id === id) {
            return {
              ...comment,
              isDeleted: true,
              deletedAt: new Date().toISOString(),
            };
          }
          
          // Check in replies recursively
          if (Array.isArray(comment.replies) && comment.replies.length > 0) {
            return {
              ...comment,
              replies: markAsDeleted(comment.replies)
            };
          }
          
          return comment;
        });
      };
      
      setComments(prevComments => markAsDeleted(prevComments));
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  // Restore a comment
  const restoreComment = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/comments/${id}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore comment');
      }
      
      // Update the UI to show comment as restored using recursive function
      const markAsRestored = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          // If this is the comment to restore
          if (comment.id === id) {
            return {
              ...comment,
              isDeleted: false,
              deletedAt: null,
            };
          }
          
          // Check in replies recursively
          if (Array.isArray(comment.replies) && comment.replies.length > 0) {
            return {
              ...comment,
              replies: markAsRestored(comment.replies)
            };
          }
          
          return comment;
        });
      };
      
      setComments(prevComments => markAsRestored(prevComments));
    } catch (err: any) {
      setError(err.message || 'Failed to restore comment');
    }
  };

  // Edit a comment
  const startEditing = (comment: Comment) => {
    setEditing(comment.id);
    setEditContent(comment.content);
  };

  const submitEdit = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/comments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
      
      const updatedComment = await response.json();
      
      // Update the comment in the UI using recursive function
      const updateEditedComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          // If this is the comment to update
          if (comment.id === id) {
            return {
              ...comment,
              content: updatedComment.content,
              updatedAt: updatedComment.updatedAt,
            };
          }
          
          // Check in replies recursively
          if (Array.isArray(comment.replies) && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateEditedComment(comment.replies)
            };
          }
          
          return comment;
        });
      };
      
      setComments(prevComments => updateEditedComment(prevComments));
      setEditing(null);
      setEditContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to update comment');
    }
  };

  // Render a single comment
  const renderComment = (comment: Comment, depth = 0) => {
    const isEditable = user && 
                       user.id === comment.author.id && 
                       !comment.isDeleted &&
                       new Date(comment.createdAt).getTime() > Date.now() - 15 * 60 * 1000;
                       
    const isRestorable = user && 
                         user.id === comment.author.id && 
                         comment.isDeleted &&
                         comment.deletedAt &&
                         new Date(comment.deletedAt).getTime() > Date.now() - 15 * 60 * 1000;

    // Sequential conversation style with clear nesting
    const threadStyles = depth > 0 ? `border-l-2 border-gray-300 pl-4 ml-6` : '';
    const bgColor = depth % 2 === 0 ? 'bg-white' : 'bg-gray-50';

    return (
      <div key={comment.id} className={`mb-3 ${threadStyles}`}>
        <div className={`p-4 border rounded-lg ${bgColor} shadow-sm relative`}>
          {/* Add connection line dot for replies */}
          {depth > 0 && (
            <div className="absolute w-3 h-0.5 bg-gray-300" style={{ left: '-12px', top: '24px' }}></div>
          )}
          
          {comment.isDeleted ? (
            <div className="text-gray-500 italic">
              <p>This comment has been deleted.</p>
              {isRestorable && (
                <button 
                  onClick={() => restoreComment(comment.id)}
                  className="text-blue-600 hover:underline text-sm mt-2"
                >
                  Restore
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-gray-800">{comment.author.username}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                
                {user && user.id === comment.author.id && (
                  <div>
                    {isEditable && (
                      <button 
                        onClick={() => startEditing(comment)}
                        className="text-blue-600 hover:underline text-sm mr-2"
                      >
                        Edit
                      </button>
                    )}
                    <button 
                      onClick={() => deleteComment(comment.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              {editing === comment.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-base font-normal bg-white shadow-inner"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => setEditing(null)}
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => submitEdit(comment.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mb-3 text-gray-800">{comment.content}</p>
              )}
              
              {user && !editing && (
                <button 
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
              )}
            </>
          )}
        </div>
        
        {/* Show reply form right after the comment being replied to */}
        {replyingTo === comment.id && (
          <div className="mt-2 mb-3 ml-6 pl-4 border-l-2 border-blue-300">
            <form onSubmit={addComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-base placeholder-gray-400 font-normal bg-white shadow-inner"
                rows={2}
                required
              />
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Reply
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Show all replies directly below their parent in sequential order */}
        {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Notification Toast Alert */}
      {showNotificationAlert && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center">
          <div className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="font-bold">New Reply!</p>
            <p className="text-sm">Someone has replied to your comment.</p>
          </div>
          <button 
            onClick={() => setShowNotificationAlert(false)}
            className="ml-auto text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Comments</h1>
        <Link 
          href="/notifications" 
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 flex items-center relative"
        >
          <span>Notifications</span>
          {unreadNotifications > 0 && (
            <span className="ml-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}
      
      <form onSubmit={addComment} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-base placeholder-gray-400 font-normal bg-white shadow-inner"
          rows={4}
          required
        />
        <div className="flex justify-end">
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Comment
          </button>
        </div>
      </form>
      
      <div>
        {loading ? (
          <div className="text-center py-10">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
} 