import axios from 'axios';

// Create API instance with base configuration
const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || 'https://ideaflux-54zk.onrender.com',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (req) => {
    const profile = localStorage.getItem('profile');
    if (profile) {
      try {
        const { token } = JSON.parse(profile);
        if (token) {
          req.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing profile from localStorage:', error);
        localStorage.removeItem('profile'); // Remove corrupted data
      }
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle different error scenarios
    if (response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('profile');
      window.location.href = '/auth';
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }
    
    if (response?.status === 403) {
      return Promise.reject(new Error('Access denied. You don\'t have permission.'));
    }
    
    if (response?.status === 404) {
      return Promise.reject(new Error('Resource not found.'));
    }
    
    if (response?.status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }
    
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please check your connection.'));
    }
    
    if (!response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Return the original error message from server if available
    const message = response.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// --- POSTS ---
export const fetchPost = (id) => API.get(`/posts/${id}`); // 🛑 NEW: Fetch Single Post
export const fetchPosts = (page, sort = 'recent', limit = 8) => API.get(`/posts?page=${page}&sort=${sort}&limit=${limit}`);
export const fetchPostsBySearch = (searchQuery) => API.get(`/posts/search?searchQuery=${searchQuery.search || 'none'}&tags=${searchQuery.tags}`);
export const createPost = (newPost) => API.post('/posts', newPost);
export const likePost = (id) => API.patch(`/posts/${id}/likePost`);
export const comment = (value, id) => API.post(`/posts/${id}/commentPost`, { value });
export const likeComment = (postId, commentId) => API.patch(`/posts/${postId}/comments/${commentId}/like`);
export const deleteComment = (postId, commentId) => API.delete(`/posts/${postId}/comments/${commentId}`);
export const updatePost = (id, updatedPost) => API.patch(`/posts/${id}`, updatedPost);
export const deletePost = (id) => API.delete(`/posts/${id}`);
export const sharePost = (id) => API.patch(`/posts/${id}/sharePost`);

// --- USERS ---
export const signIn = (formData) => API.post('/user/signin', formData);
export const signUp = (formData) => API.post('/user/signup', formData);
export const verifyEmail = (data) => API.post('/user/verify-email', data);
export const resendOTP = (data) => API.post('/user/resend-otp', data);
export const googleSignIn = (result) => API.post('/user/google', result);
export const fetchUser = (id) => API.get(`/user/${id}`);
export const updateUser = (id, updatedUser) => API.patch(`/user/${id}`, updatedUser);
export const searchUsers = (query) => API.get(`/user/search?searchQuery=${query}`);
export const followUser = (id) => API.patch(`/user/${id}/follow`);
export const unfollowUser = (id) => API.patch(`/user/${id}/unfollow`);
export const deleteAccount = (id) => API.delete(`/user/${id}`);

// --- CHAT ---
export const fetchChats = () => API.get('/message/chat');
export const accessChat = (userId) => API.post('/message/chat', { userId });
export const fetchMessages = (chatId) => API.get(`/message/${chatId}`);
export const sendMessage = (messageData) => API.post('/message', messageData);
export const deleteChat = (chatId) => API.delete(`/message/chat/${chatId}`);
export const deleteMessage = (messageId) => API.delete(`/message/message/${messageId}`);

// --- NOTIFICATIONS ---
export const fetchNotifications = () => API.get('/user/notifications');
export const markNotificationsRead = () => API.patch('/user/notifications/read');
export const markNotificationRead = (notificationId) => API.patch(`/user/notifications/${notificationId}/read`);
