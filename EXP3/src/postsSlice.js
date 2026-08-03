import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'
import { mockFetchPosts } from './api'

const postsAdapter = createEntityAdapter({ selectId: (post) => post.id, sortComparer: (a, b) => b.updatedAt - a.updatedAt })

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const res = await mockFetchPosts()
  return res
})

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState({ loading: false, error: null }),
  reducers: {
    addPost: postsAdapter.addOne,
    updatePost: postsAdapter.upsertOne,
    removePost: postsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false
        postsAdapter.setAll(state, action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { selectAll: selectAllPosts, selectById: selectPostById } = postsAdapter.getSelectors((state) => state.posts)
export const { addPost, updatePost, removePost } = postsSlice.actions

export default postsSlice.reducer
