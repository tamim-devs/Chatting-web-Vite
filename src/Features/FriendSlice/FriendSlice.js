import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  friendsItem: null, // 🔥 important
};

const FriendSlice = createSlice({
  name: "Friends",
  initialState,
  reducers: {
    Friensinfo: (state, action) => {
      state.friendsItem = action.payload;
    },
    clearFriend: (state) => {
      state.friendsItem = null;
    },
  },
});

export const { Friensinfo, clearFriend } = FriendSlice.actions;
export default FriendSlice.reducer;
