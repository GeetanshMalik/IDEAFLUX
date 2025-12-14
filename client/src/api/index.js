import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('profile')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile')).token}`;
  }
  return req;
});

// --- POSTS ---
export const fetchPost = (id) => API.get(`/posts/${id}`); // 🛑 NEW: Fetch Single Post
export const fetchPosts = (page) => API.get(`/posts?page=${page}`);
export const fetchPostsBySearch = (searchQuery) => API.get(`/posts/search?searchQuery=${searchQuery.search || 'none'}&tags=${searchQuery.tags}`);
export const createPost = (newPost) => API.post('/posts', newPost);
export const likePost = (id) => API.patch(`/posts/${id}/likePost`);
export const comment = (value, id) => API.post(`/posts/${id}/commentPost`, { value });
export const updatePost = (id, updatedPost) => API.patch(`/posts/${id}`, updatedPost);
export const deletePost = (id) => API.delete(`/posts/${id}`);

// --- USERS ---
export const signIn = (formData) => API.post('/user/signin', formData);
export const signUp = (formData) => API.post('/user/signup', formData);
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