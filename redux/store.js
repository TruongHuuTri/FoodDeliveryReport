import { configureStore, createSlice } from '@reduxjs/toolkit';

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    email: '',
    fullName: '',
    phone: '',
    isLoggedIn: false,
  },
  reducers: {
    setUser(state, action) {
      return { ...state, ...action.payload, isLoggedIn: true };
    },
    logOut() {
      return { email: '', fullName: '', phone: '', isLoggedIn: false };
    },
  },
});

export const { setUser, logOut } = userSlice.actions;

// Create store
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export default store;
