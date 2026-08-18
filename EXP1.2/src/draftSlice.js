import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  drafts: [],
  loading: false,
  error: null,
};

const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    loadStart(state) {
      state.loading = true;
      state.error = null;
    },
    loadSuccess(state, action) {
      state.loading = false;
      state.drafts = action.payload;
    },
    loadFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addDraft(state, action) {
      state.drafts.unshift(action.payload);
    },
    updateDraft(state, action) {
      state.drafts = state.drafts.map((d) => (d.id === action.payload.id ? { ...d, ...action.payload } : d));
    },
    deleteDraft(state, action) {
      state.drafts = state.drafts.filter((d) => d.id !== action.payload);
    },
  },
});

export const {
  loadStart,
  loadSuccess,
  loadFailure,
  addDraft,
  updateDraft,
  deleteDraft,
} = draftSlice.actions;

export default draftSlice.reducer;
