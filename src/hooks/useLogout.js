import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/Slice/authSlice";
import { baseApi } from "../redux/api/baseApi";

/** Signs out and clears every cached API response. */
export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return useCallback(() => {
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);
}
