import { FETCH_ALL, FETCH_POST, FETCH_BY_SEARCH, START_LOADING, END_LOADING, CREATE, UPDATE, DELETE, LIKE, COMMENT, SHARE } from '../constants/actionTypes';
import * as api from '../api/index.js';

// 🛑 NEW: Get Single Post
export const getPost = (id) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    const { data } = await api.fetchPost(id);

    // Server returns { post, relatedPosts }, we need to handle both
    if (data && data.post) {
      dispatch({ type: FETCH_POST, payload: { post: data.post, posts: data.relatedPosts || [] } });
    } else {
      // Handle case where post is not found
      dispatch({ type: FETCH_POST, payload: { post: null, posts: [] } });
    }
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.error('Error fetching post:', error);
    dispatch({ type: FETCH_POST, payload: { post: null, posts: [] } });
    dispatch({ type: END_LOADING });
  }
};

export const getPosts = (page, sort = 'recent', limit = 8) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    const { data } = await api.fetchPosts(page, sort, limit);

    dispatch({ type: FETCH_ALL, payload: data });
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.log(error);
  }
};

export const getPostsBySearch = (searchQuery) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    const { data: { data } } = await api.fetchPostsBySearch(searchQuery);

    dispatch({ type: FETCH_BY_SEARCH, payload: data });
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.log(error);
  }
};

export const createPost = (post, navigate) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    const { data } = await api.createPost(post);

    navigate(`/posts/${data._id}`);

    dispatch({ type: CREATE, payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const updatePost = (id, post) => async (dispatch) => {
  try {
    const { data } = await api.updatePost(id, post);

    dispatch({ type: UPDATE, payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const likePost = (id) => async (dispatch) => {
  const user = JSON.parse(localStorage.getItem('profile'));

  try {
    const { data } = await api.likePost(id, user?.token);

    dispatch({ type: LIKE, payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const commentPost = (value, id) => async (dispatch) => {
  try {
    const { data } = await api.comment(value, id);

    dispatch({ type: COMMENT, payload: data });

    return data.comments;
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = (id) => async (dispatch) => {
  try {
    await api.deletePost(id);

    dispatch({ type: DELETE, payload: id });
  } catch (error) {
    console.log(error);
  }
};

export const sharePost = (id) => async (dispatch) => {
  try {
    const { data } = await api.sharePost(id);

    dispatch({ type: SHARE, payload: data });
  } catch (error) {
    console.log(error);
  }
};