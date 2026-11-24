import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAdminToken } from "../utils/session";

/** Only admins and super admins may enter the dashboard. */
export function PrivateRoute() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const location = useLocation();
  if (!isAdminToken(accessToken)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Login & password-reset pages: send signed-in admins to the dashboard. */
export function GuestRoute() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  return isAdminToken(accessToken) ? <Navigate to="/" replace /> : <Outlet />;
}
