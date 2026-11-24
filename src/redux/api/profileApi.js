import { baseApi } from "./baseApi";

// Backend: petApp_backend/src/app/module/Admin/admin.router.js
const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProfile: builder.query({
      query: () => "admin/get-profile",
      transformResponse: (res) => res?.admin ?? null,
      providesTags: ["profile"],
    }),
    // multipart FormData: name, phone, profilePic (jpg/png/webp)
    updateProfile: builder.mutation({
      query: (formData) => ({ url: "admin/update-profile", method: "PUT", body: formData }),
      invalidatesTags: ["profile"],
    }),
    // Revokes all sessions on success: the client must sign in again.
    changeAdminPassword: builder.mutation({
      query: (body) => ({ url: "admin/change-password", method: "PUT", body }),
    }),
  }),
});

export const {
  useGetAdminProfileQuery,
  useUpdateProfileMutation,
  useChangeAdminPasswordMutation,
} = profileApi;
