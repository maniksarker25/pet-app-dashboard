import { baseApi } from "./baseApi";

// Ads, support tickets and admin notifications.
const moderationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Backend: Advertisement/advertisement.router.js
    getAllAds: builder.query({
      query: () => "advertisement/get-all-ads",
      transformResponse: (res) => res?.advertisement ?? [],
      providesTags: ["ads"],
    }),
    updateAdStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `advertisement/update-ads-status/${id}`,
        method: "PUT",
        body: { status }, // ACTIVE | INACTIVE
      }),
      invalidatesTags: ["ads"],
    }),

    // Backend: Dashboard/Help/help.router.js
    getSupportTickets: builder.query({
      query: () => "help/get",
      transformResponse: (res) => res?.helps ?? [],
      providesTags: ["support"],
    }),
    updateSupportStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `help/update/${id}`, method: "PUT", body: { status } }),
      invalidatesTags: ["support"],
    }),
    deleteSupportTicket: builder.mutation({
      query: (id) => ({ url: `help/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["support"],
    }),

    // Backend: Notification/notification.router.js
    getAdminNotifications: builder.query({
      query: () => "notifications/admin-notifications",
      transformResponse: (res) => res?.data ?? [],
      providesTags: ["notification"],
    }),
  }),
});

export const {
  useGetAllAdsQuery,
  useUpdateAdStatusMutation,
  useGetSupportTicketsQuery,
  useUpdateSupportStatusMutation,
  useDeleteSupportTicketMutation,
  useGetAdminNotificationsQuery,
} = moderationApi;
