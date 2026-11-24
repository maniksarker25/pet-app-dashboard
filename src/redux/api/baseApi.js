import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "../../config/envConfig";
import { logout, setTokens } from "../Slice/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Shared so that parallel 401s trigger a single refresh call.
let refreshInFlight = null;

const requestUrl = (args) => (typeof args === "string" ? args : args.url);

/**
 * Wraps every request:
 * - 401 → try POST auth/refresh-token once, retry the request, otherwise sign out
 *   (the backend revokes tokens on password change/reset).
 * - 403 "blocked" → sign out.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const status = result.error?.status;

  if (status === 401 && !requestUrl(args).startsWith("auth/")) {
    const refreshToken = api.getState().auth.refreshToken;
    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    refreshInFlight ??= Promise.resolve(
      rawBaseQuery(
        { url: "auth/refresh-token", method: "POST", body: { refreshToken } },
        api,
        extraOptions,
      ),
    ).finally(() => {
      refreshInFlight = null;
    });

    const refreshed = await refreshInFlight;
    if (refreshed.data?.accessToken) {
      api.dispatch(setTokens(refreshed.data));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  } else if (status === 403 && /blocked/i.test(result.error?.data?.message || "")) {
    api.dispatch(logout());
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  refetchOnReconnect: true,
  keepUnusedDataFor: 120,
  tagTypes: [
    "profile",
    "dashboard",
    "petOwner",
    "businessOwner",
    "services",
    "ads",
    "support",
    "notification",
    "terms",
    "privacy",
    "faq",
  ],
  endpoints: () => ({}),
});

/** Human-readable message from an RTK Query error. */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback;
  if (error.status === 429) return "Too many requests. Please wait a moment and try again.";
  if (error.status === "FETCH_ERROR") return "Can't reach the server. Check your connection.";
  return error.data?.message || error.error || fallback;
};
