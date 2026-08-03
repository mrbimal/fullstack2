import { configureStore } from '@reduxjs/toolkit';
import draftReducer from './draftSlice';

const store = configureStore({
  reducer: {
    draft: draftReducer,
  },
});

export default store;
