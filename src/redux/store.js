import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import { authSlice } from "./Slice/authSlice";
import { baseApi } from "./api/baseApi";

const persistConfig = {
  key: "sansaland-admin",
  storage,
  whitelist: ["auth"], // never persist cached API data
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authSlice.reducer,
});

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);
