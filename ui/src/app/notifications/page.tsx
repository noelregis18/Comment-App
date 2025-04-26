'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// TypeScript interfaces for data types
interface User {
  id: string;
  username: string;
}

interface Comment {
  id: string;
  content: string;
  author: User;
}

interface Notification {
  id: string;
  type: 'comment_reply';
  isRead: boolean;
  comment: Comment;
  createdAt: string;
}

// API URL - Defined outside component to avoid dependency issues
const API_URL = 'http://localhost:3003';

export default function Notifications() {
  // State hooks for UI and data
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      setToken(storedToken);
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [router]);

  // Fetch notifications from the API
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update the notification in state to show as read
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  // Mark a single notification as unread
  const markAsUnread = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/unread`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as unread');
      }
      
      // Update the notification in state to show as unread
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id
            ? { ...notification, isRead: false }
            : notification
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as unread');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update all notifications in state to show as read
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
    }
  };

  // Show loading state if not authenticated yet
  if (!token) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with mark all as read button and back link */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Notifications
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="ml-3 text-lg bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {notifications.filter(n => !n.isRead).length} unread
            </span>
          )}
        </h1>
        <div className="flex space-x-4">
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 flex items-center"
            disabled={notifications.every(n => n.isRead)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark all as read
          </button>
          <Link 
            href="/comments" 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to comments
          </Link>
        </div>
      </div>
      
      {/* Error message display */}
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
      
      {/* Notifications list */}
      <div>
        {loading ? (
          <div className="text-center py-10">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            You have no notifications yet.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-4 border rounded-lg ${notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    {/* Notification content */}
                    <div className="mb-2">
                      <span className="font-semibold">{notification.comment.author.username}</span>
                      <span className="ml-2">replied to your comment</span>
                      {!notification.isRead && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 p-2 rounded bg-gray-50">{notification.comment.content}</p>
                    <div className="mt-2 text-gray-500 text-sm">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Notification actions */}
                  <div className="flex space-x-2">
                    {!notification.isRead ? (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:underline text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark as read
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsUnread(notification.id)}
                        className="text-gray-500 hover:underline text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5" />
                        </svg>
                        Mark as unread
                      </button>
                    )}
                    <Link
                      href={`/comments?comment=${notification.comment.id}`}
                      className="text-blue-600 hover:underline text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View comment
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 