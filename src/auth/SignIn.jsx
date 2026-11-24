import { useState } from "react";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LuLock, LuMail } from "react-icons/lu";
import { useLogInMutation } from "../redux/api/authApi";
import { baseApi, getErrorMessage } from "../redux/api/baseApi";
import { setUser } from "../redux/Slice/authSlice";
import { ADMIN_ROLES } from "../utils/session";
import { AuthHeading } from "./AuthLayout";

const REMEMBER_KEY = "rememberEmail"; // only the email is remembered, never the password

const readRememberedEmail = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) || "";
  } catch {
    return "";
  }
};

export default function SignIn() {
  const [logIn, { isLoading }] = useLogInMutation();
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const rememberedEmail = readRememberedEmail();

  const onFinish = async ({ email, password, remember }) => {
    setError("");
    try {
      const res = await logIn({ email: email.trim(), password }).unwrap();
      if (!ADMIN_ROLES.includes(res?.user?.role)) {
        setError("This account doesn't have admin access.");
        return;
      }
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* storage unavailable */
      }
      dispatch(baseApi.util.resetApiState());
      dispatch(setUser({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken }));
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Sign in failed. Please try again."));
    }
  };

  return (
    <>
      <AuthHeading title="Welcome back" subtitle="Sign in to manage Sansaland." />
      {error && <Alert type="error" showIcon message={error} className="mb-5" />}
      <Form
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        initialValues={{ email: rememberedEmail, remember: Boolean(rememberedEmail) }}
        size="large"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Enter your email" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input prefix={<LuMail className="text-gray-400" />} placeholder="admin@sansaland.com" autoComplete="email" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: "Enter your password" }]}>
          <Input.Password
            prefix={<LuLock className="text-gray-400" />}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </Form.Item>
        <div className="mb-6 flex items-center justify-between">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember my email</Checkbox>
          </Form.Item>
          <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>
        <Button type="primary" htmlType="submit" block loading={isLoading}>
          Sign in
        </Button>
      </Form>
    </>
  );
}
