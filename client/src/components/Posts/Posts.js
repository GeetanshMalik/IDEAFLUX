import React from 'react';
import { Grid, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';

import Post from './Post/Post';
import NoResults from '../NoResults/NoResults';
import { styles } from './styles';

const Posts = ({ setCurrentId }) => {
  const { posts, isLoading } = useSelector((state) => state.posts);

  if (!posts.length && !isLoading) return <NoResults />;

  return (
    isLoading ? <CircularProgress sx={{ color: '#00BFFF' }} /> : (
      <Grid container alignItems="stretch" spacing={{ xs: 2, sm: 3 }} sx={styles.mainContainer}>
        {posts.map((post) => (
          <Grid key={post._id} item xs={12} sm={6} md={4} lg={3}>
            <Post post={post} setCurrentId={setCurrentId} />
          </Grid>
        ))}
      </Grid>
    )
  );
};

export default Posts;