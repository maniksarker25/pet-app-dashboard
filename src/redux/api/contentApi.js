import { baseApi } from "./baseApi";

// Legal pages and FAQ shown in the mobile app.
const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Backend: Dashboard/Manage/manage.routes.js (single document, upserted)
    getTerms: builder.query({
      query: () => "manage/get-terms-conditions",
      transformResponse: (res) => res?.data ?? null,
      providesTags: ["terms"],
    }),
    saveTerms: builder.mutation({
      query: (description) => ({
        url: "manage/add-terms-conditions",
        method: "POST",
        body: { description },
      }),
      invalidatesTags: ["terms"],
    }),
    getPrivacy: builder.query({
      query: () => "manage/get-privacy-policy",
      transformResponse: (res) => res?.data ?? null,
      providesTags: ["privacy"],
    }),
    savePrivacy: builder.mutation({
      query: (description) => ({
        url: "manage/add-privacy-policy",
        method: "POST",
        body: { description },
      }),
      invalidatesTags: ["privacy"],
    }),

    // Backend: Dashboard/Faq/faq.router.js
    getFaqs: builder.query({
      query: () => "faq/get",
      transformResponse: (res) => res?.faqs ?? [],
      providesTags: ["faq"],
    }),
    createFaq: builder.mutation({
      query: (body) => ({ url: "faq/create", method: "POST", body }),
      invalidatesTags: ["faq"],
    }),
    updateFaq: builder.mutation({
      query: ({ id, ...body }) => ({ url: `faq/update/${id}`, method: "PUT", body }),
      invalidatesTags: ["faq"],
    }),
    deleteFaq: builder.mutation({
      query: (id) => ({ url: `faq/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["faq"],
    }),
  }),
});

export const {
  useGetTermsQuery,
  useSaveTermsMutation,
  useGetPrivacyQuery,
  useSavePrivacyMutation,
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = contentApi;
