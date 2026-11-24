import { baseApi } from "./baseApi";

// Backend: petApp_backend/src/app/module/Dashboard/dashboard.router.js
const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (year) => ({ url: "dashboard/stats", params: year ? { year } : undefined }),
      transformResponse: (res) => res?.data ?? null,
      providesTags: ["dashboard"],
    }),

    // Services with their booking counts
    getServicesWithStats: builder.query({
      query: () => "dashboard/services-stats",
      transformResponse: (res) => res?.services ?? [],
      providesTags: ["services"],
    }),
    getServiceBookings: builder.query({
      query: (serviceId) => `dashboard/service-bookings/${serviceId}`,
      providesTags: (result, error, serviceId) => [{ type: "services", id: serviceId }],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetServicesWithStatsQuery,
  useGetServiceBookingsQuery,
} = dashboardApi;
