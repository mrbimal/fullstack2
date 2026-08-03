import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'
import { mockFetchPlatforms } from './api'

const platformsAdapter = createEntityAdapter({ selectId: (p) => p.id })

export const fetchPlatforms = createAsyncThunk('platforms/fetchPlatforms', async () => {
  const res = await mockFetchPlatforms()
  return res
})

const platformsSlice = createSlice({
  name: 'platforms',
  initialState: platformsAdapter.getInitialState({ loading: false, error: null }),
  reducers: {
    addPlatform: platformsAdapter.addOne,
    updatePlatform: platformsAdapter.upsertOne,
    removePlatform: platformsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatforms.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.loading = false
        platformsAdapter.setAll(state, action.payload)
      })
      .addCase(fetchPlatforms.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { selectAll: selectAllPlatforms, selectById: selectPlatformById } = platformsAdapter.getSelectors((state) => state.platforms)
export const { addPlatform, updatePlatform, removePlatform } = platformsSlice.actions

export default platformsSlice.reducer
