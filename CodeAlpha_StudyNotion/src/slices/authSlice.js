import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Get the raw token from localStorage
const rawToken = localStorage.getItem("token");

let decodedToken = null;

if (rawToken) {
  try {
    decodedToken = jwtDecode(rawToken); // just for reading user info
  } catch (err) {
    console.error("Failed to decode token:", err);
    localStorage.removeItem("token");
  }
}

// ✅ FIX: store both separately
const initialState = {
  signupData: null,
  loading: false,
  token: rawToken, // store the JWT string for Authorization header
  decodedToken: decodedToken, // optional: store decoded info for UI logic
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSignupData(state, action) {
      state.signupData = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload; // make sure this is always a string
      try {
        state.decodedToken = jwtDecode(action.payload);
      } catch {
        state.decodedToken = null;
      }
    },
  },
});

export const { setSignupData, setLoading, setToken } = authSlice.actions;

export default authSlice.reducer;
