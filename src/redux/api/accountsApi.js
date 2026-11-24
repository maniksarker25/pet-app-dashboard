import { baseApi } from "./baseApi";

// Pet owners (USER) and business owners (OWNER).
// Backend: petApp_backend/src/app/module/Dashboard/{PetOwners,BusinessOwner}
// List params: page, limit, search, status ("active" | "blocked"), subscription ("active", owners only)
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== "all"));

const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPetOwners: builder.query({
      query: (params) => ({ url: "dashboard/pet-owners", params: cleanParams(params) }),
      providesTags: ["petOwner"],
    }),
    getPetOwner: builder.query({
      query: (id) => `dashboard/pet-owner/${id}`,
      providesTags: (r, e, id) => [{ type: "petOwner", id }],
    }),
    setPetOwnerBlocked: builder.mutation({
      query: ({ id, blocked }) => ({
        url: `dashboard/pet-owner/${id}/${blocked ? "block" : "unblock"}`,
        method: "PUT",
      }),
      invalidatesTags: ["petOwner", "dashboard"],
    }),

    getBusinessOwners: builder.query({
      query: (params) => ({ url: "dashboard/business-owners", params: cleanParams(params) }),
      providesTags: ["businessOwner"],
    }),
    getBusinessOwner: builder.query({
      query: (id) => `dashboard/business-owner/${id}`,
      providesTags: (r, e, id) => [{ type: "businessOwner", id }],
    }),
    setBusinessOwnerBlocked: builder.mutation({
      query: ({ id, blocked }) => ({
        url: `dashboard/business-owner/${id}/${blocked ? "block" : "unblock"}`,
        method: "PUT",
      }),
      invalidatesTags: ["businessOwner", "dashboard"],
    }),
  }),
});

export const {
  useGetPetOwnersQuery,
  useGetPetOwnerQuery,
  useSetPetOwnerBlockedMutation,
  useGetBusinessOwnersQuery,
  useGetBusinessOwnerQuery,
  useSetBusinessOwnerBlockedMutation,
} = accountsApi;
