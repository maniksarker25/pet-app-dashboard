import { useState } from "react";
import { Alert, App, Button, Form, Input } from "antd";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LuLock } from "react-icons/lu";
import { useResetPasswordMutation } from "../redux/api/authApi";
import { getErrorMessage } from "../redux/api/baseApi";
import { AuthHeading } from "./AuthLayout";
import { BackToLogin } from "./ForgotPassword";
import { confirmRules, passwordRules } from "../utils/validation";

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [error, setError] = useState("");

  if (!state?.email || !state?.code) return <Navigate to="/forgot-password" replace />;

  const onFinish = async ({ password, confirmPassword }) => {
    setError("");
    try {
      await resetPassword({ email: state.email, code: state.code, password, confirmPassword }).unwrap();
      message.success("Password updated. Sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't reset the password. Request a new code and try again."));
    }
  };

  return (
    <>
      <AuthHeading
        title="Set a new password"
        subtitle="You'll be signed out on every device after the change."
      />
      {error && <Alert type="error" showIcon message={error} className="mb-5" />}
      <Form layout="vertical" requiredMark={false} onFinish={onFinish} size="large">
        <Form.Item name="password" label="New password" rules={passwordRules}>
          <Input.Password prefix={<LuLock className="text-gray-400" />} autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm new password"
          dependencies={["password"]}
          rules={confirmRules("password")}
        >
          <Input.Password prefix={<LuLock className="text-gray-400" />} autoComplete="new-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={isLoading}>
          Update password
        </Button>
      </Form>
      <BackToLogin />
    </>
  );
}
