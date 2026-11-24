import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { GuestRoute, PrivateRoute } from "./guards";
import DashboardLayout from "../layout/DashboardLayout";
import AuthLayout from "../auth/AuthLayout";
import FullPageLoader from "../components/FullPageLoader";
import { NotFound, RouteError } from "../components/RouteStates";

// Each page is its own chunk, so the first load only downloads what's needed.
const Dashboard = lazy(() => import("../pages/Dashboard"));
const PetOwners = lazy(() => import("../pages/PetOwners"));
const BusinessOwners = lazy(() => import("../pages/BusinessOwners"));
const Subscribers = lazy(() => import("../pages/Subscribers"));
const Services = lazy(() => import("../pages/Services"));
const ServiceBookings = lazy(() => import("../pages/ServiceBookings"));
const Ads = lazy(() => import("../pages/Ads"));
const Support = lazy(() => import("../pages/Support"));
const Notifications = lazy(() => import("../pages/Notifications"));
const Profile = lazy(() => import("../pages/settings/Profile"));
const Faq = lazy(() => import("../pages/settings/Faq"));
const TermsPage = lazy(() => import("../pages/settings/LegalContent").then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import("../pages/settings/LegalContent").then((m) => ({ default: m.PrivacyPage })));

const SignIn = lazy(() => import("../auth/SignIn"));
const ForgotPassword = lazy(() => import("../auth/ForgotPassword"));
const VerifyCode = lazy(() => import("../auth/VerifyCode"));
const ResetPassword = lazy(() => import("../auth/ResetPassword"));

const page = (Component) => (
  <Suspense fallback={<FullPageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <PrivateRoute />,
    errorElement: <RouteError />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: page(Dashboard) },
          { path: "/pet-owners", element: page(PetOwners) },
          { path: "/business-owners", element: page(BusinessOwners) },
          { path: "/subscribers", element: page(Subscribers) },
          { path: "/services", element: page(Services) },
          { path: "/services/:serviceId", element: page(ServiceBookings) },
          { path: "/ads", element: page(Ads) },
          { path: "/support", element: page(Support) },
          { path: "/notifications", element: page(Notifications) },
          { path: "/settings/profile", element: page(Profile) },
          { path: "/settings/faq", element: page(Faq) },
          { path: "/settings/terms", element: page(TermsPage) },
          { path: "/settings/privacy", element: page(PrivacyPage) },

          // Old URLs from the previous dashboard
          { path: "/dashboard/user-management", element: <Navigate to="/pet-owners" replace /> },
          { path: "/dashboard/seller-management", element: <Navigate to="/business-owners" replace /> },
          { path: "/booking-management", element: <Navigate to="/services" replace /> },
          { path: "/ads-promotion", element: <Navigate to="/ads" replace /> },
          { path: "/faq", element: <Navigate to="/settings/faq" replace /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
  {
    element: <GuestRoute />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: page(SignIn) },
          { path: "/forgot-password", element: page(ForgotPassword) },
          { path: "/verify-code", element: page(VerifyCode) },
          { path: "/reset-password", element: page(ResetPassword) },
        ],
      },
    ],
  },
]);
