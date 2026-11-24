import { Alert, Button, Form, Input } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuMail } from "react-icons/lu";
import { useForgotPasswordMutation } from "../redux/api/authApi";
import { getErrorMessage } from "../redux/api/baseApi";
import { AuthHeading } from "./AuthLayout";

export default function ForgotPassword() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onFinish = async ({ email }) => {
    setError("");
    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      navigate("/verify-code", { state: { email: email.trim() } });
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't send the code. Please try again."));
    }
  };

  return (
    <>
      <AuthHeading title="Forgot your password?" subtitle="Enter your email and we'll send you a 6-digit code." />
      {error && <Alert type="error" showIcon message={error} className="mb-5" />}
      <Form layout="vertical" requiredMark={false} onFinish={onFinish} size="large">
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
        <Button type="primary" htmlType="submit" block loading={isLoading}>
          Send code
        </Button>
      </Form>
      <BackToLogin />
    </>
  );
}

export function BackToLogin() {
  return (
    <Link
      to="/login"
      className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"
    >
      <LuArrowLeft /> Back to sign in
    </Link>
  );
}
