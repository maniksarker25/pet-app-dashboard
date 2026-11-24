import { baseApi } from "./baseApi";

// Backend: petApp_backend/src/app/module/Auth/auth.routes.js
const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    logIn: builder.mutation({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "auth/forgot-password", method: "POST", body }),
    }),
    resendResetCode: builder.mutation({
      query: (body) => ({ url: "auth/resend-password-reset-code", method: "POST", body }),
    }),
    // Must succeed before reset-password; the verified code is then valid for 10 minutes.
    verifyCode: builder.mutation({
      query: (body) => ({ url: "auth/verify-code", method: "POST", body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: "auth/reset-password", method: "POST", body }),
    }),
  }),
});

export const {
  useLogInMutation,
  useForgotPasswordMutation,
  useResendResetCodeMutation,
  useVerifyCodeMutation,
  useResetPasswordMutation,
} = authApi;
