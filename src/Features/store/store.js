import { configureStore } from "@reduxjs/toolkit";
import friendsReducer from "../FriendSlice/FriendSlice.js";
export const store = configureStore({
  reducer: {
    friendStore: friendsReducer,
  },
});
